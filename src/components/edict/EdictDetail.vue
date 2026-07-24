<script setup lang="ts">
import ImageTextButton from "@/components/ImageTextButton.vue";
import { useMediaStore } from "@/stores/media";
import type { EdictOutcome, EdictRecord } from "@/types/edictType";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  edict: EdictRecord;
  outcome: EdictOutcome;
}>();

const emit = defineEmits<{
  (e: "reconsider"): void;
  (e: "complete"): void;
}>();

const mediaStore = useMediaStore();

const sealing = ref(false);
const sealed = ref(false);
let timer: number;
const body = computed(() => `${props.outcome.emperorComment?.replace(/钦此[！。!]?\s*$/, "") ?? ""}钦此！`);
async function confirm() {
  if (sealing.value) return;
  await mediaStore.setEffectAudioAsync("ui_universal_stamp");
  sealing.value = true;
  timer = window.setTimeout(() => {
    sealing.value = false;
    sealed.value = true;
    timer = window.setTimeout(() => emit("complete"), 1000);
  }, 300);
}

onMounted(async () => {
  await mediaStore.setEffectAudioAsync("ui_zz_paper");
});

onBeforeUnmount(() => window.clearTimeout(timer));
</script>
<template>
  <section class="detail edict-screen">
    <ImageTextButton
      class="reconsider"
      image="/common/images/edict/Edict_Main_Btn_Skip.png"
      text="再考虑下"
      :textTopMargin="50"
      :fontSize="30"
      :width="230"
      scaleTransformOrigin="right center"
      @click="emit('reconsider')" />
    <div class="imperial-scroll">
      <img class="paper" src="/common/images/edict/Edict_Popup_Bg1.png" />
      <img class="axis axis--left" src="/common/images/edict/Edict_Popup_Bg4_L.png" />
      <img class="axis axis--right" src="/common/images/edict/Edict_Popup_Bg4_R.png" />
      <span class="title-wrap">
        <img class="title-line title-line--left" src="/common/images/edict/Edict_Popup_TitleLine_L.png" />
        <span class="title">圣旨</span>
        <img class="title-line title-line--right" src="/common/images/edict/Edict_Popup_TitleLine_R.png" />
      </span>
      <p class="body">{{ body }}</p>
      <ImageTextButton
        class="confirm"
        image="/common/images/Common_Btn2_Bg.png"
        hoverImage="/common/images/Common_Btn2_Hover.png"
        text="钦此"
        :textTopMargin="45"
        :fontSize="32"
        :width="300"
        scaleTransformOrigin="center center"
        @click="confirm" />
      <img
        v-if="sealing"
        class="seal-object-animate"
        src="/common/images/edict/Edict_Popup_Icon02.png"
        alt="玉玺落印进行" />
      <img v-if="sealed" class="seal-mark" src="/common/images/edict/Edict_Popup_Icon01.png" alt="玉玺印记" />
      <img
        v-if="sealed"
        class="seal-object-done"
        src="/common/images/edict/Edict_Popup_Icon03.png"
        alt="玉玺落印完成" />
    </div>
  </section>
</template>
<style scoped>
.detail {
  background: #731109 url("/common/images/edict/Edict_Main_Bg3.png") center/cover;
}
.reconsider {
  position: absolute;
  z-index: 8;
  top: 3%;
  right: 0;
}
.imperial-scroll {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 86%;
  aspect-ratio: 1024/500;
  --paper-left: 3%;
  --paper-width: 94%;
  --axis-width: 10.1%;
}
.paper {
  position: absolute;
  inset: 9% var(--paper-left);
  width: var(--paper-width);
  height: 82%;
  clip-path: inset(0 50% 0 50%);
  animation: edict-paper-open 1.2s ease both;
}
.axis {
  position: absolute;
  z-index: 2;
  top: 0;
  height: 100%;
  width: auto;
  will-change: left;
}
.axis--left {
  left: calc(50% - var(--axis-width));
  animation: edict-axis-left-open 1.2s ease both;
}
.axis--right {
  right: calc(50% - var(--axis-width));
  animation: edict-axis-right-open 1.2s ease both;
}
.title-wrap {
  position: absolute;
  z-index: 3;
  top: 15%;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  opacity: 0;
  animation: edict-content-fade-in 0.3s ease 0.7s both;
}
.title-line {
  aspect-ratio: 512/11;
  height: 8px;
}
.title {
  color: #8c4a1e;
  font-size: 54px;
  white-space: nowrap;
}
.body {
  position: absolute;
  z-index: 3;
  top: 26%;
  left: 13%;
  width: 74%;
  color: #5b2b13;
  font-size: 35px;
  line-height: 1.25;
  white-space: pre-wrap;
  opacity: 0;
  animation: edict-content-fade-in 0.3s ease 1s both;
}
.confirm {
  position: absolute;
  z-index: 7;
  bottom: 5%;
  left: 50%;
  translate: -50% 0;
  opacity: 0;
  animation: edict-confirm-fade-in 0.3s ease 1.5s both;
}
.seal-object-animate,
.seal-object-done,
.seal-mark {
  position: absolute;
  z-index: 6;
  right: 11%;
  top: 30%;
  width: 18%;
  object-fit: contain;
}
.seal-object-animate {
  animation: seal-drop 0.3s ease-in both;
}
.seal-object-done {
  animation: seal-fade-out 0.5s ease-in both;
}
@keyframes edict-paper-open {
  from {
    clip-path: inset(0 50% 0 50%);
  }
  to {
    clip-path: inset(0);
  }
}
@keyframes edict-axis-left-open {
  from {
    left: calc(50% - var(--axis-width));
  }
  to {
    left: 0;
  }
}
@keyframes edict-axis-right-open {
  from {
    right: calc(50% - var(--axis-width));
  }
  to {
    right: 0;
  }
}
@keyframes edict-content-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes edict-confirm-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes seal-drop {
  from {
    opacity: 0;
    transform: scale(1.6);
    transform-origin: left center;
  }
  to {
    opacity: 1;
    transform: scale(1.05);
  }
}
@keyframes seal-fade-out {
  from {
    opacity: 1;
    transform: scale(1.05);
  }
  to {
    opacity: 0;
    transform: scale(1.05);
  }
}
@media (max-height: 500px) {
  .title-wrap {
    gap: 15px;
  }
  .title {
    font-size: 28px;
  }
  .title-line {
    height: 6px;
  }
  .body {
    font-size: 22px;
  }
}
</style>
