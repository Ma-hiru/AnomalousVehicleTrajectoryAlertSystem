<template>
  <div class="body-container">
    <PointCharts />
    <VideoList />
    <TotalCharts />
  </div>
</template>

<script setup lang="ts" name="Body">
  import PointCharts from "@/components/Body/PointCharts.vue";
  import VideoList from "@/components/Body/VideoList.vue";
  import TotalCharts from "@/components/Body/TotalCharts.vue";
</script>

<style scoped lang="scss">
  .body-container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
  }
</style>
