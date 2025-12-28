<template>
  <div class="flex justify-center">
    <button 
      @click="shareToGroups" 
      class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!shareToChat"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      分享到群组
    </button>
  </div>
</template>

<script setup>
import { useTelegram } from '../composables/useTelegram.js';

const { shareToChat, showAlert } = useTelegram();

// 分享到群组
const shareToGroups = () => {
  if (!shareToChat) {
    showAlert('分享功能不可用');
    return;
  }
  
  shareToChat('查看这个超棒的 Mini App！', ['groups']);
};
</script>

<style scoped>
/* Tailwind CSS 已处理所有样式 */
</style>