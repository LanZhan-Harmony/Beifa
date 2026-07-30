<script setup lang="ts">
import { MIN_PENDING_EDICTS, TARGET_PENDING_EDICTS } from "@/agents/config";
import { runLiveDebate } from "@/agents/debateOrchestrator";
import { generateEdicts } from "@/agents/edictGeneratorAgent";
import { edictRepository } from "@/agents/edictRepository";
import { readableAiError } from "@/agents/errors";
import type { CharacterBrief } from "@/agents/types";
import { speakerMeta } from "@/assets/data/edictMeta";
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

type Phase = "picker" | "demand" | "preparingDebate" | "debate" | "review" | "deepThought" | "detail" | "result";
const router = useRouter();
const media = useMediaStore();
const phase = ref<Phase>("picker");
const records = ref<EdictRecord[]>([]);
const visibleIds = ref<string[]>([]);
const selectedId = ref<string | null>(null);
const activeEdict = ref<EdictRecord | null>(null);
const decision = ref<EdictDecision | null>(null);
const replaying = ref(false);
const liveComplete = ref(false);
const summaryReady = ref(false);
const summaryWaiting = ref(false);
const inputLocked = ref(false);
const generating = ref(false);
const notice = ref("");
const aiError = ref("");
const historyOpen = ref(false);
let controller: AbortController | null = null;
let stampTimer: number | undefined;
let replenishPromise: Promise<void> | null = null;
const selected = computed(
  () => activeEdict.value ?? records.value.find((item) => item.id === selectedId.value) ?? null,
);
const visible = computed(
  () => visibleIds.value.map((id) => records.value.find((item) => item.id === id)).filter(Boolean) as EdictRecord[],
);
const archived = computed(() => records.value.filter((item) => item.status !== "pending"));
const currentOutcome = computed(() =>
  decision.value && selected.value ? selected.value.outcomes[decision.value] : undefined,
);
const phaseTransitionName = computed(() =>
  phase.value === "picker" || phase.value === "demand" || phase.value === "detail" ? "" : "phase",
);
const characters: CharacterBrief[] = Object.entries(speakerMeta).map(([id, meta]) => ({
  id: id as keyof typeof speakerMeta,
  ...meta,
}));

/** 同步奏折记录 */
function syncRecords() {
  records.value = edictRepository.all();
}

/** 从待批阅奏折中随机选择5份作为可见列表 */
function chooseVisible() {
  visibleIds.value = records.value
    .filter((e) => e.status === "pending")
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((e) => e.id);
}

/** 当奏折数量不足时，补充生成新的奏折 */
async function replenish() {
  if (replenishPromise) {
    return replenishPromise;
  }
  const pending = records.value.filter((e) => e.status === "pending").length;
  if (pending >= MIN_PENDING_EDICTS) {
    return;
  }
  generating.value = true;
  replenishPromise = (async () => {
    try {
      const generated = await generateEdicts(Math.min(5, TARGET_PENDING_EDICTS - pending), characters, records.value);
      edictRepository.addMany(generated);
      syncRecords();
      if (!visibleIds.value.length) {
        chooseVisible();
      }
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

/** 选择奏折进入流程 */
function selectEdict(id: string) {
  if (inputLocked.value) {
    return;
  }
  selectedId.value = id;
  const found = records.value.find((item) => item.id === id);
  activeEdict.value = found
    ? {
        ...found,
        messages: [],
        outcomes: {},
        status: "pending",
        shouldDeepThought: undefined,
      }
    : null;
  decision.value = null;
  phase.value = "demand";
}

/** 返回选择奏折页面 */
function backToPicker() {
  controller?.abort();
  phase.value = "picker";
  selectedId.value = null;
  activeEdict.value = null;
  decision.value = null;
  inputLocked.value = false;
  chooseVisible();
}

/** 返回奏折详情页面 */
function backToDemand() {
  controller?.abort();
  phase.value = "demand";
  decision.value = null;
  inputLocked.value = false;
}

/** 刷新可见奏折列表 */
function refresh() {
  chooseVisible();
  void replenish();
}

/** 开始廷议 */
function startDebate() {
  if (!selected.value) {
    return;
  }
  controller?.abort();
  controller = new AbortController();
  aiError.value = "";
  replaying.value = false;
  liveComplete.value = false;
  summaryReady.value = false;
  summaryWaiting.value = false;
  activeEdict.value = { ...selected.value, messages: [] };
  phase.value = "debate";
  void (async () => {
    try {
      const result = await runLiveDebate(
        { edict: activeEdict.value!, characters },
        {
          signal: controller!.signal,
          onMessage: (message) => {
            if (activeEdict.value)
              activeEdict.value = { ...activeEdict.value, messages: [...activeEdict.value.messages, message] };
          },
        },
      );
      if (controller?.signal.aborted) {
        return;
      }
      liveComplete.value = true;
      const conclusion = await result.conclusion;
      if (controller?.signal.aborted || !activeEdict.value) {
        return;
      }
      activeEdict.value = {
        ...activeEdict.value,
        messages: result.messages,
        shouldDeepThought: conclusion.shouldDeepThought,
        outcomes: conclusion.outcomes,
      };
      edictRepository.upsert(activeEdict.value);
      syncRecords();
      summaryReady.value = true;
      if (summaryWaiting.value) {
        summaryWaiting.value = false;
        phase.value = "review";
      }
    } catch (error) {
      if (!controller?.signal.aborted) {
        aiError.value = readableAiError(error);
        phase.value = "preparingDebate";
      }
    }
  })();
}

/** 取消廷议前的准备 */
function cancelPreparation() {
  controller?.abort();
  aiError.value = "";
  phase.value = "demand";
}

/** 完成廷议 */
function debateComplete() {
  if (!liveComplete.value) return;
  if (summaryReady.value) phase.value = "review";
  else summaryWaiting.value = true;
  replaying.value = false;
}

/** 重播廷议 */
function replayDebate() {
  activeEdict.value = selected.value;
  liveComplete.value = true;
  summaryReady.value = true;
  summaryWaiting.value = false;
  replaying.value = true;
  phase.value = "debate";
}

/** 做出批阅结论 */
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
    if (selected.value?.shouldDeepThought && value === "approved") {
      phase.value = "deepThought";
    } else {
      phase.value = value === "approved" ? "detail" : "result";
    }
    if (value === "rejected" && !selected.value?.shouldDeepThought) {
      finalize("rejected");
    }
  }, 680);
}

/** 完成三思 */
function deepThoughtComplete() {
  if (decision.value === "approved") phase.value = "detail";
  else {
    finalize("rejected");
    phase.value = "result";
  }
}

/** 重新考虑 */
function reconsider() {
  decision.value = null;
  phase.value = "review";
}

/** 完成批阅 */
function finalize(value: EdictDecision) {
  if (!selected.value) return;
  edictRepository.upsert({ ...selected.value, status: value });
  syncRecords();
}

/** 完成奏折详情 */
function detailComplete() {
  finalize("approved");
  phase.value = "result";
}

/** 继续批阅下一份奏折 */
function continueReviewing() {
  phase.value = "picker";
  selectedId.value = null;
  activeEdict.value = null;
  decision.value = null;
  chooseVisible();
  void replenish();
}

/** 退朝 */
async function retire() {
  controller?.abort();
  await media.setEffectAudioAsync("vo_zz_02");
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
        @archive="historyOpen = true" />
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
        :live-complete="liveComplete"
        @back="backToDemand"
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
        <h2>{{ aiError ? "群臣跑路了" : "群臣正在准备廷议……" }}</h2>
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
