import apiKeyFile from "./apikey.txt?raw";
import { DEEPSEEK_MODEL } from "./config";
import { AiError } from "./errors";
import { WEB_SEARCH_TOOL } from "./tools/webSearch";
import type { AgentName } from "./types";

interface GenerateOptions {
  /** Agent名称 */
  agent: AgentName;
  /** 系统提示词 */
  systemPrompt: string;
  /** 用户输入 */
  input: unknown;
  /** 最大生成token数 */
  maxTokens?: number;
  /** 可选的AbortSignal，用于取消请求 */
  signal?: AbortSignal;
}

interface DeepSeekResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

/**
 * 去除响应中的代码块标记
 * @param value 响应字符串
 * @returns 去除代码块标记后的字符串
 */
function stripFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
}

/**
 * 获取 API Key
 * @returns API Key 字符串
 * @throws {AiError} 如果未配置 API Key，则抛出错误
 */
function getApiKey(): string {
  const key = apiKeyFile.trim();
  if (!key) {
    throw new AiError("未配置 DeepSeek API Key，请填写 src/agents/apikey.txt。", "unavailable");
  }
  return key;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatOptions {
  systemPrompt?: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
  maxTokens?: number;
  /** 默认启用 DeepSeek 原生联网搜索工具。 */
  webSearch?: boolean;
}

/**
 * 流式对话调用。每次迭代返回一段原始文本，不会尝试解析成对象。
 */
export async function* streamChat(options: StreamChatOptions): AsyncGenerator<string> {
  if (options.signal?.aborted) {
    throw new AiError("AI 请求已取消。", "cancelled");
  }

  let response: Response;
  try {
    response = await fetch("https://api.deepseek.com/anthropic/v1/messages", {
      method: "POST",
      signal: options.signal,
      headers: { "Content-Type": "application/json", "x-api-key": getApiKey() },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        system: options.systemPrompt,
        messages: options.messages,
        stream: true,
        max_tokens: options.maxTokens ?? 4096,
        tools: options.webSearch === false ? undefined : [WEB_SEARCH_TOOL],
        tool_choice: options.webSearch === false ? undefined : { type: "auto" },
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AiError("AI 请求已取消。", "cancelled");
    }
    throw new AiError(`DeepSeek 请求失败：${error instanceof Error ? error.message : String(error)}`, "network");
  }

  if (!response.ok || !response.body) {
    const payload = (await response.text().catch(() => "未知错误")).slice(0, 500);
    throw new AiError(`DeepSeek API ${response.status}：${payload}`, "network");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) {
        const data = event
          .split(/\r?\n/)
          .find((line) => line.startsWith("data: "))
          ?.slice(6);
        if (!data || data === "[DONE]") continue;
        const parsed = JSON.parse(data) as {
          type?: string;
          delta?: { type?: string; text?: string };
          error?: { message?: string };
        };
        if (parsed.type === "error") {
          throw new AiError(parsed.error?.message ?? "DeepSeek 流式响应失败。", "network");
        }
        if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && parsed.delta.text) {
          yield parsed.delta.text;
        }
      }
      if (done) break;
    }
  } catch (error) {
    if (error instanceof AiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AiError("AI 请求已取消。", "cancelled");
    }
    throw new AiError(`DeepSeek 流式响应解析失败：${error instanceof Error ? error.message : String(error)}`, "schema");
  } finally {
    reader.releaseLock();
  }
}

/**
 * 调用 API 生成对象
 * @param options 生成选项
 * @returns 解析后的对象
 * @throws {AiError} 如果请求失败或响应格式不正确，则抛出错误
 */
export async function generateObject<T>(options: GenerateOptions): Promise<T> {
  if (options.signal?.aborted) {
    throw new AiError("AI 请求已取消。", "cancelled");
  }
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: options.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: options.systemPrompt },
          { role: "user", content: JSON.stringify(options.input) },
        ],
        stream: false,
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: options.maxTokens ?? 4096,
      }),
    });
    const payload = (await response.json()) as DeepSeekResponse;
    if (import.meta.env.DEV) {
      console.debug("[edict-ai]", options.agent, payload);
    }
    if (!response.ok) {
      throw new AiError(`DeepSeek API ${response.status}：${payload.error?.message ?? "未知错误"}`, "network");
    }
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new AiError("DeepSeek 响应缺少 content。", "schema");
    }
    return JSON.parse(stripFence(content)) as T;
  } catch (error) {
    if (error instanceof AiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AiError("AI 请求已取消。", "cancelled");
    }
    const message = error instanceof Error ? error.message : "未知错误";
    throw new AiError(`DeepSeek 请求失败：${message}`, message.includes("JSON") ? "schema" : "network");
  }
}
