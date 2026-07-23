<script setup lang="ts">
import type { EdictRecord } from "@/types/edictType";

const props = defineProps<{ edicts: EdictRecord[] }>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>
<template>
  <div class="mask" @click.self="emit('close')">
    <section>
      <h2>奏折归档</h2>
      <button class="close" type="button" @click="emit('close')">×</button>
      <p v-if="!edicts.length">尚无结案奏折</p>
      <ul>
        <li v-for="edict in edicts" :key="edict.id">
          <span>{{ edict.title }}</span
          ><strong>{{ edict.status === "approved" ? "准奏" : "驳回" }}</strong>
        </li>
      </ul>
    </section>
  </div>
</template>
<style scoped>
.mask {
  position: absolute;
  z-index: 200;
  inset: 0;
  display: grid;
  place-items: center;
  background: #050101c9;
}
.mask section {
  position: relative;
  width: min(720px, 70vw);
  max-height: 70vh;
  padding: 45px;
  color: #efc27d;
  background: #651810;
  border: 3px solid #d5a258;
  overflow: auto;
}
.close {
  position: absolute;
  top: 10px;
  right: 15px;
  border: 0;
  color: inherit;
  background: none;
  font-size: 34px;
}
h2 {
  text-align: center;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  justify-content: space-between;
  padding: 14px;
  border-bottom: 1px solid #d5a25855;
}
</style>
