<script setup>
import TelegramInfo from './components/TelegramInfo.vue';
import ShareButton from './components/ShareButton.vue';
import DebugInfo from './components/DebugInfo.vue';
import ConsoleLogger from './components/ConsoleLogger.vue';
import VisualDebug from './components/VisualDebug.vue';
</script>

<template>
  <div class="app">
    <VisualDebug />
    <ShareButton />
    <TelegramInfo />
    <DebugInfo />
    <ConsoleLogger />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}
</style>
