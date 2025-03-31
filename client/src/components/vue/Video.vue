<template>
  <div class="relative video-container">
    <video ref="videoMse"
           class="relative"
           :style="styles.videoStyle"
           autoplay muted controls
    />
    <div class="meta">
      <div>ID: {{ props.meta.id }}</div>
      <div>Name: {{ props.meta.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts" name='Video'>
import { ref, onMounted, onUnmounted } from "vue";
import { BUFFER_MAX_DURATION, MAX_QUEUE_LENGTH } from "@/settings.ts";

/* 参数 */
const props = defineProps<{
  width: string;
  url: string;
  meta: {
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
/* 全局实例 */
let mediaSource: MediaSource | null = null;
let ws: WebSocket | null = null;
const videoMse = ref<HTMLVideoElement>();
const mseSourceBuffer = ref<SourceBuffer>();
const mseQueue = ref<Array<ArrayBuffer>>([]);
const mseStreamingStarted = ref(false);
/* 清理历史缓存 */
const cleanOldBuffers = () => {
  if (!videoMse.value || !mseSourceBuffer.value || mseSourceBuffer.value.updating) return;
  const currentTime = videoMse.value.currentTime;
  const buffered = videoMse.value.buffered;
  for (let i = 0; i < buffered.length; i++) {
    const start = buffered.start(i);
    const end = buffered.end(i);
    if (end < currentTime - BUFFER_MAX_DURATION)
      removeBuffer(start, end);
    else if (end - start > BUFFER_MAX_DURATION)
      removeBuffer(start, end - BUFFER_MAX_DURATION);
  }
};
const removeBuffer = (start: number, end: number) => {
  try {
    console.log("Buffer clean.");
    return mseSourceBuffer.value!.remove(start, end);
  } catch (e) {
    console.warn("Buffer清理失败:", e);
  }
};
/*  播放控制 */
const startPlay = (url: string) => {
  mediaSource = new MediaSource();
  if (videoMse.value) {
    videoMse.value.src = URL.createObjectURL(mediaSource);
    videoMse.value.play();
    mediaSource.addEventListener("sourceopen", () => {
      if (ws) ws.close();
      ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        ws?.send(JSON.stringify({
          type: "mse",
          value: "avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus"
        }));
      };
      ws.addEventListener("message", ev => {
        if (typeof ev.data === "string") {
          const msg = JSON.parse(ev.data);
          mseSourceBuffer.value = mediaSource!.addSourceBuffer(msg.value);
          mseSourceBuffer.value.mode = "segments";
          mseSourceBuffer.value.addEventListener("updateend", pushPacket);
        } else {
          readPacket(ev.data);
        }
      });
    });
  }
};
const pushPacket = () => {
  if (mseSourceBuffer.value && !mseSourceBuffer.value.updating) {
    if (mseQueue.value.length > 0) {
      mseSourceBuffer.value.appendBuffer((mseQueue.value as any).shift());
    } else {
      mseStreamingStarted.value = false;
    }
  }
  if (videoMse.value && videoMse.value.buffered != null && videoMse.value.buffered.length > 0) {
    if (typeof document.hidden !== "undefined" && document.hidden) {
      videoMse.value.currentTime = videoMse.value.buffered.end(videoMse.value.buffered.length - 1) - 0.5;
    }
  }
};
const readPacket = (packet: ArrayBuffer) => {
  if (mseQueue.value.length > MAX_QUEUE_LENGTH) {
    mseQueue.value.splice(0, mseQueue.value.length - MAX_QUEUE_LENGTH);
  }
  if (!mseStreamingStarted.value && mseSourceBuffer.value) {
    try {
      mseSourceBuffer.value.appendBuffer(packet);
    } catch (e) {
      window.location.reload();
    }
    mseStreamingStarted.value = true;
    return;
  }
  if (mseSourceBuffer.value) {
    mseQueue.value.push(packet);
    if (!mseSourceBuffer.value.updating) {
      pushPacket();
    }
  }
};
let cleanTimer: number;
onMounted(() => {
  if (ws) {
    ws.close();
    ws = null;
  }
  if (mediaSource) {
    mediaSource.endOfStream();
    mediaSource = null;
  }
  if (mseSourceBuffer.value) {
    mseSourceBuffer.value.abort();
    mseSourceBuffer.value = undefined;
  }
  mseQueue.value = [];
  if (videoMse.value) {
    // videoMse.value.addEventListener("pause", () => {
    //   if (videoMse.value && videoMse.value.currentTime > videoMse.value.buffered.end(videoMse.value.buffered.length - 1)) {
    //     if (videoMse.value.buffered) {
    //       videoMse.value.currentTime = videoMse.value.buffered.end(videoMse.value.buffered.length - 1) - 0.1;
    //       videoMse.value.play();
    //     }
    //   }
    // });
    startPlay(props.url);
    cleanTimer = window.setInterval(cleanOldBuffers, 10000);
  }
});
onUnmounted(() => {
  ws?.close();
  mediaSource?.endOfStream();
  mseSourceBuffer.value?.abort();
  mseQueue.value = [];
  window.clearInterval(cleanTimer);
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
