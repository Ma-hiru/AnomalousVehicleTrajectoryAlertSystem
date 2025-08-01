export class VideoManager {
  private video: HTMLVideoElement;
  private media_source: MediaSource;
  private source_buffer: Nullable<SourceBuffer>;
  private updated_callback: Nullable<NormalFunc>;
  private auto_play: Nullable<NormalFunc>;

  constructor(video: HTMLVideoElement, sourceopen: NormalFunc) {
    this.video = video;
    this.media_source = new MediaSource();
    this.media_source.addEventListener("sourceopen", sourceopen, { passive: true });
    this.video.src = URL.createObjectURL(this.media_source);
    this.set_auto_play();
  }

  public set_source_buffer(type: string, mode: AppendMode) {
    this.source_buffer = this.media_source.addSourceBuffer(type);
    this.source_buffer.mode = mode;
  }

  public on_updated(callback: NormalFunc) {
    if (this.source_buffer) {
      this.updated_callback &&
        this.source_buffer.removeEventListener("updateend", this.updated_callback);

      this.source_buffer.addEventListener("updateend", callback, {
        passive: true
      });
      this.updated_callback = callback;
    }
  }

  public add_source_buffer(packet: ArrayBuffer): boolean {
    try {
      if (this.source_buffer && !this.source_buffer.updating) {
        this.source_buffer.appendBuffer(packet);
        return true;
      }
      return false;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }

  public remove_source_buffer(start: number, end: number) {
    if (this.source_buffer) {
      try {
        if (!this.source_buffer.updating) this.source_buffer.remove(start, end);
        else this._next_turn_clear(start, end);
      } catch {
        this._next_turn_clear(start, end);
      }
    }
  }

  public async play() {
    try {
      if (this.video.paused) await this.video.play();
    } catch (err) {
      if (typeof err === "object" && err && "name" in err) {
        if (err.name === "AbortError") {
          console.warn("播放被浏览器节能策略中断");
        }
      }
    }
  }

  public get_video_current_time() {
    return this.video.currentTime;
  }

  public get_video_buffer_time() {
    if (this.video.buffered && this.video.buffered.length > 0) {
      return this.video.buffered.end(this.video.buffered.length - 1);
    }
    return 0;
  }

  public get_video_buffered() {
    return this.video.buffered;
  }

  public set_video_time(time: number) {
    this.video.currentTime = time;
  }

  public destroy() {
    this._destroy_stream();
    this._destroy_video();
    this._destroy_auto_play();
  }

  private _next_turn_clear(start: number, end: number) {
    this.source_buffer?.addEventListener(
      "updateend",
      this.remove_source_buffer.bind(this, start, end),
      {
        once: true,
        passive: true
      }
    );
  }

  private set_auto_play() {
    this._destroy_auto_play();
    this.auto_play = this._continue_play.bind(this);
    document.addEventListener("visibilitychange", this.auto_play);
    window.addEventListener("focus", this.auto_play);
  }

  private _continue_play() {
    if (document.visibilityState === "visible") {
      if (this.video.paused) {
        this.video.play().catch();
      }
    }
  }

  private _destroy_stream() {
    if (this.media_source.readyState === "open") {
      this.media_source.endOfStream();
    }
    if (this.source_buffer) {
      this.source_buffer.abort();
      this.media_source.removeSourceBuffer(this.source_buffer);
      if (this.updated_callback) {
        this.source_buffer.removeEventListener("updateend", this.updated_callback);
        this.updated_callback = null;
      }
      this.source_buffer = null;
    }
    this.media_source = null as unknown as MediaSource;
  }

  private _destroy_video() {
    if (this.video.src.startsWith("blob:")) {
      URL.revokeObjectURL(this.video.src);
    }
    this.video.src = "";
    if (this.video.paused) {
      this.video.pause();
    }
    this.video = null as unknown as HTMLVideoElement;
  }

  private _destroy_auto_play() {
    if (this.auto_play) {
      document.removeEventListener("visibilitychange", this.auto_play);
      window.removeEventListener("focus", this.auto_play);
    }
  }
}
