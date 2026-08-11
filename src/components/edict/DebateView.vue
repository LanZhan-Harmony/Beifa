<script setup lang="ts">
import { portraitUrl, useSpeakerMeta } from "@/assets/data/edictMeta";
import ImageTextButton from "@/components/ImageTextButton.vue";
import PageNavButton from "@/components/PageNavButton.vue";
import { useMediaStore } from "@/stores/media";
import type { EdictRecord } from "@/types/edictType";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import MessageBubble from "./MessageBubble.vue";

const props = withDefaults(
  defineProps<{
    edict: EdictRecord;
    replay?: boolean;
    liveComplete?: boolean;
  }>(),
  {
    replay: false,
    liveComplete: false,
  },
);

const emit = defineEmits<{
  (e: "complete"): void;
  (e: "back"): void;
}>();

const media = useMediaStore();
const { t } = useI18n();
const speakerMeta = useSpeakerMeta();
const intro = ref(true);
const index = ref(-1);
const finished = ref(false);
const messageComplete = ref(false);
let timer: number | undefined;
let finishTimer: number | undefined;
let introAudioTimer: number | undefined;
const DIVIDER_STEP = 50;
const SCENE_STEP = 18;
const INTRO_DURATION = 2800;
const NEXT_MESSAGE_DELAY = 1000;

const message = computed(() => props.edict.messages[index.value]);
const side = computed(() => (message.value?.sender === "objector" ? "right" : "left"));
const dividerOffset = computed(() => {
  if (intro.value || finished.value || index.value < 0) return 0;
  return props.edict.messages
    .slice(0, index.value + 1)
    .reduce((offset, item) => offset + (item.sender === "presenter" ? DIVIDER_STEP : -DIVIDER_STEP), 0);
});
const dividerX = computed(() => `calc(50% + ${dividerOffset.value}px)`);
const sceneOffset = computed(() => {
  if (intro.value || finished.value || index.value < 0) return 0;
  return props.edict.messages
    .slice(0, index.value + 1)
    .reduce((offset, item) => offset + (item.sender === "presenter" ? SCENE_STEP : -SCENE_STEP), 0);
});
const sceneStyle = computed(() => ({
  "--divider-x": dividerX.value,
  "--divider-shift": `${dividerOffset.value}px`,
  "--scene-shift": `${sceneOffset.value * 0.5}px`,
}));

function schedule(ms: number) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = undefined;
    beginMessages();
  }, ms);
}

function scheduleNextMessage() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = undefined;
    advance();
  }, NEXT_MESSAGE_DELAY);
}

function playMessageAudio() {
  void media.setEffectAudioAsync(message.value?.sender === "objector" ? "ui_zz_debate_neg" : "ui_zz_debate_aff");
}

function beginMessages() {
  intro.value = false;
  if (!props.edict.messages.length) {
    return;
  }
  index.value = 0;
  messageComplete.value = false;
  playMessageAudio();
}

function advance() {
  if (intro.value || finished.value) return;
  if (index.value < props.edict.messages.length - 1) {
    index.value++;
    messageComplete.value = false;
    playMessageAudio();
  } else if (props.liveComplete && props.edict.messages.length && !finished.value) {
    finishDebate();
  }
}

function finishDebate() {
  finished.value = true;
  window.clearTimeout(finishTimer);
  finishTimer = window.setTimeout(() => {
    finishTimer = undefined;
    emit("complete");
  }, 420);
}

function skipReplay() {
  if (!props.replay || finished.value) return;
  window.clearTimeout(timer);
  window.clearTimeout(introAudioTimer);
  window.clearTimeout(finishTimer);
  finished.value = true;
  emit("complete");
}

function onMessageComplete() {
  messageComplete.value = true;
  scheduleNextMessage();
}

watch(
  () => props.edict.messages.length,
  () => {
    if (intro.value || finished.value || !props.edict.messages.length) return;
    if (index.value < 0) {
      index.value = 0;
      messageComplete.value = false;
      playMessageAudio();
    } else if (messageComplete.value) {
      scheduleNextMessage();
    }
  },
);

watch(
  () => props.liveComplete,
  (value) => {
    if (value && !intro.value && !finished.value && messageComplete.value && props.edict.messages.length) {
      scheduleNextMessage();
    }
  },
);

onMounted(() => {
  introAudioTimer = window.setTimeout(() => {
    introAudioTimer = undefined;
    void media.setEffectAudioAsync("ui_zz_debate_start");
  }, 600);
  schedule(INTRO_DURATION);
});

onBeforeUnmount(() => {
  window.clearTimeout(timer);
  window.clearTimeout(finishTimer);
  window.clearTimeout(introAudioTimer);
});
</script>

<template>
  <section class="debate edict-screen" :class="{ 'is-intro': intro, 'is-finished': finished }" :style="sceneStyle">
    <div class="base"></div>
    <PageNavButton :text="t('edict.navigation.reviewMemorials')" :navigate="false" @click="emit('back')" />
    <ImageTextButton
      v-if="replay"
      class="skip"
      image="/common/images/edict/Edict_Main_Btn_Skip.png"
      :text="t('edict.debate.skip')"
      :textTopMargin="50"
      :fontSize="30"
      :width="230"
      @click="skipReplay" />

    <!-- z=1/2：中心纹样保持素材原始比例，避免被压扁。 -->
    <img class="theme-pattern theme-pattern--main" src="/common/images/edict/Edict_ThemeInfo_Bg_01.png" />
    <img class="theme-pattern theme-pattern--aux" src="/common/images/edict/Edict_ThemeInfo_Bg_04_2.png" />

    <!-- z=3/4：阵营底图共用同一条斜向裁剪边界。 -->
    <div class="camp camp--left camp--glow"></div>
    <div class="camp camp--right camp--glow"></div>
    <div class="camp camp--left camp--ornament"></div>
    <div class="camp camp--right camp--ornament"></div>

    <!-- z=5：左右独立的辅助纹样。 -->
    <img class="camp-detail camp-detail--left" src="/common/images/edict/Edict_ThemeInfo_Bg_03_L.png" />
    <img class="camp-detail camp-detail--right" src="/common/images/edict/Edict_ThemeInfo_Bg_03_R.png" />

    <!-- z=6：人物与装饰使用不同的景深动画速度。 -->
    <div class="characters">
      <img
        class="portrait portrait--left"
        :src="portraitUrl(edict.presenter)"
        :alt="speakerMeta[edict.presenter].name" />
      <img
        class="portrait portrait--right"
        :src="portraitUrl(edict.objector)"
        :alt="speakerMeta[edict.objector].name" />
    </div>

    <!-- z=7/8：姓名装饰与姓名文字分层。 -->
    <div class="name name--left">
      <img src="/common/images/edict/Edict_ThemeInfo_Bg_Name1_2_L.png" />
      <strong>{{ speakerMeta[edict.presenter].name }}</strong>
    </div>
    <div class="name name--right">
      <img src="/common/images/edict/Edict_ThemeInfo_Bg_Name1_2_R.png" />
      <strong>{{ speakerMeta[edict.objector].name }}</strong>
    </div>

    <!-- z=9：金线与裁剪多边形使用同一个 --divider-x。 -->
    <div class="divider"></div>

    <!-- z=10：当前气泡播放完成后自动进入下一句。 -->
    <Transition name="bubble" mode="out-in">
      <div
        v-if="!intro && message && !finished"
        :key="message.id"
        class="bubble-shell"
        :class="`bubble-shell--${side}`">
        <MessageBubble :message="message.content" :side="side" @complete="onMessageComplete" />
      </div>
    </Transition>

    <!-- z=11/12：开场装饰底与标题。 -->
    <div v-if="intro" class="intro">
      <img src="/common/images/edict/Edict_ThemeInfo_Bg_05.png" />
      <span class="debate-span">{{ t("edict.debate.intro.courtDebate") }}</span>
      <span class="start-span">{{ t("edict.debate.intro.begins") }}</span>
    </div>
  </section>
</template>

<style scoped>
.debate {
  --divider-drift: 6.2vh;
  --divider-x: 50%;
  overflow: hidden;
  color: #f4c473;
  background: #160d0b;
  isolation: isolate;
}
.base,
.camp,
.divider,
.theme-pattern,
.camp-detail,
.characters,
.name,
.bubble-shell,
.intro,
.message-loading,
.summary-loading {
  position: absolute;
}
.base {
  z-index: 0;
  inset: 0;
  background: url("/common/images/edict/Edict_Main_Bg6.png") center/cover no-repeat;
}
.skip {
  position: absolute;
  z-index: 100;
  top: 3%;
  right: 0;
}
.theme-pattern {
  pointer-events: none;
  width: 78%;
  height: auto;
  object-fit: contain;
  left: calc(50% + var(--scene-shift));
  transform: translateX(-50%);
  transition: left 0.42s ease;
}
.theme-pattern--main {
  z-index: 2;
  top: 50%;
  height: 140%;
  aspect-ratio: 1024 / 1011;
  transform: translate(-50%, -50%);
  animation: pattern-in 0.48s ease-out both;
  filter: brightness(100) contrast(100);
}
.theme-pattern--aux {
  z-index: 3;
  top: 50%;
  height: 62%;
  aspect-ratio: 1017 / 1024;
  opacity: 0.36;
  transform: translate(-50%, -50%);
  animation: aux-in 0.5s ease-out 0.08s both;
  filter: brightness(100) contrast(100);
}
.camp {
  inset: 0;
  pointer-events: none;
  transition: clip-path 0.42s ease;
  clip-path: polygon(
    0 0,
    calc(var(--divider-x) - var(--divider-drift)) 0,
    calc(var(--divider-x) + var(--divider-drift)) 100%,
    0 100%
  );
}
.camp--right {
  clip-path: polygon(
    calc(var(--divider-x) - var(--divider-drift)) 0,
    100% 0,
    100% 100%,
    calc(var(--divider-x) + var(--divider-drift)) 100%
  );
}
.camp--glow {
  z-index: 1;
  opacity: 0.5;
}
.camp--left.camp--glow {
  background: url("/common/images/edict/Edict_ThemeInfo_Bg_L_Glow.png") left/cover no-repeat;
}
.camp--right.camp--glow {
  background: url("/common/images/edict/Edict_ThemeInfo_Bg_R_Glow.png") right/cover no-repeat;
}
.camp--ornament {
  z-index: 4;
  opacity: 0.52;
  transition: background-position 0.42s ease;
}
.camp--left.camp--ornament {
  background: url("/common/images/edict/Edict_ThemeInfo_Bg_L_1.png") left bottom/auto 100% no-repeat;
  background-position: calc(-10% + var(--scene-shift)) bottom;
  background-size: auto 100%;
  filter: brightness(2);
}
.camp--right.camp--ornament {
  background: url("/common/images/edict/Edict_ThemeInfo_Bg_R_1.png") right bottom/auto 100% no-repeat;
  background-position: calc(110% + var(--scene-shift)) bottom;
  background-size: auto 100%;
  filter: brightness(2);
}
.camp-detail {
  z-index: 5;
  bottom: 20%;
  width: 300px;
  pointer-events: none;
  transform: translateX(var(--scene-shift));
  transition: transform 0.42s ease;
}
.camp-detail--left {
  left: 34%;
}
.camp-detail--right {
  right: 34%;
}
.characters {
  z-index: 6;
  inset: 0;
  pointer-events: none;
  transform: translateX(var(--scene-shift));
  transition: transform 0.42s ease;
  animation: character-in 0.44s ease-out both;
}
.portrait {
  position: absolute;
  bottom: -10%;
  width: 45%;
  height: 95%;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 8px 20px #0009);
}
.portrait--left {
  left: 3%;
  animation: portrait-left-in 0.44s ease-out both;
}
.portrait--right {
  right: -4%;
  animation: portrait-right-in 0.44s ease-out both;
}
.name {
  z-index: 8;
  bottom: 10%;
  width: 560px;
  pointer-events: none;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
}
.name img {
  display: block;
  width: 400px;
  margin-top: -60px;
}
.name strong {
  position: static;
  display: block;
  color: #ffd482;
  font-size: 76px;
  font-weight: 400;
  text-shadow: 0 3px 10px #401006;
  white-space: nowrap;
}
.name--left {
  left: 4%;
}
.name--left img {
  margin-left: -5%;
}
.name--left strong {
  margin-left: 9%;
}
.name--right {
  right: 4%;
  align-items: flex-end;
}
.name--right img {
  margin-right: -5%;
}
.name--right strong {
  margin-right: 9%;
}
.divider {
  z-index: 9;
  top: -10%;
  bottom: -10%;
  left: var(--divider-x);
  width: 11px;
  background: url("/common/images/edict/Edict_ThemeInfo_Bg_Line.png") center/100% 100% no-repeat;
  transform: translateX(-50%) rotate(-7deg);
  transform-origin: center;
  transition: left 0.42s ease;
  pointer-events: none;
}
.bubble-shell {
  z-index: 10;
  top: 18%;
  pointer-events: none;
  transition:
    left 0.42s ease,
    right 0.42s ease;
}
.bubble-shell--left {
  left: calc(33% + var(--scene-shift));
}
.bubble-shell--right {
  right: calc(30% - var(--scene-shift));
}

.intro {
  z-index: 11;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: intro 0.8s ease-out both;
  pointer-events: none;
}
.intro img {
  position: absolute;
  bottom: -4%;
  width: 100%;
  opacity: 0.8;
  animation: intro-ornament 0.42s ease-out both;
}
.intro span {
  z-index: 1;
  color: #ffd485;
  text-align: center;
  text-shadow: 0 4px 15px #42150a;
}
.debate-span {
  margin: 0 0 0 -10%;
  font-size: clamp(72px, 14vw, 180px);
}
.start-span {
  margin: -7% 0 0 15%;
  font-size: clamp(62px, 12vw, 150px);
}
.message-loading,
.summary-loading {
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
.bubble-enter-active {
  animation: bubble-shake-in 0.15s ease-out both;
}
.bubble-leave-active {
  animation: bubble-out 0.1s ease-in both;
}
.bubble-shell--left {
  transform-origin: bottom left;
}
.bubble-shell--right {
  transform-origin: bottom right;
}
.is-finished .divider {
  transition-duration: 0.42s;
}
.is-intro {
  animation: page-shake 0.42s ease-in-out 0.8s both;
}
.is-intro .camp {
  opacity: 0;
  animation: camp-in 0.4s ease-out 0.2s both;
}
.is-intro .divider {
  opacity: 0;
  animation: line-in 0.2s ease-out 0.1s both;
}
.is-intro .characters {
  opacity: 0;
  animation: character-in 0.4s ease-out 0.2s both;
}
.is-intro .camp-detail--left {
  animation: detail-left-in 0.42s ease-out 0.2s both;
}
.is-intro .camp-detail--right {
  animation: detail-right-in 0.42s ease-out 0.2s both;
}
.is-intro .name {
  opacity: 0;
}
.is-intro .name--left {
  animation: name-left-in 0.42s ease-out 1.1s both;
}
.is-intro .name--right {
  animation: name-right-in 0.42s ease-out 1.1s both;
}
.is-intro .intro {
  animation-delay: 0.6s;
}
@keyframes pattern-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(-12deg) scale(0.92);
  }
  to {
    opacity: 0.52;
    transform: translate(-50%, -50%) rotate(0) scale(1);
  }
}
@keyframes aux-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(10deg) scale(0.88);
  }
  to {
    opacity: 0.36;
    transform: translate(-50%, -50%) rotate(0) scale(1);
  }
}
@keyframes character-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes camp-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.5;
  }
}
@keyframes line-in {
  from {
    opacity: 0;
    clip-path: inset(50% 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0);
  }
}
@keyframes detail-left-in {
  from {
    transform: translateX(-15px);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes detail-right-in {
  from {
    transform: translateX(15px);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes portrait-left-in {
  from {
    transform: translateX(-30px);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes portrait-right-in {
  from {
    transform: translateX(30px);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes name-left-in {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes name-right-in {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes intro {
  0% {
    opacity: 0;
    transform: scale(1.5);
  }
  60% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}
@keyframes page-shake {
  0%,
  100% {
    transform: translate(0, 0);
  }
  15% {
    transform: translate(-6px, 2px);
  }
  30% {
    transform: translate(7px, -2px);
  }
  45% {
    transform: translate(-6px, 1px);
  }
  60% {
    transform: translate(5px, 0);
  }
  75% {
    transform: translate(-3px, -1px);
  }
}
@keyframes intro-ornament {
  from {
    opacity: 0;
    transform: translateY(24px) scale(1.04);
  }
  to {
    opacity: 0.8;
    transform: translateY(0) scale(1);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes bubble-shake-in {
  0% {
    opacity: 0;
    transform: rotate(-1deg);
  }
  35% {
    opacity: 1;
    transform: rotate(1deg);
  }
  65% {
    transform: rotate(-1deg);
  }
  100% {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}
@keyframes bubble-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@media (max-height: 500px) {
  .debate {
    --divider-drift: 5.5vh;
  }
  .theme-pattern {
    width: 86%;
  }
  .theme-pattern--aux {
    width: 48%;
  }
  .name {
    width: min(34%, 360px);
  }
  .name strong {
    font-size: clamp(20px, 4vw, 42px);
  }
  .bubble-shell {
    top: 12%;
  }
  .bubble-shell--left {
    left: 28%;
  }
  .bubble-shell--right {
    right: 26%;
  }
}
</style>
