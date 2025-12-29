<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- 富媒体分享按钮（推荐） -->
    <button 
      @click="shareRichMedia" 
      class="inline-flex items-center px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!shareRichMessage"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      分享富媒体卡片
    </button>

    <!-- 普通分享按钮 -->
    <button 
      @click="shareToGroups" 
      class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!shareDirectLink"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      分享文本链接
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

    <!-- 说明文字 -->
    <div class="text-center text-sm text-gray-600 max-w-md">
      <p class="mb-2">
        <span class="font-medium text-purple-600">富媒体卡片</span>：需要编写机器人 Inline Query 处理代码
      </p>
      <p class="mb-2">
        <span class="font-medium text-blue-600">文本链接</span>：无需额外开发，即开即用
      </p>
      <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
        <p class="font-medium text-yellow-800 mb-1">💡 关于富媒体分享</p>
        <p class="text-yellow-700">
          要实现带图片和按钮的消息，需要在机器人服务器端编写 Inline Query 处理器代码。
          如果暂时不想开发，建议使用文本链接分享。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTelegram } from '../composables/useTelegramFixed.js';

const { shareDirectLink, shareRichMessage, shareTemplate } = useTelegram();

// 分享模板配置
const shareTemplates = ref([
  { key: 'simple', name: '简单分享', emoji: '🚀' },
  { key: 'invitation', name: '邀请朋友', emoji: '🎉' },
  { key: 'feature', name: '新功能', emoji: '✨' },
  { key: 'announcement', name: '通知', emoji: '📢' }
]);

// 富媒体分享（推荐方式）
const shareRichMedia = () => {
  if (!shareRichMessage || typeof shareRichMessage !== 'function') {
    return;
  }

  // 富媒体消息配置
  const options = {
    imageUrl: 'https://cdn.dribbble.com/userupload/45573848/file/17df3bf8d98986905bfa7113afdf5067.jpg?resize=400x0',
    title: '🚀 Telegram Mini App',
    description: '快来体验这个超棒的应用！\n\n✨ 功能丰富\n🎯 简单易用\n🔥 完全免费',
    buttonText: '打开 Mini App',
    miniAppUrl: 'https://t.me/MyMoniMoniBot/fisrtminiapp'
  };

  // 调用分享函数
  shareRichMessage(options);
};

// 默认分享（简单模式）
const shareToGroups = () => {
  if (!shareDirectLink) {
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
  if (!shareTemplate || typeof shareTemplate !== 'function') {
    return;
  }
  
  // 直接使用模板分享
  shareTemplate(templateKey);
};
</script>

<style scoped>
/* Tailwind CSS 已处理所有样式 */
</style>