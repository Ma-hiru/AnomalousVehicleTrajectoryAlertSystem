const WebSocketInstance = {
  stream: null as WebSocket | null,
  info: null as WebSocket | null,
  url: ""
};

self.onmessage = (workerEvent: WebSocketMSEWorkerEV) => {
  if (workerEvent.data.type === "init") {
    WebSocketInstance.url = workerEvent.data.url;
    init();
  } else if (workerEvent.data.type === "terminate") {
    WebSocketInstance.stream?.close();
    WebSocketInstance.stream = null;
    WebSocketInstance.info?.close();
    WebSocketInstance.info = null;
  }
};

const init = () => {
  WebSocketInstance.stream = new WebSocket(WebSocketInstance.url);
  // 设置接收二进制数据类型为ArrayBuffer
  WebSocketInstance.stream.binaryType = "arraybuffer";

  // WebSocket连接成功时发送媒体配置信息
  WebSocketInstance.stream.onopen = () => {
    WebSocketInstance.stream!.send(
      JSON.stringify({
        type: "mse",
        // 支持的编解码器列表
        value: "avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus"
      })
    );
  };

  // 优化：直接判断数据类型，减少不必要的序列化/反序列化
  WebSocketInstance.stream.onmessage = (ev) => {
    if (typeof ev.data === "string") {
      // 接收到字符串消息，一般是初始化信息
      console.log(ev.data);
      const msg = JSON.parse(ev.data);
      self.postMessage({
        type: "sdp",
        sdp: msg
      } satisfies WebSocketMSE);
    } else {
      // 接收到二进制数据，添加到媒体源
      // 使用transferable对象加速二进制数据传输
      self.postMessage({
        type: "new-packet",
        packet: ev.data
      }, [ev.data]);  // 使用transferable对象
    }
  };
};


