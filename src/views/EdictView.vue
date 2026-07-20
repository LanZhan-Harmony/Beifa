<script setup lang="ts">
import type { CharacterBrief } from "@/agents";
import {
  edictRepository,
  generateEdicts,
  MIN_PENDING_EDICTS,
  prepareDebate,
  readableAiError,
  TARGET_PENDING_EDICTS,
} from "@/agents";
import DebateView from "@/components/edict/DebateView.vue";
import DeepThoughtPopup from "@/components/edict/DeepThoughtPopup.vue";
import EdictDemand from "@/components/edict/EdictDemand.vue";
import EdictDetail from "@/components/edict/EdictDetail.vue";
import EdictPicker from "@/components/edict/EdictPicker.vue";
import EdictResultPopup from "@/components/edict/EdictResultPopup.vue";
import HistoryEdicts from "@/components/edict/HistoryEdicts.vue";
import seedData from "@/langs/edicts/zh-CN.json";
import { useMediaStore } from "@/stores/media";
import type { EdictDecision, EdictRecord } from "@/types/edictType";
import { speakerMeta } from "@/utils/edictMeta";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

type Phase = "picker" | "demand" | "preparingDebate" | "debate" | "review" | "deepThought" | "detail" | "result";
const router = useRouter();
const media = useMediaStore();
const phase = ref<Phase>("picker");
const records = ref<EdictRecord[]>([]);
const visibleIds = ref<string[]>([]);
const selectedId = ref<string | null>(null);
const decision = ref<EdictDecision | null>(null);
const replaying = ref(false);
const inputLocked = ref(false);
const generating = ref(false);
const notice = ref("");
const aiError = ref("");
const historyOpen = ref(false);
let controller: AbortController | null = null;
let stampTimer: number | undefined;
let replenishPromise: Promise<void> | null = null;
const selected = computed(() => records.value.find((item) => item.id === selectedId.value) ?? null);
const visible = computed(
  () => visibleIds.value.map((id) => records.value.find((item) => item.id === id)).filter(Boolean) as EdictRecord[],
);
const archived = computed(() => records.value.filter((item) => item.status !== "pending"));
const currentOutcome = computed(() =>
  decision.value && selected.value ? selected.value.outcomes[decision.value] : undefined,
);
const phaseTransitionName = computed(() => (phase.value === "picker" || phase.value === "demand" ? "" : "phase"));
const characters: CharacterBrief[] = Object.entries(speakerMeta).map(([id, meta]) => ({
  id: id as keyof typeof speakerMeta,
  ...meta,
}));

function syncRecords() {
  records.value = edictRepository.all();
}
function chooseVisible() {
  visibleIds.value = records.value
    .filter((e) => e.status === "pending")
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((e) => e.id);
}
async function replenish() {
  if (replenishPromise) return replenishPromise;
  const pending = records.value.filter((e) => e.status === "pending").length;
  if (pending >= MIN_PENDING_EDICTS) return;
  generating.value = true;
  replenishPromise = (async () => {
    try {
      const generated = await generateEdicts(Math.min(5, TARGET_PENDING_EDICTS - pending), characters, records.value);
      edictRepository.addMany(generated);
      syncRecords();
      if (!visibleIds.value.length) chooseVisible();
      notice.value = generated.length ? `新拟 ${generated.length} 份奏折已送达` : "未生成新的奏折";
    } catch (error) {
      notice.value = readableAiError(error);
    } finally {
      generating.value = false;
      replenishPromise = null;
    }
  })();
  return replenishPromise;
}
function selectEdict(id: string) {
  if (inputLocked.value) return;
  selectedId.value = id;
  decision.value = null;
  phase.value = "demand";
}
function backToPicker() {
  controller?.abort();
  phase.value = "picker";
  selectedId.value = null;
  decision.value = null;
  inputLocked.value = false;
  chooseVisible();
}
function refresh() {
  chooseVisible();
  void replenish();
}
async function startDebate() {
  if (!selected.value) return;
  controller?.abort();
  controller = new AbortController();
  aiError.value = "";
  phase.value = "preparingDebate";
  try {
    const prepared = await prepareDebate({ edict: selected.value, characters }, controller.signal);
    const conclusion = await prepared.conclusion;
    if (!selected.value || controller.signal.aborted) return;
    const updated: EdictRecord = {
      ...selected.value,
      messages: prepared.messages,
      summary: conclusion.summary,
      shouldDeepThought: conclusion.shouldDeepThought,
      outcomes: conclusion.outcomes,
    };
    edictRepository.upsert(updated);
    syncRecords();
    replaying.value = false;
    phase.value = "debate";
  } catch (error) {
    if (!controller.signal.aborted) aiError.value = readableAiError(error);
  }
}
function cancelPreparation() {
  controller?.abort();
  aiError.value = "";
  phase.value = "demand";
}
function debateComplete() {
  phase.value = "review";
  replaying.value = false;
}
function replayDebate() {
  replaying.value = true;
  phase.value = "debate";
}
function decide(value: EdictDecision) {
  if (!selected.value?.outcomes[value] || inputLocked.value) {
    notice.value = "该结论尚未生成，请重新进行廷议。";
    return;
  }
  decision.value = value;
  inputLocked.value = true;
  window.clearTimeout(stampTimer);
  stampTimer = window.setTimeout(() => {
    inputLocked.value = false;
    if (selected.value?.shouldDeepThought) phase.value = "deepThought";
    else phase.value = value === "approved" ? "detail" : "result";
    if (value === "rejected" && !selected.value?.shouldDeepThought) finalize("rejected");
  }, 680);
}
function deepThoughtComplete() {
  if (decision.value === "approved") phase.value = "detail";
  else {
    finalize("rejected");
    phase.value = "result";
  }
}
function reconsider() {
  decision.value = null;
  phase.value = "review";
}
function finalize(value: EdictDecision) {
  if (!selected.value) return;
  edictRepository.upsert({ ...selected.value, status: value });
  syncRecords();
}
function detailComplete() {
  finalize("approved");
  phase.value = "result";
}
function continueReviewing() {
  phase.value = "picker";
  selectedId.value = null;
  decision.value = null;
  chooseVisible();
  void replenish();
}
async function retire() {
  controller?.abort();
  await router.push("/main");
}

onMounted(async () => {
  records.value = edictRepository.load(seedData.edicts as unknown as EdictRecord[]);
  chooseVisible();
  try {
    await media.setEffectAudioAsync("vo_zz_01");
    await media.setBGMAudioAsync("mus_zouzhe_loop");
  } catch {
    /* 浏览器自动播放策略不应阻塞业务初始化 */
  }
  void replenish();
});
onBeforeUnmount(() => {
  controller?.abort();
  window.clearTimeout(stampTimer);
});
</script>

<template>
  <main class="edict-root">
    <Transition :name="phaseTransitionName" mode="out-in">
      <EdictPicker
        v-if="phase === 'picker' || phase === 'result'"
        key="picker"
        :edicts="visible"
        :input-locked="phase === 'result'"
        :generating="generating"
        :notice="notice"
        @select="selectEdict"
        @refresh="refresh"
        @archive="historyOpen = true"/>
      <EdictDemand
        v-else-if="phase === 'demand' || phase === 'review' || phase === 'deepThought'"
        key="demand"
        :edict="selected!"
        :mode="phase === 'demand' ? 'demand' : 'review'"
        :decision="decision"
        :input-locked="inputLocked || phase === 'deepThought'"
        @back="backToPicker"
        @debate="startDebate"
        @decide="decide"
        @replay-debate="replayDebate" />
      <DebateView
        v-else-if="phase === 'debate'"
        key="debate"
        :edict="selected!"
        :replay="replaying"
        @complete="debateComplete" />
      <EdictDetail
        v-else-if="phase === 'detail' && currentOutcome"
        key="detail"
        :edict="selected!"
        :outcome="currentOutcome"
        @reconsider="reconsider"
        @complete="detailComplete" />
      <section v-else key="preparing" class="preparing edict-screen">
        <div class="loader"></div>
        <h2>{{ aiError ? "廷议未能开始" : "群臣正在准备廷议……" }}</h2>
        <p v-if="aiError">{{ aiError }}</p>
        <div>
          <button v-if="aiError" type="button" @click="startDebate">重试</button
          ><button type="button" @click="cancelPreparation">返回奏折</button>
        </div>
      </section>
    </Transition>
    <DeepThoughtPopup v-if="phase === 'deepThought' && decision" :decision="decision" @complete="deepThoughtComplete" />
    <EdictResultPopup
      v-if="phase === 'result' && selected && decision && currentOutcome"
      :edict="selected"
      :decision="decision"
      :outcome="currentOutcome"
      @continue="continueReviewing"
      @retire="retire" />
    <HistoryEdicts v-if="historyOpen" :edicts="archived" @close="historyOpen = false" />
  </main>
</template>

<style>
.edict-root,
.edict-screen {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #f3ce86;
}
.edict-screen button {
  font-family: inherit;
}
.phase-enter-active,
.phase-leave-active {
  transition: opacity 0.18s ease-out;
}
.phase-enter-from,
.phase-leave-to {
  opacity: 0;
}
.preparing {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 20px;
  color: #f1ca8c;
  background: #641008 url("/common/images/edict/Edict_Main_Bg3.png") center/cover;
  text-align: center;
}
.preparing h2 {
  font: clamp(32px, 3vw, 60px);
}
.preparing p {
  max-width: 700px;
}
.preparing button {
  min-width: 180px;
  margin: 10px;
  padding: 13px 25px;
  border: 1px solid #dda75d;
  color: #f1ca8c;
  background: #68180f;
  font: inherit;
}
.loader {
  width: 70px;
  height: 70px;
  border: 5px solid #f1ca8c44;
  border-top-color: #f1ca8c;
  border-radius: 50%;
  animation: edict-spin 1s linear infinite;
}
@keyframes edict-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .edict-root * {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
</style>
