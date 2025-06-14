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
  import { useStreamStore } from "@/stores/pinia/modules/streamStore";
  import { onMounted, onUnmounted } from "vue";
  import { ReqRecords, ReqVideoList } from "@/api/mock";

  const streamStore = useStreamStore();
  let timer: ReturnType<typeof setInterval>;
  onMounted(() => {
    GetVideoList();
    timer = UpdateRecord();
  });
  onUnmounted(() => {
    clearInterval(timer);
  });
  const GetVideoList = () => {
    //TODO Mock getList
    streamStore.GetStreamList(ReqVideoList());
  };
  const UpdateRecord = () => {
    //TODO Mock UpdateRecord
    timer && clearInterval(timer);
    return setInterval(() => {
      streamStore.UpdateRecord(ReqRecords());
    }, 1500);
  };
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
