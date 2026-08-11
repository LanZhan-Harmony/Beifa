import type { DebateMessage } from "@/types/edictType";
import i18n from "@/langs";
import {
  DEFAULT_MAX_DEBATE_ROUNDS,
  HARD_MAX_DEBATE_ROUNDS,
  MAX_TOTAL_DEBATE_MESSAGES,
  MIN_DEBATE_ROUNDS,
} from "./config";
import { objectorTurn } from "./objectorAgent";
import { presenterTurn } from "./presenterAgent";
import { summarizeDebate } from "./summaryAgent";
import type { DebateConclusionOutput, DebateContext, LiveDebateOptions } from "./types";

/**
 * 运行一场实时辩论
 * @param context 辩论上下文
 * @param options 辩论选项
 * @returns 辩论结果，包括消息列表和结论Promise
 */
export async function runLiveDebate(
  context: DebateContext,
  options: LiveDebateOptions,
): Promise<{
  messages: DebateMessage[];
  conclusion: Promise<DebateConclusionOutput>;
}> {
  const maxRounds = Math.min(
    HARD_MAX_DEBATE_ROUNDS,
    Math.max(MIN_DEBATE_ROUNDS, options.maxRounds ?? DEFAULT_MAX_DEBATE_ROUNDS),
  );
  const transcript: DebateMessage[] = [];
  const relevantCharacters = context.characters.filter(
    (c) => c.id === context.edict.presenter || c.id === context.edict.objector,
  );

  /**
   * 将消息添加到辩论记录中，并触发回调
   * @param sender 消息发送方
   * @param content 消息内容
   */
  function append(sender: DebateMessage["sender"], content: string) {
    const message = { id: transcript.length, sender, content } satisfies DebateMessage;
    transcript.push(message);
    options.onMessage(message);
  }

  for (let round = 1; round <= maxRounds && transcript.length < MAX_TOTAL_DEBATE_MESSAGES - 1; round++) {
    const base = {
      edict: { ...context.edict, messages: transcript },
      characters: relevantCharacters,
      round,
      maxRounds,
      remainingMessages: MAX_TOTAL_DEBATE_MESSAGES - 1 - transcript.length,
    };

    const affirmative = await presenterTurn(base, options.signal);
    for (const content of affirmative.messages) {
      if (transcript.length < MAX_TOTAL_DEBATE_MESSAGES - 1) {
        append("presenter", content);
      }
    }

    const negative = await objectorTurn(base, options.signal);
    for (const content of negative.messages) {
      if (transcript.length < MAX_TOTAL_DEBATE_MESSAGES - 1) {
        append("objector", content);
      }
    }

    if (round >= MIN_DEBATE_ROUNDS && affirmative.readyToConclude && negative.readyToConclude) {
      break;
    }
  }

  const lastSpeaker = transcript.at(-1)?.sender ?? "objector";
  append(lastSpeaker, i18n.global.t("edict.debateMessage.judgmentAppeal"));

  return {
    messages: transcript,
    conclusion: summarizeDebate({ ...context.edict, messages: transcript }, relevantCharacters, options.signal),
  };
}
