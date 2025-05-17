/** 基本URL */
export const baseUrl = import.meta.env.VITE_URL;
export const baseWS = import.meta.env.VITE_WS;
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

export enum API {
  LoginUrl = "/api/gin/user/login",
  Go2rtcConfig = "/api/gin/config",
  Go2rtcStreams = "/api/gin/streams",
}
