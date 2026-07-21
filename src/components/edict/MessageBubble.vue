<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

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

const emit = defineEmits<{
  (event: "complete"): void;
}>();

/** 每个字符的显示间隔（毫秒）。气泡尺寸仍按完整 message 计算。 */
const TYPEWRITER_INTERVAL = 70;
const displayedText = ref("");
let typewriterTimer: number | undefined;

function stopTypewriter() {
  if (typewriterTimer !== undefined) {
    window.clearInterval(typewriterTimer);
    typewriterTimer = undefined;
  }
}

function startTypewriter() {
  stopTypewriter();
  const characters = [...props.message];
  displayedText.value = "";

  if (props.type !== "bubble" || characters.length === 0) {
    displayedText.value = props.message;
    emit("complete");
    return;
  }

  let index = 0;
  typewriterTimer = window.setInterval(() => {
    displayedText.value += characters[index++];
    if (index >= characters.length) {
      stopTypewriter();
      emit("complete");
    }
  }, TYPEWRITER_INTERVAL);
}

watch(() => props.message, startTypewriter);
onMounted(startTypewriter);
onBeforeUnmount(stopTypewriter);

/** 气泡布局参数集中配置；调整间距时只改这里。 */
const BUBBLE_LAYOUT = {
  desktop: {
    fontSize: 40,
    paddingTop: 12,
    paddingBottom: 30,
    paddingInner: 18,
    paddingOuter: 14,
    borderTop: 6,
    borderBottom: 44,
    borderX: 3,
    minWidth: 0,
    maxWidth: 680,
    minHeight: 0,
  },
  compact: {
    fontSize: 20,
    paddingTop: 6,
    paddingBottom: 9,
    paddingInner: 9,
    paddingOuter: 7,
    borderTop: 3,
    borderBottom: 22,
    borderX: 1.5,
    minWidth: 0,
    maxWidth: 480,
    minHeight: 0,
  },
} as const;
const BUBBLE_LINE_HEIGHT = 1.35;
const viewportHeight = ref(typeof window === "undefined" ? 1000 : window.innerHeight);
const compactViewport = computed(() => viewportHeight.value <= 500);

/**
 * 估算文字宽度（以字号倍数为单位）
 * ASCII 字符（\u0000-\u00ff）按 0.55 倍字号计，其余全角字符按 1 倍字号计
 */
function getTextWidth(text: string) {
  return [...text].reduce((width, character) => width + (/\u0000-\u00ff/.test(character) ? 0.55 : 1), 0);
}

/** 根据文字内容动态计算气泡宽高 */
const bubbleSize = computed(() => {
  const compact = compactViewport.value;
  const layout = compact ? BUBBLE_LAYOUT.compact : BUBBLE_LAYOUT.desktop;
  const { fontSize } = layout;
  const horizontalSpace = layout.paddingInner + layout.paddingOuter + layout.borderX * 2;
  const verticalSpace = layout.paddingTop + layout.paddingBottom + layout.borderTop + layout.borderBottom;
  const lines = props.message.split("\n");
  // 最宽行的文字宽度（px）
  const longestLineWidth = Math.max(...lines.map(getTextWidth), 1) * fontSize;
  // 气泡宽度 = 文字宽度 + 水平空间，钳制在 [MIN, MAX] 范围内
  const width = Math.min(layout.maxWidth, Math.max(layout.minWidth, Math.ceil(longestLineWidth + horizontalSpace)));
  // 文字区域可用宽度
  const contentWidth = width - horizontalSpace;
  // 每行能容纳的等宽字符数
  const charsPerLine = Math.max(1, contentWidth / fontSize);
  // 自动换行后的总行数
  const lineCount = lines.reduce((count, line) => count + Math.max(1, Math.ceil(getTextWidth(line) / charsPerLine)), 0);
  // 气泡高度 = 行数 * 行高 + 垂直空间
  const height = Math.ceil(lineCount * fontSize * BUBBLE_LINE_HEIGHT + verticalSpace);

  return {
    width: `${width}px`,
    height: `${height}px`,
    "--bubble-padding-top": `${layout.paddingTop}px`,
    "--bubble-padding-bottom": `${layout.paddingBottom}px`,
    "--bubble-padding-inner": `${layout.paddingInner}px`,
    "--bubble-padding-outer": `${layout.paddingOuter}px`,
    "--bubble-border-top": `${layout.borderTop}px`,
    "--bubble-border-bottom": `${layout.borderBottom}px`,
    "--bubble-border-x": `${layout.borderX}px`,
    "--bubble-min-height": `${layout.minHeight}px`,
    "--bubble-font-size": `${layout.fontSize}px`,
  };
});

function updateViewportHeight() {
  viewportHeight.value = window.innerHeight;
}

onMounted(() => window.addEventListener("resize", updateViewportHeight));
onBeforeUnmount(() => window.removeEventListener("resize", updateViewportHeight));
</script>

<template>
  <div
    v-if="props.type === 'bubble'"
    class="message message--bubble"
    :class="`message--${props.side}`"
    :style="bubbleSize"
    role="status">
    {{ displayedText }}
  </div>
  <div v-else class="message message--card" :class="`message--${props.side}`" role="status">
    {{ displayedText }}
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

/* Bubble: Edict_ThemeInfo_Talking_L/R.png 九宫格。 */
.message--bubble {
  box-sizing: border-box;
  min-height: var(--bubble-min-height);
  color: #811700;
  padding: var(--bubble-padding-top) var(--bubble-padding-outer) var(--bubble-padding-bottom)
    var(--bubble-padding-inner);
  font-size: var(--bubble-font-size);
  border-style: solid;
  border-color: transparent;
  border-width: var(--bubble-border-top) var(--bubble-border-x) var(--bubble-border-bottom) var(--bubble-border-x);
  border-image-source: url("/common/images/edict/Edict_ThemeInfo_Talking_L.png");
  /*
   * `border-image-slice` is measured in source-image pixels (the asset is
   * 256x204). Keep this separate from `border-image-width`, which only controls
   * how large those already-cropped pieces are painted around the element.
   */
  border-image-slice: 30 65 88 138 fill;
  border-image-width: 30px 65px 88px 138px;
  border-image-repeat: stretch;
  opacity: 0.95;
}
.message--bubble.message--left {
  color: #1c5f4b;
}
.message--bubble.message--right {
  padding-right: var(--bubble-padding-inner);
  padding-left: var(--bubble-padding-outer);
  border-width: var(--bubble-border-top) var(--bubble-border-x) var(--bubble-border-bottom) var(--bubble-border-x);
  border-image-source: url("/common/images/edict/Edict_ThemeInfo_Talking_R.png");
  /* The R asset is horizontally mirrored, so the source cuts are mirrored too. */
  border-image-slice: 30 138 88 65 fill;
  border-image-width: 30px 138px 88px 65px;
}

/* Card: Result_Main_Step2_DialogueTextBgLeft/Right.png 九宫格。 */
.message--card {
  box-sizing: border-box;
  max-width: 100%;
  min-height: 54px;
  padding: 10px 16px;
  color: #811700;
  font-size: 26px;
  border: 2px solid transparent;
  border-image-source: url("/common/images/popup/Result_Main_Step2_DialogueTextBgLeft.png");
  /* border-image-slice 顺序为 top right bottom left。 */
  border-image-slice: 47 108 47 128 fill;
  /* 素材按 50% 显示，中间区域横向拉伸以适应文字长度。 */
  border-image-width: 23.5px 54px 23.5px 64px;
  border-image-repeat: stretch;
}
.message--card.message--left {
  color: #811700;
}
.message--card.message--right {
  border-image-source: url("/common/images/popup/Result_Main_Step2_DialogueTextBgRight.png");
  /* Right 素材左右切片颠倒：left=108, right=128。 */
  border-image-slice: 47 128 47 108 fill;
  border-image-width: 23.5px 64px 23.5px 54px;
}
@media (max-height: 500px) {
  .message {
    max-width: 480px;
  }
  .message--bubble {
    /* 0.5x desktop display size; source slices remain 30/65/88/138. */
    border-image-width: 15px 32.5px 44px 69px;
  }
  .message--bubble.message--right {
    border-image-slice: 30 138 88 65 fill;
    border-image-width: 15px 69px 44px 32.5px;
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
