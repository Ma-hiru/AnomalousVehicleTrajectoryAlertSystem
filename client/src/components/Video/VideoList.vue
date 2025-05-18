<template>
  <div class="bg-gray-200 grid grid-cols-2 justify-items-center">
    <!-- WebRTC方式播放视频组件 -->
    <!--    <VideoForWebRTC :width="styles.videoItem.width"-->
    <!--           :url="urlList[0]"-->
    <!--           :meta="{id:i,name:'test'+i}"-->
    <!--           v-for="i in 1"-->
    <!--           :key="i"-->
    <!--    />-->
    <!-- WebSocket方式播放视频组件 -->
    <VideoForWS width="500px"
                 :url="urlList[0]"
                 :meta="{id:i,name:'ffmpeg'}"
                 v-for="i in 1"
                 :key="i" />
  </div>
</template>

<script setup lang="ts" name='VideoList'>
  import { ref } from "vue";
  import VideoForWS from "@/components/Video/VideoForWS.vue";
  import AppSettings from "@/settings";

  // 视频流地址列表 - 连接到go2rtc的WebSocket端点
  // go2rtc是一个用于转发和转码各种视频源(RTSP/ONVIF/RTMP等)的服务
  const urlList = ref([AppSettings.GetStreamURL("ffmpeg")]);

</script>

<style scoped lang="scss">

</style>
