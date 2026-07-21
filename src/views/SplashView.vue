<script setup lang="ts">
import { invoke } from "@tauri-apps/api/core";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import ExitDialog from "../components/ExitDialog.vue";
import ThemeButton from "../components/ThemeButton.vue";
import { useMediaStore } from "../stores/media";

const router = useRouter();
const mediaStore = useMediaStore();

// --- 可配置的变量区，方便调整 ---
const layerStyle = computed(() => ({
  "--global-scale": String(globalScale.value),
  "--intro-start-scale": 1.5,
  "--speed-bg6": "600000ms",
  "--speed-bg10": "450000ms",
  "--speed-bg4": "500000ms",
  "--speed-bg1": "550000ms",
  "--ribbon-angle": "2deg",
  "--ribbon-duration": "2600ms",
  "--claw-angle": "1.8deg",
  "--claw-duration": "3200ms",
  "--scale-bg6": 1.3,
  "--scale-bg10": 0.98,
  "--scale-bg4": 0.93,
  "--scale-bg2": 0.83,
  "--scale-bg1": 1.2,
  "--scale-role": 0.8,
  "--scale-logo": 0.9,
  "--scale-long": 1.4,
  "--scale-silk": 1.4,
  "--scale-claw-l": 0.8,
  "--scale-claw-r": 0.6,
  "--scale-yun": 0.8,
  "--scale-line": 1,
  "--scale-exit": 1,
  "--role-offset-y": "260px",
  "--exit-title-y": "356px",
  "--exit-title-gap": "18px",
  "--exit-message-y": "515px",
  "--exit-button-y": "616px",
  "--exit-button-half-gap": "0px",
  "--popup-bg01-scale": 0.5,
  "--popup-bg3-scale": 0.5,
  "--popup-bg1-scale": 0.5,
  "--popup-line-scale": 0.5,
  "--popup-button-scale": 0.5,
}));

const isLeaving = ref(false);
const exitDialogOpen = ref(false);
const isExitDialogClosing = ref(false);

const globalScale = ref(1);
function updateGlobalScale() {
  globalScale.value = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
}

onMounted(async () => {
  updateGlobalScale();
  window.addEventListener("resize", updateGlobalScale);

  try {
    mediaStore.pauseLoopAudio();
    await mediaStore.setBGMAudioAsync("mus_login_loop");
  } catch (error) {
    async function retry() {
      try {
        await mediaStore.resumeBGMAudioAsync();
        cleanup();
      } catch (e) {
        // 播放失败（通常是因为用户还未交互），重试逻辑保持
      }
    }

    function cleanup() {
      document.removeEventListener("resize", updateGlobalScale);
      document.removeEventListener("click", retry);
      document.removeEventListener("keydown", retry);
      document.removeEventListener("touchstart", retry);
    }

    document.addEventListener("click", retry);
    document.addEventListener("keydown", retry);
    document.addEventListener("touchstart", retry);

    // 组件卸载时清理监听器
    onUnmounted(cleanup);
  }
});

async function enterMain() {
  if (isLeaving.value) return;
  isLeaving.value = true;
  await mediaStore.setEffectAudioAsync("ui_login_startgame_click");
  window.setTimeout(() => router.push("/main"), 500);
}

async function exitGame() {
  if ((window as any).__TAURI_INTERNALS__) await invoke("exit_app");
  else window.close();
}

function openExitDialog() {
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
</script>

<template>
  <div class="container" :class="{ leaving: isLeaving }" :style="layerStyle">
    <div class="scene">
      <img class="start-bg" src="/common/images/splash/Start_Bg.png" />
      <img class="center rotate cc bg6" src="/common/images/splash/Start_Bg6.png" />
      <img class="swing silk left" src="/common/images/splash/Launch_Silk_L.png" />
      <img class="swing silk right" src="/common/images/splash/Launch_Silk_R.png" />
      <img class="swing long left" src="/common/images/splash/Launch_Long_L.png" />
      <img class="swing long right" src="/common/images/splash/Launch_Long_R.png" />
      <img class="corner bottom-left" src="/common/images/splash/Start_Bg2_L.png" />
      <img class="corner bottom-right" src="/common/images/splash/Start_Bg2_R.png" />
      <img class="swing claw claw-left" src="/common/images/splash/Launch_Claw_L.png" />
      <img class="swing claw claw-right" src="/common/images/splash/Launch_Claw_R.png" />
      <img class="center rotate cc bg10" src="/common/images/splash/Start_Bg10.png" />
      <img class="center rotate cw bg4" src="/common/images/splash/Start_Bg4.png" />
      <img class="center bg2" src="/common/images/splash/Start_Bg2.png" />
      <img class="center rotate cw bg1" src="/common/images/splash/Start_Bg1.png" />
      <img class="center role" src="/common/images/splash/Start_Role_Bg.png" />
      <img class="yun yun-left" src="/common/images/splash/Launch_Yun_L.png" />
      <img class="yun yun-right" src="/common/images/splash/Launch_Yun_R.png" />
      <img class="bg12" src="/common/images/splash/Start_Bg12.png" />

      <div class="enter-area">
        <img class="logo" src="/common/images/splash/Logo.png" />
        <button class="enter-button" type="button" @click="enterMain">
          <img src="/common/images/splash/Legend_Page_Line_L.png" /><span>{{ $t("splash.clickToEnter") }}</span
          ><img src="/common/images/splash/Legend_Page_Line_R.png" />
        </button>
      </div>
      <ThemeButton
        class="quit"
        backgroundImage="/common/images/splash/Main_Btn1_Bg1.png"
        foregroundImage="/common/images/splash/Main_BtnIcon_Exit.png"
        :text="$t('splash.exit')"
        :foregroundWidthPercent="40"
        :fontSize="22"
        @click="openExitDialog" />
    </div>

    <ExitDialog
      :exitDialogOpen="exitDialogOpen"
      :isExitDialogClosing="isExitDialogClosing"
      :exitConfirmMessage="$t('splash.exitConfirmMessage')"
      @closeExitDialog="closeExitDialog"
      @confirmExit="exitGame" />
  </div>
</template>

<style scoped>
/* 页面容器与场景基准 */
.container,
.scene {
  position: absolute;
  width: 100%;
  height: 100%;
}

.container {
  background: #000;
  transition: opacity 500ms ease-in-out;
}

.container.leaving {
  opacity: 0;
  pointer-events: none;
}

.scene {
  animation: intro 1200ms cubic-bezier(0.215, 0.61, 0.355, 1) both;
}

.scene img,
.start-bg {
  position: absolute;
  display: block;
  pointer-events: none;
}

.start-bg,
.bg12 {
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(var(--element-scale));
  transform-origin: center;
}

.rotate {
  animation: spin var(--spin-duration) linear infinite;
}

.cc {
  animation-direction: reverse;
}

/* 场景层：按 z-index 从低到高排列 */
.bg6 {
  --element-scale: calc(var(--global-scale) * var(--scale-bg6));
  --spin-duration: var(--speed-bg6);
  z-index: 1;
}

.swing {
  --element-scale: var(--global-scale);
  z-index: 2;
  transform: scale(var(--element-scale));
  animation: swing var(--ribbon-duration) ease-in-out infinite alternate;
}

.silk {
  bottom: calc(330px * var(--global-scale));
}

.silk.left {
  right: calc(50% + 340px * var(--global-scale));
  --element-scale: calc(var(--global-scale) * var(--scale-silk));
  transform-origin: right bottom;
}

.silk.right {
  left: calc(50% + 270px * var(--global-scale));
  --element-scale: calc(var(--global-scale) * var(--scale-silk));
  transform-origin: left bottom;
  animation-direction: alternate-reverse;
}

.long {
  bottom: calc(190px * var(--global-scale));
  --element-scale: calc(var(--global-scale) * var(--scale-long));
  z-index: 3;
  animation-duration: calc(var(--ribbon-duration) + 420ms);
}

.long.left {
  right: calc(50% + 200px * var(--global-scale));
  transform-origin: right bottom;
}

.long.right {
  left: calc(50% + 300px * var(--global-scale));
  bottom: calc(170px * var(--global-scale));
  transform-origin: left bottom;
  animation-direction: alternate-reverse;
}

.corner {
  bottom: 0;
  z-index: 4;
  transform: scale(calc(var(--global-scale) * var(--scale-bg2)));
}

.bottom-left {
  left: 0;
  transform-origin: left bottom;
}

.bottom-right {
  right: 0;
  transform-origin: right bottom;
}

.claw {
  --element-scale: var(--global-scale);
  bottom: calc(-100px * var(--global-scale));
  z-index: 5;
  animation-name: claw-swing;
  animation-duration: var(--claw-duration);
}

.claw-left {
  left: calc(-200px * var(--global-scale));
  --element-scale: calc(var(--global-scale) * var(--scale-claw-l));
  transform-origin: left bottom;
}

.claw-right {
  right: calc(-230px * var(--global-scale));
  bottom: calc(-130px * var(--global-scale));
  --element-scale: calc(var(--global-scale) * var(--scale-claw-r));
  transform-origin: right bottom;
  animation-direction: alternate-reverse;
}

.bg10 {
  --element-scale: calc(var(--global-scale) * var(--scale-bg10));
  --spin-duration: var(--speed-bg10);
  z-index: 6;
}

.bg4 {
  --element-scale: calc(var(--global-scale) * var(--scale-bg4));
  --spin-duration: var(--speed-bg4);
  z-index: 7;
}

.bg2 {
  --element-scale: calc(var(--global-scale) * var(--scale-bg2));
  z-index: 8;
}

.bg1 {
  --element-scale: calc(var(--global-scale) * var(--scale-bg1));
  --spin-duration: var(--speed-bg1);
  z-index: 9;
}

.role {
  top: calc(50% + var(--role-offset-y) * var(--global-scale));
  --element-scale: calc(var(--global-scale) * var(--scale-role));
  z-index: 10;
}

.yun {
  bottom: calc(-10px * var(--global-scale));
  z-index: 11;
  transform: scale(calc(var(--global-scale) * var(--scale-yun)));
}

.yun-left {
  right: calc(50% + 70px * var(--global-scale));
  transform-origin: right bottom;
}

.yun-right {
  left: calc(50% + 160px * var(--global-scale));
  transform-origin: left bottom;
}

.bg12 {
  z-index: 12;
}

/* 场景前景控件 */
.enter-area {
  position: absolute;
  bottom: calc(100px * var(--global-scale));
  left: 50%;
  z-index: 13;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(12px * var(--global-scale));
  transform: translateX(-50%);
}

.enter-area > .logo,
.enter-button > img {
  position: static !important;
}

.logo {
  width: calc(752px * var(--global-scale) * var(--scale-logo));
  height: auto;
}

.enter-button,
.popup-actions button {
  border: 0;
  padding: 0;
  background: none;
  color: #f6d68e;
  font: inherit;
  cursor: pointer;
}

.enter-button {
  display: flex;
  align-items: center;
  font-size: calc(50px * var(--global-scale));
}

.enter-button img {
  transform: scale(calc(var(--global-scale) * var(--scale-line)));
  transform-origin: center;
}

.quit {
  position: absolute;
  top: 40px;
  right: 40px;
  font-family: inherit;
  z-index: 14;
}

/* 动画 */
@keyframes intro {
  from {
    scale: var(--intro-start-scale);
  }
  to {
    scale: 1;
  }
}
@keyframes spin {
  from {
    transform: translate(-50%, -50%) scale(var(--element-scale)) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) scale(var(--element-scale)) rotate(360deg);
  }
}
@keyframes swing {
  from {
    rotate: calc(-1 * var(--ribbon-angle));
  }
  to {
    rotate: var(--ribbon-angle);
  }
}
@keyframes claw-swing {
  from {
    rotate: calc(-1 * var(--claw-angle));
  }
  to {
    rotate: var(--claw-angle);
  }
}

@media (max-height: 500px) {
  .quit {
    top: 20px;
    right: 20px;
  }
}
</style>

