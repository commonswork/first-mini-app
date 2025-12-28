<template>
  <div class="console-logger" v-if="enabled">
    <div class="console-header">
      <span class="console-title">📋 调试日志</span>
      <div class="console-actions">
        <button @click="clearLogs" class="console-btn clear">清空</button>
        <button @click="toggleExpand" class="console-btn">
          {{ expanded ? '收起' : '展开' }}
        </button>
        <button @click="enabled = false" class="console-btn close">×</button>
      </div>
    </div>
    
    <div v-if="expanded" class="console-body">
      <div class="console-logs" ref="logsContainer">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-entry', `log-${log.type}`]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.typeLabel }}</span>
          <span class="log-message">{{ log.message }}</span>
          <pre v-if="log.data" class="log-data">{{ log.data }}</pre>
        </div>
        
        <div v-if="logs.length === 0" class="log-empty">
          暂无日志
        </div>
      </div>
    </div>
  </div>
  
  <!-- 浮动按钮 -->
  <button v-if="!enabled" @click="enabled = true" class="console-fab">
    📋
  </button>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const enabled = ref(true);
const expanded = ref(true);
const logs = ref([]);
const logsContainer = ref(null);

const addLog = (type, message, data = null) => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const typeLabels = {
    log: 'LOG',
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    success: 'SUCCESS'
  };
  
  logs.value.push({
    type,
    typeLabel: typeLabels[type] || 'LOG',
    message,
    data: data ? JSON.stringify(data, null, 2) : null,
    time
  });
  
  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value.shift();
  }
  
  // 自动滚动到底部
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
    }
  });
};

const clearLogs = () => {
  logs.value = [];
  addLog('info', '日志已清空');
};

const toggleExpand = () => {
  expanded.value = !expanded.value;
};

// 拦截 console 方法
onMounted(() => {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.log = function(...args) {
    originalLog.apply(console, args);
    addLog('log', args.map(a => String(a)).join(' '));
  };
  
  console.info = function(...args) {
    originalInfo.apply(console, args);
    addLog('info', args.map(a => String(a)).join(' '));
  };
  
  console.warn = function(...args) {
    originalWarn.apply(console, args);
    addLog('warn', args.map(a => String(a)).join(' '));
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    addLog('error', args.map(a => String(a)).join(' '));
  };
  
  // 添加自定义方法
  window.logSuccess = function(...args) {
    originalLog.apply(console, args);
    addLog('success', args.map(a => String(a)).join(' '));
  };
  
  addLog('success', '调试日志已启动');
});

// 暴露方法供外部使用
defineExpose({
  addLog,
  clearLogs
});
</script>

<style scoped>
.console-logger {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  color: #fff;
  z-index: 10000;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid #333;
}

.console-title {
  font-weight: bold;
  font-size: 14px;
}

.console-actions {
  display: flex;
  gap: 8px;
}

.console-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.console-btn:hover {
  background: #444;
}

.console-btn.clear {
  background: #ff5722;
}

.console-btn.clear:hover {
  background: #f44336;
}

.console-btn.close {
  background: #f44336;
  padding: 4px 12px;
  font-size: 16px;
  line-height: 1;
}

.console-body {
  max-height: 300px;
  overflow: hidden;
}

.console-logs {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.log-entry {
  padding: 6px 8px;
  margin-bottom: 4px;
  border-left: 3px solid #666;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  word-wrap: break-word;
}

.log-entry.log-log {
  border-left-color: #2196f3;
}

.log-entry.log-info {
  border-left-color: #00bcd4;
}

.log-entry.log-warn {
  border-left-color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.log-entry.log-error {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.log-entry.log-success {
  border-left-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.log-time {
  color: #888;
  margin-right: 8px;
  font-size: 11px;
}

.log-type {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  margin-right: 8px;
}

.log-log .log-type {
  background: #2196f3;
}

.log-info .log-type {
  background: #00bcd4;
}

.log-warn .log-type {
  background: #ff9800;
}

.log-error .log-type {
  background: #f44336;
}

.log-success .log-type {
  background: #4caf50;
}

.log-message {
  color: #fff;
}

.log-data {
  margin: 8px 0 0 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
  color: #4caf50;
}

.log-empty {
  text-align: center;
  color: #666;
  padding: 20px;
}

.console-fab {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #2196f3;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
}

.console-fab:hover {
  background: #1976d2;
  transform: scale(1.1);
}

.console-fab:active {
  transform: scale(0.95);
}

/* 滚动条样式 */
.console-logs::-webkit-scrollbar {
  width: 8px;
}

.console-logs::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.console-logs::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.console-logs::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
