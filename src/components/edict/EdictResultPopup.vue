<script setup lang="ts">
import { computed } from "vue";
import type { EdictDecision, EdictOutcome, EdictRecord } from "../../types/edictType";
import { portraitUrl, speakerMeta } from "../../utils/edictMeta";
import ImageTextButton from "../ImageTextButton.vue";
import ThemeButton from "../ThemeButton.vue";
import MessageBubble from "./MessageBubble.vue";

const props = defineProps<{
  edict: EdictRecord;
  decision: EdictDecision;
  outcome: EdictOutcome;
}>();

const emit = defineEmits<{
  (e: "continue"): void;
  (e: "retire"): void;
}>();

const speakerId = computed(() =>
  props.outcome.feedback.speaker === "presenter" ? props.edict.presenter : props.edict.objector,
);
const side = computed(() => (props.outcome.feedback.speaker === "presenter" ? "right" : "left"));
</script>
<template>
  <div class="result-mask">
    <section class="result" role="dialog" aria-modal="true" aria-label="奏折结案">
      <img class="board" src="/common/images/popup/Common_Popup1_Bg1.png" />
      <img class="wing wing--left" src="/common/images/popup/Common_Popup1_bg3_1_L.png" />
      <img class="wing wing--right" src="/common/images/popup/Common_Popup1_bg3_1_R.png" />
      <img class="wing wing--overlay wing--left" src="/common/images/popup/Common_Popup1_bg3_2_L.png" />
      <img class="wing wing--overlay wing--right" src="/common/images/popup/Common_Popup1_bg3_2_R.png" />
      <img class="top" src="/common/images/popup/Common_Popup1_Bg2.png" />
      <img class="top-ornament top-ornament--left" src="/common/images/popup/Common_Popup1_bg4_L.png" />
      <img class="top-ornament top-ornament--right" src="/common/images/popup/Common_Popup1_bg4_R.png" />
      <img class="top-drop top-drop--left" src="/common/images/popup/Common_Popup1_bg4_2.png" />
      <img class="top-drop top-drop--right" src="/common/images/popup/Common_Popup1_bg4_2.png" />
      <img class="bottom-ornament" src="/common/images/popup/Common_Popup1_bg5.png" />
      <div class="title-wrapper">
        <img class="title-line" src="/common/images/popup/Edict_Main_Line4_L.png" />
        <span class="title">{{ outcome.title }}</span>
        <img class="title-line" src="/common/images/popup/Edict_Main_Line4_R.png" />
      </div>
      <p class="content">{{ outcome.content }}</p>
      <img class="line" src="/common/images/popup/Result_Check_TitleLine1.png" />
      <div class="feedback" :class="`feedback--${side}`">
        <div class="avatar-block">
          <div class="avatar">
            <div class="avatar-portrait">
              <img :src="portraitUrl(speakerId)" :alt="speakerMeta[speakerId].name" />
            </div>
            <img class="avatar-frame" src="/common/images/popup/CharacterProfile_Tab_RoleHead.png" />
          </div>
          <p class="speaker">
            {{ speakerMeta[speakerId].name }}
          </p>
        </div>
        <img class="feedback-link" src="/common/images/popup/Result_Main_Step2_DialogueTextBg1.png" />
        <MessageBubble class="message" :message="outcome.feedback.content" :side="side" type="card" />
      </div>
      <ImageTextButton
        class="continue"
        image="/common/images/edict/Common_Btn2_Bg.png"
        hoverImage="/common/images/edict/Common_Btn2_Hover.png"
        text="继续批阅"
        :textTopMargin="45"
        :fontSize="32"
        :width="300"
        @click="emit('continue')" />
      <ThemeButton
        class="retire"
        backgroundImage="/common/images/popup/Main_Btn1_Bg1.png"
        foregroundImage="/common/images/popup/Edict_Icon.png"
        text="退朝"
        :foregroundWidthPercent="70"
        :fontSize="22"
        @click="emit('retire')" />
    </section>
  </div>
</template>
<style scoped>
.result-mask {
  position: absolute;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: center;
  background: #050101e4;
  animation: fade 0.22s;
}
.result {
  position: relative;
  width: 65%;
  aspect-ratio: 1024/699;
  isolation: isolate;
  color: #f0c27b;
  animation: pop 0.28s ease-out;
}
.board {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  aspect-ratio: 1024/699;
  object-fit: contain;
  z-index: 0;
}
.wing {
  position: absolute;
  top: 2.5%;
  height: 76%;
  width: auto;
  aspect-ratio: 206/937;
  object-fit: contain;
  pointer-events: none;
  z-index: -1;
}
.wing--left {
  left: -8.8%;
}
.wing--right {
  right: -8.8%;
}
.wing--overlay {
  top: 2.5%;
  height: 100%;
  aspect-ratio: 126/747;
  z-index: 1;
}
.top,
.top-ornament,
.top-drop,
.bottom-ornament {
  position: absolute;
  display: block;
  height: auto;
  object-fit: contain;
  pointer-events: none;
}
.top {
  top: -1%;
  left: 0;
  width: 100%;
  aspect-ratio: 1024/36;
  z-index: 5;
}
.top-ornament {
  top: 2.6%;
  width: 22%;
  aspect-ratio: 256/32;
  z-index: 6;
}
.top-ornament--left {
  left: 0.5%;
}
.top-ornament--right {
  right: 0.5%;
}
.top-drop {
  top: 3%;
  width: 0.8%;
  aspect-ratio: 9/65;
  z-index: 6;
}
.top-drop--left {
  left: 0.5%;
}
.top-drop--right {
  right: 0.5%;
  transform: scaleX(-1);
}
.bottom-ornament {
  bottom: 4%;
  left: 0;
  width: 100%;
  aspect-ratio: 843/115;
  z-index: 4;
}
.title-wrapper {
  position: absolute;
  top: 7%;
  left: 15%;
  width: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
}
.title {
  font-size: 46px;
  white-space: nowrap;
}
.title-line {
  aspect-ratio: 125/42;
  height: 20px;
  object-fit: contain;
}
.content {
  position: absolute;
  top: 18%;
  left: 7%;
  width: 86%;
  font-size: 32px;
  line-height: 1.3;
}
.line {
  position: absolute;
  top: 40%;
  left: 7%;
  width: 86%;
  height: auto;
  aspect-ratio: 256/1;
  object-fit: contain;
}
.feedback {
  position: absolute;
  top: 42%;
  left: 7%;
  width: 86%;
  display: flex;
  align-items: flex-start;
  gap: 0;
  z-index: 3;
}
.feedback--right {
  flex-direction: row-reverse;
}
.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.avatar {
  position: relative;
  width: 100px;
  aspect-ratio: 89/88;
  flex-shrink: 0;
}
.avatar-portrait {
  position: absolute;
  top: 16%;
  left: 16%;
  width: 68%;
  aspect-ratio: 1.018006/1;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
}
.avatar-portrait img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 2940/2888;
  object-fit: cover;
  object-position: 50% 16%;
}
.avatar-frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 89/88;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
}
.feedback-link {
  align-self: flex-start;
  width: 32px;
  height: auto;
  margin-top: 39px;
  aspect-ratio: 64/19;
  object-fit: contain;
  flex: 0 0 auto;
}
.feedback--right .feedback-link {
  transform: scaleX(-1);
}
.message {
  margin: 22px 0 0 -4px;
}
.speaker {
  color: #f0c27b;
  font-size: 28px;
  text-align: center;
}
.continue {
  position: absolute;
  bottom: 3%;
  left: 50%;
  transform: translateX(-50%);
}
.retire {
  position: fixed;
  right: 3%;
  bottom: 5%;
  filter: brightness(1.1);
}
@keyframes fade {
  from {
    opacity: 0;
  }
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
@media (max-height: 500px) {
  .result {
    width: 750px;
    max-width: calc(100vw - 40px);
  }
  h1 {
    font-size: 24px;
  }
  .content {
    font-size: 16px;
  }
  .avatar {
    width: 50px;
  }
  .feedback-link {
    width: 18px;
    margin-top: 19px;
  }
  .speaker {
    font-size: 14px;
  }
  .speaker strong {
    font-size: 17px;
  }
}
</style>

