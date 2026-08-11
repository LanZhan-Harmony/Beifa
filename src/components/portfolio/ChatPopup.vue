<script setup lang="ts">
import { streamChat, type ChatMessage } from "@/agents/aiClient";
import { getAgentPrompt } from "@/agents/getAgentPrompt";
import MessageCard from "@/components/MessageCard.vue";
import type { characterType } from "@/types/characterType";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  character: characterType;
  stories: characterType["stories"];
}>();
const { t } = useI18n();

const emit = defineEmits<{
  (event: "close"): void;
}>();

/** 同一页面会反复打开弹窗；按人物 id 缓存对话，避免 v-if 卸载组件后丢失记录。 */
const conversationCache = new Map<string, ChatMessage[]>();

const input = ref("");
const isStreaming = ref(false);
const messages = ref<ChatMessage[]>(loadConversation());
const messagesRef = ref<HTMLElement | null>(null);
let abortController: AbortController | undefined;

function loadConversation(): ChatMessage[] {
  const cached = conversationCache.get(props.character.id);
  if (cached) {
    return cached.map((message) => ({ ...message }));
  }
  return [
    {
      role: "assistant",
      content: t("portfolio.chat.greeting", { name: props.character.name }),
    },
  ];
}

function saveConversation() {
  conversationCache.set(
    props.character.id,
    messages.value.map((message) => ({ role: message.role, content: message.content })),
  );
}

const userContext = () => {
  const stories = props.stories
    .filter((story) => story.title || story.content)
    .map((story) => `【${story.title || "人物故事"}】\n${story.content || ""}`)
    .join("\n\n");

  return [
    `人物姓名：${props.character.name}`,
    `人物简介：${props.character.description || "暂无"}`,
    stories ? `人物故事：\n${stories}` : "人物故事：暂无已解锁内容",
  ].join("\n\n");
};

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
}

async function sendMessage() {
  const content = input.value.trim();
  if (!content || isStreaming.value) return;

  input.value = "";
  messages.value.push({ role: "user", content });
  const assistantMessage: ChatMessage = { role: "assistant", content: "" };
  messages.value.push(assistantMessage);
  saveConversation();
  isStreaming.value = true;
  abortController = new AbortController();
  await nextTick();
  scrollToBottom();

  try {
    const history = [
      { role: "user" as const, content: `当前人物资料：\n${userContext()}` },
      ...messages.value.slice(0, -1),
    ];
    for await (const chunk of streamChat({
      systemPrompt: getAgentPrompt("chatPrompt"),
      messages: history,
      maxTokens: 1200,
      webSearch: true,
      signal: abortController.signal,
    })) {
      // 必须通过 reactive 数组中的代理对象更新，否则 Vue 不会逐块重绘。
      const currentAssistantMessage = messages.value[messages.value.length - 1];
      if (currentAssistantMessage?.role === "assistant") {
        currentAssistantMessage.content += chunk;
      }
      saveConversation();
      await nextTick();
      scrollToBottom();
    }
    const completedAssistantMessage = messages.value[messages.value.length - 1];
    if (completedAssistantMessage?.role === "assistant" && !completedAssistantMessage.content) {
      completedAssistantMessage.content = t("portfolio.chat.emptyResponse");
    }
  } catch (error) {
    if (abortController.signal.aborted) return;
    assistantMessage.content = t("portfolio.chat.continueError", {
      error: error instanceof Error ? error.message : t("portfolio.chat.unknownError"),
    });
  } finally {
    saveConversation();
    isStreaming.value = false;
    abortController = undefined;
    await nextTick();
    scrollToBottom();
  }
}

function close() {
  saveConversation();
  abortController?.abort();
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    close();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  void nextTick(scrollToBottom);
});

onBeforeUnmount(() => {
  saveConversation();
  abortController?.abort();
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="chat-mask" @click.self="close">
    <section class="chat-popup" role="dialog" aria-modal="true" :aria-label="t('portfolio.chat.title', { name: character.name })">
      <img class="popup-background" src="/common/images/popup/Popup_Report_Bg.png" alt="" />
      <div class="popup-title">{{ t("portfolio.chat.title", { name: character.name }) }}</div>
      <button class="close-button" type="button" :aria-label="t('portfolio.chat.close')" @click="close">
        <img src="/common/images/popup/SystemToast_Popup_Btn_Close.png" alt="" />
      </button>

      <div ref="messagesRef" class="messages">
        <div
          v-for="(message, index) in messages"
          :key="`${message.role}-${index}`"
          class="message-row"
          :class="`message-row--${message.role}`">
          <div class="speaker-block">
            <div class="avatar">
              <img
                v-if="message.role === 'assistant'"
                class="avatar-portrait avatar-portrait--character"
                :src="`/characters/${character.id}.png`"
                :alt="character.name" />
              <span v-else class="avatar-portrait avatar-portrait--user">{{ t("portfolio.chat.userLabel") }}</span>
              <img class="avatar-frame" src="/common/images/popup/CharacterProfile_Tab_RoleHead.png" alt="" />
            </div>
            <span class="speaker-name">{{ message.role === "assistant" ? character.name : t("portfolio.chat.userLabel") }}</span>
          </div>
          <MessageCard :message="message.content || '…'" :side="message.role === 'assistant' ? 'left' : 'right'" />
        </div>
      </div>

      <form class="composer" @submit.prevent="sendMessage">
        <input
          v-model="input"
          :disabled="isStreaming"
          maxlength="500"
          autocomplete="off"
          :placeholder="t('portfolio.chat.inputPlaceholder')" />
        <button type="submit" :disabled="isStreaming || !input.trim()">{{ t("portfolio.chat.send") }}</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.chat-mask {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #120400b8;
  animation: fade-in 0.2s ease-out;
}

.chat-popup {
  position: relative;
  width: 1380px;
  aspect-ratio: 1024/528;
  color: #7d3219;
  animation: popup-in 0.24s ease-out;
}

.popup-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.popup-title {
  position: absolute;
  top: 3%;
  left: 13%;
  width: 74%;
  color: #ffd49f;
  font-size: 48px;
  line-height: 1;
  text-align: center;
  text-shadow: 0 2px 5px #6b1b0d;
  white-space: nowrap;
}

.close-button {
  position: absolute;
  top: 1.5%;
  right: 1.2%;
  width: 70px;
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition:
    filter 0.2s,
    transform 0.2s;
}

.close-button:hover {
  filter: brightness(1.2);
  transform: scale(1.05);
}

.close-button img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.messages {
  position: absolute;
  top: 14%;
  right: 7%;
  bottom: 16%;
  left: 7%;
  display: flex;
  flex-direction: column;
  gap: 26px;
  overflow-y: auto;
  padding: 8px 12px 18px;
  scrollbar-width: thin;
  scrollbar-color: #a64e2c transparent;
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #a64e2c88;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 840px;
}

.message-row--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.speaker-block {
  display: flex;
  flex: 0 0 100px;
  flex-direction: column;
  align-items: center;
}

.avatar {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.avatar-portrait,
.avatar-frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.avatar-portrait {
  top: 15%;
  left: 15%;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  z-index: 2;
}

.avatar-portrait--character {
  object-fit: cover;
  object-position: 50% 18%;
}

.avatar-portrait--user {
  display: grid;
  place-items: center;
  color: #f8d69a;
  background: #8e351d;
  font-size: 42px;
  text-shadow: 0 1px 3px #4c170d;
}

.avatar-frame {
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
}

.speaker-name {
  max-width: 100%;
  margin-top: 2px;
  color: #8a3a1e;
  font-size: 26px;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-row :deep(.message--card) {
  flex: 0 1 auto;
  width: fit-content;
  max-width: calc(100% - 120px);
  min-width: 0;
  margin-top: 22px;
  font-size: 28px;
}

.message-row--user :deep(.message--card) {
  text-align: right;
}

.message-row--assistant :deep(.message--card.message--left) {
  color: #811700;
}

.message-row--user :deep(.message--card.message--right) {
  color: #1c5f4b;
}

.composer {
  position: absolute;
  right: 7%;
  bottom: 5.5%;
  left: 7%;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 7px;
  border: 1px solid #d3975d;
  border-radius: 13px;
  background: linear-gradient(180deg, #8f321dc9, #66200fc9);
  box-shadow:
    inset 0 0 0 2px #6b2414,
    inset 0 0 0 3px #d59b5e66,
    0 4px 10px #6b1b0d44;
}

.composer input {
  flex: 1;
  min-width: 0;
  height: 56px;
  box-sizing: border-box;
  padding: 0 18px;
  border: 2px solid #d2965f;
  border-radius: 8px;
  outline: none;
  color: #6e2c16;
  background: linear-gradient(180deg, #fff4dfe8, #f4d3aee8);
  font: inherit;
  font-size: 24px;
  box-shadow: inset 0 1px 2px #6b1b0d22;
}

.composer input:focus {
  border-color: #9c3e1e;
  box-shadow: 0 0 0 3px #d79a5c55;
}

.composer button {
  height: 56px;
  min-width: 120px;
  padding: 0 18px;
  position: relative;
  overflow: hidden;
  border: 1px solid #f1c37d;
  border-radius: 8px;
  color: #fff0cf;
  background: linear-gradient(180deg, #c15a2d, #8f2f18);
  box-shadow:
    inset 0 0 0 2px #7c2a16,
    inset 0 1px 0 #f5d08d99,
    0 2px 5px #6b1b0d55;
  cursor: pointer;
  font: inherit;
  font-size: 24px;
}

.composer button::before,
.composer button::after {
  position: absolute;
  top: 50%;
  width: 7px;
  height: 7px;
  content: "";
  border: 1px solid #f4cb8a;
  transform: translateY(-50%) rotate(45deg);
  opacity: 0.8;
}

.composer button::before {
  left: 9px;
}
.composer button::after {
  right: 9px;
}

.composer button:hover:not(:disabled) {
  background: linear-gradient(180deg, #d36b37, #a33b1f);
  filter: brightness(1.08);
}

.composer button:disabled,
.composer input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes popup-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}

@media (max-height: 500px) {
  .chat-mask {
    padding: 12px;
  }

  .chat-popup {
    width: 96%;
    height: 470px;
  }

  .popup-title {
    font-size: 26px;
  }

  .close-button {
    width: 42px;
  }

  .messages {
    top: 15%;
    bottom: 18%;
    gap: 8px;
  }

  .message-row {
    width: 92%;
  }

  .speaker-block {
    flex: 0 0 58px;
  }

  .avatar-portrait--user {
    font-size: 24px;
  }

  .speaker-name {
    font-size: 16px;
  }

  .message-row :deep(.message--card) {
    max-width: calc(100% - 78px);
    margin-top: 12px;
    font-size: 17px;
  }

  .composer {
    bottom: 5%;
  }

  .composer input {
    height: 38px;
    font-size: 16px;
  }

  .composer button {
    height: 38px;
    min-width: 76px;
    font-size: 16px;
  }
}
</style>
