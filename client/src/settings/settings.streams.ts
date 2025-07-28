import { baseUrl } from "@/settings/settings.api";

/** seconds */
export const BUFFER_MAX_DURATION = 10;
export const MAX_QUEUE_LENGTH = 100;
export const STREAMS_CONF_NAME = "streams";

export const GetStreamURL = (name: string) => {
  const url = baseUrl.replace("http", "ws").replace("https", "wss");
  return {
    stream: `${url}/api/go2rtc/ws?src=${name}`,
    frame: `${url}/api/gin/frames?name=${name}`
  } as const;
};

export const enum SyncManager {
  THRESHOLD = 0.5,
  MAX_TIME_CAN_IGNORE = 15,
  RUNNING_BUFFER_TIME = 0.1
}
