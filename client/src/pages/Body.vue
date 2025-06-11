<template>
  <div class="body-container">
    <div class="content">
      <TotalCharts />
      <VideoList />
      <PointCharts />
    </div>
  </div>
</template>

<script setup lang="ts" name="Body">
  import PointCharts from "@/components/Body/PointCharts.vue";
  import VideoList from "@/components/Body/VideoList.vue";
  import TotalCharts from "@/components/Body/TotalCharts.vue";
</script>

<style scoped lang="scss">
  .body-container {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;

    .content {
      display: grid;
      height: 100%;
      width: 100%;
      grid-template-columns: 2fr 3fr 2fr;
    }
  }
</style>
