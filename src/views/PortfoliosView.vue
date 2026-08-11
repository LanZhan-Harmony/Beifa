<script setup lang="ts">
import characterUnlockConditions from "@/assets/data/characterUnlockConditions.json";
import PageNavButton from "@/components/PageNavButton.vue";
import ChatPopup from "@/components/portfolio/ChatPopup.vue";
import CommentButton from "@/components/portfolio/CommentButton.vue";
import { useMediaStore } from "@/stores/media";
import { useSaveStore } from "@/stores/save";
import type { characterType } from "@/types/characterType";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t, tm } = useI18n(); // tm 用于获取整个对象的翻译，适合需要获取数组或对象的情况
const mediaStore = useMediaStore();
const saveStore = useSaveStore();

const allCharacters = computed<characterType[]>(() => tm("characters") as characterType[]);
const characters = computed<characterType[]>(() => allCharacters.value.filter((c) => isCharacterUnlocked(c.id)));
const selectedIndex = ref(0);
const infoContentRef = ref<HTMLElement | null>(null);

watch(selectedIndex, () => {
  if (infoContentRef.value) {
    infoContentRef.value.scrollTop = 0;
  }
});

const ANGLE_STEP = 5.5;

const currentCharacter = computed<characterType | undefined>(() => characters.value[selectedIndex.value]);
const chatOpen = ref(false);
const chatStories = computed(() => currentCharacter.value?.stories.filter((story) => isStoryUnlocked(story.id)) ?? []);

onMounted(async () => {
  await mediaStore.setEffectAudioAsync("ui_character_open");
  await mediaStore.setBGMAudioAsync("mus-character-loop");
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

async function selectItem(index: number) {
  selectedIndex.value = index;
  chatOpen.value = false;
  await mediaStore.setEffectAudioAsync("ui_character_list_click");
}

function openChat() {
  if (currentCharacter.value) {
    chatOpen.value = true;
  }
}

function closeChat() {
  chatOpen.value = false;
}

function navigate(direction: 1 | -1) {
  if (direction === 1) {
    if (selectedIndex.value < characters.value.length - 1) {
      selectedIndex.value++;
    }
  } else {
    if (selectedIndex.value > 0) {
      selectedIndex.value--;
    }
  }
}

async function handleWheel(event: WheelEvent) {
  navigate(event.deltaY > 0 ? 1 : -1);
  await mediaStore.setEffectAudioAsync("ui_character_rolling");
}

const touchStartY = ref(0);

function handleTouchStart(event: TouchEvent) {
  touchStartY.value = event.touches[0]!.clientY;
}

function handleTouchEnd(event: TouchEvent) {
  const touchEndY = event.changedTouches[0]!.clientY;
  const deltaY = touchStartY.value - touchEndY;
  if (Math.abs(deltaY) > 50) {
    navigate(deltaY > 0 ? 1 : -1);
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (chatOpen.value) return;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    navigate(1);
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    navigate(-1);
  }
}

function getItemStyle(index: number) {
  const diff = index - selectedIndex.value;
  const angle = -diff * ANGLE_STEP;

  return {
    wrapper: {
      transform: `rotate(${angle}deg)`,
      zIndex: characters.value.length - Math.abs(diff),
      opacity: Math.abs(diff) > 15 ? 0 : 1,
      pointerEvents: Math.abs(diff) > 15 ? "none" : "auto",
    } as any,
    inner: {
      transform: `rotate(${-angle}deg)`,
    },
  };
}

function isCharacterUnlocked(characterId: string): boolean {
  const config = characterUnlockConditions.characters.find((c: any) => c.id === characterId);
  if (!config) return true;
  if (!config.unlockConditions || config.unlockConditions.length === 0) return true;
  return config.unlockConditions.some((id: string) => saveStore.visitedStorylets.includes(id));
}

function isStoryUnlocked(storyId: string): boolean {
  for (const character of characterUnlockConditions.characters) {
    const story = character.stories.find((s: any) => s.id === storyId);
    if (story) {
      if (!story.unlockConditions || story.unlockConditions.length === 0) return true;
      return story.unlockConditions.some((id: string) => saveStore.visitedStorylets.includes(id));
    }
  }
  return true;
}
</script>
<template>
  <div class="container">
    <img class="background" src="/common/images/portfolio/CharacterProfile_Main_bg.png" />
    <PageNavButton :text="t('character.title')" />

    <!-- 左侧扇形角色选择 -->
    <div class="selector-panel" @wheel="handleWheel" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <div
        v-for="(item, index) in characters"
        :key="item.id"
        class="list-item"
        :class="{ active: index === selectedIndex }"
        :style="getItemStyle(index).wrapper"
        @click="selectItem(index)">
        <div class="item-inner" :style="getItemStyle(index).inner">
          <div class="item-bg"></div>
          <span class="item-text">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 中间人物图片 -->
    <div
      class="image-panel"
      v-if="currentCharacter"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd">
      <img class="moon" src="/common/images/月亮底纹.webp" />
      <img
        class="character-image"
        :src="`/characters/${currentCharacter.id}.png`"
        :alt="currentCharacter.name"
        loading="lazy" />
      <div class="comment">
        <button class="ai-icon" type="button" :aria-label="t('character.chatWithCharacter')" @click="openChat" />
        <CommentButton type="like" />
        <CommentButton type="dislike" />
      </div>
    </div>

    <!-- 右侧人物信息 -->
    <div class="info-panel" v-if="currentCharacter">
      <span class="character-name">{{ currentCharacter.name }}</span>
      <img class="header-divider" src="/common/images/portfolio/CharacterProfile_Title_Iine1.png" />
      <div class="info-content" ref="infoContentRef">
        <p class="character-introduction">{{ currentCharacter.description }}</p>
        <template v-if="currentCharacter.stories.length > 0">
          <div class="character-story-title">
            <img class="title-icon" src="/common/images/portfolio/CharacterProfile_Title_Icon2.png" />
            <span>{{ $t("character.characterStories") }}</span>
            <img class="title-line" src="/common/images/portfolio/CharacterProfile_Title_Iine2.png" />
          </div>
          <div v-for="(story, idx) in currentCharacter.stories" :key="idx" class="character-story">
            <div v-if="!isStoryUnlocked(story.id)" class="story-locked">
              <img src="/common/images/portfolio/CharacterProfile_TextLockIcon_L.png" />
              <span>{{ t("character.continueExploringToUnlock") }}</span>
              <img src="/common/images/portfolio/CharacterProfile_TextLockIcon_R.png" />
            </div>
            <div v-else>
              <span class="story-title">{{ story.title }}</span>
              <p class="story-content">{{ story.content }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <ChatPopup
      v-if="chatOpen && currentCharacter"
      :character="currentCharacter"
      :stories="chatStories"
      @close="closeChat" />
  </div>
</template>
<style scoped>
.background {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}
.selector-panel {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 30%;
  display: flex;
  align-items: center;
}
.list-item {
  position: absolute;
  left: 20%;
  top: 50%;
  width: 250px;
  height: 60px;
  margin-top: -30px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transform-origin: 1100px 50%;
  transition:
    transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    opacity 0.4s;
}
.item-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.item-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/common/images/单选框.webp") no-repeat center center;
  background-size: contain;
  transition: background-image 0.3s;
}
.list-item:hover .item-bg,
.list-item.active .item-bg {
  background-image: url("/common/images/单选框高亮.webp");
}
.item-text {
  position: relative;
  color: inherit;
  font-size: 25px;
  font-family: inherit;
  z-index: 1;
}
.list-item.active .item-text {
  color: #fff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}
.image-panel {
  position: absolute;
  left: 28%;
  top: 0;
  bottom: 0;
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.moon {
  position: absolute;
  width: 120%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  z-index: -1;
  top: 50%;
  transform: translateY(-50%);
}
.character-image {
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: bottom center;
}
.comment {
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 30px;
  left: 0;
  margin-top: 0;
  z-index: 10;
}
.ai-icon {
  width: 140px;
  aspect-ratio: 241/230;
  margin: 0 0 -5% 6%;
  border: 0;
  background: none;
  background-image: url("/common/images/portfolio/CharacterProfile_BtnTurn_AI.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: background-image 0.3s;
}
.ai-icon:hover {
  background-image: url("/common/images/portfolio/CharacterProfile_BtnTurnGlow_AI.png");
}
.info-panel {
  position: absolute;
  right: 3%;
  top: 10%;
  height: 80%;
  width: 32%;
  display: flex;
  flex-direction: column;
}
.character-name {
  color: #ffd479;
  font-size: 50px;
}
.header-divider {
  height: 2px;
}
.info-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 15px;
  padding-bottom: 30px;
  padding-right: 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
}
.info-content::-webkit-scrollbar {
  display: none;
}
.character-story-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 25px 0 8px 0;
}
.character-story-title span {
  font-size: 26px;
  color: #e88266;
}
.title-icon {
  height: 20px;
}
.title-line {
  height: 3px;
  margin-left: 10px;
}
.character-introduction {
  font-size: 28px;
  line-height: 1.5;
  color: #fcd3b5;
  white-space: pre-wrap;
}
.character-story {
  margin-bottom: 15px;
}
.story-locked {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 10px;
  font-size: 25px;
  color: #e5ab85c5;
}
.story-locked img {
  width: 20px;
  vertical-align: middle;
}
.story-title {
  font-size: 28px;
  margin: 5px 0;
  color: #fcd3b5;
}
.story-content {
  font-size: 24px;
  line-height: 1.5;
  color: #fcd3b5;
  white-space: pre-wrap;
}

/* 移动端适配 */
@media (max-height: 500px) {
  .list-item {
    width: 150px;
    height: 36px;
    margin-top: -18px;
    transform-origin: 660px 50%;
  }
  .item-text {
    font-size: 15px;
  }
  .character-name {
    font-size: 24px;
  }
  .title-icon {
    width: 24px;
    height: 24px;
  }
  .character-introduction {
    font-size: 18px;
  }
  .character-story-title span {
    font-size: 18px;
  }
  .story-title {
    font-size: 18px;
  }
  .story-content {
    font-size: 16px;
  }
  .story-locked {
    font-size: 16px;
  }
  .story-locked img {
    width: 14px;
  }
}
</style>
