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
    let start;
    let end;
    // 遍历所有缓冲区范围
    for (let i = 0; i < buffered.length; i++) {
      start = buffered.start(i);
      end = buffered.end(i);
      // 如果缓冲区结束时间早于当前播放时间减去最大缓冲持续时间，则移除该缓冲区
      if (end < currentTime - AppSettings.BUFFER_MAX_DURATION) {
        this.video_manager.remove_source_buffer(start, end);
      }
      // 如果单个缓冲区时长超过最大缓冲持续时间，则移除较早的部分
      else if (end - start > AppSettings.BUFFER_MAX_DURATION * 2) {
        this.video_manager.remove_source_buffer(start, end - AppSettings.BUFFER_MAX_DURATION);
      }
    }
  }

  public destroy() {
    window.clearInterval(this.timer);
    this.timer = null as unknown as number;
    this.video_manager = null as unknown as VideoManager;
  }
}
