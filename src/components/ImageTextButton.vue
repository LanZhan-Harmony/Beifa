<script setup lang="ts">
import { useMediaStore } from "@/stores/media";
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    image: string;
    hoverImage?: string;
    text: string;
    width?: number;
    fontSize?: number;
    textTopMargin?: number;
    scaleTransformOrigin?: string;
  }>(),
  {
    width: 70,
    fontSize: 20,
    textPosition: "bottom",
    textTopMargin: 70,
    scaleTransformOrigin: "center center",
  },
);

const emit = defineEmits<{
  (e: "click"): void;
}>();

const mediaStore = useMediaStore();

const isPressed = ref(false);

const buttonStyle = computed(() => ({
  width: props.width + "px",
  "--button-image": `url(${props.image})`,
  "--button-hover-image": props.hoverImage ? `url(${props.hoverImage})` : "none",
  "--scale-transform-origin": props.scaleTransformOrigin,
}));

async function handleClick() {
  await mediaStore.setEffectAudioAsync("ui_universal_click");
  isPressed.value = true;
}

function handleTransitionEnd() {
  if (!isPressed.value) {
    return;
  }
  isPressed.value = false;
  emit("click");
}
</script>

<template>
  <button
    class="image-text-button"
    :class="{ 'is-pressed': isPressed }"
    :style="buttonStyle"
    @click="handleClick"
    @transitionend="handleTransitionEnd">
    <img class="image-text-button-sizer" :src="props.image" aria-hidden="true" />
    <span class="image-text-button-bg"></span>
    <span
      class="image-text-button-text"
      :style="{
        fontSize: props.fontSize + 'px',
        top: props.textTopMargin + '%',
        transform: 'translateX(-50%) translateY(-50%)',
      }">
      {{ props.text }}
    </span>
  </button>
</template>

<style scoped>
.image-text-button {
  position: relative;
  display: inline-block;
  padding: 0;
  background: none;
  border: none;
  overflow: hidden;
  scale: 1;
  font-family: inherit;
  transition: scale 180ms ease-out;
}
.image-text-button.is-pressed {
  scale: 0.9;
}
.image-text-button-sizer {
  display: block;
  width: 100%;
  height: auto;
  visibility: hidden;
  pointer-events: none;
}
.image-text-button-bg {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  background-image: var(--button-image);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}
.image-text-button-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--button-hover-image);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 180ms ease-out;
}
.image-text-button:hover .image-text-button-bg::after,
.image-text-button:focus-visible .image-text-button-bg::after {
  opacity: 1;
}
.image-text-button-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #ffd49f;
  white-space: nowrap;
  font-family: inherit;
}
@media (max-height: 500px) {
  .image-text-button {
    scale: 0.7;
    transform-origin: var(--scale-transform-origin);
  }
  .image-text-button.is-pressed {
    scale: 0.65;
  }
}
</style>
