<script setup lang="ts">
import { getDirection, getLoveTraits, type LoveTrait } from "./chartData";

const root = "/common/images/personality/chart/";

const traits: LoveTrait[] = getLoveTraits();

const fillWidth = (trait: LoveTrait) => (getDirection(trait.value) === "left" ? trait.value : 100 - trait.value);

const fillStyle = (trait: LoveTrait) => ({ width: `${fillWidth(trait)}%` });
// The fill image remains the full slider width and is clipped by its percentage-width wrapper.
const fillImageStyle = (trait: LoveTrait) => ({ width: `${10000 / fillWidth(trait)}%` });
const markerStyle = (trait: LoveTrait) => ({
  left: `${trait.value}%`,
  "--icon-width": trait.iconWidth,
});
</script>

<template>
  <section class="love-chart" aria-label="爱情特质分析图">
    <div class="ornaments" aria-hidden="true">
      <img class="bg2-1" src="/common/images/personality/keyword/PersonalityReport_Bg2_1.png" />
      <img class="bg2-2" src="/common/images/personality/keyword/PersonalityReport_Bg2_2.png" />
      <img class="bg2-3" src="/common/images/personality/keyword/PersonalityReport_Bg2_3.png" />
      <img class="bg2-4" src="/common/images/personality/keyword/PersonalityReport_Bg2_4.png" />
      <img class="bg2-5" src="/common/images/personality/keyword/PersonalityReport_Bg2_5.png" />
    </div>
    <div v-for="(trait, index) in traits" :key="trait.icon" class="trait-row" :style="{ '--row-index': index }">
      <div class="trait-labels" aria-hidden="true">
        <span>{{ trait.left }}</span>
        <span>{{ trait.right }}</span>
      </div>
      <div class="slider" :aria-label="`${trait.left}至${trait.right}：${trait.value}%`">
        <img class="slider-background" :src="root + 'PersonalityReportType_Love_SliderBg1.png'" alt="" />
        <div class="slider-fill" :class="getDirection(trait.value)" :style="fillStyle(trait)">
          <img :src="root + 'PersonalityReport_Type_Love_SliderFill.png'" :style="fillImageStyle(trait)" alt="" />
        </div>
        <img
          class="slider-marker"
          :src="root + `PersonalityReportType_Love_Icon${trait.icon}.png`"
          :style="markerStyle(trait)"
          alt="" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.love-chart {
  width: 100%;
  margin: 0 auto;
  padding: 0 4.7%;
  box-sizing: border-box;
  color: #f0d79e;
  user-select: none;
  --ornaments-duration: 1000ms;
  --word-duration: 550ms;
  --progress-duration: 300ms;
  --refresh-duration: 300ms;
  --ornaments-scale: 0.7;
}

.ornaments {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1020px;
  height: 1024px;
  transform: translate(-50%, -50%) scale(1);
  transform-origin: center center;
  display: grid;
  place-items: center;
  opacity: 0;
  animation: ornaments-enter var(--ornaments-duration) cubic-bezier(0.22, 0.65, 0.3, 1) forwards;
}

.ornaments img {
  grid-area: 1 / 1;
  max-width: 100%;
  max-height: 100%;
}

.bg2-1 {
  scale: calc(var(--ornaments-scale) * 1.65);
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}

.bg2-2 {
  scale: calc(var(--ornaments-scale) * 1.4);
  transform-origin: center;
  animation: sway-reverse 5s ease-in-out infinite alternate;
}

.bg2-3 {
  scale: calc(var(--ornaments-scale) * 0.9);
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}

.bg2-4 {
  scale: calc(var(--ornaments-scale) * 1.1);
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}

.bg2-5 {
  scale: calc(var(--ornaments-scale) * 1.1);
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}

.trait-row {
  width: 70%;
  margin: 0 auto 50px auto;
  --row-index: 0;
  opacity: 0;
  transform: translateY(8px);
  animation: row-enter 420ms ease-out calc(var(--row-index) * 85ms) forwards;
}

.trait-row:last-child {
  margin-bottom: 0;
}

.trait-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 22px;
  line-height: 1;
  letter-spacing: 1px;
}

.trait-labels span:last-child {
  text-align: right;
}

.slider {
  position: relative;
  width: 100%;
  aspect-ratio: 1024 / 36;
}

.slider-background,
.slider-fill img {
  display: block;
  width: 100%;
  height: 100%;
}

.slider-background {
  position: relative;
  z-index: 1;
}

.slider-fill {
  position: absolute;
  z-index: 2;
  top: 4.2%;
  bottom: 4.2%;
  left: 0;
  overflow: hidden;
}

.slider-fill.right {
  right: 0;
  left: auto;
}

.slider-fill img {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  object-fit: fill;
}

.slider-fill.right img {
  right: 0;
  left: auto;
}

.slider-marker {
  position: absolute;
  z-index: 3;
  top: 50%;
  width: var(--icon-width);
  height: auto;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 1px 3px #132a34cc);
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}

@keyframes ornaments-enter {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes sway {
  from {
    rotate: -3deg;
  }

  to {
    rotate: 3deg;
  }
}

@keyframes sway-reverse {
  from {
    rotate: 3deg;
  }

  to {
    rotate: -3deg;
  }
}

@keyframes row-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .trait-row {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>

