<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  image: string;
  hoverImage?: string;
  text: string;
  width?: number;
  fontSize?: number;
  textPosition?: "middle" | "bottom";
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const isPressed = ref(false);

const buttonStyle = computed(() => ({
  width: props.width ? props.width + "px" : "70px",
  "--button-image": `url(${props.image})`,
  "--button-hover-image": props.hoverImage ? `url(${props.hoverImage})` : "none",
}));

function handleClick() {
  isPressed.value = true;
}

function handleAnimationEnd() {
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
    @animationend="handleAnimationEnd">
    <img class="image-text-button-sizer" :src="props.image" alt="" aria-hidden="true" />
    <span class="image-text-button-bg"></span>
    <span
      class="image-text-button-text"
      :style="{
        fontSize: props.fontSize ? props.fontSize + 'px' : '20px',
        top: props.textPosition === 'middle' ? '45%' : 'auto',
        bottom: props.textPosition === 'middle' ? 'auto' : '20%',
        transform: props.textPosition === 'middle' ? 'translateX(-50%) translateY(-50%)' : 'translateX(-50%)',
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
}
.image-text-button.is-pressed {
  animation: button-press 180ms ease-out both;
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

@keyframes button-press {
  0% {
    scale: 1;
  }
  45% {
    scale: 0.94;
  }
  100% {
    scale: 1;
  }
}

@media (max-height: 500px) {
  .image-text-button {
    scale: 0.7;
  }
}
</style>
