<template>
  <div class="share-section">
    <h3>🔗 分享 Mini App</h3>
    
    <!-- 版本警告 -->
    <div v-if="!supportsSwitchInlineQuery" class="version-warning">
      <div class="warning-badge">
        ⚠️ 版本提示
      </div>
      <p class="warning-text">
        当前 Telegram 版本: <strong>{{ telegramVersion }}</strong><br>
        完整分享功能需要版本 <strong>6.7+</strong><br>
        <br>
        现在将使用简化的分享方式。<br>
        建议更新 Telegram 以获得最佳体验。
      </p>
    </div>
    
    <div class="share-card">
      <p class="share-description">
        点击下方按钮将此 Mini App 分享到任意群组。<br>
        当其他人从群组中打开时，我们可以通过 <code>chat_instance</code> 识别来源群组。
      </p>
      
      <div class="button-group">
        <button @click="shareToGroups" class="share-button primary">
          📤 分享到群组
        </button>
        
        <button @click="shareToAll" class="share-button secondary">
          📨 分享到任意聊天
        </button>
      </div>

      <div v-if="chatInstance" class="context-info">
        <div class="info-badge success">
          ✅ 检测到群组上下文
        </div>
        <p class="context-detail">
          <strong>Chat Instance:</strong> <code>{{ chatInstance }}</code>
        </p>
        
        <!-- 显示群组统计 -->
        <div v-if="isLoadingStats" class="stats-loading">
          加载统计中...
        </div>
        <div v-else-if="groupStats" class="group-stats">
          <h5>📊 群组统计</h5>
          <div class="stat-item">
            <span class="stat-label">总用户数:</span>
            <span class="stat-value">{{ groupStats.totalUsers }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总打开次数:</span>
            <span class="stat-value">{{ groupStats.totalOpens }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">首次打开:</span>
            <span class="stat-value">{{ new Date(groupStats.firstOpenedAt).toLocaleString('zh-CN') }}</span>
          </div>
        </div>
        
        <p class="context-hint">
          这个 ID 可以用来识别用户是从哪个群组打开的 Mini App
        </p>
      </div>

      <div v-else class="context-info">
        <div class="info-badge info">
          ℹ️ 未检测到群组上下文
        </div>
        <p class="context-hint">
          当用户从群组中的分享链接打开时，会自动获取 chat_instance
        </p>
      </div>
    </div>

    <div class="how-it-works">
      <h4>💡 工作原理</h4>
      <ol>
        <li>用户点击"分享到群组"按钮</li>
        <li>Telegram 显示群组选择界面</li>
        <li>用户选择群组后，Bot 在群组中发送消息</li>
        <li>群组成员点击消息打开 Mini App</li>
        <li>Mini App 通过 <code>chat_instance</code> 识别来源群组</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTelegram } from '../composables/useTelegram.js';
import { trackOpen, getGroupStats, trackAction } from '../utils/api.js';

const { shareToChat, shareFallback, getChatInstance, showAlert, initData, user, tg } = useTelegram();

const chatInstance = computed(() => getChatInstance());
const groupStats = ref(null);
const isLoadingStats = ref(false);
const telegramVersion = computed(() => tg.value?.version || '未知');
const supportsSwitchInlineQuery = computed(() => {
  if (!tg.value) return false;
  const version = parseFloat(tg.value.version);
  return version >= 6.7;
});

// 组件挂载时记录打开事件
onMounted(async () => {
  console.log('Telegram 版本:', telegramVersion.value);
  console.log('支持 switchInlineQuery:', supportsSwitchInlineQuery.value);
  
  if (initData.value) {
    try {
      // 记录用户打开 Mini App
      await trackOpen(initData.value);
      console.log('✅ 已记录打开事件');
      
      // 如果是从群组打开的，获取群组统计
      if (chatInstance.value) {
        await loadGroupStats();
      }
    } catch (error) {
      console.error('记录打开事件失败:', error);
      // 不影响用户体验，静默失败
    }
  }
});

// 加载群组统计
const loadGroupStats = async () => {
  if (!chatInstance.value) return;
  
  isLoadingStats.value = true;
  try {
    groupStats.value = await getGroupStats(chatInstance.value);
    console.log('📊 群组统计:', groupStats.value);
  } catch (error) {
    console.error('加载群组统计失败:', error);
  } finally {
    isLoadingStats.value = false;
  }
};

// 分享到群组
const shareToGroups = async () => {
  console.log('点击分享到群组按钮');
  
  if (!shareToChat) {
    console.error('shareToChat 函数不存在');
    showAlert('分享功能不可用');
    return;
  }
  
  // 记录分享行为
  if (user.value) {
    try {
      await trackAction(user.value.id, 'share_to_groups', {
        chatInstance: chatInstance.value,
        telegramVersion: telegramVersion.value
      });
    } catch (error) {
      console.error('记录分享行为失败:', error);
    }
  }
  
  // 检查版本支持
  if (!supportsSwitchInlineQuery.value) {
    // 使用备用方案
    console.log('使用备用分享方案');
    const success = shareFallback('🎉 快来试试这个超棒的 Mini App！');
    console.log('shareFallback 调用结果:', success);
  } else {
    // 使用 switchInlineQuery
    const success = shareToChat('查看这个超棒的 Mini App！', ['groups']);
    console.log('shareToChat 调用结果:', success);
  }
};

// 分享到所有类型的聊天
const shareToAll = async () => {
  console.log('点击分享到所有聊天按钮');
  
  if (!shareToChat) {
    console.error('shareToChat 函数不存在');
    showAlert('分享功能不可用');
    return;
  }
  
  // 记录分享行为
  if (user.value) {
    try {
      await trackAction(user.value.id, 'share_to_all', {
        chatInstance: chatInstance.value,
        telegramVersion: telegramVersion.value
      });
    } catch (error) {
      console.error('记录分享行为失败:', error);
    }
  }
  
  // 检查版本支持
  if (!supportsSwitchInlineQuery.value) {
    // 使用备用方案
    console.log('使用备用分享方案');
    const success = shareFallback('🎉 快来试试这个超棒的 Mini App！');
    console.log('shareFallback 调用结果:', success);
  } else {
    // 使用 switchInlineQuery
    const success = shareToChat('查看这个超棒的 Mini App！', ['users', 'bots', 'groups', 'channels']);
    console.log('shareToChat 调用结果:', success);
  }
};
</script>

<style scoped>
.share-section {
  margin: 20px 0;
}

h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2em;
}

h4 {
  color: #555;
  margin-bottom: 10px;
  font-size: 1em;
}

.share-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.share-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.share-description code {
  background: #e3f2fd;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  color: #1976d2;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.share-button {
  flex: 1;
  min-width: 150px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.share-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.share-button.secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.share-button.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.share-button:active {
  transform: translateY(0);
}

.context-info {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.info-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 600;
  margin-bottom: 10px;
}

.info-badge.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.info-badge.info {
  background: #e3f2fd;
  color: #1976d2;
}

.context-detail {
  margin: 10px 0;
  color: #333;
}

.context-detail code {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85em;
  color: #d32f2f;
  word-break: break-all;
}

.context-hint {
  color: #666;
  font-size: 0.9em;
  line-height: 1.5;
  margin: 5px 0 0 0;
}

.how-it-works {
  background: #fff3e0;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border-left: 4px solid #ff9800;
}

.how-it-works ol {
  margin: 10px 0 0 20px;
  padding: 0;
  color: #555;
  line-height: 1.8;
}

.how-it-works li {
  margin: 8px 0;
}

.how-it-works code {
  background: #ffe0b2;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  color: #e65100;
}

.group-stats {
  margin-top: 15px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 8px;
  border: 1px solid #90caf9;
}

.group-stats h5 {
  margin: 0 0 10px 0;
  color: #1976d2;
  font-size: 0.95em;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e3f2fd;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}

.stat-value {
  color: #1976d2;
  font-weight: 600;
  font-size: 0.9em;
}

.stats-loading {
  margin-top: 15px;
  padding: 15px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.version-warning {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.warning-badge {
  display: inline-block;
  background: #ff9800;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
  margin-bottom: 10px;
}

.warning-text {
  color: #e65100;
  font-size: 0.9em;
  line-height: 1.6;
  margin: 0;
}

.warning-text strong {
  color: #bf360c;
}

@media (max-width: 600px) {
  .button-group {
    flex-direction: column;
  }
  
  .share-button {
    width: 100%;
  }
}
</style>
