<script setup lang="ts">
import ImageTextButton from "@/components/ImageTextButton.vue";
import PageNavButton from "@/components/PageNavButton.vue";
import TipView from "@/components/personality/TipView.vue";
import type { personalityType } from "@/types/personalityType";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  keywords: string[];
  status: "loading" | "ready" | "error";
  errorMessage?: string;
  progressPercent: number;
  showProgress: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "retry"): void;
  (e: "refresh"): void;
}>();

const { t, tm } = useI18n();

const personalityData = computed(() => tm("personalities") as personalityType);

const root = "/common/images/personality/keyword/";
const note = personalityData.value.note;
const noteOpen = ref(false);
const detailsWrap = ref<HTMLElement | null>(null);
const slots: Array<[number, number]> = [
  [50, 47],
  [32, 32],
  [68, 31],
  [25, 51],
  [76, 51],
  [34, 66],
  [66, 67],
  [47, 25],
  [53, 72],
  [18, 38],
  [82, 39],
  [20, 63],
  [80, 64],
  [42, 82],
  [58, 82],
  [12, 51],
  [88, 52],
  [50, 15],
];

function shuffleSlots(source: Array<[number, number]>) {
  const result = [...source];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex]!, result[index]!];
  }
  return result;
}

// KeywordsView is remounted whenever the keywords page is opened, so each
// visit gets a fresh, non-centred starting position for every word.
const randomizedSlots = ref(shuffleSlots(slots));
const words = computed(() =>
  props.keywords.map((word, index) => ({
    word,
    slot: randomizedSlots.value[index % randomizedSlots.value.length]!,
    main: index < 3,
  })),
);

function refreshKeywords() {
  randomizedSlots.value = shuffleSlots(slots);
  emit("refresh");
}
function closeNote() {
  noteOpen.value = false;
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeNote();
}
function onPointerDown(event: PointerEvent) {
  if (noteOpen.value && !detailsWrap.value?.contains(event.target as Node)) closeNote();
}
onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onPointerDown);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.removeEventListener("pointerdown", onPointerDown);
});
</script>

<template>
  <template v-if="showProgress">
    <PageNavButton :text="t('personalityUi.keywords.navTitle')" />
    <div ref="detailsWrap" class="details-wrap">
      <button
        class="details"
        :aria-label="t('personalityUi.report.detailsLabel')"
        :aria-expanded="noteOpen"
        @click="noteOpen = !noteOpen">
        <img src="/common/images/personality/PersonalityReport_Details_Btn.png" />
      </button>
      <div
        v-if="noteOpen"
        class="note-popover"
        role="dialog"
        aria-modal="false"
        :aria-label="t('personalityUi.report.detailsLabel')">
        <TipView :tip="note" />
      </div>
    </div>
  </template>
  <section class="keywords">
    <div class="ornaments" aria-hidden="true">
      <img class="bg8 orbit" :src="root + 'PersonalityReport_Bg8.png'" />
      <img class="bg2-1" :src="root + 'PersonalityReport_Bg2_1.png'" />
      <img class="bg2-2" :src="root + 'PersonalityReport_Bg2_2.png'" />
      <img class="bg2-3" :src="root + 'PersonalityReport_Bg2_3.png'" />
      <img class="bg2-4" :src="root + 'PersonalityReport_Bg2_4.png'" />
      <img class="bg2-5" :src="root + 'PersonalityReport_Bg2_5.png'" />
      <!-- <img class="bg4" :src="root + 'PersonalityReport_Bg4.png'" /> -->
      <!-- <img class="bg5" :src="root + 'PersonalityReport_Bg5.png'" /> -->
      <!-- <img class="bg6" :src="root + 'PersonalityReport_Bg6.png'" /> -->
      <!-- <img class="bg7" :src="root + 'PersonalityReport_Bg7.png'" /> -->
    </div>
    <span
      v-if="status === 'ready'"
      v-for="item in words"
      :key="item.word"
      class="word"
      :class="{ main: item.main }"
      :style="{ left: item.slot[0] + '%', top: item.slot[1] + '%' }"
      >{{ item.word }}</span
    >
    <div v-if="status === 'loading'" class="loading">{{ t("personalityUi.keywords.loading") }}</div>
    <div v-else-if="status === 'error'" class="loading error">
      <span>{{ errorMessage || t("personalityUi.keywords.error") }}</span>
      <button type="button" @click="emit('retry')">{{ t("personalityUi.keywords.retry") }}</button>
    </div>
    <button v-if="!showProgress" class="close" :aria-label="t('personalityUi.keywords.close')" @click="emit('close')">
      <img src="/common/images/personality/PersonalityReport_BtnClose.png" />
    </button>
    <ImageTextButton
      class="refresh"
      image="/common/images/personality/keyword/Common_Btn_Refresh.png"
      :text="t('personalityUi.keywords.refresh')"
      :width="128"
      @click="refreshKeywords" />
    <p v-if="showProgress" class="progress">
      {{ t("personalityUi.keywords.resultProgress") }}<b>{{ progressPercent }}%</b>
    </p>
  </section>
</template>

<style scoped>
.keywords {
  position: absolute;
  inset: 0;
  overflow: hidden;
  --ornaments-duration: 1000ms;
  --word-duration: 550ms;
  --progress-duration: 300ms;
  --refresh-duration: 300ms;
}
.details-wrap {
  position: absolute;
  top: 16px;
  left: 340px;
  z-index: 3;
}
.details {
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
}
.details img {
  width: 50px;
  display: block;
}
.note-popover {
  position: absolute;
  top: 50px;
  left: -30px;
  width: 630px;
  z-index: 20;
}
.ornaments {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1020px;
  height: 1024px;
  transform: translate(-50%, -50%);
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

.bg8 {
  scale: 1.15;
}
.bg2-1 {
  scale: 1.65;
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}
.bg2-2 {
  scale: 1.4;
  transform-origin: center;
  animation: sway-reverse 5s ease-in-out infinite alternate;
}
.bg2-3 {
  scale: 0.9;
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}
.bg2-4 {
  scale: 1.1;
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}
.bg2-5 {
  scale: 1.1;
  transform-origin: center;
  animation: sway 5s ease-in-out infinite alternate;
}

.orbit {
  transform-origin: center;
  animation: spin 20s linear infinite;
}

.word {
  position: absolute;
  z-index: 2;
  transform: translate(-50%, -50%);
  font-size: 28px;
  color: #d9f0e8;
  text-shadow: 0 0 12px #173f55;
  white-space: nowrap;
  transition:
    opacity 250ms,
    transform 250ms;
  opacity: 0;
  animation: word-fade-in var(--word-duration) ease-out 80ms forwards;
}
.word:nth-of-type(3n) {
  color: #f5dc99;
}
.word:nth-of-type(3n + 1) {
  color: #efe8ca;
  font-size: 24px;
}
.word.main {
  font-size: 47px;
  color: #f5cf79;
}
.close {
  position: absolute;
  top: 4%;
  right: 5.1%;
  width: 85px;
  border: 0;
  background: none;
  cursor: pointer;
}
.close img {
  width: 100%;
}
.refresh {
  position: absolute;
  right: 50px;
  bottom: 50px;
  opacity: 0;
  animation: fade-in var(--refresh-duration) ease-out 1.15s forwards;
}
.loading {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  color: #f5ddab;
  text-align: center;
}
.loading.error {
  display: grid;
  gap: 16px;
}
.loading button {
  border: 1px solid #f5ddab;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.progress {
  position: absolute;
  z-index: 3;
  bottom: 26px;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  font-size: 27px;
  color: #f1e8d3;
  white-space: nowrap;
  text-shadow: 0 0 10px #143344;
  opacity: 0;
  animation: fade-in var(--progress-duration) ease-out 400ms forwards;
}
.progress b {
  color: #fea66c;
  font-size: 27px;
  font-weight: normal;
  font-family: "KuangShanKaiShu";
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}

@keyframes ornaments-enter {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(-45deg) scale(0.72);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
}

@keyframes word-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

@media (prefers-reduced-motion: reduce) {
  .ornaments,
  .word,
  .progress,
  .refresh {
    opacity: 1;
    animation: none;
  }

  .bg2-1,
  .bg2-2,
  .bg2-3,
  .bg2-4,
  .bg2-5 {
    rotate: 0deg;
    animation: none;
  }
}

@media (max-height: 500px) {
  .details-wrap {
    top: 14px;
    left: 215px;
    transform-origin: top left;
  }
  .details img {
    width: 35px;
  }
  .note-popover {
    top: 35px;
    left: -10px;
    width: 630px;
  }
  .keywords {
    scale: 0.7;
    transform-origin: top left;
    width: 142.857%;
    height: 142.857%;
  }
}
</style>

