import { generateObject } from "./aiClient";
import { presenterPrompt } from "./prompts/presenterPrompt";
import { validateTurn } from "./schemas";
import type { DebateTurnOutput } from "./types";

export async function presenterTurn(input: unknown, signal?: AbortSignal): Promise<DebateTurnOutput> {
  return validateTurn(await generateObject({ agent: "presenter", systemPrompt: presenterPrompt, input, maxTokens: 900, signal }));
}
