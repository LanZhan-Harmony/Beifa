import type { DebateMessage, EdictRecord } from "@/types/edictType";
import { generateObject } from "./aiClient";
import { summaryPrompt } from "./prompts/summaryPrompt";
import { validateConclusion } from "./schemas";
import type { CharacterBrief, DebateConclusionOutput } from "./types";

export async function summarizeDebate(edict: EdictRecord, messages: DebateMessage[], characters: CharacterBrief[], signal?: AbortSignal): Promise<DebateConclusionOutput> {
  return validateConclusion(await generateObject({ agent: "summary", systemPrompt: summaryPrompt, input: { edict: { type: edict.type, title: edict.title, presenter: edict.presenter, objector: edict.objector, demand: edict.demand }, characters, transcript: messages }, maxTokens: 3200, signal }));
}
