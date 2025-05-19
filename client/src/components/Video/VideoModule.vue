<template>
  <a-split class="video-split" v-model:size="size" min="0.2" max="0.8" direction="vertical">
    <template #resize-trigger-icon>
      <span class="trigger" />
    </template>
    <template #first>
      <VideoList />
    </template>
    <template #second>
      <VideoCharts />
    </template>
  </a-split>
</template>

<script setup lang="ts" name="VideoModule">
  import VideoList from "@/components/Video/VideoList.vue";
  import VideoCharts from "@/components/Charts/VideoCharts.vue";
  import { ref } from "vue";

  const size = ref(0.7);
</script>

<style scoped lang="scss">
  .video-split {
    height: 100%;
    width: 100%;

    .trigger {
      height: 0.15rem;
      background: #999;
      border-radius: 0.1rem;
      width: 3rem;
      margin: 2px;
    }
  }
</style>
