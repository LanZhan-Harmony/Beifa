<script setup lang="ts">
import ImageTextButton from "@/components/ImageTextButton.vue";
import personalityData from "@/langs/personalities/zh-CN.json";
import type { PersonalityType } from "@/types/personalityType";

type Section = "workplace" | "relationship" | "love";

const props = defineProps<{
  report: PersonalityType;
}>();

const emit = defineEmits<{
  (e: "open-analysis", section: Section): void;
  (e: "open-keywords"): void;
}>();

const root = "/common/images/personality/";
const roleImg = (id: string, suffix: string) => `${root}role/PersonalityReport_${suffix}_${id}.png`;
const roleName = (id: string) => personalityData.personality.roles.find((role) => role.id === id)?.name ?? id;
const relations = (id: string) => props.report.role.id === id;
</script>

<template>
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
          <span>当前占比</span>
        </div>
      </div>
      <ImageTextButton class="keyword-button" :image="root + 'PersonalityReportMain_Btn.png'"
        :hover-image="root + 'PersonalityReportMain_Btn_Glow.png'" text="查看词云" :width="190" :font-size="27"
        :text-top-margin="48" @click="emit('open-keywords')" />
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
    <nav class="tabs" aria-label="报告分析">
      <button v-for="tab in [
        { id: 'workplace', text: '职场\n解析' },
        { id: 'relationship', text: '人际\n解析' },
        { id: 'love', text: '爱情\n解析' },
      ]" :key="tab.id" :style="{
          backgroundImage: `url(${root}PersonalityReport_Info_BtnTaB.png)`,
          '--tab-selected-image': `url(${root}PersonalityReport_Info_BtnTaBSelect.png)`,
        }" @click="emit('open-analysis', tab.id as Section)">
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
            知己角色
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
            互补角色
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
  height: 100%;
  width: 100%;
}

.profile {
  position: absolute;
  left: 1%;
  top: 3%;
  width: 650px;
  height: 100%;
}

.type-name {
  display: grid;
  place-items: center;
  width: 650px;
  aspect-ratio: 1022/168;
}

.type-name>* {
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
}

.role-base {
  position: absolute;
  bottom: 28%;
  left: 12%;
  width: 500px;
}

.role-art {
  position: absolute;
  bottom: 31.5%;
  left: 25%;
  width: 49%;
}

.role-typeicon {
  position: absolute;
  bottom: 32%;
  left: 22%;
  width: 21%;
}

.role-tag {
  display: grid;
  place-items: center;
  position: absolute;
  top: 22%;
  left: -4%;
  width: 200px;
  aspect-ratio: 254/129;
}

.role-tag>* {
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
}

.proportion-value,
.proportion-label {
  width: 100%;
  display: grid;
  justify-items: center;
  align-items: center;
}

.proportion-value>*,
.proportion-label>* {
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
  font-family: "KuangShanKaiShu";
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
}

.reading {
  position: absolute;
  top: 5%;
  right: 16%;
  width: 43%;
  height: 90%;
  overflow-y: auto;
  scrollbar-color: #73bfb6 transparent;
  scrollbar-width: thin;
}

.reading-content {
  position: relative;
}

.reading-content::before {
  content: "";
  position: absolute;
  top: 48px;
  bottom: 0;
  left: 12px;
  width: 4px;
  background: url("/common/images/personality/PersonalityReport_Info_TextBg3.png") repeat-y top center / 4px 16px;
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
  font-size: 28px;
  line-height: 1;
  color: #ced2ca;
  white-space: pre-wrap;
}

.tabs {
  position: absolute;
  right: -190px;
  top: 20%;
  display: grid;
  gap: 30px;
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
  bottom: 12%;
  right: 10%;
  display: flex;
  gap: 30px;
}

.relation {
  position: relative;
  height: 120px;
  aspect-ratio: 507/155;
}

.relation>img:first-child {
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

@media (max-height: 500px) {
  .intro-view {
    scale: 0.7;
    transform-origin: top left;
    width: 142.857%;
    height: 142.857%;
  }
}
</style>
