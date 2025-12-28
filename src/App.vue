<script setup>

import {onMounted, ref} from "vue";

const info = ref(null)
onMounted(() => {
  const hash = window.location.hash; // 得到类似“#?tgWebAppData=xxxx”
  const queryParams = new URLSearchParams(hash.substring(hash.indexOf('?')));
  const rawInitData = queryParams.get('tgWebAppData'); // 这是您需要的原始字符串
  info.value = rawInitData;
})
</script>

<template>
  <div>
    {{info}}
  </div>
</template>

<style scoped>

</style>
