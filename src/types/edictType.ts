export type EdictCategory =
  | "livelihood"
  | "economy"
  | "entertainment"
  | "culture"
  | "technology"
  | "military"
  | "diplomacy"
  | "workplace";

export type CharacterId =
  | "XieJianAn"
  | "ChenWanEr"
  | "ZuYue"
  | "LiuNian"
  | "ZhuYuanZhi"
  | "XieXuan"
  | "SiKongSheng"
  | "SiKongXu"
  | "SiKongYu"
  | "WangMing"
  | "ChuMeng"
  | "QiuSheng"
  | "LiDingYuan"
  | "QiJiu"
  | "LinShu";

export type DebateSide = "presenter" | "objector";
export type EdictDecision = "approved" | "rejected";
export type EdictStatus = "pending" | EdictDecision;
export type EdictSource = "authored" | "ai";

export interface DebateMessage {
  id: number;
  sender: DebateSide;
  content: string;
}

export interface ResultFeedback {
  speaker: DebateSide;
  content: string;
}

export interface EdictOutcome {
  title: string;
  content: string;
  feedback: ResultFeedback;
  /** 仅准奏结局使用；正文不包含末尾固定的“钦此！”。 */
  emperorComment?: string;
}

export type EdictOutcomes = Partial<Record<EdictDecision, EdictOutcome>>;

export interface EdictRecord {
  id: string;
  type: EdictCategory;
  title: string;
  presenter: CharacterId;
  objector: CharacterId;
  demand: string;
  messages: DebateMessage[];
  status: EdictStatus;
  /** 是否需要三思 */
  shouldDeepThought?: boolean;
  outcomes: EdictOutcomes;
  source: EdictSource;
  /** AI 生成记录的 ISO 8601 时间；人工预置记录可省略。 */
  createdAt?: string;
}

