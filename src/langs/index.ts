import { createI18n } from "vue-i18n";

export const APP_LOCALES = ["en-US", "zh-CN", "zh-HK", "ko-KR", "ja-JP", "ru-RU"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

// The API uses the server locale identifiers from the official client.
const serverLocaleByAppLocale: Record<AppLocale, string> = {
  "en-US": "en",
  "zh-CN": "zh_CN",
  // The server client currently exposes only zh_CN for Chinese content.
  "zh-HK": "zh_CN",
  "ko-KR": "ko_KR",
  "ja-JP": "ja_JP",
  "ru-RU": "ru_RU",
};

const acceptLanguageByAppLocale: Record<AppLocale, string> = {
  "en-US": "en",
  "zh-CN": "zh-cmn-Hans",
  "zh-HK": "zh-cmn-Hans",
  "ko-KR": "ko",
  "ja-JP": "ja",
  "ru-RU": "ru",
};

export function getServerLocale(locale: string): string {
  return serverLocaleByAppLocale[locale as AppLocale] ?? locale.replace("-", "_");
}

export function getAcceptLanguage(locale: string): string {
  const primary = acceptLanguageByAppLocale[locale as AppLocale] ?? locale.split("-")[0] ?? "en";
  return `${primary}, zh-cmn-Hans;q=0.1`;
}

// 自动导入所有 JSON 文件
const commonFiles = import.meta.glob("./common/*.json", { eager: true, import: "default" });
const chapterFiles = import.meta.glob("./chapters/*.json", { eager: true, import: "default" });
const characterFiles = import.meta.glob("./characters/*.json", { eager: true, import: "default" });
const storylineFiles = import.meta.glob("./storylines/*.json", { eager: true, import: "default" });
const endingFiles = import.meta.glob("./endings/*.json", { eager: true, import: "default" });
const achievementFiles = import.meta.glob("./achievements/*.json", { eager: true, import: "default" });
const introductionsFiles = import.meta.glob("./introductions/*.json", { eager: true, import: "default" });
const valueChangesFiles = import.meta.glob("./valueChanges/*.json", { eager: true, import: "default" });
const creditsFiles = import.meta.glob("./credits/*.json", { eager: true, import: "default" });
const edictsFiles = import.meta.glob("./edicts/*.json", { eager: true, import: "default" });
const personalityFiles = import.meta.glob("./personalities/*.json", { eager: true, import: "default" });
const agentFiles = import.meta.glob("./agents/*.json", { eager: true, import: "default" });

const messages: Record<string, any> = {};

// 合并语言包函数
const mergeMessages = (files: Record<string, any>, prefix: string) => {
  Object.keys(files).forEach((path) => {
    // 从路径中提取语言代码，例如 "./common/zh-CN.json" -> "zh-CN"
    const langMatch = path.match(new RegExp(`\\.\\/${prefix}\\/(.*)\\.json$`));
    if (langMatch) {
      const lang = langMatch[1]!;
      if (!messages[lang]) {
        messages[lang] = {};
      }
      Object.assign(messages[lang], files[path]);
    }
  });
};

mergeMessages(commonFiles, "common");
mergeMessages(characterFiles, "characters");
mergeMessages(chapterFiles, "chapters");
mergeMessages(storylineFiles, "storylines");
mergeMessages(endingFiles, "endings");
mergeMessages(achievementFiles, "achievements");
mergeMessages(introductionsFiles, "introductions");
mergeMessages(valueChangesFiles, "valueChanges");
mergeMessages(creditsFiles, "credits");
mergeMessages(edictsFiles, "edicts");
mergeMessages(personalityFiles, "personalities");
mergeMessages(agentFiles, "agents");

// 获取初始语言：优先读取本地缓存，其次匹配浏览器语言
const getInitialLocale = (): string => {
  const savedLocale = localStorage.getItem("locale");
  if (savedLocale) return savedLocale;

  const navLang = navigator.language;
  if (!navLang) return "en-US";

  // 匹配项目中存在的语言代码
  if (navLang.startsWith("zh")) {
    return navLang.includes("HK") || navLang.includes("TW") || navLang.includes("MO") ? "zh-HK" : "zh-CN";
  }
  if (navLang.startsWith("ja")) return "ja-JP";
  if (navLang.startsWith("ko")) return "ko-KR";
  if (navLang.startsWith("en")) return "en-US";
  if (navLang.startsWith("ru")) return "ru-RU";

  return "en-US";
};

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getInitialLocale(), // 使用探测函数初始化
  fallbackLocale: "en-US", // 备用语言
  messages,
});

export default i18n;
