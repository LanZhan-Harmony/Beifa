import i18n from "@/langs";
import type { personalityReportType, personalityRoleId, personalityRoleType } from "@/types/personalityType";
import { generateObject } from "./aiClient";
import { getAgentPrompt } from "./getAgentPrompt";
import { validatePersonalityKeywords, validatePersonalityReport } from "./schemas";
import type { PersonalityReportDraft } from "./types";

export async function generatePersonalityReport(
  roles: personalityRoleType[],
  allowedKeywords: string[],
  chosenOptionPrompts: string[],
  signal?: AbortSignal,
): Promise<{ report: personalityReportType; draft: PersonalityReportDraft }> {
  const roleIds = roles.map((role) => role.id) as personalityRoleId[];
  const draft = await generateObject<PersonalityReportDraft>({
    agent: "personality-report",
    systemPrompt: getAgentPrompt("personalityReportPrompt"),
    input: {
      locale: i18n.global.locale.value,
      roleIds,
      allowedKeywords,
      chosenOptionPrompts: chosenOptionPrompts.slice(0, 120).map((item) => item.slice(0, 80)),
    },
    maxTokens: 900,
    signal,
    validate: (value) => validatePersonalityReport(value, roleIds),
  });
  const role = roles.find((item) => item.id === draft.roleId);
  if (!role) throw new Error("人格角色不存在。");
  return {
    draft,
    report: {
      role,
      keywords: draft.keywords,
      proportion: draft.proportion,
      friendId: draft.friendId as personalityRoleId,
      friendMessage: draft.friendMessage,
      enemyId: draft.enemyId as personalityRoleId,
      enemyMessage: draft.enemyMessage,
    },
  };
}

/** Generate only the current word cloud before the game has been completed. */
export async function generatePersonalityKeywords(
  chosenOptionPrompts: string[],
  signal?: AbortSignal,
): Promise<string[]> {
  return generateObject<string[]>({
    agent: "personality-keywords",
    systemPrompt: getAgentPrompt("personalityKeywordsPrompt"),
    input: {
      locale: i18n.global.locale.value,
      chosenOptionPrompts: chosenOptionPrompts.slice(0, 120).map((item) => item.slice(0, 80)),
    },
    maxTokens: 400,
    signal,
    validate: (value) => validatePersonalityKeywords(value),
  });
}

