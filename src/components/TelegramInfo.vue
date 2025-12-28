<template>
  <div class="telegram-info">
    <h2>Telegram Web App 信息</h2>
    
    <div v-if="!isReady" class="loading">
      <p>正在加载 Telegram SDK...</p>
    </div>

    <!-- 用户信息 -->
    <section v-if="displayUser" class="info-section">
      <h3>👤 用户信息</h3>
      <div class="info-card">
        <div v-if="displayUser.photo_url" class="user-avatar">
          <img :src="displayUser.photo_url" alt="用户头像" />
        </div>
        <div class="info-item">
          <span class="label">ID:</span>
          <span class="value">{{ displayUser.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">姓名:</span>
          <span class="value">{{ displayUser.first_name }} {{ displayUser.last_name }}</span>
        </div>
        <div class="info-item" v-if="displayUser.username">
          <span class="label">用户名:</span>
          <span class="value">@{{ displayUser.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">语言:</span>
          <span class="value">{{ displayUser.language_code }}</span>
        </div>
        <div class="info-item" v-if="displayUser.is_premium">
          <span class="label">Premium:</span>
          <span class="value">✨ 是</span>
        </div>
      </div>
    </section>

    <!-- 聊天信息 -->
    <section class="info-section">
      <h3>💬 聊天信息</h3>
      <div class="info-card">
        <div class="info-item">
          <span class="label">聊天类型:</span>
          <span class="value">{{ getChatType() }}</span>
        </div>
        <div v-if="chat" class="info-item">
          <span class="label">Chat ID:</span>
          <span class="value">{{ chat.id }}</span>
        </div>
        <div v-else-if="displayUser && getChatType() === 'private'" class="info-item">
          <span class="label">Chat ID (私聊):</span>
          <span class="value">{{ displayUser.id }} <span class="hint">（私聊时 chat_id = user_id）</span></span>
        </div>
        <div class="info-item" v-if="chat?.title">
          <span class="label">聊天标题:</span>
          <span class="value">{{ chat.title }}</span>
        </div>
        <div class="info-item" v-if="chat?.username">
          <span class="label">聊天用户名:</span>
          <span class="value">@{{ chat.username }}</span>
        </div>
        <div class="info-item" v-if="getChatInstance()">
          <span class="label">Chat Instance:</span>
          <span class="value">{{ getChatInstance() }} <span class="hint">（群组上下文唯一标识）</span></span>
        </div>
        <div class="info-item" v-if="getStartParam()">
          <span class="label">Start Param:</span>
          <span class="value">{{ getStartParam() }}</span>
        </div>
        <div v-if="!chat && getChatType() === 'private'" class="info-note">
          ℹ️ 私聊场景下，chat 对象为空是正常的。可以使用 user.id 作为 chat_id。
        </div>
      </div>
    </section>

    <!-- 应用信息 -->
    <section v-if="isReady" class="info-section">
      <h3>📱 应用信息</h3>
      <div class="info-card">
        <div class="info-item">
          <span class="label">版本:</span>
          <span class="value">{{ tg.version }}</span>
        </div>
        <div class="info-item">
          <span class="label">平台:</span>
          <span class="value">{{ tg.platform }}</span>
        </div>
        <div class="info-item">
          <span class="label">聊天类型:</span>
          <span class="value">{{ getChatType() }}</span>
        </div>
        <div class="info-item" v-if="initDataUnsafe?.auth_date">
          <span class="label">认证时间:</span>
          <span class="value">{{ formatAuthDate(initDataUnsafe.auth_date) }}</span>
        </div>
        <div class="info-item" v-if="initDataUnsafe?.query_id">
          <span class="label">Query ID:</span>
          <span class="value">{{ initDataUnsafe.query_id }}</span>
        </div>
      </div>
    </section>

    <!-- 主题信息 -->
    <section v-if="displayTheme" class="info-section">
      <h3>🎨 主题配置</h3>
      <div class="info-card theme-colors">
        <div class="color-item" v-for="(color, key) in displayTheme" :key="key">
          <span class="color-label">{{ formatThemeKey(key) }}:</span>
          <div class="color-display">
            <span class="color-box" :style="{ backgroundColor: color }"></span>
            <span class="color-value">{{ color }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 原始数据 -->
    <section class="info-section">
      <h3>📋 原始数据</h3>
      <details class="raw-data">
        <summary>点击查看完整 JSON (SDK)</summary>
        <pre>{{ JSON.stringify({ user: displayUser, chat, initDataUnsafe, themeParams: displayTheme }, null, 2) }}</pre>
      </details>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTelegram } from '../composables/useTelegram.js';
import { parseTelegramWebAppUrl } from '../utils/urlParser.js';

const { 
  user, 
  chat, 
  initDataUnsafe, 
  themeParams, 
  isReady, 
  tg,
  shareToChat,
  getChatInstance,
  getStartParam
} = useTelegram();
const urlData = ref(null);

// 从 URL 解析的数据（作为备用）
urlData.value = parseTelegramWebAppUrl();

// 合并 SDK 和 URL 解析的数据
const displayUser = computed(() => user.value || urlData.value?.tgWebAppData?.user);
const displayTheme = computed(() => themeParams.value || urlData.value?.tgWebAppThemeParams);

const formatAuthDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
};

const formatThemeKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getChatType = () => {
  if (chat.value) {
    return chat.value.type;
  }
  return initDataUnsafe.value?.chat_type || urlData.value?.tgWebAppData?.chat_type || '未知';
};

// 获取有效的 chat_id
const getEffectiveChatId = () => {
  if (chat.value) {
    return chat.value.id;
  }
  // 私聊场景下，使用 user_id 作为 chat_id
  if (getChatType() === 'private' && displayUser.value) {
    return displayUser.value.id;
  }
  return null;
};
</script>

<style scoped>
.telegram-info {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1em;
}

h2 {
  color: #168acd;
  margin-bottom: 30px;
  text-align: center;
}

.info-section {
  margin-bottom: 30px;
}

h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.user-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #40a7e3;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #333;
  text-align: right;
}

.theme-colors {
  display: grid;
  gap: 12px;
}

.color-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-label {
  font-size: 0.9em;
  color: #666;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #ddd;
  display: inline-block;
}

.color-value {
  font-family: monospace;
  font-size: 0.9em;
  color: #333;
}

.raw-data {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
}

.raw-data summary {
  font-weight: 600;
  color: #168acd;
  user-select: none;
}

.raw-data pre {
  margin-top: 15px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85em;
  line-height: 1.5;
}

.hint {
  font-size: 0.85em;
  color: #999;
  font-style: italic;
}

.info-note {
  padding: 12px;
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
  border-radius: 4px;
  font-size: 0.9em;
  color: #1976d2;
  margin-top: 10px;
}
</style>
