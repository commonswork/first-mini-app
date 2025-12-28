<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- 主分享按钮 -->
    <button 
      @click="shareToGroups" 
      class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!shareDirectLink"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      分享到群组
    </button>

    <!-- 分享模板选择 -->
    <div class="flex flex-wrap gap-2 justify-center">
      <button 
        v-for="template in shareTemplates" 
        :key="template.key"
        @click="shareWithTemplate(template.key)"
        class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
        :disabled="!shareDirectLink"
      >
        {{ template.emoji }} {{ template.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTelegram } from '../composables/useTelegram.js';

const { shareDirectLink, createShareTemplate, showAlert, user } = useTelegram();

// 分享模板配置
const shareTemplates = ref([
  { key: 'simple', name: '简单分享', emoji: '🚀' },
  { key: 'invitation', name: '邀请朋友', emoji: '🎉' },
  { key: 'feature', name: '新功能', emoji: '✨' },
  { key: 'announcement', name: '通知', emoji: '📢' }
]);

// 默认分享（简单模式）
const shareToGroups = () => {
  if (!shareDirectLink) {
    showAlert('分享功能不可用');
    return;
  }
  
  const currentUrl = "https://t.me/MyMoniMoniBot/fisrtminiapp";
  const shareOptions = {
    emoji: '🚀',
    title: 'Telegram Mini App',
    description: '快来体验这个超棒的应用！',
    useMarkdown: true,
    hashtags: ['MiniApp', 'Telegram']
  };
  
  shareDirectLink(currentUrl, shareOptions);
};

// 使用模板分享
const shareWithTemplate = (templateKey) => {
  if (!shareDirectLink) {
    showAlert('分享功能不可用');
    return;
  }
  
  const currentUrl = "https://t.me/MyMoniMoniBot/fisrtminiapp";
  
  // 根据用户信息自定义内容
  const userName = user.value?.first_name || '朋友';
  
  let customData = {};
  
  switch (templateKey) {
    case 'invitation':
      customData = {
        title: `${userName} 邀请你体验`,
        description: '一起来探索这个有趣的 Mini App 吧！',
        mentions: user.value?.username ? [user.value.username] : []
      };
      break;
      
    case 'feature':
      customData = {
        title: '🆕 新功能上线啦！',
        description: '发现更多精彩功能，快来体验吧！',
        text: '点击链接立即体验 👆'
      };
      break;
      
    case 'announcement':
      customData = {
        title: '📢 重要更新',
        description: '查看最新版本的精彩内容',
        text: '立即查看详情 ⬇️'
      };
      break;
  }
  
  const template = createShareTemplate(templateKey, customData);
  shareDirectLink(currentUrl, template);
};
</script>

<style scoped>
/* Tailwind CSS 已处理所有样式 */
</style>