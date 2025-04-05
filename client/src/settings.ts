/** 基本URL */
export const baseUrl = import.meta.env.VITE_URL;
export const baseWS = import.meta.env.VITE_WS;

/** token prefix type */
export enum tokenTypePrefix {
  /** BearerToken */
  Bearer = "Bearer ",
  /** NonePrefix */
  None = ""
}

/** The prefix of token in this project. */
export const tokenPrefix = tokenTypePrefix.Bearer;
export const screensConfig = {
  "xs": 480,
  "sm": 640,
  "md": 768,
  "lg": 1024,
  "xl": 1280,
  "2xl": 1536
};

export enum API {
  LoginUrl = "/api/gin/user/login",
  Go2rtcConfig = "/api/gin/config",
  Go2rtcStreams = "/api/gin/streams",
}

export const BUFFER_MAX_DURATION = 30;
export const MAX_QUEUE_LENGTH = 100;
