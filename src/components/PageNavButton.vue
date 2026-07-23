<script setup lang="ts">
import router from "@/router";
import { useMediaStore } from "@/stores/media";
import ArrowButton from "./ArrowButton.vue";

const props = withDefaults(
  defineProps<{
    text?: string;
    path?: string;
    navigate?: boolean;
  }>(),
  {
    navigate: true,
  },
);

const emit = defineEmits<{
  (e: "click"): void;
}>();

const mediaStore = useMediaStore();

async function handleClick() {
  emit("click");
  if (props.navigate === false) {
    await mediaStore.setEffectAudioAsync("ui_universal_back");
    return;
  }
  if (props.path) {
    await mediaStore.setEffectAudioAsync("音效7");
    await router.push(props.path);
  } else {
    await mediaStore.setEffectAudioAsync("ui_universal_back");
    router.back();
  }
}
</script>

<template>
  <ArrowButton class="nav-btn" :text="text || $t('button.back')" direction="left" @click="handleClick" />
</template>

<style scoped>
.nav-btn {
  position: relative;
  z-index: 1000;
  margin: 15px 0 0 25px;
}
@media (max-height: 500px) {
  .nav-btn {
    margin: 15px 0 0 20px;
  }
}
</style>
