import apiKeyFile from "./apikey.txt?raw";
import { DEEPSEEK_MODEL } from "./config";
import { AiError } from "./errors";
import type { AgentName } from "./types";

interface GenerateOptions {
  agent: AgentName;
  systemPrompt: string;
  input: unknown;
  maxTokens?: number;
  signal?: AbortSignal;
}

interface DeepSeekResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

function stripFence(value: string): string {
  return value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function getApiKey(): string {
  const key = (localStorage.getItem("deepseekApiKey") || import.meta.env.VITE_DEEPSEEK_API_KEY || apiKeyFile).trim();
  if (!key) throw new AiError("未配置 DeepSeek API Key。请填写 src/agents/apikey.txt 或 VITE_DEEPSEEK_API_KEY。", "unavailable");
  return key;
}

export async function generateObject<T>(options: GenerateOptions): Promise<T> {
  if (options.signal?.aborted) throw new AiError("AI 请求已取消。", "cancelled");
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: options.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getApiKey()}` },
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
    if (!response.ok) throw new AiError(`DeepSeek API ${response.status}：${payload.error?.message ?? "未知错误"}`, "network");
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new AiError("DeepSeek 响应缺少 content。", "schema");
    return JSON.parse(stripFence(content)) as T;
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new AiError("AI 请求已取消。", "cancelled");
    const message = error instanceof Error ? error.message : "未知错误";
    throw new AiError(`DeepSeek 请求失败：${message}`, message.includes("JSON") ? "schema" : "network");
  }
}
