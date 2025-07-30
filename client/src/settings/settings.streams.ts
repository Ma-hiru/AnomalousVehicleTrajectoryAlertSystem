/** seconds */
export const BUFFER_MAX_DURATION = 10;
export const MAX_QUEUE_LENGTH = 100;
export const STREAMS_CONF_NAME = "streams";
export const UPDATE_RECORDS_INTERVAL = 3000;

export const enum SyncManager {
  THRESHOLD = 0.5,
  MAX_TIME_CAN_IGNORE = 15,
  RUNNING_BUFFER_TIME = 0.1
}
