import type { CharacterId, EdictCategory } from "@/types/edictType";
import type { characterType } from "@/types/characterType";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export const categoryMeta: Record<EdictCategory, { label: string; color: string }> = {
  livelihood: { label: "edict.category.livelihood", color: "#88dd9e" },
  economy: { label: "edict.category.economy", color: "#d5b1ff" },
  entertainment: { label: "edict.category.entertainment", color: "#e9ff83" },
  culture: { label: "edict.category.culture", color: "#fede7e" },
  technology: { label: "edict.category.technology", color: "#8acfdc" },
  military: { label: "edict.category.military", color: "#fede7e" },
  diplomacy: { label: "edict.category.diplomacy", color: "#88dd9e" },
  workplace: { label: "edict.category.workplace", color: "#ffb347" },
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
