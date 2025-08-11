<template>
  <div class="app-container">
    <router-view />
    <!-- 内存调试面板 (仅在开发环境显示) -->
    <MemoryDebugPanel v-if="isDev" />
  </div>
</template>

<script setup lang="ts" name="App">
  import MemoryDebugPanel from "@/components/Debug/MemoryDebugPanel.vue";

  // 仅在开发环境显示内存调试面板
  const isDev = import.meta.env.DEV;
</script>

<style scoped lang="scss">
  .app-container {
    width: 100vw;
    height: 100vh;
    background-color: #020308;
    overflow: hidden;
  }
</style>
