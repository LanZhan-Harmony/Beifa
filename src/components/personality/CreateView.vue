<script setup lang="ts">
import ImageTextButton from "@/components/ImageTextButton.vue";
import { ref } from "vue";

const props = defineProps<{
  status: "idle" | "loading" | "empty" | "error";
  errorMessage?: string;
}>();

const emit = defineEmits<{
  (event: "generate"): void;
}>();

const base = "/common/images/personality/create/";

const showReportBg = ref(false);

function handleSeeReport() {
  showReportBg.value = true;
  emit("generate");
}
</script>

<template>
  <section class="create-view" aria-live="polite">
    <img class="title-bg" :src="base + 'PersonalityReport_Create_TitleBg.png'" alt="" />
    <h1>恭喜通关</h1>
    <div class="astrolabe" aria-hidden="true">
      <img class="orbit bg1" :src="base + 'PersonalityReport_Create_Bg1.png'" />
      <img class="orbit bg2" :src="base + 'PersonalityReport_Create_Bg2.png'" />
      <img class="orbit bg4 orbit-a" :src="base + 'PersonalityReport_Create_Bg4.png'" />
      <img class="orbit bg5" :src="base + 'PersonalityReport_Create_Bg5.png'" />
      <img class="orbit bg6" :class="{ 'fade-out': showReportBg }" :src="base + 'PersonalityReport_Create_Bg6.png'" />
      <img class="orbit bg7" :src="base + 'PersonalityReport_Create_Bg7.png'" />
      <img class="orbit bg8" :src="base + 'PersonalityReport_Create_Bg8.png'" />
      <img class="orbit bg10" :class="{ 'fade-in': showReportBg }" :src="base + 'PersonalityReport_Create_Bg10.png'" />
    </div>
    <div v-if="status === 'idle'" class="message">
      恭喜通关，你已完成所有数据收集，<br />
      快来查看你的最终报告吧！
    </div>
    <ImageTextButton
      v-if="status === 'idle'"
      class="see-report"
      image="/common/images/Common_Btn2_Bg.png"
      hover-image="/common/images/Common_Btn2_Hover.png"
      text="查看报告"
      :width="300"
      :fontSize="30"
      :text-top-margin="45"
      @click="handleSeeReport" />
    <div v-else-if="status === 'loading'" class="result-reveal">结果马上揭晓</div>
    <div v-else-if="status === 'error'" class="message error">
      {{ errorMessage || "报告生成失败，请重试。" }}
    </div>
  </section>
</template>

<style scoped>
.create-view {
  position: absolute;
  inset: 0;
  --astrolabe-duration: 0.7s;
  --title-duration: 0.35s;
  --content-duration: 0.35s;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
}

.title-bg {
  position: absolute;
  top: 23%;
  width: 540px;
  opacity: 0;
  clip-path: inset(0 50%);
  animation: title-reveal var(--title-duration) ease-out forwards;
}

h1 {
  position: absolute;
  top: 23%;
  margin: 0;
  font-size: 70px;
  font-weight: normal;
  letter-spacing: 2px;
  color: #f7d78f;
  z-index: 1;
  opacity: 0;
  clip-path: inset(0 50%);
  animation: title-reveal var(--title-duration) ease-out forwards;
}

.astrolabe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  opacity: 0;
  animation: astrolabe-enter var(--astrolabe-duration) cubic-bezier(0.22, 0.65, 0.3, 1) forwards;
}

.orbit {
  grid-area: 1 / 1;
  max-width: 100%;
  max-height: 100%;
}

.bg1 {
  transform: scale(0.93);
}

.bg4 {
  transform: scale(1.32);
}

.bg5 {
  transform: scale(1.14);
}

.bg6 {
  transform: scale(0.78);
  transition: opacity 0.5s;
}

.bg6.fade-out {
  opacity: 0;
}

.bg7 {
  transform: scale(1.08);
}

.bg8 {
  transform: scale(1.8);
}

.bg10 {
  transform: scale(1.05);
  opacity: 0;
  transition: opacity 0.5s 0.5s;
}

.bg10.fade-in {
  opacity: 1;
}

.orbit-a {
  transform-origin: center;
  animation: spin 30s linear infinite;
}

.message {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #f5ddab;
  font-size: 32px;
  line-height: 1.2;
  text-align: center;
  opacity: 0;
  animation: content-fade-in var(--content-duration) ease-out var(--title-duration) forwards;
}

.see-report {
  position: absolute;
  top: 65%;
  opacity: 0;
  animation: content-fade-in var(--content-duration) ease-out var(--title-duration) forwards;
}

.result-reveal {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #f5ddab;
  font-size: 40px;
  line-height: 1.2;
  text-align: center;
  opacity: 0;
  animation: content-fade-in var(--content-duration) ease-out var(--title-duration) forwards;
}

@keyframes astrolabe-enter {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.7);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes title-reveal {
  from {
    opacity: 0;
    clip-path: inset(0 50%);
  }

  to {
    opacity: 1;
    clip-path: inset(0 0);
  }
}

@keyframes content-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    rotate: -360deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .title-bg,
  h1,
  .astrolabe,
  .message,
  .result-reveal,
  .see-report {
    opacity: 1;
    clip-path: none;
    animation: none;
  }

  .orbit-a,
  .orbit-b {
    animation: none;
  }
}

@media (max-height: 500px) {
  .title-bg {
    top: 15%;
    width: 400px;
  }

  h1 {
    font-size: 35px;
  }

  .message {
    font-size: 20px;
  }

  .see-report {
    top: 455px;
  }
}
</style>

