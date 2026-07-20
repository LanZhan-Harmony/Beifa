import type { CharacterId, DebateMessage, EdictCategory, EdictOutcome, EdictRecord } from "@/types/edictType";

export type AgentName = "edict-generator" | "presenter" | "objector" | "summary";

export interface GeneratedEdictDraft {
  type: EdictCategory;
  title: string;
  presenter: CharacterId;
  objector: CharacterId;
  demand: string;
  shouldDeepThought: boolean;
}

export interface GeneratedEdictBatch { edicts: GeneratedEdictDraft[] }
export interface DebateTurnOutput { messages: string[]; readyToConclude: boolean }
export interface DebateConclusionOutput {
  summary: { content: string; keyPoints: string[] };
  shouldDeepThought: boolean;
  outcomes: { approved: EdictOutcome & { emperorComment: string }; rejected: EdictOutcome };
}
export interface PreparedDebate { messages: DebateMessage[]; conclusion: Promise<DebateConclusionOutput> }
export interface CharacterBrief { id: CharacterId; name: string; title: string; description?: string }
export interface DebateContext { edict: EdictRecord; characters: CharacterBrief[]; maxRounds?: number }
