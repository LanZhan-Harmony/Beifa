<script setup lang="ts">
import { ref } from "vue";
import type { EdictRecord } from "../../types/edictType";
import { categoryMeta } from "../../utils/edictMeta";
import ImageTextButton from "../ImageTextButton.vue";
import PageNavButton from "../PageNavButton.vue";

withDefaults(
  defineProps<{
    edicts: EdictRecord[];
    inputLocked?: boolean;
    generating?: boolean;
    notice?: string;
  }>(),
  {
    inputLocked: false,
    generating: false,
    notice: "",
  },
);

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "refresh"): void;
  (e: "archive"): void;
}>();

const refreshKey = ref(0);

function handleRefresh() {
  refreshKey.value++;
  emit("refresh");
}
</script>

<template>
  <section class="picker edict-screen">
    <PageNavButton text="批阅奏折" />
    <div v-if="edicts.length" class="cards" :key="refreshKey" :class="{ refreshing: refreshKey > 0 }">
      <button
        v-for="(edict, index) in edicts"
        :key="`${edict.id}`"
        class="card"
        :style="{ '--delay': `${index * 70}ms` }"
        :disabled="inputLocked"
        :aria-label="`查看奏折：${edict.title}`"
        @click="emit('select', edict.id)">
        <img src="/common/images/edict/Edict_Theme_Big01.png" s/>
        <span class="category" :style="{ color: categoryMeta[edict.type].color }">{{
          categoryMeta[edict.type].label
        }}</span>
        <span class="title">{{ edict.title }}</span>
      </button>
    </div>
    <div v-else class="empty">
      <span class="spinner"></span>
      <p>{{ generating ? "正在拟写新奏折……" : "暂无可批阅奏折" }}</p>
    </div>
    <p v-if="notice" class="notice">{{ notice }}</p>
    <aside class="actions">
      <ImageTextButton
        image="/common/images/edict/Common_Btn_Refresh.png"
        text="刷新"
        :width="160"
        scaleTransformOrigin="bottom center"
        @click="handleRefresh" />
      <ImageTextButton
        class="archive"
        image="/common/images/edict/Result_Finally_BtnN_L.png"
        hoverImage="/common/images/edict/Result_Finally_BtnH_L.png"
        text="奏折归档"
        :fontSize="25"
        :width="200"
        :textTopMargin="45"
        scaleTransformOrigin="top center"
        @click="emit('archive')" />
    </aside>
  </section>
</template>

<style scoped>
.picker {
  background: #6d0e08 url("/common/images/edict/Edict_Main_Bg3.png") center/cover no-repeat;
}
.cards {
  position: absolute;
  inset: 18% 10% 0 10%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 18px;
}
.card {
  --delay: 0ms;
  position: relative;
  width: 220px;
  aspect-ratio: 221/1024;
  padding: 0;
  border: 0;
  background: none;
  opacity: 0;
  animation: card-in 0.48s var(--delay) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.card:hover,
.card:focus-visible {
  z-index: 2;
  transform: translateY(-7%);
  filter: brightness(1.25);
  outline: none;
}
.card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.category {
  position: absolute;
  top: 19.5%;
  left: 8%;
  width: 84%;
  font-size: 26px;
  text-align: center;
}
.title {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translateX(-50%);
  color: #f3ce86;
  font-size: 40px;
  writing-mode: vertical-rl;
  letter-spacing: 4px;
}
.actions {
  position: absolute;
  right: 10px;
  bottom: 4%;
  z-index: 8;
  display: grid;
  justify-items: center;
  gap: 8px;
}
.empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  color: #f1ca8c;
  text-align: center;
}
.spinner {
  width: 48px;
  height: 48px;
  margin: auto;
  border: 4px solid #f1ca8c55;
  border-top-color: #f1ca8c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.notice {
  position: absolute;
  right: 3%;
  bottom: 22%;
  max-width: 340px;
  color: #f6c892;
  text-align: right;
  text-shadow: 0 2px 6px #000;
}
.cards.refreshing .card {
  animation: none;
  opacity: 1;
}
.cards.refreshing .category {
  opacity: 0;
  animation: category-in 0.48s var(--delay) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.cards.refreshing .title {
  opacity: 0;
  animation: title-in 0.48s var(--delay) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(160px);
  }
  to {
    opacity: 1;
  }
}
@keyframes category-in {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes title-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-height: 500px) {
  .cards {
    inset: 15% 6% 0 6%;
    gap: 10px;
  }
  .card {
    width: 80px;
  }
  .category {
    font-size: 11px;
  }
  .title {
    font-size: 18px;
    letter-spacing: 1px;
  }
  .actions {
    bottom: 2%;
    gap: 0px;
  }
}
</style>
