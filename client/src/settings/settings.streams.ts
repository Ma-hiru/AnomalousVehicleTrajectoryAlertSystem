import { baseUrl } from "@/settings/settings.api.ts";

/** seconds */
export const BUFFER_MAX_DURATION = 30;
export const MAX_QUEUE_LENGTH = 100;
export const STREAMS_CONF_NAME = "streams";

export const GetStreamURL = (name: string) => {
  const url = baseUrl.replace("http", "ws").replace("https", "wss");
  return {
    stream: `${url}/api/go2rtc/ws?src=${name}`,
    frame: `${url}/api/gin/frames?name=${name}`
  } as const;
};
