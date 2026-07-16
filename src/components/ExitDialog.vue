<script setup lang="ts">
const props = defineProps<{
  exitDialogOpen: boolean;
  isExitDialogClosing: boolean;
  exitConfirmMessage: string;
}>();

const emit = defineEmits<{
  (e: "closeExitDialog"): void;
  (e: "confirmExit"): void;
}>();
</script>

<template>
  <div
    v-if="exitDialogOpen"
    class="exit-mask"
    :class="{ closing: isExitDialogClosing }"
    @click.self="emit('closeExitDialog')">
    <div class="exit-panel">
      <img class="popup-bg bg3" src="/common/images/dialog/common_popup01_bg3.png" />
      <img class="popup-bg bg01" src="/common/images/dialog/common_popup01_bg01.png" />
      <img class="popup-bg popup-bg1" src="/common/images/dialog/common_popup01_bg1.png" />
      <div class="popup-title">
        <img src="/common/images/dialog/common_popup01_titleline_l.png" /><strong>{{ $t("dialog.exitConfirm") }}</strong
        ><img src="/common/images/dialog/common_popup01_titleline_r.png" />
      </div>
      <p>{{ exitConfirmMessage }}</p>
      <button class="popup-action popup-cancel" type="button" @click="emit('closeExitDialog')">
        <img src="/common/images/dialog/common_popup01_btnsmall_02.png" /><span>{{ $t("dialog.confirmNo") }}</span>
      </button>
      <button class="popup-action popup-confirm" type="button" @click="emit('confirmExit')">
        <img src="/common/images/dialog/common_popup01_btnsmall_01.png" /><span>{{ $t("dialog.confirmYes") }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
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
