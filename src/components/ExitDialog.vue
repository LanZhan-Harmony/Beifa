<script setup lang="ts">
import { watch } from "vue";
import { useMediaStore } from "../stores/media";

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
      <img class="popup-bg bg3" src="/common/images/dialog/Common_Popup01_Bg3.png" />
      <img class="popup-bg bg01" src="/common/images/dialog/Common_Popup01_Bg01.png" />
      <img class="popup-bg bg1" src="/common/images/dialog/Common_Popup01_Bg1.png" />
      <div class="popup-title">
        <img src="/common/images/dialog/Common_Popup01_TitleLine_L.png" /><span>{{ $t("dialog.exitConfirm") }}</span>
        <img src="/common/images/dialog/Common_Popup01_TitleLine_R.png" />
      </div>
      <p>{{ exitConfirmMessage }}</p>
      <button class="popup-action popup-cancel" type="button" @click="emit('closeExitDialog')">
        <img src="/common/images/dialog/Common_Popup01_BtnSmall_02.png" /><span>{{ $t("dialog.confirmNo") }}</span>
      </button>
      <button class="popup-action popup-confirm" type="button" @click="emit('confirmExit')">
        <img src="/common/images/dialog/Common_Popup01_BtnSmall_01.png" /><span>{{ $t("dialog.confirmYes") }}</span>
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
  width: 700px;
  aspect-ratio: 1648/900;
  animation: panel-in 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.closing .exit-panel {
  animation: panel-out 140ms ease-in both;
}

.popup-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.bg3 {
  width: 615px;
  opacity: 0.7;
}

.bg1 {
  width: 598px;
}

.bg01 {
  width: 700px;
}

.popup-title {
  position: absolute;
  top: 10%;
  left: 50%;
  display: flex;
  transform: translateX(-50%);
  align-items: center;
  gap: 18px;
  color: #aa420e;
  font-size: 30px;
  font-weight: 500;
}

.popup-title img {
  position: static;
  height: 20px;
}

.exit-panel p {
  position: absolute;
  top: 45%;
  left: 50%;
  color: #63321c;
  font-size: 35px;
  transform: translate(-50%, -50%);
}

.popup-action {
  position: absolute;
  top: 67%;
  width: 270px;
  aspect-ratio: 628/232;
  border: 0;
  padding: 0;
  background: none;
  color: #ffd49f;
  font-size: 35px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
