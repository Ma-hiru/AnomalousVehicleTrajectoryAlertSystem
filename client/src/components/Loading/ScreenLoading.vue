<template>
  <div class="screen-loading" ref="appRef">
    <div class="bg">
      <dv-loading v-if="loading">Loading...</dv-loading>
      <slot v-else name="default" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from "vue";
  import useDraw from "@/utils/useDraw";

  const loading = ref<boolean>(true);
  const cancelLoading = () => {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  };
  const { appRef, calcRate, windowDraw, unWindowDraw } = useDraw();
  onMounted(() => {
    cancelLoading();
    windowDraw();
    calcRate();
  });
  onUnmounted(() => {
    unWindowDraw();
  });
</script>

<style lang="scss" scoped>
  .screen-loading {
    color: #d3d6dd;
    width: 1920px;
    height: 1080px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: left top;

    .bg {
      width: 100%;
      height: 100%;
      padding: 16px 16px 0 16px;
      background-image: url("/layout/pageBg.png");
      background-size: cover;
      background-position: center center;
    }
  }
</style>
