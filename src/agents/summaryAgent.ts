import type { EdictRecord } from "@/types/edictType";
import { generateObject } from "./aiClient";
import { getAgentPrompt } from "./getAgentPrompt";
import { validateConclusion } from "./schemas";
import type { CharacterBrief, DebateConclusionOutput } from "./types";

/**
 * 生成辩论总结（辩论消息从 edict.messages 中读取）
 * @param edict 奏折（含完整辩论消息）
 * @param characters 参与辩论的角色信息（仅正方与反方）
 * @param signal 可选的中止信号
 */
export async function summarizeDebate(
  edict: EdictRecord,
  characters: CharacterBrief[],
  signal?: AbortSignal,
): Promise<DebateConclusionOutput> {
  return validateConclusion(
    await generateObject({
      agent: "summary",
      systemPrompt: getAgentPrompt("summaryPrompt"),
      input: {
        edict: {
          type: edict.type,
          title: edict.title,
          presenter: edict.presenter,
          objector: edict.objector,
          demand: edict.demand,
          messages: edict.messages,
        },
        characters,
      },
      maxTokens: 3200,
      signal,
    }),
  );
}
