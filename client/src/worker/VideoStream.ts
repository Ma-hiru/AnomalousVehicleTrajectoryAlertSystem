import AppSettings from "@/settings";

export class VideoStream {
  worker: Worker | null = null;
  video: HTMLVideoElement;
  mediaSource: MediaSource;
  sourceBuffer: SourceBuffer | null = null;
  bufferQueue: ArrayBuffer[] = [];
  timer: number | undefined = undefined;
  url: { stream: string; frame: string };
  ready = false;
  streamName = "";

  constructor(video: HTMLVideoElement, url: { stream: string; frame: string }, streamName: string) {
    this.video = video;
    this.url = url;
    this.streamName = streamName;
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener("sourceopen", this.sourceopen.bind(this), { passive: true });
    this.video.src = URL.createObjectURL(this.mediaSource);
  }

  play() {
    this.video.play().then();
  }

  sourceopen() {
    this.worker = new Worker(new URL("@/worker/WebSocket&MSE.worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.postMessage({
      type: "init",
      stream: this.url.stream,
      frame: this.url.frame
    } satisfies WebSocketMSE);
    this.worker.addEventListener("message", (ev: WebSocketMSEWorkerEV) => {
      switch (ev.data.type) {
        case "sdp":
          // 创建SourceBuffer，添加到MediaSource
          this.sourceBuffer = this.mediaSource.addSourceBuffer(ev.data.sdp.value);
          // 设置为片段模式
          this.sourceBuffer.mode = "segments";
          // 修复：使用bind绑定this上下文
          this.sourceBuffer.addEventListener("updateend", this.pushPacket.bind(this), { passive: true });
          break;
        case "new-packet":
          // 接收到二进制数据，添加到媒体源
          this.readPacket(ev.data.packet);
          break;
        case "frame":
          if (ev.data.data.streamName === this.streamName) {
            /*empty*/
          }
          break;
        case "error":
          console.error(ev.data.error);
          this.stop();
          break;
        case "close":
          console.error(ev.data.reason);
          this.stop();
      }
    }, { passive: true });
    this.timer = window.setInterval(this.clearBuffer.bind(this), 10000);
  }

  // 将媒体数据片段添加到SourceBuffer
  pushPacket() {
    if (this.sourceBuffer && !this.sourceBuffer.updating) {
      if (this.bufferQueue.length > 0) {
        // 从队列中取出一个数据片段添加到SourceBuffer
        const segments = this.bufferQueue.shift();
        segments && this.sourceBuffer.appendBuffer(segments);
      } else {
        this.ready = false;
      }
    }

    // 添加：页面不可见时的优化处理
    if (this.video && this.video.buffered != null && this.video.buffered.length > 0) {
      if (typeof document.hidden !== "undefined" && document.hidden) {
        this.video.currentTime = this.video.buffered.end(this.video.buffered.length - 1) - 0.5;
      }
    }
  }

  // 处理接收到的媒体数据包
  readPacket(packet: ArrayBuffer) {
    // 移除不必要的console.log可减少开销
    // console.log("readPacket");

    // 限制队列长度，防止内存占用过多
    if (this.bufferQueue.length > AppSettings.MAX_QUEUE_LENGTH) {
      this.bufferQueue.splice(0, this.bufferQueue.length - AppSettings.MAX_QUEUE_LENGTH);
    }
    // 第一个数据包直接添加到SourceBuffer
    if (!this.ready && this.sourceBuffer) {
      try {
        this.sourceBuffer.appendBuffer(packet);
      } catch {
        window.location.reload();
      }
      this.ready = true;
      return;
    }
    // 将数据包添加到队列
    this.bufferQueue.push(packet);
    // 如果SourceBuffer没有在更新中，则处理队列中的数据
    if (this.sourceBuffer && !this.sourceBuffer.updating) {
      this.pushPacket();
    }
  }

  stop() {
    this.mediaSource.endOfStream();
    this.sourceBuffer && this.mediaSource.removeSourceBuffer(this.sourceBuffer);
    this.sourceBuffer && this.sourceBuffer.abort();
    this.sourceBuffer = null;
    this.worker?.postMessage({ type: "terminate" } satisfies WebSocketMSE);
    this.worker?.terminate(); // 添加：确保Worker被终止
    window.clearInterval(this.timer);
  }

  clearBuffer() {
    if (!this.sourceBuffer || this.sourceBuffer.updating) return;
    const currentTime = this.video.currentTime;
    const buffered = this.video.buffered;
    // 遍历所有缓冲区范围
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      // 如果缓冲区结束时间早于当前播放时间减去最大缓冲持续时间，则移除该缓冲区
      if (end < currentTime - AppSettings.BUFFER_MAX_DURATION) this.removeBuffer(start, end);
      // 如果单个缓冲区时长超过最大缓冲持续时间，则移除较早的部分
      else if (end - start > AppSettings.BUFFER_MAX_DURATION)
        this.removeBuffer(start, end - AppSettings.BUFFER_MAX_DURATION);
    }
  }

  removeBuffer(start: number, end: number) {
    if (!this.sourceBuffer || this.sourceBuffer.updating) return;
    try {
      this.sourceBuffer.remove(start, end);
      console.log("Buffer clean.");
    } catch (e) {
      console.warn("Buffer清理失败:", e);
    }
  }
}
