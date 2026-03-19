<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import Header from '../components/Chat/Header.vue';
import Bubble from '../components/Chat/Bubble.vue';
import Input from '../components/Chat/Input.vue';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

// 状态
const messages = ref<Message[]>([]);
const inputValue = ref('');
const isGenerating = ref(false);
const messageListRef = ref<HTMLElement | null>(null);

// 模拟返回的内容库
const mockResponses = [
  "你好！我是 BrowserClaw 助手。这是一个模拟的流式输出响应。",
  "我已经收到你的消息。作为一个智能助手，我可以帮你处理各种任务。",
  "这里有一段代码示例：\n```javascript\nfunction hello() {\n  console.log('Hello World!');\n}\n```\n你可以随时向我提问！",
  "这个问题很有意思。在 Vue 3 中，我们通常使用 `ref` 或 `reactive` 来管理响应式状态。",
  "好的，我会继续为你提供帮助。还有什么我可以效劳的吗？"
];

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};

// 模拟流式输出
const simulateStream = async (messageId: string, fullContent: string) => {
  const msgIndex = messages.value.findIndex(m => m.id === messageId);
  if (msgIndex === -1) return;

  // 移除 loading 状态，准备开始输出文本
  messages.value[msgIndex].loading = false;
  
  const chars = fullContent.split('');
  let currentText = '';

  for (let i = 0; i < chars.length; i++) {
    // 模拟网络延迟和打字效果 (10ms - 50ms)
    const delay = Math.random() * 40 + 10;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    currentText += chars[i];
    messages.value[msgIndex].content = currentText;
    
    // 每次更新内容时尝试滚动到底部
    scrollToBottom();
  }

  isGenerating.value = false;
};

// 提交消息处理
const handleSubmit = async (text: string) => {
  if (!text.trim() || isGenerating.value) return;

  // 1. 添加用户消息
  const userMsgId = Date.now().toString();
  messages.value.push({
    id: userMsgId,
    role: 'user',
    content: text
  });
  
  inputValue.value = ''; // 清空输入框
  scrollToBottom();
  
  // 2. 添加助手占位消息 (loading 状态)
  isGenerating.value = true;
  const assistantMsgId = (Date.now() + 1).toString();
  messages.value.push({
    id: assistantMsgId,
    role: 'assistant',
    content: '',
    loading: true
  });
  scrollToBottom();

  // 3. 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 600));

  // 4. 随机选择一段回复并开始流式输出
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  await simulateStream(assistantMsgId, randomResponse);
};

// 初始化欢迎消息
onMounted(() => {
  messages.value.push({
    id: 'welcome-msg',
    role: 'assistant',
    content: '你好！我是 **BrowserClaw**。欢迎来到聊天界面，请问有什么我可以帮您的？'
  });
});
</script>

<template>
  <div class="flex flex-col h-screen bg-base-200">
    <!-- 头部 -->
    <Header 
      title="BrowserClaw Chat" 
      @logo-click="console.log('logo clicked')" 
      @title-click="console.log('title clicked')"
    >
      <template #actions>
        <button class="btn btn-ghost btn-sm btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </template>
    </Header>

    <!-- 消息列表区 -->
    <div 
      ref="messageListRef"
      class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      <Bubble
        v-for="msg in messages"
        :key="msg.id"
        :content="msg.content"
        :loading="msg.loading"
        :align="msg.role === 'user' ? 'right' : 'left'"
      >
        <template #top>
          {{ msg.role === 'user' ? 'You' : 'BrowserClaw' }}
        </template>
      </Bubble>
    </div>

    <!-- 输入区 -->
    <div class="bg-base-100 border-t border-base-300 p-4 shrink-0">
      <div class="max-w-4xl mx-auto">
        <Input
          v-model="inputValue"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :loading="isGenerating"
          :disabled="isGenerating"
          autofocus
          placeholder="给 BrowserClaw 发送消息..."
          @submit="handleSubmit"
        >
          <!-- 这里可以演示使用 extra 插槽放置一些辅助按钮，如上传图片等 -->
          <template #extra>
             <button class="btn btn-ghost btn-xs btn-circle text-base-content/50" title="Attach file">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
             </button>
          </template>
        </Input>
        <div class="text-center text-[10px] text-base-content/40 mt-2">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条使其更美观 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--fallback-bc,oklch(var(--bc)/0.2));
  border-radius: 10px;
}
</style>
