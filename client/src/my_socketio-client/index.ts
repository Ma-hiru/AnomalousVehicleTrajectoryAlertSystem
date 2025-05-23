type BaseEvType = "connect" | "disconnect" | "connect_error";

export type EventType = BaseEvType | "join" | "frame";

export type Socket = {
  on: (ev: EventType, listener: (data?: any) => any) => void;
  emit: (ev: EventType, data?: any) => void;
  disconnect: () => void;
};
export type Message = {
  event: EventType;
  data: string | object;
};
export const io = (uri: string): Socket => {
  let instance: WebSocket | null = null;
  let retry = 0;
  const handler = new Map<EventType, (data?: any) => any>();

  async function onmessage(res: MessageEvent) {
    const msg: Message = JSON.parse(res.data);
    const event = msg.event;
    let data = msg.data;
    if (typeof data === "string") {
      data = JSON.parse(data);
    }
    if (handler.has(event)) {
      const fn = handler.get(event);
      if (!fn) return;
      if (fn.constructor && fn.constructor.name === "AsyncFunction") await fn(data);
      else fn(data);
    }
  }

  function onopen(ev: Event) {
    if (handler.has("connect")) {
      const fn = handler.get("connect");
      fn && fn(ev);
    }
  }

  function onclose(ev: CloseEvent) {
    if (handler.has("disconnect")) {
      const fn = handler.get("disconnect");
      fn && fn(ev);
    }
    clear();
    reconnect();
  }

  function onerror(ev: Event) {
    if (handler.has("connect_error")) {
      const fn = handler.get("connect_error");
      fn && fn(ev);
    }
    clear();
    reconnect();
  }

  function openConnect(ev: Event) {
    instance!.addEventListener("message", onmessage, { passive: true });
    instance!.addEventListener("close", onclose, { passive: true });
    instance!.addEventListener("error", onerror, { passive: true });
    onopen(ev);
  }

  function errConnect() {
    clear();
    reconnect();
  }

  function clear() {
    if (instance) {
      try {
        instance.close();
        instance.removeEventListener("message", onmessage);
        instance.removeEventListener("close", onclose);
        instance.removeEventListener("error", errConnect);
        instance.removeEventListener("error", onerror);
        instance.removeEventListener("open", openConnect);
        instance = null;
      } catch (e) {
        console.log(e);
      }
    }
  }

  function connect() {
    try {
      instance = new WebSocket(uri);
      instance.addEventListener("open", openConnect, { passive: true });
      instance.addEventListener("error", errConnect, { passive: true });
    } catch (e) {
      clear();
      console.error(e);
      return;
    }
  }

  function reconnect() {
    retry++;
    if (retry <= 10) {
      connect();
      console.log(`重连第${retry}次`);
    }
  }

  connect();

  return {
    on: (ev: EventType, listener: (data?: any) => any) => {
      handler.set(ev, listener);
    },
    emit: (ev: EventType, data?: any) => {
      instance &&
        instance.send(
          JSON.stringify({
            event: ev,
            data: JSON.stringify(data) || ""
          })
        );
    },
    disconnect: () => {
      if (handler.has("disconnect")) {
        const fn = handler.get("disconnect");
        fn && fn();
      }
      clear();
    }
  };
};
