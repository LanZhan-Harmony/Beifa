<script setup lang="ts">
import { useMediaStore } from "@/stores/media";
import type { EdictRecord } from "@/types/edictType";
import { portraitUrl, speakerMeta } from "@/utils/edictMeta";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import MessageBubble from "./MessageBubble.vue";

const props = withDefaults(defineProps<{ edict: EdictRecord; replay?: boolean; summaryBusy?: boolean }>(), {
  replay: false,
  summaryBusy: false,
});
const emit = defineEmits<{ complete: [] }>();
const media = useMediaStore();
const intro = ref(true);
const index = ref(0);
const finished = ref(false);
let timer: number | undefined;
const message = computed(() => props.edict.messages[index.value]);
const side = computed(() => (message.value?.sender === "objector" ? "right" : "left"));
const divider = computed(() => (intro.value ? "50%" : side.value === "left" ? "57%" : "43%"));

function schedule(ms = 1450) {
  window.clearTimeout(timer);
  timer = window.setTimeout(advance, ms);
}
function advance() {
  if (intro.value) {
    intro.value = false;
    index.value = 0;
    void media.setEffectAudioAsync(message.value?.sender === "objector" ? "ui_zz_debate_neg" : "ui_zz_debate_aff");
    schedule();
    return;
  }
  if (index.value < props.edict.messages.length - 1) {
    index.value++;
    void media.setEffectAudioAsync(message.value?.sender === "objector" ? "ui_zz_debate_neg" : "ui_zz_debate_aff");
    schedule();
  } else {
    finished.value = true;
    if (!props.summaryBusy) emit("complete");
  }
}
function handleClick() {
  if (!finished.value) advance();
  else if (!props.summaryBusy) emit("complete");
}
onMounted(() => {
  void media.setEffectAudioAsync("ui_zz_debate_start");
  schedule(1050);
});
onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <section class="debate edict-screen" :style="{ '--divider': divider }" @click="handleClick">
    <div class="base"></div>
    <div class="left-camp"></div>
    <div class="right-camp"></div>
    <img class="ornament ornament--left" src="/common/images/edict/Edict_ThemeInfo_Bg_L_1.png" alt="" />
    <img class="ornament ornament--right" src="/common/images/edict/Edict_ThemeInfo_Bg_R_1.png" alt="" />
    <img class="portrait portrait--left" :src="portraitUrl(edict.presenter)" :alt="speakerMeta[edict.presenter].name" />
    <img class="portrait portrait--right" :src="portraitUrl(edict.objector)" :alt="speakerMeta[edict.objector].name" />
    <div class="divider"></div>
    <div class="name name--left">
      <small>{{ speakerMeta[edict.presenter].title }}</small
      ><strong>{{ speakerMeta[edict.presenter].name }}</strong>
    </div>
    <div class="name name--right">
      <small>{{ speakerMeta[edict.objector].title }}</small
      ><strong>{{ speakerMeta[edict.objector].name }}</strong>
    </div>
    <Transition name="bubble" mode="out-in"
      ><MessageBubble
        v-if="!intro && message"
        :key="message.id"
        class="bubble"
        :class="`bubble--${side}`"
        :message="message.content"
        :side="side"
        type="bubble"
    /></Transition>
    <div v-if="intro" class="intro">
      <img src="/common/images/edict/Edict_ThemeInfo_Bg_05.png" alt="" /><span>廷议<br />开始</span>
    </div>
    <div v-if="finished && summaryBusy" class="summary-loading"><span></span>正在汇总廷议……</div>
  </section>
</template>

<style scoped>
.debate {
  overflow: hidden;
  color: #f4c473;
  background: #160d0b url("/common/images/edict/Edict_Main_Bg6.png") center/cover;
}
.base,
.left-camp,
.right-camp {
  position: absolute;
  inset: 0;
  transition: clip-path 0.42s ease;
}
.base {
  background: url("/common/images/edict/Edict_ThemeInfo_Bg_01.png") center/70% 120% no-repeat;
  opacity: 0.42;
}
.left-camp {
  background: #073f2dcc url("/common/images/edict/Edict_ThemeInfo_Bg_L_Glow.png") left/cover;
  clip-path: polygon(0 0, calc(var(--divider) - 4%) 0, calc(var(--divider) + 4%) 100%, 0 100%);
}
.right-camp {
  background: #842316cc url("/common/images/edict/Edict_ThemeInfo_Bg_R_Glow.png") right/cover;
  clip-path: polygon(calc(var(--divider) - 4%) 0, 100% 0, 100% 100%, calc(var(--divider) + 4%) 100%);
}
.ornament {
  position: absolute;
  bottom: -25%;
  width: 68%;
  opacity: 0.55;
  transition: transform 0.42s;
}
.ornament--left {
  left: -15%;
}
.ornament--right {
  right: -15%;
}
.portrait {
  position: absolute;
  z-index: 4;
  bottom: -10%;
  width: 45%;
  height: 95%;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 8px 20px #0009);
}
.portrait--left {
  left: 3%;
}
.portrait--right {
  right: 1%;
}
.divider {
  position: absolute;
  z-index: 7;
  top: -10%;
  bottom: -10%;
  left: var(--divider);
  width: 11px;
  background: url("/common/images/edict/Edict_ThemeInfo_Bg_Line.png") center/100% 100%;
  transform: rotate(-7deg);
  transform-origin: center;
  transition: left 0.42s ease;
  filter: drop-shadow(0 0 7px #ffd468);
}
.name {
  position: absolute;
  z-index: 8;
  bottom: 5%;
  display: grid;
  text-shadow: 0 3px 10px #401006;
}
.name small {
  font-size: clamp(20px, 2vw, 40px);
}
.name strong {
  font-size: clamp(34px, 3.2vw, 66px);
  font-weight: 400;
}
.name--left {
  left: 7%;
}
.name--right {
  right: 7%;
  text-align: right;
}
.bubble {
  position: absolute;
  z-index: 10;
  top: 18%;
}
.bubble--left {
  left: 33%;
}
.bubble--right {
  right: 31%;
}
.intro {
  position: absolute;
  z-index: 12;
  inset: 18% 25%;
  display: grid;
  place-items: center;
  animation: intro 0.95s ease-out both;
}
.intro img {
  position: absolute;
  width: 100%;
}
.intro span {
  z-index: 1;
  color: #ffd485;
  font: clamp(55px, 7vw, 140px)/0.95;
  text-align: center;
}
.summary-loading {
  position: absolute;
  z-index: 20;
  bottom: 4%;
  left: 50%;
  padding: 12px 26px;
  transform: translateX(-50%);
  border: 1px solid #eabf7388;
  border-radius: 24px;
  background: #210e0dcc;
}
.summary-loading span {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 12px;
  border: 2px solid #f4c47355;
  border-top-color: #f4c473;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.bubble-enter-active,
.bubble-leave-active {
  transition: 0.2s;
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
@keyframes intro {
  from {
    opacity: 0;
    transform: scale(1.35);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

