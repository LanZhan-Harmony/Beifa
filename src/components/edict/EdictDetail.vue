<script setup lang="ts">
import type { EdictOutcome, EdictRecord } from "@/types/edictType";
import { computed, onBeforeUnmount, ref } from "vue";
const props = defineProps<{ edict: EdictRecord; outcome: EdictOutcome }>();
const emit = defineEmits<{ reconsider: []; complete: [] }>();
const sealing = ref(false);
const sealed = ref(false);
let timer: number;
const body = computed(() => `${props.outcome.emperorComment?.replace(/钦此[！。!]?\s*$/, "") ?? ""}\n钦此！`);
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
    <button class="reconsider" type="button" :disabled="sealing" @click="$emit('reconsider')">再考虑下</button>
    <div class="imperial-scroll">
      <img class="paper" src="/common/images/edict/Edict_Popup_Bg1.png" alt="" />
      <img class="axis axis--left" src="/common/images/edict/Edict_Popup_Bg4_L.png" alt="" /><img
        class="axis axis--right"
        src="/common/images/edict/Edict_Popup_Bg4_R.png"
        alt="" />
      <h1>圣旨</h1>
      <p class="body">{{ body }}</p>
      <button class="confirm" type="button" :disabled="sealing" @click="confirm">钦此</button>
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
  width: clamp(190px, 14vw, 280px);
  aspect-ratio: 244/76;
  border: 0;
  color: #ecc889;
  background: url("/common/images/edict/Edict_Main_Btn_Skip.png") center/100% 100%;
  font: clamp(23px, 1.8vw, 36px);
}
.imperial-scroll {
  position: absolute;
  top: 12%;
  left: 7%;
  width: 86%;
  height: 80%;
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
h1 {
  position: absolute;
  z-index: 3;
  top: 10%;
  left: 0;
  width: 100%;
  color: #8c4a1e;
  font: clamp(38px, 3.3vw, 68px) KuangShanKaiShu;
  text-align: center;
}
.body {
  position: absolute;
  z-index: 3;
  top: 24%;
  left: 13%;
  width: 74%;
  color: #5b2b13;
  font: clamp(22px, 1.85vw, 38px)/1.5 TsangErJinKai;
  white-space: pre-wrap;
}
.confirm {
  position: absolute;
  z-index: 7;
  bottom: -1%;
  left: 50%;
  width: clamp(240px, 17vw, 350px);
  aspect-ratio: 512/129;
  transform: translateX(-50%);
  border: 0;
  color: #f3d09b;
  background: url("/common/images/edict/Common_Btn2_Bg.png") center/100% 100%;
  font: clamp(25px, 2vw, 40px) KuangShanKaiShu;
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
</style>

