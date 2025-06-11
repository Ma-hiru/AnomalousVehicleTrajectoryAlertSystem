import { baseUrl } from "@/settings/settings.api";

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

/** 异常行为 */
export const enum ActionCategory {
  /** 倒车/逆行 */
  Reversing,
  /** 超速 */
  Speeding,
  /** 随意变道 */
  DangerousLaneChanges,
  /** 占用应急车道 */
  OccupyingEmergencyLanes,
  /** 低速 */
  LowSpeed,
  /** 停车 */
  Stopping
}
/** 异常枚举最大数目 */
export const ActionCategoryMaxLen = 6;
