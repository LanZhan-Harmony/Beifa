<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    message: string;
    side: "left" | "right";
    type: "bubble" | "card";
  }>(),
  {
    side: "left",
    type: "bubble",
  },
);

const BUBBLE_FONT_SIZE = 40;
const BUBBLE_LINE_HEIGHT = 1.35;
const BUBBLE_MAX_WIDTH = 980;
const BUBBLE_MIN_WIDTH = 430;
const BUBBLE_HORIZONTAL_SPACE = 42 * 2 + 4 + 70;
const BUBBLE_VERTICAL_SPACE = 28 + 42 + 8 + 60;

function getTextWidth(text: string) {
  return [...text].reduce((width, character) => width + (/\u0000-\u00ff/.test(character) ? 0.55 : 1), 0);
}

const bubbleSize = computed(() => {
  const lines = props.message.split("\n");
  const longestLineWidth = Math.max(...lines.map(getTextWidth), 1) * BUBBLE_FONT_SIZE;
  const width = Math.min(
    BUBBLE_MAX_WIDTH,
    Math.max(BUBBLE_MIN_WIDTH, Math.ceil(longestLineWidth + BUBBLE_HORIZONTAL_SPACE)),
  );
  const contentWidth = width - BUBBLE_HORIZONTAL_SPACE;
  const charsPerLine = Math.max(1, contentWidth / BUBBLE_FONT_SIZE);
  const lineCount = lines.reduce((count, line) => count + Math.max(1, Math.ceil(getTextWidth(line) / charsPerLine)), 0);
  const height = Math.ceil(lineCount * BUBBLE_FONT_SIZE * BUBBLE_LINE_HEIGHT + BUBBLE_VERTICAL_SPACE);

  return {
    width: `${width}px`,
    height: `${height}px`,
  };
});
</script>

<template>
  <div
    class="message"
    :class="[`message--${props.type}`, `message--${props.side}`]"
    :style="props.type === 'bubble' ? bubbleSize : undefined"
    role="status">
    {{ props.message }}
  </div>
</template>

<style scoped>
.message {
  position: relative;
  width: max-content;
  min-width: 260px;
  max-width: 980px;
  color: #8e261b;
  line-height: 1.35;
  white-space: pre-wrap;
  filter: drop-shadow(0 5px 8px #1c090780);
}
.message--bubble {
  box-sizing: border-box;
  min-height: 192px;
  padding: 28px 42px 42px;
  font-size: 40px;
  border-style: solid;
  border-color: transparent;
  border-width: 8px 4px 60px 70px;
  border-image-source: url("/common/images/edict/Edict_ThemeInfo_Talking_L.png");
  border-image-slice: 8 4 60 70 fill;
  border-image-width: 8px 4px 60px 70px;
  border-image-repeat: stretch;
}
.message--left {
  color: #267b68;
}
.message--bubble.message--right {
  border-width: 8px 70px 60px 4px;
  border-image-source: url("/common/images/edict/Edict_ThemeInfo_Talking_R.png");
  border-image-width: 8px 70px 60px 4px;
}
.message--card {
  min-height: 58px;
  padding: 14px 30px;
  font-size: 26px;
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
@media (max-height: 500px) {
  .message {
    max-width: 480px;
  }
  .message--bubble {
    font-size: 20px;
    padding: 18px 22px 28px;
    border-width: 8px 4px 48px 54px;
    border-image-width: 8px 4px 48px 54px;
  }
  .message--bubble.message--right {
    border-width: 8px 54px 48px 4px;
    border-image-width: 8px 54px 48px 4px;
  }
  .message--card {
    font-size: 16px;
  }
}
</style>

