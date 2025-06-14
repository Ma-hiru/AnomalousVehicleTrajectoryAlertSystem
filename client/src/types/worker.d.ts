/** socket事件可辨识联合类型 */
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
      data: CarBox;
    }
  | {
      type: "meta";
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
/** worker传递事件数据类型 */
type WebSocketMSEWorkerEV = MessageEvent<WebSocketMSE>;
