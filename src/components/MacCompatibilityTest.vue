<template>
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
    <h3 class="text-lg font-semibold text-yellow-800 mb-3">🍎 Mac 兼容性测试</h3>
    
    <div class="space-y-3 text-sm">
      <div class="flex justify-between items-center">
        <span class="text-yellow-700">当前平台:</span>
        <span class="font-mono bg-yellow-100 px-2 py-1 rounded">
          {{ tg?.platform || 'unknown' }}
        </span>
      </div>
      
      <div class="flex justify-between items-center">
        <span class="text-yellow-700">WebApp 版本:</span>
        <span class="font-mono bg-yellow-100 px-2 py-1 rounded">
          {{ tg?.version || 'unknown' }}
        </span>
      </div>
      
      <div class="flex justify-between items-center">
        <span class="text-yellow-700">是否 Mac 平台:</span>
        <span :class="isMac ? 'text-orange-600' : 'text-green-600'">
          {{ isMac ? '🍎 是' : '✅ 否' }}
        </span>
      </div>
    </div>
    
    <div class="mt-4 space-y-2">
      <button 
        @click="testStandardShare"
        class="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        测试标准分享方式
      </button>
      
      <button 
        @click="testMacCompatibleShare"
        class="w-full px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
      >
        测试 Mac 兼容分享
      </button>
      
      <button 
        @click="testDirectLinkShare"
        class="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
      >
        测试直接链接分享
      </button>
    </div>
    
    <div v-if="isMac" class="mt-4 p-3 bg-orange-100 border border-orange-300 rounded text-xs">
      <p class="font-medium text-orange-800 mb-1">🍎 Mac 端注意事项</p>
      <ul class="text-orange-700 space-y-1">
        <li>• Mac 端的 switchInlineQuery 可能不会触发 inline query</li>
        <li>• 建议使用直接链接分享作为备选方案</li>
        <li>• 或提示用户手动输入 @BotName query</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTelegram } from '../composables/useTelegramFixed.js';

const { tg, showAlert, shareDirectLink, detectPlatformAndShare } = useTelegram();

const isMac = computed(() => {
  const platform = tg.value?.platform;
  return platform === 'macos' || platform === 'mac';
});

const testStandardShare = () => {
  if (!tg.value || typeof tg.value.switchInlineQuery !== 'function') {
    showAlert('❌ switchInlineQuery 不可用');
    return;
  }
  
  try {
    tg.value.switchInlineQuery('test_standard', ['users', 'groups']);
    showAlert('✅ 标准方式调用成功\n查询: test_standard');
  } catch (error) {
    showAlert('❌ 标准方式失败: ' + error.message);
  }
};

const testMacCompatibleShare = () => {
  const result = detectPlatformAndShare('test_mac_compatible', {
    title: '🧪 Mac 兼容性测试',
    description: '测试 Mac 端分享兼容性',
    miniAppUrl: 'https://t.me/MyMoniMoniBot/fisrtminiapp'
  });
  
  if (!result) {
    showAlert('❌ Mac 兼容分享失败');
  }
};

const testDirectLinkShare = () => {
  const url = 'https://t.me/MyMoniMoniBot/fisrtminiapp';
  const options = {
    emoji: '🧪',
    title: 'Mac 兼容性测试',
    description: '通过直接链接分享的测试消息',
    useMarkdown: true,
    hashtags: ['MacTest', 'MiniApp']
  };
  
  const result = shareDirectLink(url, options);
  if (result) {
    showAlert('✅ 直接链接分享调用成功');
  } else {
    showAlert('❌ 直接链接分享失败');
  }
};
</script>