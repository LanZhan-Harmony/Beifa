<script setup lang="ts">
import { useMediaStore } from "../stores/media";

const props = withDefaults(
  defineProps<{
    backgroundImage: string;
    foregroundImage: string;
    text: string;
    width?: number;
    foregroundWidthPercent?: number;
    fontSize?: number;
  }>(),
  {
    width: 70,
    foregroundWidthPercent: 50,
    fontSize: 20,
  },
);

const emit = defineEmits<{
  (e: "click"): void;
}>();

const mediaStore = useMediaStore();

async function handleHover() {
  await mediaStore.setEffectAudioAsync("ui_universal_hover");
}

async function handleClick() {
  await mediaStore.setEffectAudioAsync("ui_universal_click");
  emit("click");
}
</script>

<template>
  <button class="theme-button" :style="{ width: props.width + 'px' }" @click="handleClick" @mouseenter="handleHover">
    <img class="theme-button-bg" :src="props.backgroundImage" />
    <img class="theme-button-fg" :src="props.foregroundImage" :style="{ width: props.foregroundWidthPercent + '%' }" />
    <span class="theme-button-text" :style="{ fontSize: props.fontSize + 'px' }">
      {{ props.text }}
    </span>
  </button>
</template>

<style scoped>
.theme-button {
  position: relative;
  display: inline-block;
  background: none;
  border: none;
}
.theme-button-bg {
  display: block;
  width: 100%;
}
.theme-button-fg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.theme-button-text {
  position: absolute;
  bottom: -25%;
  left: 50%;
  transform: translateX(-50%);
  color: #ffd49f;
  white-space: nowrap;
  font-family: inherit;
}

@media (max-height: 500px) {
  .theme-button {
    scale: 0.8;
  }
}
</style>
