import i18n from "@/langs";

export type AgentPromptKey =
  | "chatPrompt"
  | "edictGeneratorPrompt"
  | "presenterPrompt"
  | "objectorPrompt"
  | "summaryPrompt"
  | "personalityKeywordsPrompt"
  | "personalityReportPrompt";

type AgentMessages = Partial<Record<AgentPromptKey, string>>;

function getAgentMessages(locale: string): AgentMessages {
  const messages = i18n.global.getLocaleMessage(locale) as { agents?: AgentMessages };
  return messages.agents ?? {};
}

export function getAgentPrompt(key: AgentPromptKey): string {
  const locale = String(i18n.global.locale.value);
  const prompt = getAgentMessages(locale)[key] ?? getAgentMessages("en-US")[key];
  if (!prompt) {
    throw new Error("Missing agent prompt: " + key);
  }
  return prompt;
}
