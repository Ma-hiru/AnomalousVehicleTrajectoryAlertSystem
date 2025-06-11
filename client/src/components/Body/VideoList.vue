<template>
  <OnEnter mode="FromBottom" :duration="0.8">
    <div class="video-list-container">
      <VideoInfo class="info" />
      <dv-border-box7 style="margin-top: 20px">
        <div class="content">
          <VideoModule />
        </div>
      </dv-border-box7>
    </div>
  </OnEnter>
</template>

<script setup lang="ts" name="VideoList">
  import OnEnter from "@/components/Ani/OnEnter.vue";
  import VideoModule from "@/components/Video/VideoModule.vue";
  import VideoInfo from "@/components/Body/VideoInfo.vue";
</script>

<style scoped lang="scss">
  .video-list-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;

    .info {
      width: 100%;
    }

    .content {
      width: 100%;
      max-height: 740px;
      overflow-y: scroll;
      scrollbar-width: none;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      overflow-x: hidden;
      gap: 15px;
      padding: 10px;
    }
  }
</style>
