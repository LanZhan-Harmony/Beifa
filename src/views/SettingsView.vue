<script setup lang="ts">
import PageNavButton from "@/components/PageNavButton.vue";
import VolumeSlider from "@/components/setting/VolumeSlider.vue";
import { useMediaStore } from "@/stores/media";
import { useUIStore } from "@/stores/ui";
import { storeToRefs } from "pinia";

const mediaStore = useMediaStore();
const { mainVolume, playerVolume, bgmVolume, effectVolume } = storeToRefs(mediaStore);

const uiStore = useUIStore();
const { locale, fullscreen } = storeToRefs(uiStore);

function handleFullscreenChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  uiStore.applyFullscreen(value === "true");
}
</script>

<template>
  <div class="container">
    <img class="background" src="/common/images/设置背景.webp" />
    <PageNavButton />

    <div class="settings">
      <table>
        <tbody>
          <!-- 主音量 -->
          <tr>
            <td>
              <label class="volume-label">{{ $t("setting.mainVolume") }}</label>
            </td>
            <td>
              <VolumeSlider v-model="mainVolume" />
            </td>
          </tr>

          <!-- 视频音量 -->
          <tr>
            <td>
              <label class="volume-label">{{ $t("setting.videoVolume") }}</label>
            </td>
            <td>
              <VolumeSlider v-model="playerVolume" />
            </td>
          </tr>

          <!-- 背景音乐音量 -->
          <tr>
            <td>
              <label class="volume-label">{{ $t("setting.bgmVolume") }}</label>
            </td>
            <td>
              <VolumeSlider v-model="bgmVolume" />
            </td>
          </tr>

          <!-- 音效音量 -->
          <tr>
            <td>
              <label class="volume-label">{{ $t("setting.effectsVolume") }}</label>
            </td>
            <td>
              <VolumeSlider v-model="effectVolume" />
            </td>
          </tr>

          <!-- 界面语言 -->
          <tr>
            <td>
              <label class="locale">{{ $t("setting.language") }}</label>
            </td>
            <td>
              <select v-model="locale">
                <option value="zh-CN">{{ $t("setting.localeNames.zh-CN") }}</option>
                <option value="zh-HK">{{ $t("setting.localeNames.zh-HK") }}</option>
                <option value="en-US">{{ $t("setting.localeNames.en-US") }}</option>
                <option value="ja-JP">{{ $t("setting.localeNames.ja-JP") }}</option>
                <option value="ko-KR">{{ $t("setting.localeNames.ko-KR") }}</option>
                <option value="ru-RU">{{ $t("setting.localeNames.ru-RU") }}</option>
              </select>
            </td>
          </tr>

          <!-- 全屏模式 -->
          <tr>
            <td>
              <label class="fullscreen-label">{{ $t("setting.fullscreen") }}</label>
            </td>
            <td>
              <select :value="fullscreen" @change="handleFullscreenChange">
                <option :value="true">{{ $t("setting.fullscreenOn") }}</option>
                <option :value="false">{{ $t("setting.fullscreenOff") }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}
.settings {
  width: 60%;
  margin: 5% auto 0;
}
table {
  width: 100%;
  border-collapse: separate;
}
td:first-child {
  width: 25%;
  font-size: 30px;
  white-space: nowrap;
}
td:last-child {
  width: 75%;
}
select {
  display: block;
  width: 99%;
  margin: 0 auto;
  padding: 6px 20px 6px 12px;
  background-color: rgba(20, 20, 20, 0.8);
  border: 1px solid var(--color-text);
  border-radius: 8px;
  color: #d1c4b9;
  font-size: 20px;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23918375' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  transition: all 0.2s;
}
select:focus {
  outline: none;
  border-color: #ffc98e;
}
select option {
  background-color: #2a221b;
  color: #d1c4b9;
}

@media (max-height: 500px) {
  .settings {
    width: 90%;
    margin: 6% auto 0;
  }
  td:first-child {
    font-size: 20px;
  }
  select {
    font-size: 16px;
    padding: 4px 18px 4px 12px;
  }
}
</style>
