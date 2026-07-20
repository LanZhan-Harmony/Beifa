<script setup lang="ts">
import type { EdictDecision } from "@/types/edictType";
import { onBeforeUnmount, onMounted } from "vue";
defineProps<{ decision: EdictDecision }>();
const emit = defineEmits<{ complete: [] }>();
let timer: number;
onMounted(() => {
  timer = window.setTimeout(() => emit("complete"), 1900);
});
onBeforeUnmount(() => window.clearTimeout(timer));
</script>
<template>
  <div class="thought" role="alert">
    <div class="shade"></div>
    <img class="wing wing--left" src="/common/images/edict/Edict_judgment_Bg1_2.png" alt="" /><img
      class="wing wing--right"
      src="/common/images/edict/Edict_judgment_Bg1_1.png"
      alt="" /><img class="officials" src="/common/images/edict/Edict_judgment_Bg2.png" alt="群臣进谏" />
    <div class="warning"><strong>陛下！！</strong><span>三思啊！</span></div>
  </div>
</template>
<style scoped>
.thought {
  position: absolute;
  z-index: 100;
  inset: 0;
  overflow: hidden;
  animation: thought-in 0.22s ease-out both;
  pointer-events: all;
}
.shade {
  position: absolute;
  inset: 0;
  background: #080504c9 url("/common/images/edict/Edict_judgment_Bg1.png") center/cover no-repeat;
}
.wing {
  position: absolute;
  top: 23%;
  height: 50%;
  opacity: 0.8;
}
.wing--left {
  left: 2%;
}
.wing--right {
  right: 2%;
}
.officials {
  position: absolute;
  z-index: 2;
  bottom: -10%;
  left: 15%;
  height: 93%;
  filter: brightness(0.65) drop-shadow(0 0 12px #eac164);
}
.warning {
  position: absolute;
  z-index: 3;
  top: 30%;
  right: 21%;
  display: grid;
  color: #ffd477;
  text-shadow: 0 4px 14px #000;
}
.warning strong {
  font-size: clamp(65px, 7vw, 145px);
  font-weight: 400;
}
.warning span {
  margin: 5% 0 0 25%;
  font-size: clamp(44px, 4.3vw, 88px);
}
@keyframes thought-in {
  from {
    opacity: 0;
    transform: translateY(80px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>

