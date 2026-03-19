<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
});

interface Props {
  content?: string;
  loading?: boolean;
  align?: "left" | "right";
  avatar?: string;
}

const props = withDefaults(defineProps<Props>(), {
  content: "",
  loading: false,
  align: "left",
  avatar: "",
});

const renderedContent = computed(() => {
  if (props.loading) return "";
  return md.render(props.content);
});
</script>

<template>
  <div :class="['chat', align === 'right' ? 'chat-end' : 'chat-start']">
    <!-- 头像区域 -->
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img v-if="avatar" :src="avatar" alt="Avatar" />
        <!-- 默认头像占位 (当未提供 avatar 时) -->
        <div
          v-else
          class="w-full h-full bg-base-300 flex items-center justify-center text-base-content/50"
        >
          <svg
            v-if="align === 'left'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Top 区域 (例如：显示名称、时间等) -->
    <div class="chat-header mb-1 text-xs text-base-content/70">
      <slot name="top"></slot>
    </div>

    <!-- 气泡主体内容 -->
    <div
      class="chat-bubble"
      :class="
        align === 'right' ? 'chat-bubble-primary' : 'chat-bubble-base-200'
      "
    >
      <div v-if="loading" class="flex items-center justify-center h-full">
        <span class="loading loading-dots loading-md"></span>
      </div>
      <div
        v-else
        class="markdown-body text-sm break-words"
        v-html="renderedContent"
      ></div>
    </div>

    <!-- Bottom 区域 (例如：显示操作按钮，如点赞、复制等) -->
    <div class="chat-footer opacity-70 mt-1 text-xs">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<style scoped>
/* 可在这里补充一些覆盖 Markdown 默认样式的设置以契合 daisyUI 风格 */
.markdown-body :deep(p) {
  margin-bottom: 0.5em;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-body :deep(pre) {
  background-color: var(--fallback-b3, oklch(var(--b3) / 1));
  padding: 0.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.markdown-body :deep(code) {
  font-family: monospace;
  background-color: var(--fallback-b3, oklch(var(--b3) / 0.5));
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
}
.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
}
.markdown-body :deep(a) {
  color: var(--fallback-p, oklch(var(--p) / 1));
  text-decoration: underline;
}
</style>
