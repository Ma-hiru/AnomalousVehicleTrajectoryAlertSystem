// WebSocket实例
let ws: WebSocket | null = null;

// 监听主线程消息
self.onmessage = (event: MessageEvent<{ type: "init" | "terminate"; url: string }>) => {
  if (event.data.type === "init") {
    // 初始化WebSocket连接
    if (ws) ws.close(); // 如果已存在连接则关闭
    ws = new WebSocket(event.data.url);
    ws.binaryType = "arraybuffer"; // 设置接收二进制数据类型为ArrayBuffer

    // WebSocket连接成功时发送媒体配置信息
    ws.onopen = () => {
      ws?.send(
        JSON.stringify({
          type: "mse",
          // 支持的编解码器列表
          // avc1.* - H.264视频编码
          // hvc1.* - H.265/HEVC视频编码
          // mp4a.* - AAC音频编码
          // flac - FLAC音频编码
          // opus - Opus音频编码
          value:
            "avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus"
        })
      );
    };

    // 接收服务器发来的消息并转发到主线程
    ws.addEventListener("message", (ev) => {
      self.postMessage(ev.data); // 将接收到的数据直接传递给主线程
    });
  } else if (event.type === "terminate") {
    // 终止连接
    if (ws) ws.close();
  }
};
