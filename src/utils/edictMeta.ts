import type { CharacterId, EdictCategory } from "@/types/edictType";

export const categoryMeta: Record<EdictCategory, { label: string; color: string }> = {
  livelihood: { label: "民生类", color: "#88dd9e" }, economy: { label: "经济类", color: "#d5b1ff" },
  entertainment: { label: "娱乐类", color: "#e9ff83" }, culture: { label: "文化类", color: "#fede7e" },
  technology: { label: "科技类", color: "#8acfdc" }, military: { label: "军事类", color: "#fede7e" },
  diplomacy: { label: "外交类", color: "#88dd9e" }, workplace: { label: "职场类", color: "#ffb347" },
};

export const speakerMeta: Record<CharacterId, { name: string; title: string }> = {
  XieJianAn: { name: "谢建安", title: "中书令" }, ChenWanEr: { name: "陈婉儿", title: "户部侍郎" },
  ZuYue: { name: "祖月", title: "御史中丞" }, LiuNian: { name: "刘念", title: "太常卿" },
  ZhuYuanZhi: { name: "朱元之", title: "尚书左丞" }, XieXuan: { name: "谢玄", title: "工部尚书" },
  SiKongSheng: { name: "司空盛", title: "宗正卿" }, SiKongXu: { name: "司空旭", title: "宁王" },
  SiKongYu: { name: "司空钰", title: "太平公主" }, WangMing: { name: "王明", title: "国子祭酒" },
  ChuMeng: { name: "楚蒙", title: "卫尉卿" }, QiuSheng: { name: "邱胜", title: "大司农" },
  LiDingYuan: { name: "李定远", title: "兵部尚书" }, QiJiu: { name: "齐九", title: "鸿胪卿" },
  LinShu: { name: "林戍", title: "京兆尹" },
};

export const portraitUrl = (id: CharacterId) => `/characters/${id}.png`;
