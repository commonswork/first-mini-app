<script setup>

import {onMounted, ref} from "vue";

const info = ref(null)
onMounted(() => {
  info.value = window.location.toString()
  console.log(info.value)
})
</script>

<template>
  <div>
    url =
    {{info}}
  </div>
</template>

<style scoped>

</style>
