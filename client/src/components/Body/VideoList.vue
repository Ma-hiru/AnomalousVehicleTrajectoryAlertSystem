<template>
  <OnEnter mode="FromBottom" :duration="0.8">
    <div class="video-list-container">
      <VideoModule />
    </div>
  </OnEnter>
</template>

<script setup lang="ts" name="VideoList">
  import OnEnter from "@/components/Ani/OnEnter.vue";
  import VideoModule from "@/components/Video/VideoModule.vue";
</script>

<style scoped lang="scss">
  .video-list-container {
    width: 100%;
    height: 100%;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(150px, 1fr));
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
    gap: 10px;
    padding: 10px;
  }
</style>
