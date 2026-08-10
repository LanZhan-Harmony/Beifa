import type { CharacterId, EdictCategory } from "@/types/edictType";
import type { characterType } from "@/types/characterType";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

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

export const speakerIds = [
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
] as const satisfies readonly CharacterId[];

export function useSpeakerMeta() {
  const { tm } = useI18n();

  return computed<Record<CharacterId, { name: string }>>(() => {
    const characters = tm("characters") as characterType[];
    const charactersById = new Map(characters.map((character) => [character.id, character]));

    return Object.fromEntries(
      speakerIds.map((id) => [id, { name: charactersById.get(id)?.name ?? id }]),
    ) as Record<CharacterId, { name: string }>;
  });
}

export const portraitUrl = (id: CharacterId) => `/characters/${id}.png`;
