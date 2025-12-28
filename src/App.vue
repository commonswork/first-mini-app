<script setup>
import TelegramInfo from './components/TelegramInfo.vue';
import ShareButton from './components/ShareButton.vue';
</script>

<template>
  <div class="app">
    <ShareButton />
    <TelegramInfo />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}
</style>
