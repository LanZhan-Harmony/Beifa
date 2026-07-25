import type { CharacterId, EdictCategory, EdictOutcome } from "@/types/edictType";
import type { PersonalityRoleId } from "@/types/personalityType";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES_PER_TURN } from "./config";
import { AiError } from "./errors";
import type {
  DebateConclusionOutput,
  DebateTurnOutput,
  GeneratedEdictBatch,
  GeneratedEdictDraft,
  PersonalityReportDraft,
} from "./types";

export const characterIds = [
  "XieJianAn",
  "ChenWanEr",
  "ZuYue",
  "LiuNian",
  "ZhuYuanZhi",
  "XieXuan",
  "SiKongSheng",
  "SiKongXu",
  "SiKongYu",
  "WangMing",
  "ChuMeng",
  "QiuSheng",
  "LiDingYuan",
  "QiJiu",
  "LinShu",
] as const;

export const categories = [
  "livelihood",
  "economy",
  "entertainment",
  "culture",
  "technology",
  "military",
  "diplomacy",
  "workplace",
] as const;

function text(value: unknown, min: number, max: number, label: string): string {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new AiError(`${label}长度无效。`, "schema");
  }
  return value.trim();
}

function isCharacter(v: unknown): v is CharacterId {
  return characterIds.includes(v as CharacterId);
}

function isCategory(v: unknown): v is EdictCategory {
  return categories.includes(v as EdictCategory);
}

/**
 * 验证 AI 生成的奏折格式
 * @param value AI 生成的原始数据
 * @param limit 最大生成数量
 * @returns 验证后的奏折
 */
export function validateBatch(value: unknown, limit: number): GeneratedEdictBatch {
  const rows = (value as any)?.edicts;
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > limit) throw new AiError("奏折批次格式无效。", "schema");
  return {
    edicts: rows.map((row: any): GeneratedEdictDraft => {
      if (
        !isCategory(row.type) ||
        !isCharacter(row.presenter) ||
        !isCharacter(row.objector) ||
        row.presenter === row.objector
      ) {
        throw new AiError("奏折人物或分类无效。", "schema");
      }
      return {
        type: row.type,
        title: text(row.title, 2, 12, "标题"),
        presenter: row.presenter,
        objector: row.objector,
        demand: text(row.demand, 10, 140, "诉求"),
      };
    }),
  };
}

/**
 * 验证 AI 生成的辩论回复格式
 * @param value AI 生成的原始数据
 * @returns 验证后的辩论回复
 */
export function validateTurn(value: unknown): DebateTurnOutput {
  const messages = (value as any)?.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES_PER_TURN) {
    throw new AiError("辩论回复格式无效。", "schema");
  }
  const cleaned = messages.map((m) => text(m, 1, MAX_MESSAGE_CHARS, "辩论消息")).filter((m) => m !== "请陛下明鉴！");
  if (!cleaned.length) {
    throw new AiError("辩论回复没有有效消息。", "schema");
  }
  return {
    messages: cleaned,
    readyToConclude: Boolean((value as any).readyToConclude),
  };
}

/**
 * 验证 AI 生成的奏折结案格式
 * @param value AI 生成的原始数据
 * @returns 验证后的奏折结案
 */
export function validateConclusion(value: unknown): DebateConclusionOutput {
  const v = value as any;
  const outcomes = v?.outcomes ?? { approved: v?.approved, rejected: v?.rejected };
  const approved = validateOutcome(outcomes.approved, "approved") as EdictOutcome & { emperorComment: string };
  const rejected = validateOutcome(outcomes.rejected, "rejected");
  if (!approved.title.startsWith("准奏！") || !rejected.title.startsWith("驳回！")) {
    throw new AiError("结案标题格式无效。", "schema");
  }
  return {
    shouldDeepThought: Boolean(v.shouldDeepThought),
    outcomes: { approved, rejected },
  };
}

function validateOutcome(value: any, decision: "approved" | "rejected"): EdictOutcome {
  if (!value || typeof value !== "object") {
    throw new AiError("结案内容无效。", "schema");
  }
  const feedback = value.feedback;
  if (!feedback || typeof feedback !== "object") {
    throw new AiError("结案反馈无效。", "schema");
  }
  const speaker =
    feedback.speaker === "presenter" || feedback.speaker === "objector"
      ? feedback.speaker
      : decision === "approved"
        ? "presenter"
        : "objector";
  const outcome: EdictOutcome = {
    title: text(value.title ?? (decision === "approved" ? "准奏！" : "驳回！"), 2, 40, "结案标题"),
    content: text(value.content, 2, 500, "结案内容"),
    feedback: { speaker, content: text(feedback.content, 2, 100, "人物反馈") },
  };
  if (decision === "approved") {
    outcome.emperorComment = text(value.emperorComment, 2, 600, "圣旨").replace(/钦此[！。!]?\s*$/, "");
  }
  return outcome;
}

/** Validate the deliberately narrow AI payload for the personality report. */
export function validatePersonalityReport(
  value: unknown,
  roleIds: readonly PersonalityRoleId[],
): PersonalityReportDraft {
  const row = value as Partial<PersonalityReportDraft>;
  const isRole = (id: unknown): id is PersonalityRoleId =>
    typeof id === "string" && roleIds.includes(id as PersonalityRoleId);
  if (
    !isRole(row.roleId) ||
    !isRole(row.friendId) ||
    !isRole(row.enemyId) ||
    new Set([row.roleId, row.friendId, row.enemyId]).size !== 3
  ) {
    throw new AiError("人格角色格式无效。", "schema");
  }
  const keywords = Array.isArray(row.keywords)
    ? [...new Set(row.keywords.filter((item): item is string => typeof item === "string"))]
    : [];
  if (keywords.length < 12 || keywords.length > 18) {
    throw new AiError("人格关键词格式无效。", "schema");
  }
  if (!Number.isInteger(row.proportion) || (row.proportion as number) < 1 || (row.proportion as number) > 99) {
    throw new AiError("人格占比格式无效。", "schema");
  }
  const message = (value: unknown, label: string) => {
    if (typeof value !== "string" || value.trim().length < 6 || value.trim().length > 48)
      throw new AiError(`${label}格式无效。`, "schema");
    return value.trim();
  };
  return {
    roleId: row.roleId,
    keywords,
    proportion: row.proportion as number,
    friendId: row.friendId,
    friendMessage: message(row.friendMessage, "知己寄语"),
    enemyId: row.enemyId,
    enemyMessage: message(row.enemyMessage, "互补寄语"),
  };
}

/** Validate the lightweight in-progress personality keyword payload. */
export function validatePersonalityKeywords(value: unknown): string[] {
  const row = value as { keywords?: unknown };
  const keywords = Array.isArray(row.keywords)
    ? [
        ...new Set(
          row.keywords
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ]
    : [];
  if (keywords.length < 12 || keywords.length > 18) {
    throw new AiError("人格关键词格式无效。", "schema");
  }
  return keywords;
}
