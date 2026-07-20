<script setup lang="ts">
withDefaults(defineProps<{ message: string; side: "left" | "right"; type: "bubble" | "card" }>(), {
  side: "left",
  type: "bubble",
});
</script>

<template>
  <div class="message" :class="[`message--${type}`, `message--${side}`]" role="status">{{ message }}</div>
</template>

<style scoped>
.message {
  position: relative;
  width: max-content;
  min-width: 260px;
  max-width: min(48vw, 980px);
  color: #8e261b;
  font-family: TsangErJinKai, serif;
  line-height: 1.35;
  white-space: pre-wrap;
  filter: drop-shadow(0 5px 8px #1c090780);
}
.message--bubble {
  min-height: 118px;
  padding: 28px 42px 42px;
  font-size: clamp(24px, 2.35vw, 48px);
  background: #edbd82;
  border: 4px solid #9b552d;
  border-radius: 24px;
  box-shadow: inset 0 0 0 3px #f7d49f;
}
.message--bubble::before {
  position: absolute;
  bottom: -55px;
  width: 70px;
  height: 70px;
  content: "";
  background: #edbd82;
  border-bottom: 4px solid #9b552d;
  transform: skewY(-38deg) rotate(20deg);
}
.message--left {
  color: #267b68;
}
.message--left::before {
  left: 45px;
  border-left: 4px solid #9b552d;
}
.message--right::before {
  right: 45px;
  border-right: 4px solid #9b552d;
  transform: skewY(38deg) rotate(-20deg);
}
.message--card {
  min-height: 58px;
  padding: 14px 30px;
  font-size: clamp(18px, 1.5vw, 30px);
  background: #f1c792;
  border: 3px solid #9d582e;
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px #ffe0ad;
}
.message--card::after {
  position: absolute;
  top: 50%;
  width: 25px;
  height: 25px;
  content: "";
  background: inherit;
  border: inherit;
  transform: translateY(-50%) rotate(45deg);
}
.message--card.message--left::after {
  left: -14px;
  border-top: 0;
  border-right: 0;
}
.message--card.message--right::after {
  right: -14px;
  border-bottom: 0;
  border-left: 0;
}
</style>

