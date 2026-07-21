import type { CharacterId, DebateMessage, EdictCategory, EdictOutcome, EdictRecord } from "@/types/edictType";

export type AgentName = "edict-generator" | "presenter" | "objector" | "summary";

export interface GeneratedEdictDraft {
  type: EdictCategory;
  title: string;
  presenter: CharacterId;
  objector: CharacterId;
  demand: string;
}

export interface GeneratedEdictBatch {
  edicts: GeneratedEdictDraft[];
}

export interface DebateTurnOutput {
  messages: string[];
  readyToConclude: boolean;
}

export interface DebateConclusionOutput {
  shouldDeepThought: boolean;
  outcomes: {
    approved: EdictOutcome & { emperorComment: string };
    rejected: EdictOutcome;
  };
}

export interface LiveDebateOptions {
  /** 当有新的辩论消息时触发的回调函数 */
  onMessage: (message: DebateMessage) => void;
  /** 可选的AbortSignal，用于取消请求 */
  signal?: AbortSignal;
  /** 最大辩论轮数 */
  maxRounds?: number;
}

export interface CharacterBrief {
  id: CharacterId;
  name: string;
  description?: string;
}

export interface DebateContext {
  edict: EdictRecord;
  characters: CharacterBrief[];
  maxRounds?: number;
}

