<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

type ChartSection = "workplace" | "relationship";

const props = defineProps<{
  section: ChartSection;
}>();

const root = "/common/images/personality/chart/";

type Item = {
  label: string;
  value: number;
  color: string;
  tab: number;
  x: number;
  y: number;
  align: "left" | "right";
};

const { t } = useI18n();

const charts: Record<ChartSection, Item[]> = {
  workplace: [
    { label: "personalityUi.chart.labels.workplace.resourcefulness", value: 14, color: "#b77162", tab: 1, x: 50, y: 22, align: "left" },
    { label: "personalityUi.chart.labels.workplace.ambitionAchievement", value: 9, color: "#e0a85e", tab: 5, x: 62, y: 50, align: "right" },
    { label: "personalityUi.chart.labels.workplace.managingUp", value: 13, color: "#67c5b1", tab: 6, x: 53, y: 81, align: "right" },
    { label: "personalityUi.chart.labels.workplace.changeResilience", value: 16, color: "#a09bd3", tab: 7, x: 18, y: 84, align: "right" },
    { label: "personalityUi.chart.labels.workplace.bidingTime", value: 10, color: "#8db7c8", tab: 4, x: -3, y: 60, align: "left" },
    { label: "personalityUi.chart.labels.workplace.decisiveness", value: 17, color: "#d99abb", tab: 3, x: -5, y: 33, align: "left" },
    { label: "personalityUi.chart.labels.workplace.adaptability", value: 21, color: "#ddd377", tab: 2, x: 22, y: 15, align: "left" },
  ],
  relationship: [
    { label: "personalityUi.chart.labels.relationship.sociability", value: 18, color: "#e0a85e", tab: 5, x: 58, y: 33, align: "right" },
    { label: "personalityUi.chart.labels.relationship.emotionalStability", value: 12, color: "#67c5b1", tab: 6, x: 60, y: 70, align: "right" },
    { label: "personalityUi.chart.labels.relationship.curiosity", value: 20, color: "#a09bd3", tab: 7, x: 12, y: 82, align: "right" },
    { label: "personalityUi.chart.labels.relationship.openness", value: 26, color: "#8db7c8", tab: 4, x: -5, y: 50, align: "left" },
    { label: "personalityUi.chart.labels.relationship.skepticism", value: 24, color: "#d99abb", tab: 3, x: 20, y: 15, align: "left" },
  ],
};

const items = computed(() => charts[props.section]);
const sectorAngle = computed(() => 360 / items.value.length);
const startAngle = computed(() => (props.section === "workplace" ? -101 : -100));

const point = (angle: number, radius: number) => {
  const radians = (angle * Math.PI) / 180;
  return [256 + Math.cos(radians) * radius, 256 + Math.sin(radians) * radius];
};

const sectorPath = (index: number) => {
  const from = startAngle.value + index * sectorAngle.value;
  const to = from + sectorAngle.value;
  const [x1, y1] = point(from, 229);
  const [x2, y2] = point(to, 229);
  return `M 256 256 L ${x1} ${y1} A 229 229 0 0 1 ${x2} ${y2} Z`;
};

const lineStyle = (index: number) => ({
  transform: `translateX(-50%) rotate(${startAngle.value + index * sectorAngle.value + 90}deg)`,
});

const labelStyle = (item: Item) => ({
  left: `${item.x}%`,
  top: `${item.y}%`,
  "--label-color": item.color,
});
</script>

<template>
  <div
    class="relationship-chart"
    :class="section"
    :aria-label="t(section === 'workplace' ? 'personalityUi.chart.workplace.ariaLabel' : 'personalityUi.chart.relationship.ariaLabel')">
    <div class="chart-stage">
      <div class="chart-plane" aria-hidden="true">
        <img class="star-map" :src="root + 'PersonalityReport_Type_Bg1.png'" />
        <img class="flower-map" :src="root + 'PersonalityReport_Type_Bg5.png'" />
        <img class="halo-map" :src="root + 'PersonalityReport_Type_Bg6.png'" />
        <img class="guide-map" :src="root + 'PersonalityReport_Type_Bg8.png'" />
        <svg class="sectors" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet">
          <path v-for="(item, index) in items" :key="item.label" :d="sectorPath(index)" :fill="item.color" />
          <circle cx="256" cy="256" r="229" />
        </svg>
        <img
          v-for="(_, index) in items"
          :key="`line-${index}`"
          class="fill-line"
          :style="lineStyle(index)"
          :src="root + 'PersonalityReportType_FillLine.png'" />
        <img class="core-disc" :src="root + 'PersonalityReport_Type_Bg3.png'" />
        <img class="core-flower" :src="root + 'PersonalityReport_Type_Bg4.png'" />
      </div>

      <div
        v-for="item in items"
        :key="`label-${item.label}`"
        class="chart-label"
        :class="item.align"
        :style="labelStyle(item)">
        <div class="label-copy">
          <img class="label-bg" :src="root + 'PersonalityReportType_TabBg.png'" />
          <span>{{ t(item.label) }}</span>
        </div>
        <div class="value-tab">
          <img :src="root + `PersonalityReportType_Tab${item.tab}.png`" />
          <b>{{ item.value }}<small>%</small></b>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.relationship-chart {
  width: 100%;
  margin: 0 auto;
  user-select: none;
}

.chart-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1.5;
  overflow: visible;
}

.chart-plane {
  position: absolute;
  z-index: 1;
  left: 18%;
  width: 65%;
  aspect-ratio: 1;
  transform: perspective(1300px) rotateZ(25deg) rotateX(34deg);
  transform-style: preserve-3d;
  animation: chart-plane-enter 0.3s 0.15s ease-out both;
}

.chart-plane > :not(.fill-line) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.star-map {
  opacity: 0.5;
  scale: 0.9;
}
.flower-map {
  opacity: 0.56;
  scale: 1.2;
}
.halo-map {
  opacity: 0.35;
  scale: 0.86;
}
.guide-map {
  opacity: 0.9;
  scale: 1.2;
}

.sectors {
  z-index: 2;
  overflow: visible;
  scale: 0.77;
}

.sectors path {
  opacity: 0.26;
  mix-blend-mode: screen;
  stroke: color-mix(in srgb, currentColor 30%, transparent);
  stroke-width: 0.8;
}

.sectors circle {
  fill: none;
  stroke: #aad8d2;
  stroke-width: 1;
  opacity: 0.82;
}

.fill-line {
  position: absolute;
  z-index: 3;
  bottom: 50%;
  left: 50%;
  width: 4px;
  height: 38%;
  object-fit: fill;
  transform-origin: center bottom;
  opacity: 0.92;
}

.core-disc {
  z-index: 5;
  inset: 33% !important;
  width: 34% !important;
  height: 34% !important;
  filter: drop-shadow(0 0 13px #e1c66d88);
}

.core-flower {
  z-index: 6;
  inset: 40% !important;
  width: 20% !important;
  height: 20% !important;
  filter: drop-shadow(0 0 12px #ffe59d);
}

.chart-label {
  position: absolute;
  z-index: 8;
  display: flex;
  align-items: center;
  width: 35%;
  height: 68px;
  transform: translateY(-50%);
  animation: fade-in 0.3s 0.15s ease-out both;
}

.chart-label {
  flex-direction: row-reverse;
}

.value-tab {
  position: relative;
  z-index: 2;
  width: 55px;
  aspect-ratio: 1;
}

.value-tab img {
  display: block;
  width: 100%;
}

.value-tab b {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  color: var(--label-color);
  font-family: "KuangShanKaiShu";
  font-size: 20px;
  font-weight: normal;
  white-space: nowrap;
}

.value-tab small {
  font-size: 12px;
}

.label-copy {
  position: relative;
  display: flex;
  align-items: center;
  width: 140px;
  aspect-ratio: 256/96;
  margin: 14px 0 0 -14px;
}

.label-bg {
  position: absolute;
  inset: 0;
  width: 100%;
}

.label-copy span {
  position: absolute;
  inset: 4.2% 15% 27.1%;
  z-index: 1;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  color: var(--label-color);
  font-size: 22px;
  line-height: 1;
  white-space: nowrap;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes chart-plane-enter {
  from {
    opacity: 0;
    transform: perspective(1300px) rotateZ(25deg) rotateX(34deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: perspective(1300px) rotateZ(25deg) rotateX(34deg) scale(1);
  }
}

@media (max-height: 500px) {
  .chart-stage {
    min-height: 400px;
  }
  .chart-label {
    height: 54px;
  }
  .value-tab {
    flex-basis: 54px;
    width: 54px;
    height: 54px;
  }
}
</style>
