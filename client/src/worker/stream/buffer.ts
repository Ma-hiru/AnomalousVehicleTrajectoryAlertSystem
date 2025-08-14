export class BufferManager {
  queue: Nullable<ArrayBuffer[]>;
  max_size: number;

  constructor(max_size: number) {
    this.queue = [];
    this.max_size = max_size;
  }

  is_overflow() {
    return this.queue ? this.queue.length > this.max_size : true;
  }

  remove_overflow() {
    if (this.queue) {
      let remove_count = this.queue.length - this.max_size;
      while (remove_count-- > 0 && this.queue.length > 0) {
        this.queue.shift();
      }
    }
  }

  push_packet(packet: ArrayBuffer) {
    if (this.is_overflow()) {
      this.remove_overflow();
    }
    this.queue && this.queue.push(packet);
  }

  pop_packet() {
    if (this.is_ready()) {
      return this.queue!.shift();
    }
  }

  unshift_packet(packet: ArrayBuffer) {
    if (this.queue && !this.is_overflow()) {
      this.queue.unshift(packet);
    }
  }

  is_ready() {
    return this.queue ? this.queue.length > 0 : false;
  }

  get_queue_length() {
    return this.queue ? this.queue.length : 0;
  }

  destroy() {
    this.queue = null;
  }
}
