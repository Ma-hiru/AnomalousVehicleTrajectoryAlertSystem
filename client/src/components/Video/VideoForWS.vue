<template>
  <div>
    <el-tooltip
      :effect="isDark ? `dark` : `light`"
      placement="top"
      :content="`ID:${props.meta.id}-Name:${props.meta.name}`">
      <motion.div
        class="video-container"
        @click="props.setActive(props.meta.id)"
        :whileHover="{
          scale: 1.05
        }"
        @mouseenter="showControls = true"
        @mouseleave="showControls = false">
        <video
          class="w-full"
          ref="videoMse"
          :class="{ active: props.active }"
          :autoplay="true"
          :muted="true"
          :controls="showControls" />
        <div class="meta">
          <el-button
            size="large"
            circle
            style="background: rgba(255,255,255,0.5);"
            @click="refresh"
            @mouseenter="showControls = false"
            @mouseleave="showControls = true"
            :icon="RefreshRight" />
        </div>
      </motion.div>
    </el-tooltip>
  </div>
</template>

<!--suppress ES6UnusedImports -->
<script setup lang="ts" name="Video">
  import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
  import { VideoStreamWithWS } from "@/worker/VideoStream";
  import { motion } from "motion-v";
  import { useDarkModeVue } from "@/hooks/useDarkMode";
  import { RefreshRight } from "@element-plus/icons-vue";
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
  const [isDark] = useDarkModeVue();
  const showControls = ref(false);
  const videoMse = useTemplateRef("videoMse");
  const videoStream = ref<VideoStreamWithWS>();
  onMounted(() => {
    if (videoMse.value) {
      videoStream.value = new VideoStreamWithWS(videoMse.value, props.url, props.meta.name);
      videoStream.value.play();
    }
  });
  onUnmounted(() => {
    videoStream.value?.stop();
  });
  const refresh = () => {
    if (videoMse.value) {
      videoStream.value?.stop();
      videoStream.value = new VideoStreamWithWS(videoMse.value, props.url, props.meta.name);
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
      border-radius: 0.5rem;
      border: 5px solid #999;
      overflow: hidden;
      background: rgba(255,255,255,0.2);
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
