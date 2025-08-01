import { io, Socket } from "@/my_socketio";
import { getURLSearchParam } from "@/utils/getURLSearchParam";

class WebsocketWorker {
  private stream_instance: Nullable<WebSocket>;
  private frame_instance: Nullable<Socket>;
  private ready;
  private meta;
  private self;

  constructor(self: Window & typeof globalThis) {
    this.ready = false;
    this.meta = {
      stream: "",
      frame: ""
    };
    this.self = self;
  }

  handlerMessage(workerEvent: WebSocketMSE) {
    switch (workerEvent.type) {
      case "init": {
        this.meta.stream = workerEvent.stream;
        this.meta.frame = workerEvent.frame;
        this.init();
        break;
      }
      case "terminate": {
        this.terminate();
        break;
      }
    }
  }

  private post_message(msg: WebSocketMSE) {
    this.self.postMessage(msg);
  }

  private init() {
    try {
      this.create_frame_socket();
      this.create_stream_socket();
    } catch (err) {
      this.post_message({
        type: "error",
        error: err
      });
    }
  }

  private create_stream_socket() {
    this.stream_instance = new WebSocket(this.meta.stream);
    this.stream_instance.binaryType = "arraybuffer";
    this.stream_instance.onmessage = (ev) => {
      switch (typeof ev.data) {
        case "string": {
          const msg = JSON.parse(ev.data);
          if (msg.type === "error") {
            return this.post_message({
              type: "error",
              error: msg
            });
          }
          this.post_message({
            type: "sdp",
            sdp: msg
          });
          break;
        }
        default: {
          this.self.postMessage(
            {
              type: "new-packet",
              packet: ev.data
            },
            // 直接移交所有权，避免数据复制
            [ev.data]
          );
        }
      }
    };
    this.stream_instance.onopen = () => {
      this.ready = true;
      this.stream_instance && this.stream_instance.send(SDP_MESSAGE);
    };
    this.stream_instance.onerror = (ev) => {
      this.post_message({
        type: "error",
        error: JSON.stringify(ev)
      });
    };
    this.stream_instance.onclose = (ev) => {
      this.ready &&
        this.post_message({
          type: "close",
          reason: {
            code: ev.code,
            reason: ev.reason,
            wasClean: ev.wasClean
          }
        });
    };
  }

  private create_frame_socket() {
    this.frame_instance = io(this.meta.frame, {
      retry: 5,
      name: getURLSearchParam(this.meta.frame, "name")[0] || this.meta.frame,
      reconnectionInterval: 100
    });
    this.frame_instance.on("frame", (data) => {
      this.post_message({
        type: "frame",
        data: data
      });
    });
    this.frame_instance.on("meta", (data) => {
      this.post_message({
        type: "meta",
        data: data
      });
    });
  }

  private terminate() {
    if (this.stream_instance) {
      this.stream_instance.onopen = null;
      this.stream_instance.onmessage = null;
      this.stream_instance.onerror = null;
      this.stream_instance.onclose = null;
      this.ready && this.stream_instance.close();
      this.stream_instance = null;
    }
    this.frame_instance?.disconnect();
    this.frame_instance = null;
    this.self = null as unknown as any;
  }
}

const Instance = new WebsocketWorker(self);
const handler = (ev: WebSocketMSEWorkerEV) => {
  Instance.handlerMessage(ev.data);
};
self.addEventListener("message", handler, { passive: true });

const SDP_MESSAGE = JSON.stringify({
  type: "mse",
  // 支持的编解码器列表
  value: "avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus"
});
