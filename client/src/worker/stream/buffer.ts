export class BufferManager {
  queue: ArrayBuffer[];
  max_size: number;
  private totalSize: number;

  constructor(max_size: number) {
    this.queue = [];
    this.max_size = max_size;
    this.totalSize = 0;
  }

  is_overflow() {
    return this.queue.length > this.max_size;
  }

  remove_overflow() {
    let remove_count = this.queue.length - this.max_size;
    while (remove_count-- > 0 && this.queue.length > 0) {
      const removed = this.queue.shift();
      if (removed) {
        this.totalSize -= removed.byteLength;
      }
    }
  }

  push_packet(packet: ArrayBuffer) {
    if (this.is_overflow()) {
      this.remove_overflow();
    }
    this.queue.push(packet);
    this.totalSize += packet.byteLength;
    
    // 如果总大小超过阈值，也需要清理旧数据
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
    while (this.totalSize > MAX_TOTAL_SIZE && this.queue.length > 1) {
      const removed = this.queue.shift();
      if (removed) {
        this.totalSize -= removed.byteLength;
      }
    }
  }

  pop_packet() {
    if (this.queue.length > 0) {
      const packet = this.queue.shift();
      if (packet) {
        this.totalSize -= packet.byteLength;
      }
      return packet;
    }
  }

  unshift_packet(packet: ArrayBuffer) {
    if (!this.is_overflow()) {
      this.queue.unshift(packet);
      this.totalSize += packet.byteLength;
    }
  }

  is_ready() {
    return this.queue.length > 0;
  }

  get_total_size() {
    return this.totalSize;
  }

  get_queue_length() {
    return this.queue.length;
  }

  destroy() {
    this.queue = [];
    this.totalSize = 0;
  }
}
