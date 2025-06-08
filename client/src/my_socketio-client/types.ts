type BaseEvType = "connect" | "disconnect" | "connect_error";
export type EventType = BaseEvType | "join" | "frame" | "meta";
export type Socket = {
  on: (ev: EventType, listener: (data?: any) => any) => void;
  emit: (ev: EventType, data?: any) => void;
  disconnect: () => void;
};
export type Message = {
  event: EventType;
  data: string | object;
};
export type Options = {
  name?: string;
  retry?: number;
  reconnectionInterval?: number;
};
