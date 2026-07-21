import type { DebateMessage, EdictRecord } from "@/types/edictType";
import { generateObject } from "./aiClient";
import { summaryPrompt } from "./prompts/summaryPrompt";
import { validateConclusion } from "./schemas";
import type { CharacterBrief, DebateConclusionOutput } from "./types";

/**
 * 生成辩论总结
 * @param edict 奏折
 * @param messages 辩论消息
 * @param characters 参与辩论的角色信息
 * @param signal 可选的中止信号
 * @returns 辩论总结
 */
export async function summarizeDebate(
  edict: EdictRecord,
  messages: DebateMessage[],
  characters: CharacterBrief[],
  signal?: AbortSignal,
): Promise<DebateConclusionOutput> {
  return validateConclusion(
    await generateObject({
      agent: "summary",
      systemPrompt: summaryPrompt,
      input: {
        edict: {
          type: edict.type,
          title: edict.title,
          presenter: edict.presenter,
          objector: edict.objector,
          demand: edict.demand,
        },
        characters,
        transcript: messages,
      },
      maxTokens: 3200,
      signal,
    }),
  );
}

