<template>
  <div class="h-full">
    <VideoList />
    <VideoCharts />
  </div>
</template>

<script setup lang="ts" name="VideoModule">

  import VideoList from "@/components/Video/VideoList.vue";
  import VideoCharts from "@/components/Charts/VideoCharts.vue";
</script>

<style scoped lang="scss">

</style>
