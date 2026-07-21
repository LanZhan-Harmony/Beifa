<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import type { EdictOutcome, EdictRecord } from "../../types/edictType";
import ImageTextButton from "../ImageTextButton.vue";

const props = defineProps<{
  edict: EdictRecord;
  outcome: EdictOutcome;
}>();

const emit = defineEmits<{
  (e: "reconsider"): void;
  (e: "complete"): void;
}>();

const sealing = ref(false);
const sealed = ref(false);
let timer: number;
const body = computed(() => `${props.outcome.emperorComment?.replace(/钦此[！。!]?\s*$/, "") ?? ""}钦此！`);
function confirm() {
  if (sealing.value) return;
  sealing.value = true;
  timer = window.setTimeout(() => {
    sealed.value = true;
    timer = window.setTimeout(() => emit("complete"), 700);
  }, 800);
}
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
      @click="emit('reconsider')" />
    <div class="imperial-scroll">
      <img class="paper" src="/common/images/edict/Edict_Popup_Bg1.png" alt="" />
      <img class="axis axis--left" src="/common/images/edict/Edict_Popup_Bg4_L.png" alt="" /><img
        class="axis axis--right"
        src="/common/images/edict/Edict_Popup_Bg4_R.png"
        alt="" />
      <span class="title">圣旨</span>
      <p class="body">{{ body }}</p>
      <ImageTextButton
        class="confirm"
        image="/common/images/edict/Common_Btn2_Bg.png"
        hoverImage="/common/images/edict/Common_Btn2_Hover.png"
        text="钦此"
        :textTopMargin="45"
        :fontSize="32"
        :width="300"
        @click="confirm" />
      <img
        v-if="sealing && !sealed"
        class="seal-object"
        src="/common/images/edict/Edict_Popup_Icon02.png"
        alt="玉玺落印" />
      <img v-if="sealed" class="seal-mark" src="/common/images/edict/Edict_Popup_Icon01.png" alt="玉玺印记" />
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
  animation: unfold 0.82s ease-out both;
}
.paper {
  position: absolute;
  inset: 9% 3%;
  width: 94%;
  height: 82%;
}
.axis {
  position: absolute;
  z-index: 2;
  top: 0;
  height: 100%;
}
.axis--left {
  left: 0;
}
.axis--right {
  right: 0;
}
.title {
  position: absolute;
  z-index: 3;
  top: 15%;
  left: 0;
  width: 100%;
  color: #8c4a1e;
  font-size: 54px;
  text-align: center;
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
}
.confirm {
  position: absolute;
  z-index: 7;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
}
.seal-object,
.seal-mark {
  position: absolute;
  z-index: 6;
  right: 8%;
  top: 21%;
  width: 25%;
  object-fit: contain;
}
.seal-object {
  animation: seal-drop 0.8s ease-in both;
}
.seal-mark {
  opacity: 0.72;
  animation: mark-in 0.3s ease-out;
}
@keyframes unfold {
  from {
    opacity: 0;
    clip-path: inset(0 48%);
  }
  to {
    opacity: 1;
    clip-path: inset(0);
  }
}
@keyframes seal-drop {
  from {
    opacity: 0;
    transform: translate(60%, -100%) scale(1.4);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes mark-in {
  from {
    opacity: 0;
    transform: scale(1.2);
  }
}
@media (max-height: 500px) {
  .reconsider {
    width: 140px;
    font-size: 16px;
  }
  .title {
    font-size: 28px;
  }
  .body {
    font-size: 16px;
  }
  .confirm {
    width: 160px;
    font-size: 18px;
  }
}
</style>

