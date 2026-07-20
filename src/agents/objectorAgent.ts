import { generateObject } from "./aiClient";
import { objectorPrompt } from "./prompts/objectorPrompt";
import { validateTurn } from "./schemas";
import type { DebateTurnOutput } from "./types";

export async function objectorTurn(input: unknown, signal?: AbortSignal): Promise<DebateTurnOutput> {
  return validateTurn(await generateObject({ agent: "objector", systemPrompt: objectorPrompt, input, maxTokens: 900, signal }));
}
