import { MAX_MESSAGE_CHARS, MAX_MESSAGES_PER_TURN } from "./config";
import { AiError } from "./errors";
import type { CharacterId, EdictCategory, EdictOutcome } from "@/types/edictType";
import type { DebateConclusionOutput, DebateTurnOutput, GeneratedEdictBatch, GeneratedEdictDraft } from "./types";

export const characterIds = ["XieJianAn","ChenWanEr","ZuYue","LiuNian","ZhuYuanZhi","XieXuan","SiKongSheng","SiKongXu","SiKongYu","WangMing","ChuMeng","QiuSheng","LiDingYuan","QiJiu","LinShu"] as const;
export const categories = ["livelihood","economy","entertainment","culture","technology","military","diplomacy","workplace"] as const;

const text = (value: unknown, min: number, max: number, label: string) => {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) throw new AiError(`${label}长度无效。`, "schema");
  return value.trim();
};
const isCharacter = (v: unknown): v is CharacterId => characterIds.includes(v as CharacterId);
const isCategory = (v: unknown): v is EdictCategory => categories.includes(v as EdictCategory);

export function validateBatch(value: unknown, limit: number): GeneratedEdictBatch {
  const rows = (value as any)?.edicts;
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > limit) throw new AiError("奏折批次格式无效。", "schema");
  return { edicts: rows.map((row: any): GeneratedEdictDraft => {
    if (!isCategory(row.type) || !isCharacter(row.presenter) || !isCharacter(row.objector) || row.presenter === row.objector) throw new AiError("奏折人物或分类无效。", "schema");
    return { type: row.type, title: text(row.title, 2, 12, "标题"), presenter: row.presenter, objector: row.objector, demand: text(row.demand, 10, 140, "诉求"), shouldDeepThought: Boolean(row.shouldDeepThought) };
  }) };
}

export function validateTurn(value: unknown): DebateTurnOutput {
  const messages = (value as any)?.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES_PER_TURN) throw new AiError("辩论回复格式无效。", "schema");
  const cleaned = messages.map((m) => text(m, 1, MAX_MESSAGE_CHARS, "辩论消息")).filter((m) => m !== "请陛下明鉴！");
  if (!cleaned.length) throw new AiError("辩论回复没有有效消息。", "schema");
  return { messages: cleaned, readyToConclude: Boolean((value as any).readyToConclude) };
}

function validateOutcome(value: any, decision: "approved" | "rejected"): EdictOutcome {
  const expected = decision === "approved" ? "presenter" : "objector";
  if (!value?.feedback || !["presenter", "objector"].includes(value.feedback.speaker)) throw new AiError("结案反馈无效。", "schema");
  const outcome: EdictOutcome = { title: text(value.title, 3, 20, "结案标题"), content: text(value.content, 20, 500, "结案内容"), feedback: { speaker: value.feedback.speaker ?? expected, content: text(value.feedback.content, 2, 100, "人物反馈") } };
  if (decision === "approved") outcome.emperorComment = text(value.emperorComment, 20, 500, "圣旨").replace(/钦此[！。!]?\s*$/, "");
  return outcome;
}

export function validateConclusion(value: unknown): DebateConclusionOutput {
  const v = value as any;
  if (!v?.summary || !Array.isArray(v.summary.keyPoints) || v.summary.keyPoints.length < 2 || v.summary.keyPoints.length > 6) throw new AiError("廷议总结格式无效。", "schema");
  const approved = validateOutcome(v.outcomes?.approved, "approved") as EdictOutcome & { emperorComment: string };
  const rejected = validateOutcome(v.outcomes?.rejected, "rejected");
  if (!approved.title.startsWith("准奏！") || !rejected.title.startsWith("驳回！")) throw new AiError("结案标题格式无效。", "schema");
  return { summary: { content: text(v.summary.content, 20, 300, "廷议总结"), keyPoints: v.summary.keyPoints.map((p: unknown) => text(p, 2, 80, "总结要点")) }, shouldDeepThought: Boolean(v.shouldDeepThought), outcomes: { approved, rejected } };
}
