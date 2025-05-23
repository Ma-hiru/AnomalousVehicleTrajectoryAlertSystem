<template>
  <motion.div
    class="video-container"
    @click="props.setActive(props.meta.id)"
    :whileHover="{
      scale: 1.05
    }">
    <video
      class="w-full video-js vjs-theme-city"
      :class="{ active: props.active }"
      ref="videoMse"
      autoplay
      muted
      controls />
    <div class="meta">
      <div>ID: {{ props.meta.id }}</div>
      <div>Name: {{ props.meta.name }}</div>
      <el-button v-show="props.active" size="small" link type="primary" @click="refresh"
        >刷新</el-button
      >
    </div>
  </motion.div>
</template>

<!--suppress ES6UnusedImports -->
<script setup lang="ts" name="Video">
  import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
  import { VideoStream } from "@/worker/VideoStream.ts";
  import { motion } from "motion-v";
  /* 组件属性定义 */
  const props = defineProps<{
    url: { stream: string; frame: string };
    active: boolean;
    setActive: (id: string | number) => void;
    meta: {
      id: string | number;
      name: string;
    };
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
  const refresh = () => {
    if (videoMse.value) {
      videoStream.value = new VideoStream(videoMse.value, props.url, props.meta.name);
      videoStream.value.play();
    }
  };
  defineExpose({
    refresh
  });
</script>

<style scoped lang="scss">
  .video-container {
    position: relative;

    video {
      transition: all 0.3s ease-in-out;
      border-radius: 1rem;
      border: 5px solid #999;
      overflow: hidden;

      &.active {
        border: 5px solid palevioletred;
      }
    }

    .meta {
      display: none;
    }

    &:hover {
      .meta {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2px;
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
