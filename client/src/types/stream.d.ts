type WebSocketMSE =
  | {
      type: "init";
      stream: string;
      frame: string;
    }
  | {
      type: "terminate";
    }
  | {
      type: "sdp";
      sdp: {
        type: string;
        value: string;
      };
    }
  | {
      type: "new-packet";
      packet: ArrayBuffer;
    }
  | {
      type: "frame";
      data: {
        streamName: string;
        timestamp: number;
        data: any;
      };
    }
  | {
      type: "error";
      error: any;
    }
  | {
      type: "close";
      reason: CloseEvent;
    };
type WebSocketMSEWorkerEV = MessageEvent<WebSocketMSE>;
