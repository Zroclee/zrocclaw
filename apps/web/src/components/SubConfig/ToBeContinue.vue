<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center space-y-3">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-300 text-base-content">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3.75c-4.556 0-8.25 3.694-8.25 8.25s3.694 8.25 8.25 8.25 8.25-3.694 8.25-8.25-3.694-8.25-8.25-8.25z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold">{{ title }}</h3>
      <p class="text-base-content/70">功能正在建设中，敬请期待</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>
