<script setup lang="ts">
import { invoke } from "@tauri-apps/api/core";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
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
  window.setTimeout(() => router.replace({ name: "main" }), 1000);
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

function image(name: string) {
  return `/common/images/${name}`;
}
</script>

<template>
  <main class="splash" :class="{ leaving: isLeaving }" :style="layerStyle">
    <div class="scene">
      <img class="start-bg" :src="image('start_bg.png')" />
      <img class="center rotate cc bg6" :src="image('start_bg6.png')" />
      <img class="swing silk left" :src="image('launch_silk_l.png')" />
      <img class="swing silk right" :src="image('launch_silk_r.png')" />
      <img class="swing long left" :src="image('launch_long_l.png')" />
      <img class="swing long right" :src="image('launch_long_r.png')" />
      <img class="corner bottom-left" :src="image('start_bg2_l.png')" />
      <img class="corner bottom-right" :src="image('start_bg2_r.png')" />
      <img class="swing claw claw-left" :src="image('launch_claw_l.png')" />
      <img class="swing claw claw-right" :src="image('launch_claw_r.png')" />
      <img class="center rotate cc bg10" :src="image('start_bg10.png')" />
      <img class="center rotate cw bg4" :src="image('start_bg4.png')" />
      <img class="center bg2" :src="image('start_bg2.png')" />
      <img class="center rotate cw bg1" :src="image('start_bg1.png')" />
      <img class="center role" :src="image('start_role_bg.png')" />
      <img class="yun yun-left" :src="image('launch_yun_l.png')" />
      <img class="yun yun-right" :src="image('launch_yun_r.png')" />
      <img class="bg12" :src="image('start_bg12.png')" />

      <div class="enter-area">
        <img class="logo" :src="image('logo.png')" />
        <button class="enter-button" type="button" @click="enterMain">
          <img :src="image('legend_page_line_l.png')" /><span>{{ $t("splash.clickToEnter") }}</span
          ><img :src="image('legend_page_line_r.png')" />
        </button>
      </div>
      <button class="quit" type="button" @click="openExitDialog">
        <img :src="image('common_btn_quit.png')" /><span>{{ $t("splash.exit") }}</span>
      </button>
    </div>

    <div
      v-if="exitDialogOpen"
      class="exit-mask"
      :class="{ closing: isExitDialogClosing }"
      @click.self="closeExitDialog">
      <div class="exit-panel">
        <img class="popup-bg bg3" :src="image('common_popup01_bg3.png')" />
        <img class="popup-bg bg01" :src="image('common_popup01_bg01.png')" />
        <img class="popup-bg popup-bg1" :src="image('common_popup01_bg1.png')" />
        <div class="popup-title">
          <img :src="image('common_popup01_titleline_l.png')" /><strong>{{ $t("splash.exitConfirm") }}</strong
          ><img :src="image('common_popup01_titleline_r.png')" />
        </div>
        <p>{{ $t("splash.exitConfirmMessage") }}</p>
        <button class="popup-action popup-cancel" type="button" @click="closeExitDialog">
          <img :src="image('common_popup01_btnsmall_02.png')" /><span>{{ $t("splash.exitConfirmNo") }}</span>
        </button>
        <button class="popup-action popup-confirm" type="button" @click="exitGame">
          <img :src="image('common_popup01_btnsmall_01.png')" /><span>{{ $t("splash.exitConfirmYes") }}</span>
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 页面容器与场景基准 */
.splash,
.scene {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.splash {
  background: #000;
  transition: opacity 1200ms ease-in-out;
}

.splash.leaving {
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
.enter-button > img,
.quit > img {
  position: static !important;
}

.logo {
  width: calc(752px * var(--global-scale) * var(--scale-logo));
  height: auto;
}

.enter-button,
.quit,
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
  font-size: 40px;
}

.enter-button img {
  transform: scale(calc(var(--global-scale) * var(--scale-line)));
  transform-origin: center;
}

.quit {
  position: absolute;
  top: 40px;
  right: 40px;
  z-index: 14;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 26px;
  transform: scale(calc(var(--global-scale) * var(--scale-exit)));
  transform-origin: right top;
}

/* 退出确认弹窗 */
.exit-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgb(0 0 0/0.62);
  animation: modal-in 180ms cubic-bezier(0.215, 0.61, 0.355, 1);
}

.exit-mask.closing {
  animation: modal-out 140ms ease-in both;
}

.exit-panel {
  position: relative;
  width: calc(1920px * var(--global-scale));
  height: calc(1080px * var(--global-scale));
  animation: panel-in 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.closing .exit-panel {
  animation: panel-out 140ms ease-in both;
}

.popup-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(calc(var(--global-scale) * var(--popup-bg01-scale)));
}

.popup-bg.bg3 {
  transform: translate(-50%, -50%) scale(calc(var(--global-scale) * var(--popup-bg3-scale)));
  opacity: 0.5;
}

.popup-bg1 {
  transform: translate(-50%, -50%) scale(calc(var(--global-scale) * var(--popup-bg1-scale)));
}

.popup-title {
  position: absolute;
  top: calc(356px * var(--global-scale));
  left: 50%;
  display: flex;
  align-items: center;
  gap: calc(18px * var(--global-scale));
  color: #aa420e;
  font-size: calc(40px * var(--global-scale));
  transform: translateX(-50%);
}

.popup-title img {
  position: static;
  transform: scale(calc(var(--global-scale) * var(--popup-line-scale)));
}

.exit-panel p {
  position: absolute;
  top: calc(515px * var(--global-scale));
  left: 50%;
  color: #63321c;
  font-size: calc(44px * var(--global-scale));
  transform: translate(-50%, -50%);
}

.popup-action {
  position: absolute;
  top: calc(625px * var(--global-scale));
  width: 628px;
  height: 232px;
  border: 0;
  padding: 0;
  background: none;
  color: #ffd49f;
  font-size: 82px;
  font-family: inherit;
  cursor: pointer;
  transform: scale(calc(var(--global-scale) * var(--popup-button-scale)));
}

.popup-cancel {
  left: 50%;
  transform-origin: right top;
  translate: -100% 0;
}

.popup-confirm {
  left: 50%;
  transform-origin: left top;
}

.popup-action img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.popup-action span {
  position: relative;
  z-index: 1;
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
@keyframes modal-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes modal-out {
  to {
    opacity: 0;
  }
}
@keyframes panel-in {
  from {
    scale: 0.94;
  }
  to {
    scale: 1;
  }
}
@keyframes panel-out {
  to {
    scale: 0.96;
  }
}
</style>

