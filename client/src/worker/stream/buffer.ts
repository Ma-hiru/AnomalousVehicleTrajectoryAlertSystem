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
    while (remove_count--) this.queue.shift();
  }

  push_packet(packet: ArrayBuffer) {
    if (this.is_overflow()) this.remove_overflow();
    this.queue.push(packet);
  }

  pop_packet() {
    if (this.queue.length) return this.queue.shift();
  }

  unshift_packet(packet: ArrayBuffer) {
    if (!this.is_overflow()) this.queue.unshift(packet);
  }

  is_ready() {
    return this.queue.length > 0;
  }

  free() {
    this.queue = [];
  }
}
