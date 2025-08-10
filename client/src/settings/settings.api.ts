/** 基本URL */
export const baseUrl = import.meta.env.VITE_URL;
export const MAP_SECURITY_CODE = import.meta.env.VITE_MAP_SECURITY_CODE;
export const MAP_KEY = import.meta.env.VITE_MAP_KEY;
export const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;

/** token prefix type */
export enum tokenTypePrefix {
  /** BearerToken */
  Bearer = "Bearer ",
  /** BasicToken */
  Basic = "Basic ",
  /** NonePrefix */
  None = ""
}

/** The prefix of token in this project. */
export const tokenPrefix = tokenTypePrefix.Bearer;

export enum Go2rtcAPI {
  Go2rtcConfig = "/api/go2rtc/config",
  Go2rtcStreams = "/api/go2rtc/streams"
}

export const GinAPI = {
  V1: {
    video_stream: "/api/gin/v1/videos",
    video_settings: "/api/gin/v1/videos/settings",
    actions_enum: "/api/gin/v1/actions",
    records: "/api/gin/v1/records",
    category: "/api/gin/v1/category",
    category_minute: "/api/gin/v1/category/minute",
    exceptions_count: "/api/gin/v1/category/exceptions",
    tracks: "/api/gin/v1/tracks",
    anomaly_count: "/api/gin/v1/anomaly",
    go2rtc_yaml: "/api/gin/v1/proxy/config"
  },
  restart: "/api/gin/restart"
} as const;
