<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useMediaStore } from "../../stores/media";
import type { EdictRecord } from "../../types/edictType";
import { portraitUrl, speakerMeta } from "../../utils/edictMeta";
import MessageBubble from "./MessageBubble.vue";

const props = withDefaults(
  defineProps<{
    edict: EdictRecord;
    replay?: boolean;
    liveComplete?: boolean;
    summaryBusy?: boolean;
  }>(),
  {
    replay: false,
    liveComplete: false,
    summaryBusy: false,
  },
);

const emit = defineEmits<{
  (e: "complete"): void;
}>();

const media = useMediaStore();
const intro = ref(true);
const index = ref(-1);
const finished = ref(false);
let timer: number | undefined;
const message = computed(() => props.edict.messages[index.value]);
const side = computed(() => (message.value?.sender === "objector" ? "right" : "left"));
const divider = computed(() => (intro.value ? "50%" : side.value === "left" ? "57%" : "43%"));

function schedule(ms = 1450) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = undefined;
    advance();
  }, ms);
}
function advance() {
  if (intro.value) {
    intro.value = false;
    if (props.edict.messages.length) {
      index.value = 0;
      void media.setEffectAudioAsync("ui_zz_debate_aff");
      schedule();
    }
    return;
  }
  if (index.value < props.edict.messages.length - 1) {
    index.value++;
    void media.setEffectAudioAsync(message.value?.sender === "objector" ? "ui_zz_debate_neg" : "ui_zz_debate_aff");
    schedule();
  } else if (props.liveComplete && props.edict.messages.length && !finished.value) {
    finished.value = true;
    emit("complete");
  }
}
function handleClick() {
  if (!finished.value) advance();
  else if (!props.summaryBusy) emit("complete");
}
watch(
  () => props.edict.messages.length,
  () => {
    if (intro.value || finished.value || timer || !props.edict.messages.length) return;
    if (index.value < 0) {
      index.value = 0;
      schedule(500);
    } else if (props.liveComplete && index.value >= props.edict.messages.length - 1) schedule(650);
  },
);
watch(
  () => props.liveComplete,
  (value) => {
    if (value && !intro.value && !finished.value && props.edict.messages.length) schedule(650);
  },
);
onMounted(() => {
  void media.setEffectAudioAsync("ui_zz_debate_start");
  schedule(950);
});
onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <section class="debate edict-screen" :style="{ '--divider': divider }" @click="handleClick">
    <div class="base"></div>
    <div class="left-camp"></div>
    <div class="right-camp"></div>
    <img class="ornament ornament--left" src="/common/images/edict/Edict_ThemeInfo_Bg_L_1.png" alt="" /><img
      class="ornament ornament--right"
      src="/common/images/edict/Edict_ThemeInfo_Bg_R_1.png"
      alt="" />
    <img
      class="portrait portrait--left"
      :src="portraitUrl(edict.presenter)"
      :alt="speakerMeta[edict.presenter].name" /><img
      class="portrait portrait--right"
      :src="portraitUrl(edict.objector)"
      :alt="speakerMeta[edict.objector].name" />
    <div class="divider"></div>
    <div class="name name--left">
      <strong>{{ speakerMeta[edict.presenter].name }}</strong>
    </div>
    <div class="name name--right">
      <strong>{{ speakerMeta[edict.objector].name }}</strong>
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
      <img src="/common/images/edict/Edict_ThemeInfo_Bg_05.png" alt="" />
      <span class="debate-span">廷议</span>
      <span class="start-span">开始</span>
    </div>
    <div v-if="!intro && !message && !finished" class="message-loading"><span></span>正反双方正在发言……</div>
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
}
.left-camp {
  background: #073f2dcc url("/common/images/edict/Edict_ThemeInfo_Bg_L_Glow.png") left/cover;
  opacity: 0.3;
  clip-path: polygon(0 0, calc(var(--divider) - 4%) 0, calc(var(--divider) + 4%) 100%, 0 100%);
}
.right-camp {
  background: #842316cc url("/common/images/edict/Edict_ThemeInfo_Bg_R_Glow.png") right/cover;
  opacity: 0.3;
  clip-path: polygon(calc(var(--divider) - 4%) 0, 100% 0, 100% 100%, calc(var(--divider) + 4%) 100%);
}
.ornament {
  position: absolute;
  bottom: -25%;
  width: 68%;
  opacity: 0.55;
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
  font-size: 34px;
}
.name strong {
  font-size: 54px;
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
  inset: 10% 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: intro 0.3s ease-out both;
}
.intro img {
  position: absolute;
  width: 100%;
  opacity: 0.8;
}
.intro span {
  z-index: 1;
  color: #ffd485;
  text-align: center;
}
.debate-span {
  font-size: 180px;
  margin: 0 0 0 -10%;
}
.start-span {
  font-size: 150px;
  margin: -7% 0 0 15%;
}
.message-loading,
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
.message-loading span,
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
    transform: scale(1.5);
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
@media (max-height: 500px) {
  .name small {
    font-size: 18px;
  }
  .name strong {
    font-size: 28px;
  }
  .intro span {
    font-size: 50px;
  }
  .bubble {
    top: 12%;
  }
  .bubble--left {
    left: 28%;
  }
  .bubble--right {
    right: 26%;
  }
}
</style>

