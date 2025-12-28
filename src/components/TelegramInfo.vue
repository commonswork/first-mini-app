<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold text-blue-600 text-center mb-8">Telegram 用户信息</h2>

    <!-- 加载状态 -->
    <div v-if="!isReady" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">正在加载 Telegram SDK...</p>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div v-if="displayUser" class="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div class="flex flex-col items-center space-y-4">
        <!-- 用户头像 -->
        <div v-if="displayUser.photo_url" class="relative">
          <img 
            :src="displayUser.photo_url" 
            alt="用户头像" 
            class="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg"
          />
        </div>
        <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
          <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- 用户基本信息 -->
        <div class="text-center space-y-2">
          <h3 class="text-xl font-semibold text-gray-800">
            {{ displayUser.first_name }} {{ displayUser.last_name }}
          </h3>
          <p v-if="displayUser.username" class="text-blue-600 font-medium">
            @{{ displayUser.username }}
          </p>
        </div>

        <!-- 用户详细信息 -->
        <div class="w-full space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600 font-medium">用户 ID</span>
            <span class="text-gray-800 font-mono">{{ displayUser.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Instance 信息 -->
    <div v-if="getChatInstance()" class="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800">Chat Instance</h3>
      </div>
      <div class="bg-white rounded-lg p-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-600 font-medium">实例标识</span>
          <span class="text-gray-800 font-mono text-sm bg-gray-100 px-3 py-1 rounded">
            {{ getChatInstance() }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-2">群组上下文唯一标识符</p>
      </div>
    </div>

    <!-- 分享按钮 -->
    <div class="mb-6">
      <ShareButton />
    </div>

    <!-- 无数据提示 -->
    <div v-if="!displayUser && isReady" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p class="text-gray-600">暂无用户信息</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTelegram } from '../composables/useTelegram.js';
import { parseTelegramWebAppUrl } from '../utils/urlParser.js';
import ShareButton from './ShareButton.vue';

const {
  user,
  isReady,
  getChatInstance
} = useTelegram();

const urlData = ref(null);

// 从 URL 解析的数据（作为备用）
urlData.value = parseTelegramWebAppUrl();

// 合并 SDK 和 URL 解析的数据
const displayUser = computed(() => user.value || urlData.value?.tgWebAppData?.user);
</script>

<style scoped>
/* Tailwind CSS 已处理所有样式，这里保留 scoped 以防需要自定义样式 */
</style>
