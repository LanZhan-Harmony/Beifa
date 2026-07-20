import type { DebateMessage } from "@/types/edictType";
import { DEFAULT_MAX_DEBATE_ROUNDS, HARD_MAX_DEBATE_ROUNDS, MAX_TOTAL_DEBATE_MESSAGES, MIN_DEBATE_ROUNDS } from "./config";
import { objectorTurn } from "./objectorAgent";
import { presenterTurn } from "./presenterAgent";
import { summarizeDebate } from "./summaryAgent";
import type { DebateContext, PreparedDebate } from "./types";

export async function prepareDebate(context: DebateContext, signal?: AbortSignal): Promise<PreparedDebate> {
  const maxRounds = Math.min(HARD_MAX_DEBATE_ROUNDS, Math.max(MIN_DEBATE_ROUNDS, context.maxRounds ?? DEFAULT_MAX_DEBATE_ROUNDS));
  const transcript: DebateMessage[] = [];
  for (let round = 1; round <= maxRounds && transcript.length < MAX_TOTAL_DEBATE_MESSAGES - 1; round++) {
    const base = { edict: context.edict, characters: context.characters, transcript, round, maxRounds, remainingMessages: MAX_TOTAL_DEBATE_MESSAGES - 1 - transcript.length };
    const affirmative = await presenterTurn(base, signal);
    for (const content of affirmative.messages) if (transcript.length < MAX_TOTAL_DEBATE_MESSAGES - 1) transcript.push({ id: transcript.length, sender: "presenter", content });
    const negative = await objectorTurn({ ...base, transcript }, signal);
    for (const content of negative.messages) if (transcript.length < MAX_TOTAL_DEBATE_MESSAGES - 1) transcript.push({ id: transcript.length, sender: "objector", content });
    if (round >= MIN_DEBATE_ROUNDS && affirmative.readyToConclude && negative.readyToConclude) break;
  }
  transcript.push({ id: transcript.length, sender: "objector", content: "请陛下明鉴！" });
  return { messages: transcript, conclusion: summarizeDebate(context.edict, transcript, context.characters, signal) };
}
