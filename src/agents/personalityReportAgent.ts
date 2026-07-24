import type { PersonalityRoleId, PersonalityRoleType, PersonalityType } from "@/types/personalityType";
import { generateObject } from "./aiClient";
import { personalityKeywordsPrompt } from "./prompts/personalityKeywordsPrompt";
import { personalityReportPrompt } from "./prompts/personalityReportPrompt";
import { validatePersonalityKeywords, validatePersonalityReport } from "./schemas";
import type { PersonalityReportDraft } from "./types";

export async function generatePersonalityReport(
  roles: PersonalityRoleType[],
  allowedKeywords: string[],
  chosenOptionPrompts: string[],
  signal?: AbortSignal,
): Promise<{ report: PersonalityType; draft: PersonalityReportDraft }> {
  const roleIds = roles.map((role) => role.id) as PersonalityRoleId[];
  const raw = await generateObject<PersonalityReportDraft>({
    agent: "personality-report",
    systemPrompt: personalityReportPrompt,
    input: {
      locale: "zh-CN",
      roleIds,
      allowedKeywords,
      chosenOptionPrompts: chosenOptionPrompts.slice(0, 120).map((item) => item.slice(0, 80)),
    },
    maxTokens: 900,
    signal,
  });
  const draft = validatePersonalityReport(raw, roleIds, allowedKeywords);
  const role = roles.find((item) => item.id === draft.roleId);
  if (!role) throw new Error("人格角色不存在。");
  return {
    draft,
    report: {
      role,
      keywords: draft.keywords,
      proportion: draft.proportion,
      friendId: draft.friendId as PersonalityRoleId,
      friendMessage: draft.friendMessage,
      enemyId: draft.enemyId as PersonalityRoleId,
      enemyMessage: draft.enemyMessage,
    },
  };
}

/** Generate only the current word cloud before the game has been completed. */
export async function generatePersonalityKeywords(
  chosenOptionPrompts: string[],
  signal?: AbortSignal,
): Promise<string[]> {
  const raw = await generateObject<{ keywords: string[] }>({
    agent: "personality-keywords",
    systemPrompt: personalityKeywordsPrompt,
    input: {
      locale: "zh-CN",
      chosenOptionPrompts: chosenOptionPrompts.slice(0, 120).map((item) => item.slice(0, 80)),
    },
    maxTokens: 400,
    signal,
  });
  return validatePersonalityKeywords(raw);
}
