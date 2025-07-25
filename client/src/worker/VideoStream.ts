import AppSettings from "@/settings";
import { SyncManager, BufferManager } from "@/wasm/pkg";

/** VideoStream powered by websocket */
export class VideoStreamWithWS {
  private readonly mediaSource: MediaSource;
  private worker: Worker | null = null;
  private video: HTMLVideoElement;
  private sourceBuffer: SourceBuffer | null = null;
  private timer: number | undefined = undefined;
  private ready = false;
  private readonly buffer_manager;
  private onDestroy;
  private readonly autoPlay;
  public readonly url: { stream: string; frame: string };
  public readonly streamName;
  public readonly streamId: number;

  constructor(
    video: HTMLVideoElement,
    url: { stream: string; frame: string },
    meta: { streamName: string; streamId: number },
    onDestroy?: () => void
  ) {
    this.video = video;
    this.url = { ...url };
    this.streamName = meta.streamName;
    this.streamId = meta.streamId;
    this.buffer_manager = new BufferManager(AppSettings.MAX_QUEUE_LENGTH);
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener("sourceopen", this.sourceopen.bind(this), { passive: true });
    this.video.src = URL.createObjectURL(this.mediaSource);
    this.onDestroy = onDestroy;

    function autoPlay(this: VideoStreamWithWS) {
      if (document.visibilityState === "visible") {
        if (this.video.paused) {
          this.video.play().catch();
        }
      }
    }

    this.autoPlay = autoPlay.bind(this);
  }

  private sourceopen() {
    this.initWorker();
    this.timer = window.setInterval(
      this.clearBuffer.bind(this),
      (AppSettings.BUFFER_MAX_DURATION * 1000) / 2
    );
  }

  private initWorker() {
    this.worker = new Worker(new URL("@/worker/WebSocket&MSE.worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.postMessage({
      type: "init",
      stream: this.url.stream,
      frame: this.url.frame
    } satisfies WebSocketMSE);
    this.worker.addEventListener("message", this.handlerMessage.bind(this), { passive: true });
  }

  private async handlerMessage(ev: WebSocketMSEWorkerEV) {
    switch (ev.data.type) {
      case "new-packet": {
        // 接收到二进制数据，添加到媒体源
        this.readPacket(ev.data.packet);
        break;
      }
      case "frame": {
        const bufferTime =
          (this.video.buffered && this.video.buffered.end(this.video.buffered.length - 1)) || 0;
        const target = sync_manager.calculate_taget_time(
          ev.data.data.timestamp,
          this.video.currentTime,
          bufferTime
        );
        target && (this.video.currentTime = target);
        break;
      }
      case "sdp": {
        // 创建SourceBuffer，添加到MediaSource
        this.sourceBuffer = this.mediaSource.addSourceBuffer(ev.data.sdp.value);
        // 设置为片段模式
        this.sourceBuffer.mode = "segments";
        this.sourceBuffer &&
          this.sourceBuffer.addEventListener("updateend", this.pushPacket.bind(this), {
            passive: true
          });
        break;
      }
      case "error": {
        console.warn(ev.data.error);
        this.destroy();
        break;
      }
      case "close": {
        console.warn(ev.data.reason);
        this.destroy();
      }
    }
  }

  // 将媒体数据片段添加到SourceBuffer
  private pushPacket() {
    if (this.buffer_manager.is_ready()) {
      // 从队列中取出一个数据片段添加到SourceBuffer
      const segments = this.buffer_manager.pop_packet();
      if (segments) {
        if (!this.sourceBuffer!.updating) {
          try {
            this.sourceBuffer!.appendBuffer(segments);
          } catch (error) {
            if (error instanceof DOMException && error.name === "QuotaExceededError") {
              this.clearBuffer();
            }
            this.buffer_manager.unshift_packet(segments);
          }
        } else {
          this.buffer_manager.unshift_packet(segments);
        }
      }
    } else {
      this.ready = false;
    }
  }

  // 处理接收到的媒体数据包
  private readPacket(packet: ArrayBuffer) {
    // 第一个数据包直接添加到SourceBuffer
    if (!this.ready && this.sourceBuffer) {
      try {
        if (!this.sourceBuffer.updating) {
          this.sourceBuffer!.appendBuffer(packet);
          this.ready = true;
          this.video.paused && this.play().catch();
        }
      } catch {
        this.buffer_manager.push_packet(new Uint8Array(packet));
        this.ready = true;
      }
    } else {
      // 将数据包添加到队列
      this.buffer_manager.push_packet(new Uint8Array(packet));
    }
  }

  public destroy() {
    try {
      //mediaSource
      if (this.ready && this.mediaSource.readyState === "open") this.mediaSource.endOfStream();
      //sourceBuffer
      this.sourceBuffer?.abort();
      this.sourceBuffer && this.mediaSource.removeSourceBuffer(this.sourceBuffer);
      this.sourceBuffer = null;
      //worker
      this.worker?.postMessage({ type: "terminate" } satisfies WebSocketMSE);
      this.worker?.terminate();
      //buffer
      this.buffer_manager.free();
      if (this.video.src.startsWith("blob:")) {
        URL.revokeObjectURL(this.video.src);
      }
      this.worker = null;
      //listener & timer
      window.clearInterval(this.timer);
      this.timer = undefined;
      window.removeEventListener("blur", this.autoPlay);
      document.removeEventListener("visibilitychange", this.autoPlay);
      //video element
      !this.video.paused && this.video.pause();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.video = null;
    } catch (err) {
      console.warn(err);
    }
    //callback
    this.onDestroy?.();
    this.onDestroy = undefined;
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

  public async play() {
    try {
      if (this.video.paused) {
        await this.video.play();
        document.addEventListener("visibilitychange", this.autoPlay.bind(this));
        window.addEventListener("focus", this.autoPlay.bind(this));
      }
    } catch (err) {
      if (typeof err === "object" && err && "name" in err) {
        if (err.name === "AbortError") {
          console.warn("播放被浏览器节能策略中断");
        }
      }
    }
  }
}

const sync_manager = new SyncManager(
  AppSettings.SyncManager.THRESHOLD,
  AppSettings.SyncManager.MAX_TIME_CAN_IGNORE,
  AppSettings.SyncManager.RUNNING_BUFFER_TIME
);
