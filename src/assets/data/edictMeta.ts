import type { CharacterId, EdictCategory } from "@/types/edictType";

export const categoryMeta: Record<EdictCategory, { label: string; color: string }> = {
  livelihood: { label: "民生类", color: "#88dd9e" },
  economy: { label: "经济类", color: "#d5b1ff" },
  entertainment: { label: "娱乐类", color: "#e9ff83" },
  culture: { label: "文化类", color: "#fede7e" },
  technology: { label: "科技类", color: "#8acfdc" },
  military: { label: "军事类", color: "#fede7e" },
  diplomacy: { label: "外交类", color: "#88dd9e" },
  workplace: { label: "职场类", color: "#ffb347" },
};

export const speakerMeta: Record<CharacterId, { name: string }> = {
  XieJianAn: { name: "谢建安" },
  ChenWanEr: { name: "陈婉儿" },
  ZuYue: { name: "祖月" },
  LiuNian: { name: "刘念" },
  ZhuYuanZhi: { name: "朱元之" },
  XieXuan: { name: "谢玄" },
  SiKongSheng: { name: "司空盛" },
  SiKongXu: { name: "司空旭" },
  SiKongYu: { name: "司空钰" },
  WangMing: { name: "王明" },
  ChuMeng: { name: "楚蒙" },
  QiuSheng: { name: "邱胜" },
  LiDingYuan: { name: "李定远" },
  QiJiu: { name: "齐九" },
  LinShu: { name: "林戍" },
};

export const portraitUrl = (id: CharacterId) => `/characters/${id}.png`;
