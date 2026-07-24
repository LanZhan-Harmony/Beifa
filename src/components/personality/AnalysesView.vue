<script setup lang="ts">
import ImageTextButton from "@/components/ImageTextButton.vue";
import type { PersonalityRoleParagraphType, PersonalityType } from "@/types/personalityType";
type Section = "workplace" | "relationship" | "love";
const props = defineProps<{ report: PersonalityType; section: Section }>();
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
const keys: Record<
  Section,
  keyof Pick<typeof props.report.role, "workplaceAnalyses" | "relationshipAnalyses" | "loveAnalyses">
> = { workplace: "workplaceAnalyses", relationship: "relationshipAnalyses", love: "loveAnalyses" };
const paragraphs = () => props.report.role[keys[props.section]] as PersonalityRoleParagraphType[];
const role = (id: string, part: string) => `${root}role/PersonalityReport_${part}_${id}.png`;
const metrics = [72, 58, 83, 62, 76, 67];
const radarPoints = metrics
  .map((value, index) => {
    const angle = ((-90 + index * 60) * Math.PI) / 180;
    return `${150 + Math.cos(angle) * value},${150 + Math.sin(angle) * value}`;
  })
  .join(" ");
const metricStyle = (index: number) => {
  const angle = ((-90 + index * 60) * Math.PI) / 180;
  return { left: `${50 + Math.cos(angle) * 46}%`, top: `${50 + Math.sin(angle) * 46}%` };
};
</script>

<template>
  <section class="analysis-view">
    <header>
      <img :src="role(report.role.id, 'TypeIcon')" :alt="report.role.name" />
      <div>
        <img :src="root + 'PersonalityReportShare_Text_Bg5.png'" /><span>{{ report.role.name }}</span>
      </div>
      <button @click="emit('show-introduction')">×</button>
    </header>
    <aside class="visual">
      <template v-if="section !== 'love'">
        <div class="radar">
          <svg viewBox="0 0 300 300" aria-label="六项能力图">
            <polygon points="150,25 258,87 258,213 150,275 42,213 42,87" />
            <polygon class="data" :points="radarPoints" />
          </svg><span v-for="(m, i) in metrics" :key="m" :style="metricStyle(i)">{{ m }}%</span>
        </div>
        <p>洞察力　行动力　协作力<br />韧性　表达力　适应力</p>
      </template>
      <template v-else>
        <div class="love-bars" v-for="(m, i) in [82, 65, 73, 56]" :key="m">
          <span>{{ ["主动", "热烈", "信任", "浪漫"][i] }}</span>
          <i>
            <b :style="{ width: m + '%' }"> </b>
          </i>
          <strong>{{ m }}%</strong>
        </div>
      </template>

    </aside>
    <main>
      <h1>{{ labels[section] }}</h1>
      <h2>我的类型：{{ report.role.tag }}型</h2>
      <article v-for="p in paragraphs()" :key="p.title">
        <h3><img :src="root + 'PersonalityReport_Info_TextBg1.png'" />{{ p.title }}</h3>
        <p>{{ p.content }}</p>
      </article>
    </main>
    <nav class="tabs" aria-label="报告分析">
      <button v-for="tab in [
        { id: 'workplace', text: '职场\n解析' },
        { id: 'relationship', text: '人际\n解析' },
        { id: 'love', text: '爱情\n解析' },
      ]" :key="tab.id" :class="{ active: section === tab.id }" :style="{
          backgroundImage: `url(${root}PersonalityReport_Info_BtnTaB.png)`,
          '--tab-selected-image': `url(${root}PersonalityReport_Info_BtnTaBSelect.png)`,
        }" @click="emit('change-section', tab.id as Section)">
        {{ tab.text }}
      </button>
    </nav>
    <div class="messages">
      <div class="message friend">
        <img :src="role(report.friendId, 'Role')" />
        <p>{{ report.friendMessage }}</p>
      </div>
      <div class="message enemy">
        <img :src="role(report.enemyId, 'Role')" />
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
  top: 28px;
  left: 40px;
  height: 130px;
  display: flex;
  align-items: center;
}

.analysis-view header>img {
  width: 119px;
}

.analysis-view header div {
  position: relative;
  width: 512px;
  height: 37px;
}

.analysis-view header div img {
  width: 512px;
}

.analysis-view header span {
  position: absolute;
  left: 35px;
  top: 4px;
  font-size: 28px;
}

.analysis-view header button {
  margin-left: 35px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: #3a1f20;
  color: #ffd78f;
  font-size: 25px;
  cursor: pointer;
}

.visual {
  position: absolute;
  left: 45px;
  top: 200px;
  width: 650px;
  text-align: center;
}

.radar {
  position: relative;
  margin: auto;
  width: 370px;
  height: 370px;
}

.radar svg {
  width: 300px;
  margin: 35px;
}

.radar polygon {
  fill: none;
  stroke: #85c2bb;
  stroke-width: 2;
}

.radar .data {
  fill: #609e9c88;
  stroke: #eed593;
}

.radar span {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 17px;
  color: #e9d8a5;
}

.visual p {
  font-size: 22px;
  line-height: 2;
}

.love-bars {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 25px auto;
  width: 450px;
  font-size: 22px;
}

.love-bars i {
  width: 260px;
  height: 15px;
  background: #234a58;
  border-radius: 10px;
}

.love-bars b {
  display: block;
  height: 100%;
  background: #d4b66b;
  border-radius: 10px;
}

.love-bars strong {
  font-size: 18px;
}

main {
  position: absolute;
  top: 190px;
  left: 760px;
  width: 900px;
  height: 690px;
  overflow-y: auto;
  padding-right: 15px;
  scrollbar-color: #73bfb6 transparent;
  scrollbar-width: thin;
}

main h1 {
  margin: 0;
  font-size: 42px;
  font-weight: normal;
}

main h2 {
  margin: 10px 0 20px;
  font-size: 24px;
  font-weight: normal;
}

article {
  border-left: 4px dotted #aa9863;
  margin-bottom: 26px;
  padding-left: 24px;
}

article h3 {
  position: relative;
  margin: 0 0 10px -24px;
  height: 37px;
  font-size: 27px;
  font-weight: normal;
  line-height: 37px;
}

article h3 img {
  position: absolute;
  left: 0;
  width: 512px;
  height: 37px;
  z-index: -1;
}

article p {
  margin: 0;
  font-size: 21px;
  line-height: 1.55;
  color: #e8d5a3;
}

.tabs {
  position: absolute;
  right: -190px;
  top: 27.9%;
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
.tabs button:focus-visible,
.tabs button.active {
  background-image: var(--tab-selected-image) !important;
}

.messages {
  position: absolute;
  left: 80px;
  bottom: 55px;
  width: 560px;
  display: grid;
  gap: 12px;
}

.message {
  height: 78px;
  position: relative;
  padding-left: 90px;
}

.message>img {
  position: absolute;
  bottom: 0;
  left: 0;
  max-width: 80px;
  max-height: 80px;
}

.message p {
  margin: 0;
  padding: 14px 12px;
  background: #5d3837cc;
  border-radius: 16px;
  font-size: 16px;
  line-height: 22px;
  max-height: 44px;
  overflow: hidden;
}

.enemy p {
  background: #174950cc;
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
