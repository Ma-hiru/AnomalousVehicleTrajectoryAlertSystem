type WebSocketMSE =
  | {
  type: "init";
  url: string;
}
  | {
  type: "terminate"
}
  | {
  type: "sdp",
  sdp: {
    type: string;
    value: string
  }
}
  | {
  type: "new-packet",
  packet: ArrayBuffer
}
type WebSocketMSEWorkerEV = MessageEvent<WebSocketMSE>
