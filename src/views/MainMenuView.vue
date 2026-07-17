<script setup lang="ts">
import ExitDialog from "@/components/ExitDialog.vue";
import ThemeButton from "@/components/ThemeButton.vue";
import type { chapterType } from "@/types/chapterType";
import { invoke } from "@tauri-apps/api/core";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import router from "../router";
import { useMediaStore } from "../stores/media";
import { useSaveStore } from "../stores/save";
import { toStreamUrl } from "../utils/streamUrl";

const { tm } = useI18n();
const mediaStore = useMediaStore();
const saveStore = useSaveStore();
const mainVideoUrl = toStreamUrl("/common/videos/main.mp4");

const exitDialogOpen = ref(false);
const isExitDialogClosing = ref(false);
// 上朝功能尚未开放；保留此状态供后续接入解锁条件。
const edictEnabled = ref(true);

const chapters = computed(() => tm("chapters") as chapterType[]);
const currentChapter = computed(() => chapters.value[saveStore.currentChapterId] ?? chapters.value[0]);
const currentChapterText = computed(() => {
  const chapter = currentChapter.value;
  return chapter ? `${chapter.chapterDisplayId} ${chapter.title}` : "";
});
const progressPercent = computed(() => Math.round(saveStore.totalProgress * 100));
const progressStyle = computed(() => ({ width: `${progressPercent.value}%` }));
const handleStyle = computed(() => ({ left: `${progressPercent.value}%` }));

onMounted(async () => {
  await mediaStore.setBGMAudioAsync("main_bgm", 20);
});

async function navigateTo(path: string) {
  await mediaStore.setEffectAudioAsync("音效3");
  await router.push(path);
}

async function openExitDialog() {
  await mediaStore.setEffectAudioAsync("音效1");
  isExitDialogClosing.value = false;
  exitDialogOpen.value = true;
}

function closeExitDialog() {
  if (isExitDialogClosing.value) return;
  isExitDialogClosing.value = true;
  window.setTimeout(() => {
    exitDialogOpen.value = false;
    isExitDialogClosing.value = false;
  }, 140);
}

async function returnToSplash() {
  router.back();
}
</script>

<template>
  <div class="container">
    <video class="background-video" :src="mainVideoUrl" autoplay muted loop playsinline></video>
    <div class="menu-shade"></div>

    <section class="top-actions top-actions--left" aria-label="系统功能">
      <ThemeButton
        backgroundImage="/common/images/main/Main_Btn1_Bg1.png"
        foregroundImage="/common/images/main/Main_BtnIcon_Exit.png"
        text="退出"
        :foregroundWidthPercent="40"
        :fontSize="22"
        @click="openExitDialog" />
      <ThemeButton
        backgroundImage="/common/images/main/Main_Btn1_Bg1.png"
        foregroundImage="/common/images/main/Main_BtnIcon_Setting.png"
        text="设置"
        :foregroundWidthPercent="60"
        :fontSize="22"
        @click="navigateTo('/settings')" />
    </section>

    <section class="top-actions top-actions--right" aria-label="扩展功能">
      <button class="top-action--personality" type="button">
        <img src="/common/images/main/Main_Btn_Personality.png" />
        <span>人格报告测试</span>
      </button>
      <ThemeButton
        backgroundImage="/common/images/main/Main_Btn2_Bg1.png"
        foregroundImage="/common/images/main/Main_BtnIcon_Achievement.png"
        text="成就"
        :foregroundWidthPercent="55"
        @click="navigateTo('/achievements')" />
      <ThemeButton
        backgroundImage="/common/images/main/Main_Btn2_Bg1.png"
        foregroundImage="/common/images/main/Main_BtnIcon_Mail.png"
        text="公告"
        :foregroundWidthPercent="45"
        @click="navigateTo('/announcements')" />
    </section>

    <section class="left-features" aria-label="探索功能">
      <button class="feature-button feature-button--storyline" type="button" @click="navigateTo('/storylines')">
        <img class="feature-button__bg" src="/common/images/main/Main_Btn_Storyline.png" alt="" />
        <span class="feature-button__label feature-button__label--storyline">
          <span class="feature-button__texture" aria-hidden="true">
            <span class="feature-button__texture-lead">故</span><span>事线</span>
          </span>
          <b>故</b>事线
        </span>
        <img class="feature-button__icon" src="/common/images/main/Main_Btn_Storyline_Icon.png" alt="" />
      </button>
      <button class="feature-button feature-button--character" type="button" @click="navigateTo('/portfolios')">
        <img class="feature-button__bg" src="/common/images/main/Main_Btn_Character.png" alt="" />
        <span class="feature-button__label feature-button__label--character">
          <span class="feature-button__texture" aria-hidden="true">
            <span class="feature-button__texture-lead">风</span><span>华人物</span>
          </span>
          <b>风</b>华人物
        </span>
        <img class="feature-button__icon" src="/common/images/main/Main_Btn_Character_Icon.png" alt="" />
      </button>
    </section>

    <button class="chapter-button" type="button" @click="navigateTo('/chapters')">
      <img src="/common/images/main/Main_Btn_Chapter.png" alt="" />
      <span>全部<br />章节</span>
    </button>

    <section class="progress" aria-label="探索进度">
      <div class="progress__title">
        探索进度 <em>{{ progressPercent }}%</em>
      </div>
      <div class="progress__track-row">
        <img class="progress__ornament" src="/common/images/main/Main_Slider_Bg1.png" alt="" />
        <div class="progress__track">
          <img class="progress__background" src="/common/images/main/Main_Slider_Bg.png" alt="" />
          <div class="progress__fill-clip" :style="progressStyle">
            <img src="/common/images/main/Main_Slider_Fill.png" alt="" />
          </div>
          <img class="progress__handle" src="/common/images/main/Main_Handle.png" :style="handleStyle" alt="" />
        </div>
      </div>
    </section>

    <button class="edict-button" :class="{ 'is-locked': !edictEnabled }" type="button" :disabled="!edictEnabled">
      <img
        class="edict-button__background"
        :src="`/common/images/main/${edictEnabled ? 'Main_Btn_Edict.png' : 'Main_Btn_EdictLock.png'}`"
        alt="" />
      <img
        class="edict-button__icon"
        :src="`/common/images/main/${edictEnabled ? 'Main_Btn_Edict_Icon.png' : 'Main_Btn_Edict_IconLock.png'}`"
        alt="" />
      <span>上朝</span>
    </button>

    <section class="continue-area">
      <p>{{ currentChapterText }}</p>
      <button class="continue-button" type="button" @click="navigateTo('/player')">
        <img src="/common/images/main/Main_Btn_Continue.png" alt="" />
        <span
          class="continue-button__texture"
          :data-text="saveStore.isNewGame ? '开始故事' : '继续'"
          aria-hidden="true"></span>
        <span class="continue-button__text">{{ saveStore.isNewGame ? "开始故事" : "继续" }}</span>
      </button>
    </section>

    <ExitDialog
      :exitDialogOpen="exitDialogOpen"
      :isExitDialogClosing="isExitDialogClosing"
      exitConfirmMessage="是否要返回登录界面？"
      @closeExitDialog="closeExitDialog"
      @confirmExit="returnToSplash" />
  </div>
</template>

<style scoped>
.container {
  color: #eec586;
  font-family: inherit;
  background: #090605;
}

.background-video,
.menu-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.background-video {
  z-index: -2;
  object-fit: cover;
  object-position: center;
}
.menu-shade {
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(90deg, rgb(0 0 0 / 0.42), transparent 38%, rgb(0 0 0 / 0.1) 70%, rgb(0 0 0 / 0.32));
}

button {
  color: inherit;
  font: inherit;
}

button:focus-visible {
  outline: 2px solid #eec586;
  outline-offset: 3px;
}

.top-actions {
  position: absolute;
  top: 36px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.top-actions--left {
  left: 72px;
}

.top-actions--right {
  right: 72px;
}

.top-action--personality {
  position: relative;
  display: flex;
  align-items: center;
  border: none;
  background: none;
  width: 75px;
  font-size: 20px;
  margin: -5px 20px 0 0;
}

.top-action--personality img {
  width: 100%;
}

.top-action--personality span {
  position: absolute;
  bottom: -25%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  white-space: nowrap;
  color: #ffd49f;
}

.left-features {
  position: absolute;
  left: 50px;
  bottom: 30%;
  display: grid;
}

.feature-button {
  position: relative;
  width: 512px;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
}

.feature-button--storyline {
  height: 126px;
}

.feature-button--character {
  height: 126px;
}

.feature-button__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: auto;
  aspect-ratio: 512 / 126;
}

.feature-button--character .feature-button__bg {
  aspect-ratio: 512 / 108;
}

.feature-button__label {
  position: absolute;
  z-index: 1;
  font-size: 58px;
  letter-spacing: -8px;
  white-space: nowrap;
  color: transparent;
  -webkit-text-fill-color: transparent;
  width: max-content;
  min-width: max-content;
  overflow: visible;
}

.feature-button__texture {
  position: absolute;
  top: 0;
  left: 0;
  right: auto;
  width: max-content;
  min-width: max-content;
  overflow: visible;
  z-index: 1;
  display: flex;
  align-items: baseline;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.feature-button__texture > span {
  display: inline-block;
  color: transparent;
  -webkit-text-fill-color: transparent;
  background: url("/common/images/main/MainView_Text_Hover.png") center / 100% 100% no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
}

.feature-button__texture > span:last-child {
  padding-right: 10px;
}

.feature-button__texture-lead {
  font-size: 75px;
  padding-right: 12px;
  margin-right: -12px;
}

.feature-button__label--storyline {
  top: -10%;
  left: 66px;
}

.feature-button__label--character {
  top: -15%;
  left: 85px;
}

.feature-button__label b {
  font-size: 75px;
  font-weight: inherit;
}

.feature-button__icon {
  position: absolute;
  z-index: 1;
  right: 80px;
  object-fit: contain;
}

.feature-button--storyline .feature-button__icon {
  top: 35px;
  width: 115px;
}

.feature-button--character .feature-button__icon {
  top: 0;
  width: 105px;
}

.chapter-button {
  position: absolute;
  bottom: 42px;
  left: 38px;
  width: 128px;
  aspect-ratio: 1 / 1;
  padding: 0;
  border: 0;
  background: none;
  font-size: 26px;
  line-height: 1.13;
}

.chapter-button img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
}

.chapter-button span {
  position: relative;
  z-index: 1;
}

.progress {
  position: absolute;
  bottom: 35px;
  left: 145px;
  width: 576px;
}

.progress__title {
  position: relative;
  z-index: 1;
  margin: 0 0 -4px 32px;
  font-size: 20px;
  text-shadow: 0 1px 4px #160a03;
}

.progress__title em {
  color: #d45b3f;
  font-style: normal;
  font-family: KuangShanKaiShu;
}

.progress__track-row {
  display: flex;
  align-items: center;
}

.progress__ornament {
  width: 48px;
  aspect-ratio: 64 / 61;
  object-fit: contain;
}

.progress__track {
  position: relative;
  width: 512px;
  aspect-ratio: 512 / 7;
  margin: -18px 0 0 -16px;
}

.progress__background {
  position: absolute;
  top: 0;
  left: 0;
  aspect-ratio: 512 / 7;
}

.progress__fill-clip {
  position: absolute;
  top: 1px;
  left: 0;
  width: 0;
  height: 5px;
  overflow: hidden;
}

.progress__fill-clip img {
  display: block;
  width: 512px;
  height: auto;
  aspect-ratio: 512 / 5;
}

.progress__handle {
  position: absolute;
  top: 50%;
  width: 20px;
  aspect-ratio: 1 / 1;
  transform: translate(-50%, -50%);
}

.edict-button {
  position: absolute;
  top: 280px;
  right: 30px;
  width: 230px;
  aspect-ratio: 256 / 88;
  padding: 0;
  border: 0;
  background: none;
  font-size: 36px;
}

.edict-button__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.edict-button__icon {
  position: absolute;
  top: 13%;
  left: 14%;
  width: 34%;
  height: auto;
  aspect-ratio: 128 / 89;
  object-fit: contain;
}

.edict-button span {
  position: absolute;
  z-index: 1;
  top: 50%;
  right: 14%;
  transform: translateY(-50%);
}

.edict-button.is-locked {
  color: #816e53;
  cursor: not-allowed;
}

.continue-area {
  position: absolute;
  right: 0px;
  bottom: 30px;
  text-align: center;
}

.continue-area p {
  position: relative;
  z-index: 1;
  font-size: 30px;
  white-space: nowrap;
  text-shadow: 0 2px 7px #2e1207;
}

.continue-button {
  position: relative;
  display: block;
  width: 450px;
  aspect-ratio: 512 / 120;
  padding: 0;
  border: 0;
  background: none;
  font-size: 55px;
}

.continue-button img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
}

.continue-button span {
  position: relative;
  z-index: 1;
}

.continue-button__text {
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.continue-button__texture {
  position: absolute !important;
  inset: 0;
  z-index: 2 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  -webkit-text-fill-color: transparent;
  background: url("/common/images/main/MainView_Text_Hover.png") center / 100% 100% no-repeat;
  mix-blend-mode: normal;
  -webkit-background-clip: text;
  background-clip: text;
  transform: none !important;
}

.continue-button__texture::before {
  content: attr(data-text);
}

@media (max-height: 500px) {
  .top-actions {
    top: 14px;
    gap: 0px;
  }
  .top-actions--left {
    left: 22px;
  }
  .top-actions--right {
    right: 22px;
  }
  .top-action--personality {
    scale: 0.8;
  }

  .left-features {
    left: 24px;
  }
  .feature-button {
    transform-origin: left;
    transform: scale(0.5);
  }
  .feature-button--storyline {
    height: 70px;
  }
  .feature-button--character {
    height: 70px;
    margin-bottom: 0;
  }
  .chapter-button {
    bottom: 18px;
    left: 16px;
    width: 90px;
    font-size: 19px;
  }
  .progress {
    bottom: 20px;
    left: 95px;
    width: 288px;
    transform-origin: left bottom;
    transform: scale(0.75);
  }
  .edict-button {
    top: 128px;
    right: 36px;
    width: 128px;
    font-size: 22px;
  }
  .continue-area {
    right: 20px;
    bottom: 18px;
    width: 256px;
  }
  .continue-area p {
    margin-bottom: 6px;
    font-size: 16px;
  }
  .continue-button {
    width: 256px;
    aspect-ratio: 256 / 60;
    font-size: 35px;
  }
}
</style>
