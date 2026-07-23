import type { EdictRecord } from "@/types/edictType";
import { v7 as uuidv7 } from "uuid";
import { generateObject } from "./aiClient";
import { MAX_GENERATION_BATCH } from "./config";
import { edictGeneratorPrompt } from "./prompts/edictGeneratorPrompt";
import { categories, characterIds, validateBatch } from "./schemas";
import type { CharacterBrief, GeneratedEdictBatch } from "./types";

/**
 * 生成奏折
 * @param count 生成数量
 * @param characters 可用人物列表
 * @param recent 最近的奏折列表，用于避免重复
 * @param signal 可选的AbortSignal，用于取消请求
 * @returns 生成的奏折列表
 */
export async function generateEdicts(
  count: number,
  characters: CharacterBrief[],
  recent: EdictRecord[],
  signal?: AbortSignal,
): Promise<EdictRecord[]> {
  const amount = Math.max(1, Math.min(MAX_GENERATION_BATCH, count));
  const raw = await generateObject<GeneratedEdictBatch>({
    agent: "edict-generator",
    systemPrompt: edictGeneratorPrompt,
    input: {
      count: amount,
      locale: "zh-CN",
      categories,
      allowedCharacterIds: characterIds,
      characters,
      recent: recent.slice(-10).map(({ title, demand }) => ({ title, demand })),
    },
    maxTokens: 2800,
    signal,
  });
  const batch = validateBatch(raw, amount);
  const existing = new Set(recent.map((e) => `${e.title.trim()}|${e.demand.trim()}`));
  return batch.edicts
    .filter((e) => !existing.has(`${e.title}|${e.demand}`))
    .map((draft) => ({
      id: uuidv7(),
      ...draft,
      messages: [],
      status: "pending",
      outcomes: {},
      source: "ai",
      createdAt: new Date().toISOString(),
    }));
}
