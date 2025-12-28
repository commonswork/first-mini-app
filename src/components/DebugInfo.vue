<template>
  <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-3">🔧 调试信息</h3>
    
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-600">WebApp SDK:</span>
        <span :class="isReady ? 'text-green-600' : 'text-red-600'">
          {{ isReady ? '✅ 已加载' : '❌ 未加载' }}
        </span>
      </div>
      
      <div v-if="isReady" class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">版本:</span>
          <span class="text-gray-800 font-mono">{{ tg?.version || 'N/A' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">平台:</span>
          <span class="text-gray-800 font-mono">{{ tg?.platform || 'N/A' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">switchInlineQuery:</span>
          <span :class="hasSwitchInlineQuery ? 'text-green-600' : 'text-red-600'">
            {{ hasSwitchInlineQuery ? '✅ 支持' : '❌ 不支持' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">用户ID:</span>
          <span class="text-gray-800 font-mono">{{ user?.id || 'N/A' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">用户名:</span>
          <span class="text-gray-800">{{ user?.first_name || 'N/A' }}</span>
        </div>
      </div>
    </div>
    
    <div class="mt-4 space-y-2">
      <button 
        @click="testBasicInlineQuery"
        class="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        :disabled="!hasSwitchInlineQuery"
      >
        测试基础 Inline Query
      </button>
      
      <button 
        @click="showWebAppInfo"
        class="w-full px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
      >
        显示 WebApp 详细信息
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTelegram } from '../composables/useTelegram.js';

const { tg, user, isReady, showAlert } = useTelegram();

const hasSwitchInlineQuery = computed(() => {
  return tg.value && typeof tg.value.switchInlineQuery === 'function';
});

const testBasicInlineQuery = () => {
  if (!hasSwitchInlineQuery.value) {
    showAlert('❌ switchInlineQuery 不可用');
    return;
  }
  
  try {
    tg.value.switchInlineQuery('debug_test', ['users', 'groups']);
    showAlert('✅ 已调用 switchInlineQuery\n查询内容: debug_test');
  } catch (error) {
    showAlert('❌ 调用失败: ' + error.message);
  }
};

const showWebAppInfo = () => {
  if (!tg.value) {
    showAlert('❌ WebApp 未初始化');
    return;
  }
  
  const info = [
    `版本: ${tg.value.version}`,
    `平台: ${tg.value.platform}`,
    `主题: ${tg.value.colorScheme}`,
    `视口高度: ${tg.value.viewportHeight}`,
    `是否展开: ${tg.value.isExpanded}`,
    `switchInlineQuery: ${typeof tg.value.switchInlineQuery}`,
    `shareToStory: ${typeof tg.value.shareToStory}`,
    `showPopup: ${typeof tg.value.showPopup}`,
  ].join('\n');
  
  showAlert('📱 WebApp 信息:\n\n' + info);
};
</script>