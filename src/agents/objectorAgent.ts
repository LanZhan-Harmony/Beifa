import { generateObject } from "./aiClient";
import { objectorPrompt } from "./prompts/objectorPrompt";
import { validateTurn } from "./schemas";
import type { DebateTurnOutput } from "./types";

/**
 * 生成反方辩论内容
 * @param input 之前的辩论内容
 * @param signal 可选的中止信号
 * @returns 反方辩论内容
 */
export async function objectorTurn(input: unknown, signal?: AbortSignal): Promise<DebateTurnOutput> {
  return validateTurn(
    await generateObject({
      agent: "objector",
      systemPrompt: objectorPrompt,
      input,
      maxTokens: 900,
      signal,
    }),
  );
}
