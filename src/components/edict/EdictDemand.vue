<script setup lang="ts">
import { ref } from "vue";
import type { EdictDecision, EdictRecord } from "../../types/edictType";
import { speakerMeta } from "../../utils/edictMeta";
import ImageTextButton from "../ImageTextButton.vue";
import PageNavButton from "../PageNavButton.vue";

withDefaults(
  defineProps<{
    edict: EdictRecord;
    mode: "demand" | "review";
    decision?: EdictDecision | null;
    inputLocked?: boolean;
  }>(),
  { decision: null, inputLocked: false },
);

const emit = defineEmits<{
  (e: "back"): void;
  (e: "debate"): void;
  (e: "decide", decision: EdictDecision): void;
  (e: "replayDebate"): void;
}>();

const pressedDecision = ref<EdictDecision | null>(null);

function pressDecision(decision: EdictDecision) {
  pressedDecision.value = decision;
}

function finishDecisionPress() {
  if (!pressedDecision.value) {
    return;
  }
  const decision = pressedDecision.value;
  pressedDecision.value = null;
  emit("decide", decision);
}
</script>

<template>
  <section class="demand edict-screen">
    <PageNavButton text="奏折批阅" :navigate="false" @click="emit('back')" />
    <div class="scroll">
      <div class="scroll-bg" aria-hidden="true">
        <img class="scroll-bg__half scroll-bg__half--left" src="/common/images/edict/Edict_Popup_Bg5.png" />
        <img class="scroll-bg__half scroll-bg__half--right" src="/common/images/edict/Edict_Popup_Bg5.png" />
      </div>
      <div class="scroll-content">
        <p class="body">{{ edict.demand }}</p>
        <p class="signature">
          <span>{{ speakerMeta[edict.presenter].name }}</span>
        </p>
        <div v-if="mode === 'demand'" class="single-actions">
          <ImageTextButton
            image="/common/images/edict/Common_Btn2_Bg.png"
            hoverImage="/common/images/edict/Common_Btn2_Hover.png"
            text="众卿怎么看？"
            :textTopMargin="45"
            :fontSize="30"
            :width="280"
            @click="emit('debate')" />
        </div>
        <div v-else-if="!decision" class="review-actions">
          <button
            type="button"
            :class="{ 'is-pressed': pressedDecision === 'approved' }"
            :disabled="inputLocked"
            @click="pressDecision('approved')"
            @animationend="finishDecisionPress">
            准奏
          </button>
          <button
            type="button"
            :class="{ 'is-pressed': pressedDecision === 'rejected' }"
            :disabled="inputLocked"
            @click="pressDecision('rejected')"
            @animationend="finishDecisionPress">
            驳回
          </button>
        </div>
      </div>
      <div v-if="decision" class="stamp" :class="`stamp--${decision}`">
        <img :src="`/common/images/edict/Edict_Theme_TypeIcon_${decision === 'approved' ? 'Approve' : 'Oppose'}.png`" />
        <span>{{ decision === "approved" ? "准奏" : "驳回" }}</span>
      </div>
    </div>
    <ImageTextButton
      v-if="mode === 'review'"
      class="replay"
      image="/common/images/edict/Edict_ThemeInfo_Btn.png"
      text="查看讨论"
      :width="160"
      :disabled="inputLocked"
      @click="emit('replayDebate')" />
  </section>
</template>

<style scoped>
.demand {
  background: #74110a url("/common/images/edict/Edict_Main_Bg3.png") center/cover no-repeat;
}
.scroll {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  aspect-ratio: 977/464;
}
.scroll-bg {
  position: absolute;
  inset: 0;
  overflow: visible;
}
.scroll-content {
  position: absolute;
  inset: 0;
  animation: scroll-content-in 0.24s ease-out 0.72s both;
}
.scroll-bg__half {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform-origin: center;
  will-change: transform;
}
.scroll-bg__half--left {
  clip-path: inset(0 50% 0 0);
  animation: scroll-open-left 0.72s cubic-bezier(0.2, 0.85, 0.35, 1) both;
}
.scroll-bg__half--right {
  clip-path: inset(0 0 0 50%);
  animation: scroll-open-right 0.72s cubic-bezier(0.2, 0.85, 0.35, 1) both;
}
.body {
  position: absolute;
  top: 26%;
  left: 10%;
  width: 82%;
  color: #27130d;
  font-size: 58px;
  line-height: 1.2;
  white-space: pre-wrap;
}
.signature {
  position: absolute;
  right: 8%;
  bottom: 20%;
  display: grid;
  color: #29140d;
  font-size: 35px;
  text-align: center;
}
.single-actions,
.review-actions {
  position: absolute;
  right: 0;
  bottom: 4%;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 10%;
}
.single-actions button {
  width: 300px;
  aspect-ratio: 512/129;
}
.review-actions button {
  position: relative;
  width: 28%;
  aspect-ratio: 512/123;
  background-image: url("/common/images/edict/Common_BuyPopup_Btn_Normal.png");
  background-position: top 50% left 75%;
  background-size: 92% 49%;
  background-repeat: no-repeat;
}
.review-actions button::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  background: url("/common/images/edict/Common_BuyPopup_Btn_Normal1.png") center/100% 100% no-repeat;
  pointer-events: none;
}
.review-actions button:hover:not(:disabled) {
  filter: none;
  background-image: url("/common/images/edict/Common_BuyPopup_Btn_Hover.png");
}
.review-actions button:hover:not(:disabled)::after,
.review-actions button:focus-visible:not(:disabled)::after {
  background: url("/common/images/edict/Common_BuyPopup_Btn_Hover1.png") center/100% 100% no-repeat;
}
.review-actions button.is-pressed {
  animation: button-press 180ms ease-out both;
}
button {
  border: 0;
  color: #f5d19c;
  background: url("/common/images/edict/Common_Btn2_Bg.png") center/100% 100% no-repeat;
  font: inherit;
  font-size: 30px;
}
button:hover:not(:disabled) {
  filter: brightness(1.25);
}
.replay {
  position: absolute;
  right: 6%;
  bottom: 2%;
}
.stamp {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: 4%;
  width: 30%;
  transform: translateX(-50%);
  animation: stamp-in 0.4s both;
}
.stamp img {
  width: 100%;
}
.stamp span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: #8f1710;
}
.stamp--rejected span {
  color: #611919;
}
@keyframes stamp-in {
  0% {
    transform: translate(-50%, 0) scale(1.5);
  }
  100% {
    transform: translate(-50%, 0) scale(1);
  }
}
@keyframes button-press {
  0% {
    scale: 1;
  }
  45% {
    scale: 0.94;
  }
  100% {
    scale: 1;
  }
}
@keyframes scroll-open-left {
  0% {
    transform: translateX(16%) scaleY(1.12);
  }
  100% {
    transform: translateX(0) scaleY(1);
  }
}
@keyframes scroll-open-right {
  0% {
    transform: translateX(-16%) scaleY(1.12);
  }
  100% {
    transform: translateX(0) scaleY(1);
  }
}
@keyframes scroll-content-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (max-height: 500px) {
  .body {
    font-size: 30px;
  }
  .signature {
    font-size: 25px;
  }
  button {
    font-size: 16px;
  }
  .stamp span {
    font-size: 24px;
  }
}
</style>
