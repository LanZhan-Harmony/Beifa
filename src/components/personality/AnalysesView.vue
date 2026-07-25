<script setup lang="ts">
import type { PersonalityRoleParagraphType, PersonalityType } from "@/types/personalityType";
import type { ComponentPublicInstance } from "vue";
import { nextTick, onMounted, ref, watch } from "vue";
import LoveChart from "./LoveChart.vue";
import WorkPlaceRelationshipChart from "./WorkPlaceRelationshipChart.vue";
type Section = "workplace" | "relationship" | "love";
const props = defineProps<{
  report: PersonalityType;
  section: Section;
}>();
const emit = defineEmits<{
  (e: "change-section", section: Section): void;
  (e: "show-introduction"): void;
}>();

const root = "/common/images/personality/";
const labels: Record<Section, string> = {
  workplace: "事业解析",
  relationship: "人际解析",
  love: "爱情解析",
};
const sectionOrder: Section[] = ["workplace", "relationship", "love"];
const keys: Record<
  Section,
  keyof Pick<typeof props.report.role, "workplaceAnalyses" | "relationshipAnalyses" | "loveAnalyses">
> = { workplace: "workplaceAnalyses", relationship: "relationshipAnalyses", love: "loveAnalyses" };
const readingRef = ref<HTMLElement | null>(null);
const sectionRefs = ref<Record<Section, HTMLElement | null>>({
  workplace: null,
  relationship: null,
  love: null,
});
const syncingFromScroll = ref(false);
const role = (id: string, part: string) => `${root}role/PersonalityReport_${part}_${id}.png`;
const getParagraphs = (section: Section) => props.report.role[keys[section]] as PersonalityRoleParagraphType[];
const setSectionRef = (section: Section, element: Element | ComponentPublicInstance | null) => {
  sectionRefs.value[section] = element instanceof HTMLElement ? element : null;
};
const scrollToSection = async (section: Section, behavior: ScrollBehavior = "smooth") => {
  await nextTick();
  const container = readingRef.value;
  const target = sectionRefs.value[section];
  if (!container || !target) {
    return;
  }
  container.scrollTo({ top: target.offsetTop, behavior });
};
const detectSectionFromScroll = () => {
  const container = readingRef.value;
  if (!container) {
    return;
  }

  const threshold = container.getBoundingClientRect().top + container.clientHeight * 0.34;
  let currentSection = props.section;

  for (const section of sectionOrder) {
    const element = sectionRefs.value[section];
    if (element && element.getBoundingClientRect().top <= threshold) {
      currentSection = section;
    }
  }

  if (currentSection !== props.section) {
    syncingFromScroll.value = true;
    emit("change-section", currentSection);
  }
};

onMounted(() => {
  void scrollToSection(props.section, "auto");
});

watch(
  () => props.section,
  async (section) => {
    if (syncingFromScroll.value) {
      syncingFromScroll.value = false;
      return;
    }

    await scrollToSection(section, "smooth");
  },
);
</script>

<template>
  <section class="analysis-view">
    <header>
      <img :src="role(report.role.id, 'TypeIcon')" :alt="report.role.name" />
      <div>
        <img :src="root + 'PersonalityReport_Type_Title_Bg.png'" /><span>{{ report.role.name }}</span>
      </div>
    </header>
    <button class="close" @click="emit('show-introduction')">
      <img src="/common/images/personality/PersonalityReport_BtnClose.png" />
    </button>
    <aside class="visual">
      <Transition name="analysis-visual-fade" mode="out-in">
        <WorkPlaceRelationshipChart v-if="section === 'workplace'" key="workplace" section="workplace" />
        <WorkPlaceRelationshipChart v-else-if="section === 'relationship'" key="relationship" section="relationship" />
        <LoveChart v-else key="love" />
      </Transition>
    </aside>
    <main ref="readingRef" class="reading" @scroll="detectSectionFromScroll">
      <div class="reading-content">
        <section
          v-for="section in sectionOrder"
          :key="section"
          :ref="(el) => setSectionRef(section, el)"
          class="reading-section">
          <h1>{{ labels[section] }}</h1>
          <img class="section-divider" :src="root + 'PersonalityReport_Info_TextList_Line.png'" alt="" />
          <article v-for="p in getParagraphs(section)" :key="p.title">
            <h3>
              <img class="title-background" :src="root + 'PersonalityReport_Info_TextBg1.png'" />
              <img class="title-mark" :src="root + 'PersonalityReport_Info_TextBg2.png'" />
              <span>{{ p.title }}</span>
            </h3>
            <p>{{ p.content }}</p>
          </article>
        </section>
      </div>
    </main>
    <nav class="tabs" aria-label="报告分析">
      <button
        v-for="tab in [
          { id: 'workplace', text: '职场\n解析' },
          { id: 'relationship', text: '人际\n解析' },
          { id: 'love', text: '爱情\n解析' },
        ]"
        :key="tab.id"
        :class="{ active: section === tab.id }"
        :style="{
          backgroundImage: `url(${root}PersonalityReport_Info_BtnTaB.png)`,
          '--tab-selected-image': `url(${root}PersonalityReport_Info_BtnTaBSelect.png)`,
        }"
        @click="scrollToSection(tab.id as Section)">
        {{ tab.text }}
      </button>
    </nav>
    <div class="messages">
      <div class="message friend">
        <img class="message-bg" :src="root + 'PersonalityReport_Info_Friend_5.png'" />
        <img class="message-decoration" :src="root + 'PersonalityReport_Info_Friend_4.png'" />
        <img class="message-avatar-bg" :src="root + 'PersonalityReport_Info_Friend_3.png'" />
        <div class="message-avatar-clip friend-message-avatar-clip">
          <img class="message-avatar" :src="role(report.friendId, 'Role')" />
        </div>
        <img class="message-mark" :src="root + 'PersonalityReport_Info_Friend_6.png'" />
        <p>{{ report.friendMessage }}</p>
      </div>
      <div class="message enemy">
        <img class="message-bg" :src="root + 'PersonalityReport_Info_Enemy_5.png'" />
        <img class="message-decoration" :src="root + 'PersonalityReport_Info_Enemy_4.png'" />
        <img class="message-avatar-bg" :src="root + 'PersonalityReport_Info_Enemy_3.png'" />
        <div class="message-avatar-clip enemy-message-avatar-clip">
          <img class="message-avatar" :src="role(report.enemyId, 'Role')" />
        </div>
        <img class="message-mark" :src="root + 'PersonalityReport_Info_Enemy_6.png'" />
        <p>{{ report.enemyMessage }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.analysis-view {
  position: absolute;
  inset: 0;
  color: #f2d69d;
}

.analysis-view header {
  position: absolute;
  top: 2%;
  left: 0.9%;
  height: 150px;
  display: flex;
  align-items: center;
}

.analysis-view header > img {
  height: 100%;
  z-index: 2;
}

.analysis-view header div {
  height: 80%;
  margin-left: -200px;
  position: relative;
  z-index: 1;
}

.analysis-view header div img {
  height: 100%;
}

.analysis-view header span {
  position: absolute;
  left: 210px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 52px;
  color: transparent;
  background: linear-gradient(to bottom, #ffffc5, #ffe883);
  -webkit-background-clip: text;
  background-clip: text;
}

.close {
  position: absolute;
  top: 3%;
  right: 3%;
  width: 85px;
  border: 0;
  background: none;
  cursor: pointer;
}

.close img {
  width: 100%;
}

.visual {
  position: absolute;
  left: 0;
  top: 20%;
  width: 44%;
  text-align: center;
}

.analysis-visual-fade-enter-active,
.analysis-visual-fade-leave-active {
  transition: opacity 150ms ease;
}

.analysis-visual-fade-enter-from,
.analysis-visual-fade-leave-to {
  opacity: 0;
}

.reading {
  position: absolute;
  top: 13%;
  bottom: 7.5%;
  right: 13%;
  width: 44%;
  overflow-y: auto;
  padding-right: 15px;
  scrollbar-width: none;
  mask-image: linear-gradient(to bottom, black 0%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 90%, transparent 100%);
}

.reading h1 {
  margin: 0 0 0 25px;
  font-size: 40px;
  font-weight: normal;
  color: #ffa36f;
}

.reading h2 {
  margin: 10px 0 20px;
  font-size: 24px;
  font-weight: normal;
}

.reading-content {
  position: relative;
  animation: reading-content-fade-in 500ms 300ms ease-out both;
}

.reading-section {
  position: relative;
  margin-bottom: 30px;
}

.section-divider {
  display: block;
  width: 98%;
  height: auto;
  margin: 0 auto 30px;
}

.reading-section:last-child {
  margin-bottom: 0;
}

.reading-section::before {
  content: "";
  position: absolute;
  top: 130px;
  bottom: 0;
  left: 11px;
  width: 4px;
  background: url("/common/images/personality/PersonalityReport_Info_TextBg3.png") repeat-y top center / 3.5px 14px;
  pointer-events: none;
}

article {
  margin-bottom: 28px;
  padding-left: 24px;
}

article:last-child {
  margin-bottom: 0;
}

article h3 {
  position: relative;
  height: 60px;
  margin: 0 0 12px -24px;
  font-size: 38px;
  font-weight: normal;
  color: #f2e3b2;
}

article h3 .title-background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

article h3 .title-mark {
  position: absolute;
  left: -2px;
  top: 50%;
  width: 32px;
  height: 32px;
  transform: translateY(-50%);
  z-index: 1;
}

article h3 span {
  position: relative;
  padding-left: 35px;
  line-height: 37px;
}

article p {
  margin: 0;
  font-size: 27px;
  line-height: 1;
  color: #ced2ca;
  margin-left: 10px;
  white-space: pre-wrap;
  font-family: "KuangShanKaiShu";
}

.tabs {
  position: absolute;
  right: -190px;
  top: 28%;
  display: grid;
  gap: 30px;
  animation: intro-slide-left-in 300ms ease-out both;
}

.tabs button {
  height: 120px;
  aspect-ratio: 256/81;
  background-color: transparent;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: 0;
  color: #fff8b9;
  font-family: inherit;
  font-size: 35px;
  line-height: 1;
  padding: 0 145px 0 0;
  white-space: pre-line;
  text-align: center;
  cursor: pointer;
  transition: background-image 0.3s;
}

.tabs button:hover,
.tabs button:focus-visible,
.tabs button.active {
  background-image: var(--tab-selected-image) !important;
}

.messages {
  position: absolute;
  left: 3%;
  bottom: 5%;
  width: 620px;
  display: grid;
  gap: 20px;
  animation: messages-slide-right-in 400ms ease-out 220ms both;
}

.messages .message:nth-child(2) {
  animation: message-fade-in 400ms ease-out 520ms both;
}

.message {
  width: 620px;
  height: 78px;
  position: relative;
}

.message-bg {
  position: absolute;
  left: 80px;
  top: 0;
  width: 512px;
  z-index: 1;
}

.message-decoration {
  position: absolute;
  left: -45px;
  top: 10px;
  width: 128px;
  z-index: 2;
}

.message-avatar-bg {
  position: absolute;
  left: 0;
  top: 50%;
  width: 80px;
  transform: translateY(-50%);
  z-index: 3;
}

.message-avatar-clip {
  position: absolute;
  left: 0;
  top: 50%;
  width: 80px;
  height: 80px;
  transform: translateY(-50%);
  overflow: hidden;
  z-index: 4;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 80px 80px;
  mask-size: 80px 80px;
}

.friend-message-avatar-clip {
  -webkit-mask-image: url("/common/images/personality/PersonalityReport_Info_Friend_3.png");
  mask-image: url("/common/images/personality/PersonalityReport_Info_Friend_3.png");
}

.enemy-message-avatar-clip {
  -webkit-mask-image: url("/common/images/personality/PersonalityReport_Info_Enemy_3.png");
  mask-image: url("/common/images/personality/PersonalityReport_Info_Enemy_3.png");
}

.message-avatar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  max-width: 76px;
  max-height: 76px;
  object-fit: contain;
}

.message-mark {
  position: absolute;
  left: -3px;
  bottom: 1px;
  width: 40px;
  z-index: 5;
}

.message p {
  position: absolute;
  left: 18%;
  top: 42%;
  transform: translateY(-50%);
  z-index: 2;
  font-size: 25px;
  color: #fffbdc;
  white-space: pre-wrap;
  overflow: hidden;
}

@keyframes intro-slide-left-in {
  from {
    opacity: 0;
    transform: translateX(28px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes reading-content-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes messages-slide-right-in {
  from {
    opacity: 0;
    transform: translateX(-26px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes message-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reading-content,
  .messages,
  .messages .message:nth-child(2) {
    animation: none;
  }
}

@media (max-height: 500px) {
  .analysis-view {
    scale: 0.7;
    transform-origin: top left;
    width: 142.857%;
    height: 142.857%;
  }
}
</style>

