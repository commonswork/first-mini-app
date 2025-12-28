<template>
  <div class="telegram-info">
    <h2>Telegram Web App 信息</h2>
    
    <!-- 用户信息 -->
    <section v-if="user" class="info-section">
      <h3>👤 用户信息</h3>
      <div class="info-card">
        <div v-if="user.photo_url" class="user-avatar">
          <img :src="user.photo_url" alt="用户头像" />
        </div>
        <div class="info-item">
          <span class="label">ID:</span>
          <span class="value">{{ user.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">姓名:</span>
          <span class="value">{{ user.first_name }} {{ user.last_name }}</span>
        </div>
        <div class="info-item" v-if="user.username">
          <span class="label">用户名:</span>
          <span class="value">@{{ user.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">语言:</span>
          <span class="value">{{ user.language_code }}</span>
        </div>
      </div>
    </section>

    <!-- 应用信息 -->
    <section v-if="appData" class="info-section">
      <h3>📱 应用信息</h3>
      <div class="info-card">
        <div class="info-item">
          <span class="label">版本:</span>
          <span class="value">{{ appData.tgWebAppVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">平台:</span>
          <span class="value">{{ appData.tgWebAppPlatform }}</span>
        </div>
        <div class="info-item" v-if="appData.tgWebAppData">
          <span class="label">聊天类型:</span>
          <span class="value">{{ appData.tgWebAppData.chat_type }}</span>
        </div>
        <div class="info-item" v-if="appData.tgWebAppData">
          <span class="label">认证时间:</span>
          <span class="value">{{ formatAuthDate(appData.tgWebAppData.auth_date) }}</span>
        </div>
      </div>
    </section>

    <!-- 主题信息 -->
    <section v-if="theme" class="info-section">
      <h3>🎨 主题配置</h3>
      <div class="info-card theme-colors">
        <div class="color-item" v-for="(color, key) in theme" :key="key">
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
        <summary>点击查看完整 JSON</summary>
        <pre>{{ JSON.stringify({ user, appData, theme }, null, 2) }}</pre>
      </details>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { parseTelegramWebAppUrl, getTelegramUser, getTelegramTheme } from '../utils/urlParser.js';

const user = ref(null);
const appData = ref(null);
const theme = ref(null);

onMounted(() => {
  user.value = getTelegramUser();
  appData.value = parseTelegramWebAppUrl();
  theme.value = getTelegramTheme();
});

const formatAuthDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
};

const formatThemeKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
</script>

<style scoped>
.telegram-info {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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
</style>
