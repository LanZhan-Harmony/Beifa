<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tip: string;
    upsidedown?: boolean;
  }>(),
  {
    upsidedown: false,
  },
);
</script>

<template>
  <div class="tip" :class="{ 'tip--upsidedown': props.upsidedown }" role="status">
    <span class="tip__text">{{ props.tip }}</span>
  </div>
</template>

<style scoped>
.tip {
  position: relative;
  box-sizing: border-box;
  width: fit-content;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 16px;
  line-height: 1.2;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  filter: drop-shadow(0 4px 6px #1c090780);
  border: 2px solid transparent;
  border-image-source: url("/common/images/personality/Share_Btn_TipsBg.png");
  /* border-image-slice 顺序为 top right bottom left。 */
  border-image-slice: 28 19 19 62 fill;
  border-image-width: 28px 19px 19px 62px;
  border-image-repeat: stretch;
}

.tip__text {
  display: block;
}

/* 翻转背景和气泡尖角，但把文字翻回来保持正常阅读方向。 */
.tip--upsidedown {
  transform: scaleY(-1);
}

.tip--upsidedown .tip__text {
  transform: scaleY(-1);
}

@media (max-height: 500px) {
  .tip {
    padding: 6px 8px;
    border-image-width: 14px 9.5px 9.5px 31px;
  }
}
</style>

