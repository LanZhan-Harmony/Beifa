import type { EdictRecord } from "@/types/edictType";
import { MAX_GENERATION_BATCH } from "./config";
import { generateObject } from "./aiClient";
import { edictGeneratorPrompt } from "./prompts/edictGeneratorPrompt";
import { categories, characterIds, validateBatch } from "./schemas";
import type { CharacterBrief, GeneratedEdictBatch } from "./types";

export async function generateEdicts(count: number, characters: CharacterBrief[], recent: EdictRecord[], signal?: AbortSignal): Promise<EdictRecord[]> {
  const amount = Math.max(1, Math.min(MAX_GENERATION_BATCH, count));
  const raw = await generateObject<GeneratedEdictBatch>({ agent: "edict-generator", systemPrompt: edictGeneratorPrompt, input: { count: amount, locale: "zh-CN", categories, allowedCharacterIds: characterIds, characters, recent: recent.slice(-30).map(({ title, demand }) => ({ title, demand })) }, maxTokens: 2800, signal });
  const batch = validateBatch(raw, amount);
  const existing = new Set(recent.map((e) => `${e.title.trim()}|${e.demand.trim()}`));
  return batch.edicts.filter((e) => !existing.has(`${e.title}|${e.demand}`)).map((draft) => ({ id: crypto.randomUUID(), ...draft, messages: [], status: "pending", outcomes: {}, source: "ai", createdAt: new Date().toISOString() }));
}
