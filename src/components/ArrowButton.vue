<script setup lang="ts">
const props = defineProps<{
  text: string;
  direction: "left" | "right";
  type?: "new" | "legacy";
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <button :class="['btn', { right: direction === 'right' }]" @click="$emit('click')">
    <div :class="['arrow', type || 'new']"></div>
    <span :class="type || 'new'">{{ text }}</span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
}

/* ========== Arrow (共用基础) ========== */
.arrow {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: background-image 0.3s;
}

/* ========== 新风格 ========== */
.arrow.new {
  height: 50px;
  aspect-ratio: 186/76;
  background-image: url("/common/images/Common_Back.png");
}
.btn:hover .arrow.new,
.btn:focus-visible .arrow.new {
  background-image: url("/common/images/Common_Back_Glow.png");
}

span.new {
  font-size: 40px;
  line-height: 1;
  color: #ffe38b;
}

/* ========== 旧风格 ========== */
.arrow.legacy {
  width: 26px;
  height: 26px;
  background-image: url("/common/images/箭头按钮.webp");
}
.btn:hover .arrow.legacy,
.btn:focus-visible .arrow.legacy {
  background-image: url("/common/images/箭头按钮高亮.webp");
}

span.legacy {
  font-size: 26px;
  color: #918375;
  transition: color 0.3s;
}

.btn:hover span.legacy,
.btn:focus-visible span.legacy {
  color: #fff;
}

/* ========== 方向 ========== */
.right {
  flex-direction: row-reverse;
}
.right .arrow {
  rotate: 180deg;
}

/* ========== 小屏适配 ========== */
@media (max-height: 500px) {
  .btn {
    gap: 6px;
  }

  span.new {
    font-size: 25px;
  }
  span.legacy {
    font-size: 18px;
  }

  .arrow.new {
    height: 30px;
  }
  .arrow.legacy {
    width: 20px;
    height: 20px;
  }
}
</style>
