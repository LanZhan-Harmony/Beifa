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
      <img class="top" src="/common/images/popup/Common_Popup1_Bg2.png" />
      <div class="title-wrapper">
        <img class="title-line" src="/common/images/popup/Edict_Main_Line4_L.png" />
        <span class="title">{{ outcome.title }}</span>
        <img class="title-line" src="/common/images/popup/Edict_Main_Line4_R.png" />
      </div>
      <p class="content">{{ outcome.content }}</p>
      <div class="line"></div>
      <div class="feedback" :class="`feedback--${side}`">
        <div class="avatar-block">
          <div class="avatar">
            <img :src="portraitUrl(speakerId)" :alt="speakerMeta[speakerId].name" />
          </div>
          <p class="speaker">
            {{ speakerMeta[speakerId].name }}
          </p>
        </div>
        <MessageBubble :message="outcome.feedback.content" :side="side" type="card" />
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
  background: #050101ef;
  animation: fade 0.22s;
}
.result {
  position: relative;
  width: 60%;
  aspect-ratio: 1024/699;
  color: #f0c27b;
  animation: pop 0.28s ease-out;
}
.board {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.top {
  position: absolute;
  top: -1%;
  left: 0;
  width: 100%;
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
}
.content {
  position: absolute;
  top: 18%;
  left: 5%;
  width: 90%;
  font-size: 32px;
  line-height: 1.3;
}
.line {
  position: absolute;
  top: 40%;
  left: 5%;
  width: 90%;
  height: 1px;
  background: #d6a85f88;
}
.feedback {
  position: absolute;
  top: 42%;
  left: 5%;
  width: 90%;
  display: flex;
  align-items: flex-start;
  gap: 24px;
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
  width: 100px;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 50%;
  background-image: url("/common/images/popup/CharacterProfile__Tab_RoleHead.png");
  background-size: 100% 100%;
  display: grid;
  place-items: start center;
}
.avatar img {
  width: 100%;
  height: 50%;
  margin-top: 15%;
  object-fit: cover;
  object-position: top;
}
.speaker {
  color: #f0c27b;
  font-size: 25px;
  text-align: center;
}
.continue {
  position: absolute;
  bottom: -2%;
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
    height: 500px;
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
  .speaker {
    font-size: 14px;
  }
  .speaker strong {
    font-size: 17px;
  }
  .continue {
    width: 160px;
    font-size: 18px;
  }
}
</style>
