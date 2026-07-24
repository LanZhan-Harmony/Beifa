<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    message: string;
    side: "left" | "right";
  }>(),
  {
    side: "left",
  },
);
</script>

<template>
  <div class="message message--card" :class="`message--${props.side}`" role="status">
    {{ props.message }}
  </div>
</template>

<style scoped>
.message {
  position: relative;
  width: max-content;
  line-height: 1.35;
  white-space: pre-wrap;
  filter: drop-shadow(0 5px 8px #1c090780);
}

.message--card {
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  min-height: 54px;
  padding: 10px 16px;
  color: #811700;
  font-size: 26px;
  line-height: 1.45;
  overflow-wrap: anywhere;
  word-break: break-word;
  border: 2px solid transparent;
  border-image-source: url("/common/images/popup/Result_Main_Step2_DialogueTextBgLeft.png");
  border-image-slice: 47 108 47 128 fill;
  border-image-width: 23.5px 54px 23.5px 64px;
  border-image-repeat: stretch;
}

.message--card.message--left {
  color: #811700;
}

.message--card.message--right {
  border-image-source: url("/common/images/popup/Result_Main_Step2_DialogueTextBgRight.png");
  border-image-slice: 47 128 47 108 fill;
  border-image-width: 23.5px 64px 23.5px 54px;
}

@media (max-height: 500px) {
  .message {
    max-width: 480px;
  }

  .message--card {
    font-size: 16px;
    min-height: 27px;
    padding: 5px 8px;
    border-image-width: 12px 27px 12px 32px;
  }

  .message--card.message--right {
    border-image-width: 12px 32px 12px 27px;
  }
}
</style>

