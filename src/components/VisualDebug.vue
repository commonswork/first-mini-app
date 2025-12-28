<template>
  <div class="visual-debug">
    <div class="debug-card">
      <h3>🔍 实时状态</h3>
      
      <div class="status-grid">
        <div class="status-item">
          <div class="status-label">Telegram SDK</div>
          <div :class="['status-value', sdkLoaded ? 'success' : 'error']">
            {{ sdkLoaded ? '✅ 已加载' : '❌ 未加载' }}
          </div>
        </div>
        
        <div class="status-item">
          <div class="status-label">版本</div>
          <div class="status-value">{{ version }}</div>
        </div>
        
        <div class="status-item">
          <div class="status-label">switchInlineQuery</div>
          <div :class="['status-value', hasSwitchInlineQuery ? 'success' : 'error']">
            {{ hasSwitchInlineQuery ? '✅ 支持' : '❌ 不支持' }}
          </div>
        </div>
        
        <div class="status-item">
          <div class="status-label">openLink</div>
          <div :class="['status-value', hasOpenLink ? 'success' : 'error']">
            {{ hasOpenLink ? '✅ 支持' : '❌ 不支持' }}
          </div>
        </div>
        
        <div class="status-item">
          <div class="status-label">用户 ID</div>
          <div class="status-value">{{ userId || '未登录' }}</div>
        </div>
        
        <div class="status-item">
          <div class="status-label">最后操作</div>
          <div class="status-value">{{ lastAction }}</div>
        </div>
      </div>
      
      <div class="action-log">
        <h4>📝 操作日志</h4>
        <div class="log-list">
          <div v-for="(log, index) in actionLogs" :key="index" :class="['log-item', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-text">{{ log.message }}</span>
          </div>
          <div v-if="actionLogs.length === 0" class="log-empty">
            等待操作...
          </div>
        </div>
      </div>
      
      <div class="test-buttons">
        <button @click="testBasic" class="test-btn">测试基础功能</button>
        <button @click="testShare" class="test-btn">测试分享</button>
        <button @click="clearLog" class="test-btn clear">清空日志</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTelegram } from '../composables/useTelegram.js';

const { tg, user, shareToChat, shareFallback, showAlert } = useTelegram();

const actionLogs = ref([]);
const lastAction = ref('无');

const sdkLoaded = computed(() => !!window.Telegram?.WebApp);
const version = computed(() => tg.value?.version || '未知');
const hasSwitchInlineQuery = computed(() => {
  return tg.value && typeof tg.value.switchInlineQuery === 'function';
});
const hasOpenLink = computed(() => {
  return tg.value && typeof tg.value.openLink === 'function';
});
const userId = computed(() => user.value?.id || null);

const addLog = (message, type = 'info') => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  actionLogs.value.unshift({
    time,
    message,
    type
  });
  
  lastAction.value = message;
  
  // 限制日志数量
  if (actionLogs.value.length > 20) {
    actionLogs.value.pop();
  }
};

const clearLog = () => {
  actionLogs.value = [];
  lastAction.value = '日志已清空';
};

const testBasic = () => {
  addLog('开始测试基础功能', 'info');
  
  if (!tg.value) {
    addLog('❌ Telegram WebApp 未初始化', 'error');
    showAlert('Telegram WebApp 未初始化');
    return;
  }
  
  addLog(`✅ SDK 版本: ${tg.value.version}`, 'success');
  addLog(`✅ 平台: ${tg.value.platform}`, 'success');
  
  if (user.value) {
    addLog(`✅ 用户: ${user.value.first_name} (${user.value.id})`, 'success');
  } else {
    addLog('⚠️ 未获取到用户信息', 'warn');
  }
  
  // 测试 showAlert
  try {
    showAlert('✅ 基础功能测试成功！\n\nSDK 版本: ' + tg.value.version);
    addLog('✅ showAlert 测试成功', 'success');
  } catch (error) {
    addLog('❌ showAlert 测试失败: ' + error.message, 'error');
  }
};

const testShare = () => {
  addLog('开始测试分享功能', 'info');
  
  if (!tg.value) {
    addLog('❌ Telegram WebApp 未初始化', 'error');
    showAlert('Telegram WebApp 未初始化');
    return;
  }
  
  const version = parseFloat(tg.value.version);
  addLog(`当前版本: ${version}`, 'info');
  
  if (version >= 6.7) {
    addLog('✅ 版本支持 switchInlineQuery', 'success');
    
    if (typeof tg.value.switchInlineQuery === 'function') {
      addLog('尝试调用 switchInlineQuery...', 'info');
      try {
        const result = shareToChat('测试分享', ['groups']);
        addLog(`switchInlineQuery 调用结果: ${result}`, result ? 'success' : 'error');
      } catch (error) {
        addLog('❌ switchInlineQuery 失败: ' + error.message, 'error');
      }
    } else {
      addLog('❌ switchInlineQuery 方法不存在', 'error');
    }
  } else {
    addLog('⚠️ 版本过低，使用备用方案', 'warn');
    
    if (typeof tg.value.openLink === 'function') {
      addLog('✅ openLink 可用', 'success');
      addLog('尝试调用 shareFallback...', 'info');
      try {
        const result = shareFallback('测试分享');
        addLog(`shareFallback 调用结果: ${result}`, result ? 'success' : 'error');
      } catch (error) {
        addLog('❌ shareFallback 失败: ' + error.message, 'error');
      }
    } else {
      addLog('❌ openLink 方法不存在', 'error');
      showAlert('❌ 没有可用的分享方法\n\n请更新 Telegram 到最新版本');
    }
  }
};

onMounted(() => {
  addLog('调试面板已加载', 'success');
  
  if (sdkLoaded.value) {
    addLog(`Telegram SDK 已加载 (v${version.value})`, 'success');
  } else {
    addLog('Telegram SDK 未加载', 'error');
  }
});
</script>

<style scoped>
.visual-debug {
  margin: 20px;
}

.debug-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2em;
}

h4 {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 1em;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.status-item {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
}

.status-label {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 5px;
}

.status-value {
  font-size: 1em;
  font-weight: 600;
  color: #333;
}

.status-value.success {
  color: #4caf50;
}

.status-value.error {
  color: #f44336;
}

.action-log {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.log-list {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  padding: 8px;
  margin-bottom: 5px;
  border-left: 3px solid #2196f3;
  background: white;
  border-radius: 4px;
  font-size: 0.9em;
}

.log-item.success {
  border-left-color: #4caf50;
  background: #f1f8f4;
}

.log-item.error {
  border-left-color: #f44336;
  background: #fef1f0;
}

.log-item.warn {
  border-left-color: #ff9800;
  background: #fff8f0;
}

.log-time {
  color: #999;
  font-size: 0.85em;
  margin-right: 8px;
}

.log-text {
  color: #333;
}

.log-empty {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.test-btn {
  flex: 1;
  min-width: 120px;
  padding: 10px 15px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.test-btn:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

.test-btn:active {
  transform: translateY(0);
}

.test-btn.clear {
  background: #ff5722;
}

.test-btn.clear:hover {
  background: #f44336;
}

@media (max-width: 600px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .test-buttons {
    flex-direction: column;
  }
  
  .test-btn {
    width: 100%;
  }
}
</style>
