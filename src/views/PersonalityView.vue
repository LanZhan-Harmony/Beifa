<script setup lang="ts">
import { readableAiError } from "@/agents/errors";
import { generatePersonalityKeywords, generatePersonalityReport } from "@/agents/personalityReportAgent";
import {
  cacheKeywords,
  cacheReport,
  fingerprint,
  initialActions,
  loadCachedKeywords,
  loadCachedReport,
} from "@/agents/personalityReportRepository";
import { validatePersonalityReport } from "@/agents/schemas";
import AnalysesView from "@/components/personality/AnalysesView.vue";
import CreateView from "@/components/personality/CreateView.vue";
import IntroductionView from "@/components/personality/IntroductionView.vue";
import KeywordsView from "@/components/personality/KeywordsView.vue";
import personalityData from "@/langs/personalities/zh-CN.json";
import { useMediaStore } from "@/stores/media";
import { useSaveStore } from "@/stores/save";
import type { PersonalityRoleType, PersonalityType } from "@/types/personalityType";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type View = "creating" | "introduction" | "analyses" | "keywords";
type Section = "workplace" | "relationship" | "love";
const mediaStore = useMediaStore();
const saveStore = useSaveStore();
const view = ref<View>("creating");
const section = ref<Section>("workplace");
const status = ref<"idle" | "loading" | "empty" | "error">("idle");
const keywordStatus = ref<"loading" | "ready" | "error">("loading");
const errorMessage = ref("");
const report = ref<PersonalityType | null>(null);
const keywords = ref<string[]>([]);
let controller: AbortController | undefined;
const roles = personalityData.personality.roles as PersonalityRoleType[];
const progressPercent = computed(() =>
  Math.round((saveStore.chapterUnlocked.filter(Boolean).length / saveStore.chapterUnlocked.length) * 100),
);

function saveId() {
  return saveStore.currentSave?.id ?? Number(localStorage.getItem("saveId") ?? 0);
}

function chosenPrompts() {
  return Object.keys(initialActions(saveId()))
    .sort()
    .map((key) => initialActions(saveId())[key]!.prompt);
}

function reportFromDraft(draft: ReturnType<typeof validatePersonalityReport>): PersonalityType {
  const role = roles.find((item) => item.id === draft.roleId);
  if (!role) throw new Error("人格角色不存在。");
  return {
    role,
    keywords: draft.keywords,
    proportion: draft.proportion,
    friendId: draft.friendId as PersonalityType["friendId"],
    friendMessage: draft.friendMessage,
    enemyId: draft.enemyId as PersonalityType["enemyId"],
    enemyMessage: draft.enemyMessage,
  };
}

async function generateReport() {
  const values = chosenPrompts();
  if (!values.length) {
    status.value = "empty";
    return;
  }
  controller?.abort();
  const requestController = new AbortController();
  controller = requestController;
  status.value = "loading";
  errorMessage.value = "";
  try {
    const result = await generatePersonalityReport(
      roles,
      personalityData.personality.keywords,
      values,
      requestController.signal,
    );
    cacheReport(saveId(), {
      sourceFingerprint: fingerprint(initialActions(saveId())),
      draft: result.draft,
    });
    report.value = result.report;
    keywordStatus.value = "ready";
    view.value = "introduction";
  } catch (error) {
    if (requestController.signal.aborted) return;
    status.value = "error";
    errorMessage.value = readableAiError(error);
  }
}

async function generateKeywords() {
  const values = chosenPrompts();
  if (!values.length) return;
  controller?.abort();
  const requestController = new AbortController();
  controller = requestController;
  keywordStatus.value = "loading";
  errorMessage.value = "";
  try {
    keywords.value = await generatePersonalityKeywords(values, requestController.signal);
    cacheKeywords(saveId(), keywords.value);
    keywordStatus.value = "ready";
  } catch (error) {
    if (requestController.signal.aborted) return;
    keywordStatus.value = "error";
    errorMessage.value = readableAiError(error);
  }
}

onMounted(async () => {
  await mediaStore.setBGMAudioAsync("mus_personality_loop");

  const values = chosenPrompts();
  if (!values.length) {
    status.value = "empty";
    return;
  }
  const cachedKeywords = loadCachedKeywords(saveId());
  if (cachedKeywords) keywords.value = cachedKeywords;
  if (!saveStore.gameCompleted) {
    view.value = "keywords";
    if (cachedKeywords) keywordStatus.value = "ready";
    else generateKeywords();
    return;
  }
  const cached = loadCachedReport(saveId());
  if (cached) {
    try {
      report.value = reportFromDraft(
        validatePersonalityReport(
          cached.draft,
          roles.map((item) => item.id),
        ),
      );
      keywordStatus.value = "ready";
      view.value = "introduction";
      return;
    } catch {
      // A malformed legacy cache is discarded by replacing it after the user requests a new report.
    }
  }
  view.value = "creating";
  status.value = "idle";
});

onBeforeUnmount(() => {
  controller?.abort();
});
</script>

<template>
  <div class="container">
    <img class="background" src="/common/images/personality/PersonalityReport_Bg3.png" />
    <Transition name="personality-view" mode="out-in">
      <div :key="view" class="personality-view-shell">
        <CreateView v-if="view === 'creating'" :status="status" :error-message="errorMessage" @generate="generateReport" />
        <IntroductionView
          v-else-if="view === 'introduction' && report"
          :report="report"
          @open-analysis="
            (item) => {
              section = item;
              view = 'analyses';
            }
          "
          @open-keywords="view = 'keywords'" />
        <AnalysesView
          v-else-if="view === 'analyses' && report"
          :report="report"
          :section="section"
          @change-section="section = $event"
          @show-introduction="view = 'introduction'" />
        <KeywordsView
          v-else
          :keywords="keywords.length ? keywords : (report?.keywords ?? [])"
          :status="keywordStatus"
          :error-message="errorMessage"
          :progress-percent="progressPercent"
          :show-progress="!report"
          @retry="generateKeywords"
          @refresh="generateKeywords"
          @close="report ? (view = 'introduction') : undefined" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.container {
  overflow: hidden;
  color: #f3ce86;
}
.background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}
.personality-view-enter-active,
.personality-view-leave-active {
  transition: opacity 420ms ease;
}
.personality-view-enter-from,
.personality-view-leave-to {
  opacity: 0;
}
.personality-view-shell {
  position: absolute;
  inset: 0;
}
</style>
