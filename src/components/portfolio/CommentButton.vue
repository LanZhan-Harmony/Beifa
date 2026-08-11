<script setup lang="ts">
import { useMediaStore } from "@/stores/media";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  type: "like" | "dislike";
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const mediaStore = useMediaStore();
const { t } = useI18n();

const isPressed = ref(false);

async function handleClick() {
  if (props.type === "like") {
    await mediaStore.setEffectAudioAsync("ui_character_flower_click");
  } else {
    await mediaStore.setEffectAudioAsync("ui_character_egg_click");
  }
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
    class="comment-button"
    :class="{ 'is-pressed': isPressed }"
    @click="handleClick"
    @transitionend="handleTransitionEnd">
    <img class="comment-button-bg" src="/common/images/portfolio/CharacterProfile_Btn_Vote01.png" />
    <img
      v-if="props.type === 'like'"
      class="comment-button-fg-like"
      src="/common/images/portfolio/CharacterProfile_Btn_Flower.png " />
    <img v-else class="comment-button-fg-dislike" src="/common/images/portfolio/CharacterProfile_Voteicon_Egg.png" />
    <span class="comment-button-text">
      {{ t(props.type === "like" ? "portfolio.vote.like" : "portfolio.vote.dislike") }}
    </span>
  </button>
</template>

<style scoped>
.comment-button {
  position: relative;
  display: inline-block;
  background: none;
  border: none;
  font-family: inherit;
  height: 100px;
  aspect-ratio: 241/158;
  scale: 1;
  transition: scale 180ms ease-out;
}
.comment-button.is-pressed {
  scale: 0.9;
}
.comment-button-bg {
  display: block;
  width: 100%;
}
.comment-button-fg-like {
  position: absolute;
  top: 15%;
  left: 34%;
  width: 38%;
}
.comment-button-fg-dislike {
  position: absolute;
  top: 15%;
  left: 39%;
  width: 25%;
}
.comment-button-text {
  position: absolute;
  bottom: 22%;
  left: 50%;
  transform: translateX(-50%);
  color: #ffd49f;
  white-space: nowrap;
  font-size: 20px;
  font-family: inherit;
}

@media (max-height: 500px) {
  .comment-button {
    scale: 0.8;
  }
  .comment-button.is-pressed {
    scale: 0.7;
  }
}
</style>
