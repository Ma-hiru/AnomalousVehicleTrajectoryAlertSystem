export class BufferManager {
  queue: ArrayBuffer[];
  max_size: number;

  constructor(max_size: number) {
    this.queue = [];
    this.max_size = max_size;
  }

  is_overflow() {
    return this.queue.length > this.max_size;
  }

  remove_overflow() {
    let remove_count = this.queue.length - this.max_size;
    while (remove_count-- > 0 && this.queue.length > 0) {
      this.queue.shift();
    }
  }

  push_packet(packet: ArrayBuffer) {
    if (this.is_overflow()) {
      this.remove_overflow();
    }
    this.queue.push(packet);
  }

  pop_packet() {
    if (this.is_ready()) {
      return this.queue.shift();
    }
  }

  unshift_packet(packet: ArrayBuffer) {
    if (!this.is_overflow()) {
      this.queue.unshift(packet);
    }
  }

  is_ready() {
    return this.queue.length > 0;
  }

  get_queue_length() {
    return this.queue.length;
  }

  destroy() {
    this.queue = null as unknown as ArrayBuffer[];
  }
}
