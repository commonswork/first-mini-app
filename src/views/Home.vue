<template>
  <div >
    <div class="space-y-4">
      <MacCompatibilityTest />
      <DebugInfo />
      <TelegramInfo />
    </div>
  </div>
</template>

<script setup>
import TelegramInfo from '../components/TelegramInfo.vue'
import DebugInfo from '../components/DebugInfo.vue'
import MacCompatibilityTest from '../components/MacCompatibilityTest.vue'
</script>
