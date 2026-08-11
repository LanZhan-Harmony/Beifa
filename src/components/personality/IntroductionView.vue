<script setup lang="ts">
import ImageTextButton from "@/components/ImageTextButton.vue";
import PageNavButton from "@/components/PageNavButton.vue";
import TipView from "@/components/personality/TipView.vue";
import type { personalityReportType, personalityType } from "@/types/personalityType";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  report: personalityReportType;
}>();

const emit = defineEmits<{
  (e: "open-analysis", section: Section): void;
  (e: "open-keywords"): void;
}>();

type Section = "workplace" | "relationship" | "love";

const { t, tm } = useI18n();

const personalityData = computed(() => tm("personalities") as personalityType);

const root = "/common/images/personality/";
const roleImg = (id: string, suffix: string) => `${root}role/PersonalityReport_${suffix}_${id}.png`;
const roleName = (id: string) => personalityData.value.roles.find((role) => role.id === id)?.name ?? id;
const note = personalityData.value.note;
const noteOpen = ref(false);
const detailsWrap = ref<HTMLElement | null>(null);
function closeNote() {
  noteOpen.value = false;
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeNote();
}
function onPointerDown(event: PointerEvent) {
  if (noteOpen.value && !detailsWrap.value?.contains(event.target as Node)) closeNote();
}
onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onPointerDown);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.removeEventListener("pointerdown", onPointerDown);
});
</script>

<template>
  <PageNavButton :text="t('personalityUi.report.title')" />
  <div ref="detailsWrap" class="details-wrap">
    <button
      class="details"
      :aria-label="t('personalityUi.report.detailsLabel')"
      :aria-expanded="noteOpen"
      @click="noteOpen = !noteOpen">
      <img src="/common/images/personality/PersonalityReport_Details_Btn.png" />
    </button>
    <div
      v-if="noteOpen"
      class="note-popover"
      role="dialog"
      aria-modal="false"
      :aria-label="t('personalityUi.report.detailsLabel')">
      <TipView :tip="note" />
    </div>
  </div>
  <section class="intro-view">
    <aside class="profile">
      <div class="type-name">
        <img :src="roleImg(report.role.id, 'Type')" />
        <span>{{ report.role.name }}</span>
      </div>
      <p class="motto">{{ report.role.motto }}</p>
      <img class="role-base" :src="root + 'PersonalityReport_Role_Select.png'" />
      <img class="role-art" :src="roleImg(report.role.id, 'Role')" :alt="report.role.name" />
      <img class="role-typeicon" :src="roleImg(report.role.id, 'TypeIconRole')" :alt="report.role.name" />
      <div class="role-tag">
        <img :src="roleImg(report.role.id, 'Tag')" />
        <span>{{ report.role.tag }}</span>
      </div>
      <div class="proportion">
        <div class="proportion-value">
          <img :src="root + 'PersonalityReport_Info_RoleBtn2_1.png'" />
          <b>{{ report.proportion ?? 50 }}%</b>
        </div>
        <div class="proportion-label">
          <img :src="root + 'PersonalityReport_Info_RoleBtn2_2.png'" />
          <span>{{ t("personalityUi.report.currentProportion") }}</span>
        </div>
      </div>
      <ImageTextButton
        class="keyword-button"
        :image="root + 'PersonalityReportMain_Btn.png'"
        :hover-image="root + 'PersonalityReportMain_Btn_Glow.png'"
        :text="t('personalityUi.report.viewWordCloud')"
        :width="190"
        :font-size="27"
        :text-top-margin="48"
        @click="emit('open-keywords')" />
    </aside>
    <main class="reading">
      <div class="reading-content">
        <article v-for="paragraph in report.role.introductions" :key="paragraph.title">
          <h2>
            <img class="title-background" :src="root + 'PersonalityReport_Info_TextBg1.png'" />
            <img class="title-mark" :src="root + 'PersonalityReport_Info_TextBg2.png'" />
            <span>{{ paragraph.title }}</span>
          </h2>
          <p>{{ paragraph.content }}</p>
        </article>
      </div>
    </main>
    <nav class="tabs" :aria-label="t('personalityUi.report.analysisLabel')">
      <button
        v-for="tab in [
          { id: 'workplace', text: t('personalityUi.report.tabs.workplace') },
          { id: 'relationship', text: t('personalityUi.report.tabs.relationship') },
          { id: 'love', text: t('personalityUi.report.tabs.love') },
        ]"
        :key="tab.id"
        :style="{
          backgroundImage: `url(${root}PersonalityReport_Info_BtnTaB.png)`,
          '--tab-selected-image': `url(${root}PersonalityReport_Info_BtnTaBSelect.png)`,
        }"
        @click="emit('open-analysis', tab.id as Section)">
        {{ tab.text }}
      </button>
    </nav>
    <div class="relationships">
      <div class="relation friend">
        <img :src="root + 'PersonalityReport_Info_Friend_1.png'" />
        <img class="relation-decoration" :src="root + 'PersonalityReport_Info_Friend_4.png'" />
        <img class="avatar-bg" :src="root + 'PersonalityReport_Info_Friend_3.png'" />
        <div class="avatar-clip friend-avatar-clip">
          <img class="avatar" :src="roleImg(report.friendId, 'Role')" />
        </div>
        <span>
          <span class="relation-label">
            <img :src="root + 'PersonalityReport_Info_Friend_2.png'" />
            {{ t("personalityUi.report.relationships.confidantRole") }}
          </span>
          <b>{{ roleName(report.friendId) }}</b>
        </span>
      </div>
      <div class="relation enemy">
        <img :src="root + 'PersonalityReport_Info_Enemy_1.png'" />
        <img class="relation-decoration" :src="root + 'PersonalityReport_Info_Enemy_4.png'" />
        <img class="avatar-bg" :src="root + 'PersonalityReport_Info_Enemy_3.png'" />
        <div class="avatar-clip enemy-avatar-clip">
          <img class="avatar" :src="roleImg(report.enemyId, 'Role')" />
        </div>
        <span>
          <span class="relation-label">
            <img :src="root + 'PersonalityReport_Info_Enemy_2.png'" />
            {{ t("personalityUi.report.relationships.complementaryRole") }}
          </span>
          <b>{{ roleName(report.enemyId) }}</b>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.intro-view {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}
.details-wrap {
  position: absolute;
  top: 16px;
  left: 410px;
  z-index: 3;
}
.details {
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
}
.details img {
  width: 50px;
  display: block;
}
.note-popover {
  position: absolute;
  top: 50px;
  left: -30px;
  width: 630px;
  z-index: 20;
}

.profile {
  position: absolute;
  left: 1%;
  top: 12%;
  width: 650px;
  height: 100%;
}

.type-name {
  display: grid;
  place-items: center;
  width: 650px;
  aspect-ratio: 1022/168;
  animation: intro-scale-in 300ms ease-out both;
}

.type-name > * {
  grid-area: 1 / 1;
}

.type-name img {
  width: 100%;
}

.type-name span {
  text-align: center;
  font-size: 52px;
  color: transparent;
  background: linear-gradient(to bottom, #ffffc5, #ffe883);
  -webkit-background-clip: text;
  background-clip: text;
  white-space: nowrap;
}

.motto {
  text-align: center;
  font-size: 30px;
  margin-top: -20px;
  color: #ffe29b;
  animation: intro-fade-in 300ms 240ms ease-out both;
}

.role-base {
  position: absolute;
  bottom: 28%;
  left: 12%;
  width: 500px;
  animation: intro-rise-in 300ms 240ms ease-out both;
}

.role-art {
  position: absolute;
  bottom: 31.5%;
  left: 25%;
  width: 49%;
  animation: intro-rise-in 300ms 240ms ease-out both;
}

.role-typeicon {
  position: absolute;
  bottom: 32%;
  left: 22%;
  width: 21%;
  animation: intro-rise-in 300ms 240ms ease-out both;
}

.role-tag {
  display: grid;
  place-items: center;
  position: absolute;
  top: 22%;
  left: -4%;
  width: 200px;
  aspect-ratio: 254/129;
  animation: intro-fade-in 300ms 500ms ease-out both;
}

.role-tag > * {
  grid-area: 1 / 1;
}

.role-tag img {
  width: 100%;
}

.role-tag span {
  text-align: center;
  font-size: 37px;
  color: #fff;
}

.proportion {
  position: absolute;
  bottom: 30%;
  left: -4%;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: intro-fade-in 300ms 500ms ease-out both;
}

.proportion-value,
.proportion-label {
  width: 100%;
  display: grid;
  justify-items: center;
  align-items: center;
}

.proportion-value > *,
.proportion-label > * {
  grid-area: 1 / 1;
}

.proportion-value img {
  width: 70%;
}

.proportion-label {
  margin-top: -30px;
}

.proportion-label img {
  width: 100%;
}

.proportion b {
  color: #c9fffe;
  font-size: 30px;
  font-family: "JunYiShouShu";
  font-weight: normal;
}

.proportion span {
  font-size: 25px;
  color: #fbfdd1;
  white-space: nowrap;
}

.keyword-button {
  position: absolute;
  bottom: 20%;
  left: 35%;
  animation: intro-fade-in 300ms 500ms ease-out both;
}

.reading {
  position: absolute;
  top: 13%;
  bottom: 21%;
  right: 16%;
  width: 43%;
  overflow-y: auto;
  scrollbar-width: none;
  animation: intro-reveal-down 300ms 600ms ease-out both;
}

.reading-content {
  position: relative;
}

.reading-content::before {
  content: "";
  position: absolute;
  top: 48px;
  bottom: 0;
  left: 11px;
  width: 4px;
  background: url("/common/images/personality/PersonalityReport_Info_TextBg3.png") repeat-y top center / 3.5px 14px;
  pointer-events: none;
}

.reading article {
  margin-bottom: 28px;
  padding-left: 24px;
}

.reading article:last-child {
  margin-bottom: 0;
}

.reading h2 {
  position: relative;
  height: 60px;
  margin: 0 0 12px -24px;
  font-size: 38px;
  font-weight: normal;
  color: #f2e3b2;
}

.reading h2 .title-background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.reading h2 .title-mark {
  position: absolute;
  left: -2px;
  top: 50%;
  width: 32px;
  height: 32px;
  transform: translateY(-50%);
  z-index: 1;
}

.reading h2 span {
  position: relative;
  padding-left: 35px;
  line-height: 37px;
}

.reading p {
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
  animation: intro-slide-left-in 300ms 500ms ease-out both;
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
.tabs button:focus-visible {
  background-image: var(--tab-selected-image) !important;
}

.relationships {
  position: absolute;
  bottom: 5%;
  right: 9%;
  display: flex;
  gap: 30px;
  animation: intro-slide-right-in 300ms 800ms ease-out both;
}

.relation {
  position: relative;
  height: 120px;
  aspect-ratio: 507/155;
}

.relation > img:first-child {
  width: 100%;
}

.relation .relation-decoration {
  position: absolute;
  left: -45px;
  bottom: -5px;
  width: 128px;
  z-index: 1;
}

.relation .avatar-bg {
  position: absolute;
  left: 0;
  top: 50%;
  width: 72px;
  transform: translateY(-50%);
  z-index: 2;
}

.relation .avatar {
  position: absolute;
  left: 8px;
  bottom: 0;
  max-width: 68px;
  max-height: 68px;
  object-fit: contain;
}

.avatar-clip {
  position: absolute;
  left: 0;
  top: 50%;
  width: 72px;
  height: 72px;
  transform: translateY(-50%);
  overflow: hidden;
  z-index: 3;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 72px 72px;
  mask-size: 72px 72px;
}

.friend-avatar-clip {
  -webkit-mask-image: url("/common/images/personality/PersonalityReport_Info_Friend_3.png");
  mask-image: url("/common/images/personality/PersonalityReport_Info_Friend_3.png");
}

.enemy-avatar-clip {
  -webkit-mask-image: url("/common/images/personality/PersonalityReport_Info_Enemy_3.png");
  mask-image: url("/common/images/personality/PersonalityReport_Info_Enemy_3.png");
}

.relation span {
  position: absolute;
  left: 88px;
  top: 25px;
  font-size: 30px;
}

.relation-label {
  position: static !important;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 30px;
}

.relation-label img {
  width: 30px;
}

.friend .relation-label {
  color: #ffac8f;
}

.enemy .relation-label {
  color: #9ed8c5;
}

.relation b {
  display: block;
  font-weight: normal;
  line-height: 30px;
  margin-top: -2px;
}

@keyframes intro-scale-in {
  from {
    opacity: 0;
    transform: scale(1.1);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes intro-rise-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes intro-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

@keyframes intro-slide-right-in {
  from {
    opacity: 0;
    transform: translateX(-28px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes intro-reveal-down {
  from {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
  }

  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

@media (max-height: 500px) {
  .details-wrap {
    top: 14px;
    left: 260px;
    transform-origin: top left;
  }
  .details img {
    width: 35px;
  }
  .note-popover {
    top: 35px;
    left: -10px;
    width: 630px;
  }
  .intro-view {
    scale: 0.7;
    transform-origin: top left;
    width: 142.857%;
    height: 142.857%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-view * {
    animation: none !important;
  }
}
</style>
