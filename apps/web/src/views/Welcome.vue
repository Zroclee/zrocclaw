<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold text-primary">ZrocClaw</h1>
        <p class="py-6 text-lg">
          ZrocClaw 通过自然语言对话，操作浏览器页面，并通过记忆能力、定时器任务、接入远程聊天渠道来帮助用户完成繁琐的网页操作工作。
        </p>
        <div class="flex gap-4 justify-center mt-4">
          <button class="btn btn-primary shadow-lg" @click="router.push('/chat')">前往聊天</button>
          <button class="btn btn-outline btn-secondary" @click="router.push('/config')">前往配置页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 可根据需要添加额外样式 */
</style>
