<script setup lang="ts">
import ImageTextButton from "@/components/ImageTextButton.vue";
import PageNavButton from "@/components/PageNavButton.vue";
import type { EdictDecision, EdictRecord } from "@/types/edictType";
import { speakerMeta } from "@/utils/edictMeta";

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
</script>

<template>
  <section class="demand edict-screen">
    <PageNavButton text="奏折批阅" :navigate="false" @click="emit('back')" />
    <div class="scroll">
      <div class="scroll-bg" aria-hidden="true">
        <img class="scroll-bg__half scroll-bg__half--left" src="/common/images/edict/Edict_Popup_Bg5.png" alt="" />
        <img class="scroll-bg__half scroll-bg__half--right" src="/common/images/edict/Edict_Popup_Bg5.png" alt="" />
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
            textPosition="middle"
            :fontSize="30"
            :width="280"
            @click="emit('debate')" />
        </div>
        <div v-else-if="!decision" class="review-actions">
          <button type="button" :disabled="inputLocked" @click="emit('decide', 'approved')">准奏</button>
          <button type="button" :disabled="inputLocked" @click="emit('decide', 'rejected')">驳回</button>
        </div>
      </div>
      <div v-if="decision" class="stamp" :class="`stamp--${decision}`">
        <img
          :src="`/common/images/edict/Edict_Theme_TypeIcon_${decision === 'approved' ? 'Approve' : 'Oppose'}.png`"
          alt="" />
        <span>{{ decision === "approved" ? "准奏" : "驳回" }}</span>
      </div>
    </div>
    <ImageTextButton
      v-if="mode === 'review'"
      class="replay"
      image="/common/images/edict/Edict_ThemeInfo_Btn.png"
      text="查看讨论"
      :width="94"
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
  bottom: 4.5%;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 10%;
  transform: translateY(25%);
}
.single-actions button {
  width: 300px;
  aspect-ratio: 512/129;
}
.review-actions button {
  width: 28%;
  aspect-ratio: 512/61;
  background-image: url("/common/images/edict/Common_BuyPopup_Btn_Normal.png");
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
  right: 5%;
  bottom: 5%;
}
.stamp {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: 4%;
  width: 30%;
  transform: translateX(-50%);
  animation: stamp-in 0.65s cubic-bezier(0.2, 0.85, 0.35, 1.2) both;
}
.stamp img {
  width: 100%;
}
.stamp span {
  position: absolute;
  top: 39%;
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
    opacity: 0;
    transform: translate(-50%, -300px) scale(1.2);
  }
  72% {
    opacity: 1;
    transform: translate(-50%, 0) scale(0.92);
  }
  88% {
    transform: translate(-50%, 0) scale(1.06);
  }
  100% {
    transform: translate(-50%, 0);
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
    font-size: 20px;
  }
  .signature {
    font-size: 16px;
  }
  .single-actions button {
    width: 180px;
  }
  button {
    font-size: 16px;
  }
  .stamp span {
    font-size: 24px;
  }
}
</style>
