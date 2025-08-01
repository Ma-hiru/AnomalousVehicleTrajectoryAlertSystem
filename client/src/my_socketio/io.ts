import { Options, EventType, Socket, Message } from "./types";

export const io = (uri: string, options?: Options | string): Socket => {
  let retry: number;
  let instance: Nullable<WebSocket>;
  let maxRetry: number;
  let name: string;
  let reconnectionInterval: number;
  let ready = false;
  const handler = new Map<EventType, (data?: any) => any>();
  if (options && typeof options === "string") {
    name = options;
    maxRetry = 10;
    reconnectionInterval = 500;
  } else if (options && typeof options === "object") {
    name = options.name || "";
    maxRetry = options.retry || 0;
    reconnectionInterval = options.reconnectionInterval || 500;
  }

  async function executeHandler(event: EventType, data?: any) {
    const fn = handler.get(event);
    if (!fn) return;
    try {
      if (fn.constructor.name === "AsyncFunction") await fn(data);
      else fn(data);
    } catch (err: unknown) {
      console.error("未知错误（executeHandler）：", err);
    }
  }

  async function onmessage(res: MessageEvent) {
    const { event, data } = JSON.parse(res.data) as Message;
    try {
      if (typeof data === "string") await executeHandler(event, JSON.parse(data));
      else await executeHandler(event, data);
    } catch (err) {
      if (err instanceof SyntaxError) console.error("JSON解析错误：", err);
      else console.error("未知错误（executeHandler）：", err);
    }
  }

  async function onopen(ev: Event) {
    await executeHandler("connect", ev);
  }

  async function onclose(ev: CloseEvent) {
    await executeHandler("disconnect", ev);
    clear();
    reconnect();
  }

  async function onerror(ev: Event) {
    await executeHandler("connect_error", ev);
    clear();
    reconnect();
  }

  async function openConnect(ev: Event) {
    instance!.addEventListener("message", onmessage, { passive: true });
    instance!.addEventListener("close", onclose, { passive: true });
    instance!.addEventListener("error", onerror, { passive: true });
    instance!.removeEventListener("open", openConnect);
    instance!.removeEventListener("error", errConnect);
    retry = 0;
    ready = true;
    await onopen(ev);
  }

  function errConnect() {
    clear();
    reconnect();
  }

  function clear() {
    if (instance) {
      try {
        ready && instance.close();
        ready = false;
        instance.removeEventListener("message", onmessage);
        instance.removeEventListener("close", onclose);
        instance.removeEventListener("error", errConnect);
        instance.removeEventListener("error", onerror);
        instance.removeEventListener("open", openConnect);
        instance = null;
      } catch (err) {
        console.error("WebSocket Clear Error:", err);
      }
    }
  }

  function connect() {
    try {
      instance = new WebSocket(uri);
      instance.addEventListener("open", openConnect, { passive: true });
      instance.addEventListener("error", errConnect, { passive: true });
    } catch {
      clear();
    }
  }

  function reconnect() {
    if (++retry <= maxRetry) {
      console.log(`WebSocket[${name}]第${retry}次重连`);
      setTimeout(connect, reconnectionInterval);
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
