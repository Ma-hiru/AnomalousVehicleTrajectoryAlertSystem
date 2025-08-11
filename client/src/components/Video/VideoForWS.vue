<template>
  <el-tooltip
    effect="dark"
    placement="top"
    :content="`${props.meta.streamName}(${props.meta.streamId})`">
    <motion.div
      class="video-container"
      @mouseover="streamStore.set_active_stream(props.meta)"
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
  import { VideoStreamByWS } from "@/worker/stream";
  import { motion } from "motion-v";
  import { RefreshRight } from "@element-plus/icons-vue";
  import { useStreamStore } from "@/stores/pinia";

  const streamStore = useStreamStore();
  const props = defineProps<{
    url: { stream: string; frame: string };
    meta: VideoStreamInfo;
  }>();
  const showControls = ref(false);
  const videoMse = useTemplateRef("videoMse");
  const videoStream = ref<VideoStreamByWS>();

  function refresh() {
    destroy();
    init();
  }

  function init() {
    if (videoMse.value) {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => {
          videoMse.value &&
            (videoStream.value = new VideoStreamByWS(videoMse.value, {
              ...props.url,
              ...props.meta
            }));
        });
      } else {
        videoStream.value = new VideoStreamByWS(videoMse.value, {
          ...props.url,
          ...props.meta
        });
      }
    }
  }

  function destroy() {
    videoStream.value && videoStream.value.destroy();
    videoStream.value = undefined;
  }

  function listenPlaying() {
    let lastTime = 0;
    let timer: NodeJS.Timeout;
    return [
      () =>
        (timer = setInterval(() => {
          if (videoMse.value) {
            const currentTime = videoMse.value.currentTime;
            if (currentTime === lastTime) refresh();
            else lastTime = currentTime;
          }
        }, 5000)),
      () => clearInterval(timer)
    ];
  }

  const [listener, clearListener] = listenPlaying();

  onMounted(init);
  onMounted(listener);
  onUnmounted(destroy);
  onUnmounted(clearListener);
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

    .cover {
      position: absolute;
      inset: 0;
      z-index: 1000;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
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
