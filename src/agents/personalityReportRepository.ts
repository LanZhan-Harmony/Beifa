import type { actionItemType } from "@/types/actionGroupType";
import type { CachedPersonalityReport } from "./types";

export type InitialActions = Record<string, Record<string, Pick<actionItemType, "prompt" | "index" | "key">>>;
const ACTIONS_KEY = "mandate.personality.initial-actions.v1";
const REPORTS_KEY = "mandate.personality.reports.v1";
const KEYWORDS_KEY = "mandate.personality.keywords.v1";
function read<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "");
    return value && typeof value === "object" ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function saveInitialAction(saveId: number, storyletId: string, action: actionItemType) {
  const all = read<InitialActions>(ACTIONS_KEY, {});
  const group = all[String(saveId)] ?? {};
  const key = `${storyletId}::${action.key}`;
  if (!group[key]) {
    group[key] = { prompt: action.prompt, index: action.index, key: action.key };
    all[String(saveId)] = group;
    write(ACTIONS_KEY, all);
  }
}
export function initialActions(saveId: number) {
  return read<InitialActions>(ACTIONS_KEY, {})[String(saveId)] ?? {};
}
export function fingerprint(actions: Record<string, Pick<actionItemType, "prompt" | "index" | "key">>) {
  return JSON.stringify(
    Object.keys(actions)
      .sort()
      .map((key) => [key, actions[key]!.prompt]),
  );
}
export function loadCachedReport(saveId: number) {
  return read<Record<string, CachedPersonalityReport>>(REPORTS_KEY, {})[String(saveId)];
}
export function cacheReport(saveId: number, report: CachedPersonalityReport) {
  const all = read<Record<string, CachedPersonalityReport>>(REPORTS_KEY, {});
  all[String(saveId)] = report;
  write(REPORTS_KEY, all);
}
export function loadCachedKeywords(saveId: number): string[] | undefined {
  const keywords = read<Record<string, unknown>>(KEYWORDS_KEY, {})[String(saveId)];
  if (!Array.isArray(keywords) || keywords.some((item) => typeof item !== "string" || !item.trim())) return undefined;
  return keywords.map((item) => item.trim());
}
export function cacheKeywords(saveId: number, keywords: string[]) {
  const all = read<Record<string, string[]>>(KEYWORDS_KEY, {});
  all[String(saveId)] = keywords;
  write(KEYWORDS_KEY, all);
}
