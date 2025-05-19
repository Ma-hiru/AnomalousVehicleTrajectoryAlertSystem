<template>
  <div class="video-container">
    <video
      class="w-full"
      ref="videoMse"
      autoplay muted controls
    />
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
    url: { stream: string; frame: string };
    meta: {
      id: string | number;
      name: string;
    }
  }>();

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
    position: relative;

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
