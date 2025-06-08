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
type WebSocketMSEWorkerEV = MessageEvent<WebSocketMSE>;

type CarAction = {
  id: string;
  stream: string;
  carId: string;
  timestamp: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
type CarRecord = {
  id: number;
  carId: string;
  stream: string;
  time: string;
  types: number[];
  status: boolean;
};
