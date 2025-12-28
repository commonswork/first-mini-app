<script setup>

import {onMounted, ref} from "vue";

const info = ref(null)
onMounted(() => {
  info.value = window.location
})
</script>

<template>
  <div>
    {{info}}
  </div>
</template>

<style scoped>

</style>
