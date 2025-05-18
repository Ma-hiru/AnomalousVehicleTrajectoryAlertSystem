<template>
  <div class="relative video-container">
    <!-- 视频播放元素 -->
    <video ref="videoMse"
           class="relative"
           :style="styles.videoStyle"
           autoplay muted controls
    />
    <!-- 视频元数据信息，鼠标悬停时显示 -->
    <div class="meta">
      <div>ID: {{ props.meta.id }}</div>
      <div>Name: {{ props.meta.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts" name='Video'>
  import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
  import { VideoStream } from "@/worker/VideoStream.ts";

  /* 组件属性定义 */
  const props = defineProps<{
    width: string;          // 视频宽度
    url: { stream: string; frame: string };            // WebSocket URL
    meta: {                 // 视频元数据
      id: string | number;
      name: string;
    }
  }>();
  const styles = {
    videoStyle: {
      width: props.width,
      height: "auto",
      margin: "10px"
    }
  };
  const videoMse = useTemplateRef("videoMse");
  const videoStream = ref<VideoStream>();
  onMounted(() => {
    if (videoMse.value) {
      videoStream.value = new VideoStream(videoMse.value, props.url, props.meta.name);
      videoStream.value.play();
    }
  });
  onUnmounted(() => {
    videoStream.value?.stop();
  });
</script>

<style scoped lang="scss">
  .video-container {
    .meta {
      display: none;
    }

    &:hover {
      .meta {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: start;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        color: red;
      }
    }
  }
</style>
