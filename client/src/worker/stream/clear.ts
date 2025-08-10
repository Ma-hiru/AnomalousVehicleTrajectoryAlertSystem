import AppSettings from "@/settings";
import { VideoManager } from "@/worker/stream/video";

export class ClearManager {
  private video_manager;
  private timer;

  constructor(video_manager: VideoManager) {
    this.video_manager = video_manager;
    this.timer = window.setInterval(
      this.clearBuffer.bind(this),
      (AppSettings.BUFFER_MAX_DURATION * 1000) / 2
    );
  }

  private clearBuffer() {
    const currentTime = this.video_manager.get_video_current_time();
    const buffered = this.video_manager.get_video_buffered();
    const bufferAheadTime = this.video_manager.get_video_buffer_time() - currentTime;
    
    console.log("缓存清理 - 当前时间:", currentTime.toFixed(2), "缓冲提前时间:", bufferAheadTime.toFixed(2));
    
    let start;
    let end;
    let hasRemoved = false;
    
    // 遍历所有缓冲区范围
    for (let i = 0; i < buffered.length; i++) {
      start = buffered.start(i);
      end = buffered.end(i);
      
      // 如果缓冲区结束时间早于当前播放时间减去最大缓冲持续时间，则移除该缓冲区
      if (end < currentTime - AppSettings.BUFFER_MAX_DURATION) {
        console.log("移除过期缓冲区:", start.toFixed(2), "到", end.toFixed(2));
        this.video_manager.remove_source_buffer(start, end);
        hasRemoved = true;
      }
      // 如果单个缓冲区时长超过最大缓冲持续时间，则移除较早的部分
      else if (end - start > AppSettings.BUFFER_MAX_DURATION * 2) {
        const removeEnd = end - AppSettings.BUFFER_MAX_DURATION;
        console.log("移除缓冲区前半部分:", start.toFixed(2), "到", removeEnd.toFixed(2));
        this.video_manager.remove_source_buffer(start, removeEnd);
        hasRemoved = true;
      }
      // 如果缓冲区过于超前，保留合理的缓冲区大小
      else if (bufferAheadTime > AppSettings.BUFFER_MAX_DURATION * 1.5) {
        const keepBufferSize = AppSettings.BUFFER_MAX_DURATION * 0.8;
        const removeStart = currentTime + keepBufferSize;
        if (removeStart < end) {
          console.log("移除过度超前缓冲区:", removeStart.toFixed(2), "到", end.toFixed(2));
          this.video_manager.remove_source_buffer(removeStart, end);
          hasRemoved = true;
        }
      }
    }
    
    if (hasRemoved) {
      console.log("缓存清理完成，剩余缓冲区数量:", buffered.length);
    }
  }

  public destroy() {
    window.clearInterval(this.timer);
    this.timer = null as unknown as number;
    this.video_manager = null as unknown as VideoManager;
  }
}
