<template>
  <a-split class="video-split" v-model:size="size" min="0.2" max="0.8" direction="vertical">
    <template #resize-trigger>
      <div class="trigger">
        <span />
      </div>
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
      background: #999999;
      margin: auto;
      width: 98%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;

      span {
        height: 0.15rem;
        background: #ffffff;
        border-radius: 0.1rem;
        width: 3rem;
        margin: 2px;
      }
    }
  }
</style>
