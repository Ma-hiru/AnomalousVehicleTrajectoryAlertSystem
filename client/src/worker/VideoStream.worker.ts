let ws: WebSocket | null = null;
self.onmessage = (event: MessageEvent<{ type: "init" | "terminate", url: string }>) => {
  if (event.data.type === "init") {
    if (ws) ws.close();
    ws = new WebSocket(event.data.url);
    ws.binaryType = "arraybuffer";
    ws.onopen = () => {
      ws?.send(JSON.stringify({
        type: "mse",
        value: "avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus"
      }));
    };
    ws.addEventListener("message", ev => {
      self.postMessage(ev.data);
    });
  } else if (event.type === "terminate") {
    if (ws) ws.close();
  }
};
