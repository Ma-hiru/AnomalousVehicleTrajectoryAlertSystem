import { io, Socket } from "@/my_socketio-client";
import { getURLSearchParam } from "@/utils/getURLSearchParam";

const WebSocketInstance = {
  stream: null as WebSocket | null,
  info: null as Socket | null,
  url: { stream: "", frame: "" },
  ready: false
};
const handlerMessage = (workerEvent: WebSocketMSEWorkerEV) => {
  if (workerEvent.data.type === "init") {
    WebSocketInstance.url.stream = workerEvent.data.stream;
    WebSocketInstance.url.frame = workerEvent.data.frame;
    try {
      init();
    } catch (e) {
      self.postMessage({
        type: "error",
        error: JSON.stringify(e)
      } as WebSocketMSE);
      terminate();
    }
  } else if (workerEvent.data.type === "terminate") terminate();
};

const init = () => {
  WebSocketInstance.stream = new WebSocket(WebSocketInstance.url.stream);
  WebSocketInstance.info = io(WebSocketInstance.url.frame, {
    retry: 5,
    name: getURLSearchParam(WebSocketInstance.url.frame, "name")[0] || WebSocketInstance.url.frame,
    reconnectionInterval: 100
  });
  WebSocketInstance.info.on("frame", (data) => {
    self.postMessage({
      type: "frame",
      data: data
    } satisfies WebSocketMSE);
  });
  WebSocketInstance.info.on("meta", (data) => {
    self.postMessage({
      type: "meta",
      data: data
    } satisfies WebSocketMSE);
  });
  // 设置接收二进制数据类型为ArrayBuffer
  WebSocketInstance.stream.binaryType = "arraybuffer";
  WebSocketInstance.stream.onmessage = (ev) => {
    if (typeof ev.data === "string") {
      // 接收到字符串消息，一般是初始化信息
      const msg = JSON.parse(ev.data);
      if (msg.type === "error") {
        self.postMessage({
          type: "error",
          error: msg
        } as WebSocketMSE);
        return;
      }
      self.postMessage({
        type: "sdp",
        sdp: msg
      } satisfies WebSocketMSE);
    } else {
      // 接收到二进制数据，添加到媒体源
      // 使用transferable对象加速二进制数据传输
      self.postMessage(
        {
          type: "new-packet",
          packet: ev.data
        },
        [ev.data]
      ); // 使用transferable对象
    }
  };
  WebSocketInstance.stream.onopen = () => {
    WebSocketInstance.ready = true;
    WebSocketInstance.stream!.send(
      JSON.stringify({
        type: "mse",
        // 支持的编解码器列表
        value: "avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus"
      })
    );
  };
  WebSocketInstance.stream.onerror = (ev) => {
    self.postMessage({
      type: "error",
      error: JSON.stringify(ev)
    } as WebSocketMSE);
  };
  WebSocketInstance.stream.onclose = (ev) => {
    WebSocketInstance.ready &&
      self.postMessage({
        type: "close",
        reason: {
          code: ev.code,
          reason: ev.reason,
          wasClean: ev.wasClean
        }
      } as WebSocketMSE);
  };
};

const terminate = () => {
  if (WebSocketInstance.stream) {
    WebSocketInstance.stream.onopen = null;
    WebSocketInstance.stream.onmessage = null;
    WebSocketInstance.stream.onerror = null;
    WebSocketInstance.stream.onclose = null;
    WebSocketInstance.ready && WebSocketInstance.stream.close();
    WebSocketInstance.stream = null;
  }
  WebSocketInstance.info?.disconnect();
  WebSocketInstance.info = null;
  self.removeEventListener("message", handlerMessage);
};

self.addEventListener("message", handlerMessage, { passive: true });
