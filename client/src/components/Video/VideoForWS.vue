<template>
  <el-tooltip
    effect="dark"
    placement="top"
    :content="`${props.meta.streamName}(${props.meta.streamId})`">
    <motion.div
      class="video-container"
      @mouseover="streamStore.SetActiveStream(props.meta)"
      :whileHover="{
        scale: 1.05
      }"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false">
      <video
        class="w-full"
        ref="videoMse"
        :class="{ active: streamStore.ActiveStream.streamId === meta.streamId }"
        :autoplay="true"
        :muted="true"
        :controls="showControls" />
      <div class="meta">
        <el-button
          size="large"
          circle
          style="background: rgba(255, 255, 255, 0.5)"
          @click="refresh"
          @mouseenter="showControls = false"
          @mouseleave="showControls = true"
          :icon="RefreshRight" />
      </div>
    </motion.div>
  </el-tooltip>
</template>

<!--suppress ES6UnusedImports -->
<script setup lang="ts" name="Video">
  import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
  import { VideoStreamWithWS } from "@/worker/VideoStream";
  import { motion } from "motion-v";
  import { RefreshRight } from "@element-plus/icons-vue";
  import { useStreamStore } from "@/stores/pinia/modules/streamStore";

  const streamStore = useStreamStore();
  /* 组件属性定义 */
  const props = defineProps<{
    url: { stream: string; frame: string };
    meta: VideoStreamInfo;
  }>();
  const showControls = ref(false);
  const videoMse = useTemplateRef("videoMse");
  const videoStream = ref<VideoStreamWithWS>();
  onMounted(() => {
    if (videoMse.value) {
      videoStream.value = new VideoStreamWithWS(videoMse.value, props.url, props.meta);
    }
  });
  onUnmounted(() => {
    videoStream.value?.stop();
  });
  const refresh = () => {
    if (videoMse.value) {
      videoStream.value?.stop();
      videoStream.value = new VideoStreamWithWS(videoMse.value, props.url, props.meta);
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
      border-radius: 0.5rem;
      border: 5px solid #999;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);

      &.active {
        border: 5px solid #ffffff;
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
