export type LoveTrait = {
  leftKey: string;
  rightKey: string;
  left?: string;
  right?: string;
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
    { leftKey: "pragmatic", rightKey: "romantic", icon: 1, iconWidth: "6.05%", value: randomValue() },
    { leftKey: "independent", rightKey: "dependent", icon: 2, iconWidth: "6.25%", value: randomValue() },
    { leftKey: "open", rightKey: "loyal", icon: 3, iconWidth: "5.47%", value: randomValue() },
    { leftKey: "conservativeWait", rightKey: "proactivePursuit", icon: 4, iconWidth: "5.47%", value: randomValue() },
    { leftKey: "reasonLed", rightKey: "emotionLed", icon: 5, iconWidth: "5.27%", value: randomValue() },
  ];

  return cachedLoveTraits;
};
