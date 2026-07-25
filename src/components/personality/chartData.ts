export type LoveTrait = {
  left: string;
  right: string;
  icon: number;
  iconWidth: string;
  value: number;
};

const randomValue = () => Math.floor(Math.random() * 53) + 27;

let cachedLoveTraits: LoveTrait[] | null = null;

export const getDirection = (value: number) => (value >= 50 ? "left" : "right");

export const getLoveTraits = () => {
  if (cachedLoveTraits) {
    return cachedLoveTraits;
  }

  cachedLoveTraits = [
    { left: "务实型", right: "浪漫型", icon: 1, iconWidth: "6.05%", value: randomValue() },
    { left: "独立型", right: "依赖型", icon: 2, iconWidth: "6.25%", value: randomValue() },
    { left: "开放型", right: "忠诚型", icon: 3, iconWidth: "5.47%", value: randomValue() },
    { left: "保守等待型", right: "主动追求型", icon: 4, iconWidth: "5.47%", value: randomValue() },
    { left: "理性主导型", right: "感情主导型", icon: 5, iconWidth: "5.27%", value: randomValue() },
  ];

  return cachedLoveTraits;
};
