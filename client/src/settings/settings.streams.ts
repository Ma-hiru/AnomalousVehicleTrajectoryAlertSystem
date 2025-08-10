/** seconds */
export const BUFFER_MAX_DURATION = 15; // 增加缓冲区最大持续时间
export const MAX_QUEUE_LENGTH = 50; // 减少队列长度以防止内存过多占用
export const STREAMS_CONF_NAME = "streams";
export const UPDATE_RECORDS_INTERVAL = 3000;

export const enum SyncManager {
  THRESHOLD = 0.5,
  MAX_TIME_CAN_IGNORE = 15,
  RUNNING_BUFFER_TIME = 0.1
}
