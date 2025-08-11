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
        <Tips tips="No Videos" />
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
  import { UPDATE_RECORDS_INTERVAL } from "@/settings/settings.streams";
  import Tips from "@/components/Tips.vue";
  import { memoryMonitor } from "@/utils/memoryMonitor";

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
        ok && (timer = StartUpdate());
      });
  });
  onUnmounted(() => {
    timer && clearInterval(timer);
  });

  function StartUpdate() {
    timer && clearInterval(timer);
    return setInterval(Update, UPDATE_RECORDS_INTERVAL);
  }

  // 清理计数器
  let cleanupCounter = 0;

  function Update() {
    streamStore.GetTotalRecords();
    streamStore.GetSingleRecords(streamStore.ActiveStream.streamId);
    streamStore.GetTotalExceptionsCount();
    streamStore.GetTotalCategory();
    streamStore.GetSingleCategory(streamStore.ActiveStream.streamId);
    streamStore.GetTotalCategoryByTime(1, startTime);
    streamStore.GetAnomalousCount();

    // 每10次更新执行一次内存清理和监控
    cleanupCounter++;
    if (cleanupCounter >= 10) {
      streamStore.performPeriodicCleanup();

      // 仅在开发环境记录内存信息
      if (import.meta.env.DEV) {
        const snapshot = memoryMonitor.takeSnapshot();
        if (snapshot.memory) {
          console.log(
            `🧹 Memory cleanup - Current: ${(snapshot.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB, Total: ${(snapshot.memory.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB`
          );
        }
      }

      cleanupCounter = 0;
    }
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
  }
</style>
