<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import type { EdictDecision } from "../../types/edictType";

const props = defineProps<{
  decision: EdictDecision;
}>();

const emit = defineEmits<{
  (e: "complete"): void;
}>();

let timer: number;
const shakeTimers: number[] = [];

function shakePage(delay: number) {
  shakeTimers.push(
    window.setTimeout(() => {
      const app = document.getElementById("app-container");
      if (!app) return;
      app.classList.remove("deep-thought-shake");
      void app.offsetWidth;
      app.classList.add("deep-thought-shake");
      window.setTimeout(() => app.classList.remove("deep-thought-shake"), 420);
    }, delay),
  );
}

onMounted(() => {
  timer = window.setTimeout(() => emit("complete"), 3000);
  shakePage(480);
  shakePage(1860);
});

onBeforeUnmount(() => {
  window.clearTimeout(timer);
  shakeTimers.forEach(window.clearTimeout);
  document.getElementById("app-container")?.classList.remove("deep-thought-shake");
});
</script>
<template>
  <div class="thought" role="alert">
    <div class="shade"></div>
    <div class="scene">
      <div class="background"></div>
      <img class="wing wing--left" src="/common/images/edict/Edict_judgment_Bg1_2.png" alt="" />
      <img class="wing wing--right" src="/common/images/edict/Edict_judgment_Bg1_1.png" alt="" />
      <img class="officials" src="/common/images/edict/Edict_judgment_Bg2.png" alt="群臣进谏" />
      <div class="warning"><strong>陛下!!</strong><span>三思啊!</span></div>
    </div>
  </div>
</template>
<style scoped>
.thought {
  position: absolute;
  z-index: 100;
  inset: 0;
  overflow: hidden;
  animation:
    thought-shake 0.42s 0.78s ease-in-out both,
    thought-shake 0.42s 1.86s ease-in-out both;
  pointer-events: all;
}
.background,
.shade {
  position: absolute;
  inset: 0;
}
.scene {
  position: absolute;
  inset: 0;
  transform: scale(0.88);
  transform-origin: center;
}
.background {
  background: url("/common/images/edict/Edict_judgment_Bg1.png") center/cover no-repeat;
  animation: fade-in 0.66s ease-out both;
}
.shade {
  background: linear-gradient(
    180deg,
    rgba(8, 5, 4, 0.95) 0%,
    rgba(8, 5, 4, 0.83) 34%,
    rgba(8, 5, 4, 0.62) 66%,
    rgba(8, 5, 4, 0.3) 100%
  );
  animation: fade-in 0.66s ease-out both;
}
.wing {
  position: absolute;
  top: 23%;
  height: 50%;
  opacity: 0.8;
  animation: fade-in 0.66s ease-out both;
}
.wing--left {
  left: 7%;
}
.wing--right {
  left: 40%;
}
.officials {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 20%;
  height: 86%;
  animation: officials-in 0.5s 0.08s cubic-bezier(0.18, 0.86, 0.28, 1) both;
}
.warning {
  position: absolute;
  z-index: 3;
  top: 30%;
  left: 53%;
  display: grid;
  color: #ffd477;
  text-shadow: 0 4px 14px #000;
}
.warning strong {
  font-size: 110px;
  font-weight: 400;
  animation: warning-strong-sequence 0.6s 0.08s ease-out both;
}
.warning span {
  margin: 0% 0 0 40%;
  font-size: 68px;
  white-space: nowrap;
  animation: warning-span-sequence 0.9s 1.25s ease-out both;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes officials-in {
  from {
    opacity: 0;
    transform: translate(-18%, 18%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}
@keyframes warning-strong-sequence {
  from {
    opacity: 0;
    transform: translate(55%, -55%) scale(1.18);
  }
  45% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  64% {
    transform: translate(0, 0) scale(1);
  }
  72% {
    transform: translate(-4px, 2px) rotate(-1deg);
  }
  80% {
    transform: translate(4px, -2px) rotate(1deg);
  }
  88% {
    transform: translate(-3px, 1px) rotate(-0.7deg);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) rotate(0);
  }
}
@keyframes warning-span-sequence {
  from {
    opacity: 0;
    transform: translate(4%, -18%) scale(2.35);
  }
  52% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  73% {
    transform: translate(0, 0) scale(1);
  }
  81% {
    transform: translate(-4px, 2px) rotate(-1deg);
  }
  89% {
    transform: translate(4px, -2px) rotate(1deg);
  }
  96% {
    transform: translate(-3px, 1px) rotate(-0.7deg);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) rotate(0);
  }
}
@keyframes thought-shake {
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
:global(#app-container.deep-thought-shake) {
  animation: page-shake 0.42s ease-in-out both;
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
@media (max-height: 500px) {
  .warning strong {
    font-size: 50px;
  }
  .warning span {
    font-size: 32px;
  }
}
</style>
