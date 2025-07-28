export class WorkerManager<T> {
  private instance: Worker;
  private callback: ((ev: MessageEvent<T>) => void) | undefined;

  constructor() {
    this.instance = new Worker(new URL("@/worker/stream/websocket.worker.ts", import.meta.url), {
      type: "module"
    });
  }

  send(message: T, options?: StructuredSerializeOptions) {
    this.instance.postMessage(message, options);
  }

  message(callback: (ev: T) => void) {
    this.callback && this.instance.removeEventListener("message", this.callback);
    const handler = (ev: MessageEvent<T>) => callback(ev.data);
    this.instance.addEventListener("message", handler, { passive: true });
    this.callback = handler;
  }

  destroy() {
    this.callback && this.instance.removeEventListener("message", this.callback);
    this.callback = undefined;
    this.instance.terminate();
    this.instance = null as unknown as Worker;
  }
}
