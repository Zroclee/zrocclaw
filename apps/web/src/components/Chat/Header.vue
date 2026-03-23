<script setup lang="ts">
// Vue 3 `<script setup>` 宏不需要显式导入 withDefaults, defineProps, defineEmits
interface Props {
  logo?: string;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'ZrocClaw',
  logo: ''
});

const emit = defineEmits<{
  (e: 'logo-click'): void;
  (e: 'title-click'): void;
}>();

const handleLogoClick = () => {
  emit('logo-click');
};

const handleTitleClick = () => {
  emit('title-click');
};
</script>

<template>
  <div class="navbar bg-base-100 border-b border-base-300 px-4 h-16 shrink-0">
    <div class="flex-1 flex items-center gap-2">
      <!-- Logo 区域 -->
      <div 
        v-if="logo" 
        class="avatar cursor-pointer transition-transform hover:scale-105" 
        @click="handleLogoClick"
      >
        <div class="w-8 rounded">
          <img :src="logo" alt="Logo" />
        </div>
      </div>
      <!-- 如果没有提供 logo，可以使用一个默认的图标作为后备，或者直接不显示 -->
      <div 
        v-else 
        class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary cursor-pointer transition-transform hover:scale-105"
        @click="handleLogoClick"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      </div>

      <!-- 标题区域 -->
      <h1 
        class="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
        @click="handleTitleClick"
      >
        {{ title }}
      </h1>
    </div>
    
    <!-- 右侧操作区 插槽 -->
    <div class="flex-none">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped>
/* 组件特有样式 */
</style>
