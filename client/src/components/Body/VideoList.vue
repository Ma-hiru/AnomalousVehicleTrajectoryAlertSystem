<template>
  <OnEnter mode="FromBottom" :duration="0.8" :delay="1.4">
    <div class="video-list-container">
      <VideoInfo class="info" />
      <dv-border-box7 style="margin-top: 20px" v-if="streamStore.StreamList.length">
        <div class="content">
          <VideoModule />
        </div>
      </dv-border-box7>
      <dv-border-box7 style="margin-top: 20px" v-else>
        <div class="tips">No Streams</div>
      </dv-border-box7>
    </div>
  </OnEnter>
</template>

<script setup lang="ts" name="VideoList">
  import OnEnter from "@/components/Ani/OnEnter.vue";
  import VideoModule from "@/components/Video/VideoModule.vue";
  import VideoInfo from "@/components/Body/VideoInfo.vue";
  import { onMounted, onUnmounted } from "vue";
  import { useStreamStore } from "@/stores/pinia";

  const streamStore = useStreamStore();
  const startTime = new Date().getTime();
  let timer: ReturnType<typeof setInterval>;
  onMounted(() => {
    streamStore
      .GetActionsEnum()
      .then((ok: boolean | Promise<boolean>) => {
        ok && (ok = streamStore.GetVideoList());
        return ok;
      })
      .then((ok) => {
        ok && (timer = UpdateRecord());
      });
  });
  onUnmounted(() => {
    clearInterval(timer);
  });

  function UpdateRecord() {
    timer && clearInterval(timer);
    return setInterval(() => {
      streamStore.GetTotalRecords();
      streamStore.GetTotalCategory();
      streamStore.GetTotalCategoryByTime(1, startTime);
    }, 3000);
  }
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

    .tips {
      font-size: 24px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: title, sans-serif;
      text-align: center;
      color: white;
    }
  }
</style>
