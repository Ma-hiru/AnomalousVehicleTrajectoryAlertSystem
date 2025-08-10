import AppSettings from "@/settings";
import { SyncManager } from "@/wasm/pkg";
import { BufferManager } from "./buffer";
import { WorkerManager } from "./worker";
import { VideoManager } from "./video";
import { ClearManager } from "@/worker/stream/clear";

const sync_manager = new SyncManager(
  AppSettings.SyncManager.THRESHOLD,
  AppSettings.SyncManager.MAX_TIME_CAN_IGNORE,
  AppSettings.SyncManager.RUNNING_BUFFER_TIME
);

interface Meta {
  stream: string;
  frame: string;
  streamName: string;
  streamId: number;
}

/** VideoStream powered by websocket */
export class VideoStreamByWS {
  public readonly meta;
  private readonly buffer_manager;
  private readonly video_manager;
  private worker_manager: Nullable<WorkerManager<WebSocketMSE>>;
  private clear_manager: Nullable<ClearManager>;
  private ready;
  private onDestroy;

  constructor(video: HTMLVideoElement, meta: Meta, onDestroy?: NormalFunc) {
    this.ready = false;
    this.video_manager = new VideoManager(video, this.sourceopen.bind(this));
    this.buffer_manager = new BufferManager(AppSettings.MAX_QUEUE_LENGTH);
    this.meta = { ...meta };
    this.onDestroy = onDestroy;
  }

  private sourceopen() {
    this.initWorker();
    this.clear_manager = new ClearManager(this.video_manager);
  }

  private initWorker() {
    this.worker_manager = new WorkerManager<WebSocketMSE>();
    this.worker_manager.send({
      type: "init",
      stream: this.meta.stream,
      frame: this.meta.frame
    });
    this.worker_manager.message(this.handlerMessage.bind(this));
  }

  private async handlerMessage(ev: WebSocketMSE) {
    switch (ev.type) {
      case "new-packet": {
        // 接收到二进制数据，添加到媒体源
        this.readPacket(ev.packet);
        break;
      }
      case "frame": {
        import.meta.env.DEV && console.log("frame", ev);
        const target = sync_manager.calculate_taget_time(
          ev.data.timestamp,
          this.video_manager.get_video_current_time(),
          this.video_manager.get_video_buffer_time()
        );
        target && this.video_manager.set_video_time(target);
        break;
      }
      case "sdp": {
        // 创建SourceBuffer，添加到MediaSource
        this.video_manager.set_source_buffer(ev.sdp.value, "segments");
        this.video_manager.on_updated(this.pushPacket.bind(this));
        break;
      }
      case "error": {
        console.warn(ev.error);
        this.destroy();
        break;
      }
      case "close": {
        console.warn(ev.reason);
        this.destroy();
      }
    }
  }

  // 将媒体数据片段添加到SourceBuffer
  private pushPacket() {
    if (this.buffer_manager.is_ready()) {
      // 从队列中取出一个数据片段添加到SourceBuffer
      const segments = this.buffer_manager.pop_packet();
      if (segments && !this.video_manager.add_source_buffer(segments)) {
        this.buffer_manager.unshift_packet(segments);
      }
    } else {
      this.ready = false;
    }
  }

  // 处理接收到的媒体数据包
  private readPacket(packet: ArrayBuffer) {
    // 第一个数据包直接添加到SourceBuffer
    if (!this.ready) {
      if (this.video_manager.add_source_buffer(packet)) {
        this.ready = true;
        this.video_manager.play();
      } else {
        this.buffer_manager.push_packet(packet);
        this.pushPacket();
      }
    } else {
      // 将数据包添加到队列
      this.buffer_manager.push_packet(packet);
    }
  }

  public destroy() {
    try {
      //worker
      this.worker_manager?.send({ type: "terminate" });
      this.worker_manager?.destroy();
      this.buffer_manager.destroy();
      this.clear_manager?.destroy();
      this.video_manager.destroy();
    } catch (err) {
      console.warn(err);
    }
    //callback
    this.onDestroy?.();
    this.onDestroy = undefined;
  }

  public async play() {
    return this.video_manager.play();
  }
}
