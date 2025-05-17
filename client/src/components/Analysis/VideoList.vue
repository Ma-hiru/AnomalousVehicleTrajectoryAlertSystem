<template>
  <div class="bg-gray-200 grid grid-cols-2 justify-items-center items-center"
       :style="styles.container">
    <!-- WebRTC方式播放视频组件 -->
<!--    <VideoForWebRTC :width="styles.videoItem.width"-->
<!--           :url="urlList[0]"-->
<!--           :meta="{id:i,name:'test'+i}"-->
<!--           v-for="i in 1"-->
<!--           :key="i"-->
<!--    />-->
    <!-- WebSocket方式播放视频组件 -->
    <VideoForWS1 :width="styles.videoItem.width"
            :url="urlList[0]"
            :meta="{id:i,name:'test'+i}"
            v-for="i in 1"
            :key="i" />
  </div>
</template>

<script setup lang="ts" name='VideoList'>
  // 注意: 这里错误地从React导入了CSSProperties，在Vue项目中应该使用Vue的类型定义
  import { CSSProperties } from "react";
  // import VideoForWebRTC from "@/components/Analysis/VideoForWebRTC.vue";
  import { ref } from "vue";
  import VideoForWS1 from "@/components/Analysis/VideoForWS1.vue";

  // 接收容器样式属性
  const props = defineProps<{
    containerStyle: CSSProperties
  }>();

  // 视频流地址列表 - 连接到go2rtc的WebSocket端点
  // go2rtc是一个用于转发和转码各种视频源(RTSP/ONVIF/RTMP等)的服务
  const urlList = ref(["ws://127.0.0.1:8080/api/go2rtc/ws?src=ffmpeg"]);

  // 合并样式
  const styles = {
    container: {
      ...props.containerStyle
    },
    videoItem: {
      width: "95%" // 视频占容器95%宽度
    }
  };
</script>

<style scoped lang="scss">

</style>
