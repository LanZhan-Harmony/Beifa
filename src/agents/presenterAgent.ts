import { generateObject } from "./aiClient";
import { presenterPrompt } from "./prompts/presenterPrompt";
import { validateTurn } from "./schemas";
import type { DebateTurnOutput } from "./types";

/**
 * 生成正方辩论内容
 * @param input 之前的辩论内容
 * @param signal 可选的中止信号
 * @returns 正方辩论内容
 */
export async function presenterTurn(input: unknown, signal?: AbortSignal): Promise<DebateTurnOutput> {
  return validateTurn(
    await generateObject({
      agent: "presenter",
      systemPrompt: presenterPrompt,
      input,
      maxTokens: 900,
      signal,
    }),
  );
}
