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

export enum API {
  Go2rtcConfig = "/api/go2rtc/config",
  Go2rtcStreams = "/api/go2rtc/streams",
  GinRestart = "/api/gin/restart",
}

export const GetStreamURL = (name: string) => {
  const url = baseUrl.replace("http", "ws").replace("https", "wss");
  return {
    stream: `${url}/api/go2rtc/ws?src=${name}`,
    frame: `${url}/api/gin/frames?name=${name}`
  } as const;
};
