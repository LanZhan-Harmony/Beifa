<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    message: string;
    side: "left" | "right";
  }>(),
  {
    side: "left",
  },
);

const emit = defineEmits<{
  (event: "complete"): void;
}>();

const TYPEWRITER_INTERVAL = 70;
const displayedText = ref("");
let typewriterTimer: number | undefined;

const characters = computed(() => [...props.message]);

function stopTypewriter() {
  if (typewriterTimer !== undefined) {
    window.clearInterval(typewriterTimer);
    typewriterTimer = undefined;
  }
}

function startTypewriter() {
  stopTypewriter();
  displayedText.value = "";

  if (characters.value.length === 0) {
    emit("complete");
    return;
  }

  let index = 0;
  typewriterTimer = window.setInterval(() => {
    displayedText.value += characters.value[index++];
    if (index >= characters.value.length) {
      stopTypewriter();
      emit("complete");
    }
  }, TYPEWRITER_INTERVAL);
}

watch(() => props.message, startTypewriter);
onMounted(startTypewriter);
onBeforeUnmount(stopTypewriter);

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
    maxWidth: 680,
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
    maxWidth: 480,
  },
} as const;

const viewportHeight = ref(typeof window === "undefined" ? 1000 : window.innerHeight);
const compactViewport = computed(() => viewportHeight.value <= 500);
const bubbleStyle = computed(() => {
  const layout = compactViewport.value ? BUBBLE_LAYOUT.compact : BUBBLE_LAYOUT.desktop;
  return {
    "--bubble-max-width": `${layout.maxWidth}px`,
    "--bubble-padding-top": `${layout.paddingTop}px`,
    "--bubble-padding-bottom": `${layout.paddingBottom}px`,
    "--bubble-padding-inner": `${layout.paddingInner}px`,
    "--bubble-padding-outer": `${layout.paddingOuter}px`,
    "--bubble-border-top": `${layout.borderTop}px`,
    "--bubble-border-bottom": `${layout.borderBottom}px`,
    "--bubble-border-x": `${layout.borderX}px`,
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
    class="message message--bubble"
    :class="`message--${props.side}`"
    :style="bubbleStyle"
    role="status">
    <!-- 使用连续文本节点占位，避免每个字符成为独立的最小换行单位。 -->
    <span class="bubble__sizer" aria-hidden="true">{{ props.message }}</span>
    <span class="bubble__text">{{ displayedText }}</span>
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

.message--bubble {
  box-sizing: border-box;
  /* 绝对定位父级下用 max-content，避免 fit-content 退化成最小内容宽度。 */
  width: max-content;
  max-width: min(var(--bubble-max-width), calc(100vw - 40px));
  color: #811700;
  padding: var(--bubble-padding-top) var(--bubble-padding-outer) var(--bubble-padding-bottom)
    var(--bubble-padding-inner);
  font-size: var(--bubble-font-size);
  border-style: solid;
  border-color: transparent;
  border-width: var(--bubble-border-top) var(--bubble-border-x) var(--bubble-border-bottom) var(--bubble-border-x);
  border-image-source: url("/common/images/edict/Edict_ThemeInfo_Talking_L.png");
  border-image-slice: 30 65 88 138 fill;
  border-image-width: 30px 65px 88px 138px;
  border-image-repeat: stretch;
  opacity: 0.95;
}

.bubble__sizer {
  display: block;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.bubble__text {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  padding: var(--bubble-padding-top) var(--bubble-padding-outer) var(--bubble-padding-bottom)
    var(--bubble-padding-inner);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.bubble__sizer {
  visibility: hidden;
}

.message--bubble.message--left {
  color: #1c5f4b;
}

.message--bubble.message--right {
  padding-right: var(--bubble-padding-inner);
  padding-left: var(--bubble-padding-outer);
  border-image-source: url("/common/images/edict/Edict_ThemeInfo_Talking_R.png");
  border-image-slice: 30 138 88 65 fill;
  border-image-width: 30px 138px 88px 65px;
}

.message--bubble.message--right .bubble__text {
  padding-right: var(--bubble-padding-inner);
  padding-left: var(--bubble-padding-outer);
}

@media (max-height: 500px) {
  .message {
    max-width: 480px;
  }

  .message--bubble {
    border-image-width: 15px 32.5px 44px 69px;
  }

  .message--bubble.message--right {
    border-image-slice: 30 138 88 65 fill;
    border-image-width: 15px 69px 44px 32.5px;
  }
}
</style>
