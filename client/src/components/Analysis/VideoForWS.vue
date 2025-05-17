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
  import { ref, onMounted, onUnmounted, useTemplateRef } from "vue";
  import AppSettings from "@/settings";

  /* 组件属性定义 */
  const props = defineProps<{
    width: string;          // 视频宽度
    url: string;            // WebSocket URL
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

  /* 媒体播放相关实例 */
  let mediaSource: MediaSource | null = null;  // MSE媒体源对象
  let ws: WebSocket | null = null;             // WebSocket实例
  let worker: Worker | null = null;            // Web Worker实例
  const videoMse = useTemplateRef("videoMse"); // 视频元素引用
  const mseSourceBuffer = ref<SourceBuffer>(); // 媒体源缓冲区
  const mseQueue = ref<Array<ArrayBuffer>>([]); // 媒体数据队列
  const mseStreamingStarted = ref(false);      // 流媒体是否已开始

  /* 清理历史缓冲区，防止内存占用过多 */
  const cleanOldBuffers = () => {
    if (!videoMse.value || !mseSourceBuffer.value || mseSourceBuffer.value.updating) return;

    const currentTime = videoMse.value.currentTime;
    const buffered = videoMse.value.buffered;

    // 遍历所有缓冲区范围
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);

      // 如果缓冲区结束时间早于当前播放时间减去最大缓冲持续时间，则移除该缓冲区
      if (end < currentTime - AppSettings.BUFFER_MAX_DURATION)
        removeBuffer(start, end);
      // 如果单个缓冲区时长超过最大缓冲持续时间，则移除较早的部分
      else if (end - start > AppSettings.BUFFER_MAX_DURATION)
        removeBuffer(start, end - AppSettings.BUFFER_MAX_DURATION);
    }
  };

  // 从SourceBuffer移除指定范围的缓冲数据
  const removeBuffer = (start: number, end: number) => {
    try {
      console.log("Buffer clean.");
      return mseSourceBuffer.value!.remove(start, end);
    } catch (e) {
      console.warn("Buffer清理失败:", e);
    }
  };

  /* 视频播放控制 */
  const startPlay = (url: string) => {
    // 创建媒体源对象
    mediaSource = new MediaSource();
    if (videoMse.value) {
      // 将媒体源对象绑定到视频元素
      // videoMse.value.srcObject = mediaSource;
      videoMse.value.src = URL.createObjectURL(mediaSource);
      videoMse.value.play();

      // 媒体源打开后，创建Worker开始获取数据
      mediaSource.addEventListener("sourceopen", () => {
        // 创建Web Worker，传入Worker脚本位置
        worker = new Worker(new URL("@/worker/VideoStream.worker.ts", import.meta.url), { type: "module" });
        // 发送初始化消息，包含WebSocket URL
        worker.postMessage({ type: "init", url });

        // 处理从Worker接收的消息
        worker.onmessage = (ev) => {
          if (typeof ev.data === "string") {
            // 接收到字符串消息，一般是初始化信息
            const msg = JSON.parse(ev.data);
            // 创建SourceBuffer，添加到MediaSource
            mseSourceBuffer.value = mediaSource!.addSourceBuffer(msg.value);
            mseSourceBuffer.value.mode = "segments"; // 设置为片段模式
            // 添加updateend事件，当一个片段处理完毕后继续处理下一个
            mseSourceBuffer.value.addEventListener("updateend", pushPacket);
          } else {
            // 接收到二进制数据，添加到媒体源
            readPacket(ev.data);
          }
        };
      });
    }
  };

  // 将媒体数据片段添加到SourceBuffer
  const pushPacket = () => {
    if (mseSourceBuffer.value && !mseSourceBuffer.value.updating) {
      if (mseQueue.value.length > 0) {
        // 从队列中取出一个数据片段添加到SourceBuffer
        mseSourceBuffer.value.appendBuffer((mseQueue.value as any).shift());
      } else {
        mseStreamingStarted.value = false;
      }
    }

    // 如果页面不可见，则将播放位置设置到缓冲区末尾，以减少缓冲区积累
    if (videoMse.value && videoMse.value.buffered != null && videoMse.value.buffered.length > 0) {
      if (typeof document.hidden !== "undefined" && document.hidden) {
        videoMse.value.currentTime = videoMse.value.buffered.end(videoMse.value.buffered.length - 1) - 0.5;
      }
    }
  };

  // 处理接收到的媒体数据包
  const readPacket = (packet: ArrayBuffer) => {
    // 限制队列长度，防止内存占用过多
    if (mseQueue.value.length > AppSettings.MAX_QUEUE_LENGTH) {
      mseQueue.value.splice(0, mseQueue.value.length - AppSettings.MAX_QUEUE_LENGTH);
    }

    // 第一个数据包直接添加到SourceBuffer
    if (!mseStreamingStarted.value && mseSourceBuffer.value) {
      try {
        mseSourceBuffer.value.appendBuffer(packet);
      } catch (e) {
        window.location.reload(); // 出错时刷新页面
      }
      mseStreamingStarted.value = true;
      return;
    }

    if (mseSourceBuffer.value) {
      // 将数据包添加到队列
      mseQueue.value.push(packet);
      // 如果SourceBuffer没有在更新中，则处理队列中的数据
      if (!mseSourceBuffer.value.updating) {
        pushPacket();
      }
    }
  };

  let cleanTimer: number;

  onMounted(() => {
    // 组件挂载时清理已有的连接和实例
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

    // 开始播放视频
    if (videoMse.value) {
      startPlay(props.url);
      // 定时清理缓冲区，防止内存占用过多
      cleanTimer = window.setInterval(cleanOldBuffers, 10000);
    }
  });

  // 组件卸载时清理资源
  onUnmounted(() => {
    ws?.close();
    mediaSource?.endOfStream();
    mseSourceBuffer.value?.abort();
    mseQueue.value = [];
    worker?.postMessage({ type: "terminate", url: "" });
    worker?.terminate();
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
