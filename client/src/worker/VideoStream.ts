import AppSettings from "@/settings";

/** VideoStream powered by websocket */
export class VideoStreamWithWS {
  private readonly mediaSource: MediaSource;
  private worker: Worker | null = null;
  private video: HTMLVideoElement;
  private sourceBuffer: SourceBuffer | null = null;
  private bufferQueue: ArrayBuffer[] = [];
  private timer: number | undefined = undefined;
  private ready = false;
  // private metaTime: number = 0;
  private paused = false;
  private bufferedTime = 0;
  // public onloaderr: () => void;
  public url: { stream: string; frame: string };
  public streamName;
  public streamId: number;
  private syncThreshold = 1.0; // 同步阈值
  private maxJumpTime = 5.0; // 最大跳跃时间
  constructor(
    video: HTMLVideoElement,
    url: { stream: string; frame: string },
    meta: { streamName: string; streamId: number }
  ) {
    this.video = video;
    this.url = url;
    this.streamName = meta.streamName;
    this.streamId = meta.streamId;
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener("sourceopen", this.sourceopen.bind(this), { passive: true });
    this.video.src = URL.createObjectURL(this.mediaSource);
  }

  public async play() {
    this.paused = false;
    try {
      if (this.video.paused) {
        await this.video.play();
      }
    } catch (err) {
      if (typeof err === "object" && err && "name" in err) {
        if (err.name === "AbortError") {
          console.warn("播放被浏览器节能策略中断");
        }
      }
    }
  }

  public pause() {
    this.paused = true;
    if (!this.video.paused) {
      this.video.pause();
    }
  }

  private sourceopen() {
    this.worker = new Worker(new URL("@/worker/WebSocket&MSE.worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.postMessage({
      type: "init",
      stream: this.url.stream,
      frame: this.url.frame
    } satisfies WebSocketMSE);
    this.worker.addEventListener(
      "message",
      async (ev: WebSocketMSEWorkerEV) => {
        switch (ev.data.type) {
          case "new-packet":
            // 接收到二进制数据，添加到媒体源
            this.readPacket(ev.data.packet);
            break;
          case "frame": {
            /*TODO 目前是简单对齐 */
            const timeDiff = Math.abs(ev.data.data.timestamp - this.video.currentTime);
            if (!this.paused && this.video.buffered != null && this.video.buffered.length > 0) {
              // 如果页面隐藏，跳到最新帧
              if (document && document.hidden) {
                this.video.currentTime = this.video.buffered.end(this.video.buffered.length - 1);
              }
              // 时间差超过阈值且在合理范围内才进行跳跃
              else if (
                !this.video.paused &&
                timeDiff > this.syncThreshold &&
                timeDiff < this.maxJumpTime
              ) {
                const targetTime =
                  this.bufferedTime < ev.data.data.timestamp
                    ? Math.max(0, this.bufferedTime - 0.5)
                    : ev.data.data.timestamp;

                // 确保目标时间在缓冲范围内
                if (this.isTimeBuffered(targetTime)) {
                  this.video.currentTime = targetTime;
                }
              }
            }
            break;
          }
          case "sdp":
            // 创建SourceBuffer，添加到MediaSource
            this.sourceBuffer = this.mediaSource.addSourceBuffer(ev.data.sdp.value);
            // 设置为片段模式
            this.sourceBuffer.mode = "segments";
            // 修复：使用bind绑定this上下文
            this.sourceBuffer &&
              this.sourceBuffer.addEventListener("updateend", this.pushPacket.bind(this), {
                passive: true
              });
            break;
          case "error":
            console.warn(ev.data.error);
            this.stop();
            break;
          case "close":
            console.warn(ev.data.reason);
            this.stop();
        }
      },
      { passive: true }
    );
    this.timer = window.setInterval(
      this.clearBuffer.bind(this),
      (AppSettings.BUFFER_MAX_DURATION * 1000) / 2
    );
  }

  private isTimeBuffered(time: number): boolean {
    const buffered = this.video.buffered;
    for (let i = 0; i < buffered.length; i++) {
      if (time >= buffered.start(i) && time <= buffered.end(i)) {
        return true;
      }
    }
    return false;
  }

  // 将媒体数据片段添加到SourceBuffer
  private pushPacket() {
    if (this.bufferQueue.length > 0) {
      // 从队列中取出一个数据片段添加到SourceBuffer
      const segments = this.bufferQueue.shift();
      if (segments) {
        if (!this.sourceBuffer!.updating) {
          try {
            this.sourceBuffer!.appendBuffer(segments);
          } catch (error) {
            if (error instanceof DOMException && error.name === "QuotaExceededError") {
              this.clearBuffer();
            }
            this.bufferQueue.unshift(segments);
          }
        } else {
          this.bufferQueue.unshift(segments);
        }
      }
    } else {
      this.ready = false;
    }
    if (this.video.buffered != null && this.video.buffered.length > 0) {
      this.bufferedTime = this.video.buffered.end(this.video.buffered.length - 1);
    }
  }

  // 处理接收到的媒体数据包
  private readPacket(packet: ArrayBuffer) {
    // 限制队列长度，防止内存占用过多
    if (this.bufferQueue.length > AppSettings.MAX_QUEUE_LENGTH) {
      this.bufferQueue.splice(0, this.bufferQueue.length - AppSettings.MAX_QUEUE_LENGTH);
    }
    // 第一个数据包直接添加到SourceBuffer
    if (!this.ready && this.sourceBuffer) {
      try {
        if (!this.sourceBuffer.updating) {
          this.sourceBuffer!.appendBuffer(packet);
          this.ready = true;
          this.play().catch();
        }
      } catch {
        this.bufferQueue.push(packet);
        this.ready = true;
      }
    } else {
      // 将数据包添加到队列
      this.bufferQueue.push(packet);
    }
  }

  public stop() {
    try {
      this.ready && this.pause();

      if (this.ready && this.mediaSource.readyState === "open") this.mediaSource.endOfStream();
      this.sourceBuffer?.abort();
      this.sourceBuffer && this.mediaSource.removeSourceBuffer(this.sourceBuffer);

      this.sourceBuffer = null;
      this.worker?.postMessage({ type: "terminate" } satisfies WebSocketMSE);
      this.worker?.terminate();
      window.clearInterval(this.timer);

      this.bufferQueue = [];
      if (this.video.src.startsWith("blob:")) {
        URL.revokeObjectURL(this.video.src);
      }
      this.worker = null;
      this.timer = undefined;
    } catch (err) {
      console.warn(err);
    }
  }

  private clearBuffer() {
    if (!this.sourceBuffer || this.sourceBuffer.updating) return;
    const currentTime = this.video.currentTime;
    const buffered = this.video.buffered;
    // 遍历所有缓冲区范围
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      // 如果缓冲区结束时间早于当前播放时间减去最大缓冲持续时间，则移除该缓冲区
      if (end < currentTime - AppSettings.BUFFER_MAX_DURATION) {
        this.removeBuffer(start, end);
      }
      // 如果单个缓冲区时长超过最大缓冲持续时间，则移除较早的部分
      else if (end - start > AppSettings.BUFFER_MAX_DURATION) {
        this.removeBuffer(start, end - AppSettings.BUFFER_MAX_DURATION);
      }
    }
  }

  private removeBuffer(start: number, end: number) {
    if (!this.sourceBuffer) return;
    try {
      if (!this.sourceBuffer!.updating) {
        this.sourceBuffer!.remove(start, end);
      } else {
        this.sourceBuffer.addEventListener("updateend", () => this.removeBuffer(start, end), {
          once: true
        });
      }
    } catch {
      this.sourceBuffer.addEventListener("updateend", () => this.removeBuffer(start, end), {
        once: true
      });
    }
  }
}
