<script setup lang="ts">
import { computed } from "vue";
import type { EdictDecision, EdictOutcome, EdictRecord } from "../../types/edictType";
import { portraitUrl, speakerMeta } from "../../utils/edictMeta";
import ImageTextButton from "../ImageTextButton.vue";
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
      <img class="board" src="/common/images/popup/Common_Popup1_Bg1.png" alt="" /><img
        class="top"
        src="/common/images/popup/Common_Popup1_Bg2.png"
        alt="" />
      <h1>{{ outcome.title }}</h1>
      <p class="content">{{ outcome.content }}</p>
      <div class="line"></div>
      <div class="feedback" :class="`feedback--${side}`">
        <div class="avatar"><img :src="portraitUrl(speakerId)" :alt="speakerMeta[speakerId].name" /></div>
        <MessageBubble :message="outcome.feedback.content" :side="side" type="card" />
        <p class="speaker">
          <strong>{{ speakerMeta[speakerId].name }}</strong>
        </p>
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
      <button class="retire" type="button" @click="emit('retire')">
        <img src="/common/images/popup/Edict_Icon.png" alt="" /><span>退朝</span>
      </button>
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
  background: #050101d9;
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
h1 {
  position: absolute;
  top: 9%;
  left: 15%;
  width: 70%;
  font-size: 46px;
  text-align: center;
}
.content {
  position: absolute;
  top: 21%;
  left: 8%;
  width: 84%;
  font-size: 28px;
  line-height: 1.75;
}
.line {
  position: absolute;
  top: 49%;
  left: 8%;
  width: 84%;
  height: 1px;
  background: #d6a85f88;
}
.feedback {
  position: absolute;
  top: 55%;
  left: 8%;
  width: 84%;
  display: flex;
  align-items: center;
  gap: 24px;
}
.feedback--right {
  flex-direction: row-reverse;
}
.avatar {
  width: 100px;
  aspect-ratio: 1;
  overflow: hidden;
  border: 5px solid #d6a65d;
  border-radius: 50%;
  background: #3c130d;
}
.avatar img {
  width: 100%;
  height: 160%;
  object-fit: cover;
  object-position: center top;
}
.speaker {
  display: grid;
  min-width: 130px;
  color: #f0c27b;
  font-size: 22px;
}
.speaker strong {
  font-size: 26px;
}
.feedback--right .speaker {
  text-align: right;
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
  bottom: 3%;
  display: grid;
  justify-items: center;
  border: 0;
  color: #f0c27b;
  background: none;
  font-size: 24px;
}
.retire img {
  width: 90px;
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
  .retire {
    font-size: 14px;
  }
  .retire img {
    width: 40px;
  }
}
</style>

