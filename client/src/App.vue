<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts" name="App">
  import init, { greet } from "@/wasm/pkg";

  init().then(() => {
    greet("JavaScript");
  });
</script>

<style scoped lang="scss">
  .app-container {
    width: 100vw;
    height: 100vh;
    background-color: #020308;
    overflow: hidden;
  }
</style>
