import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useStreamStore = defineStore("streamStore", () => {
  // 视频流列表及当前视频流
  const StreamList = ref<VideoStreamInfo[]>([]);
  const ActiveStream = ref<VideoStreamInfo>(InitialStream);
  const ActionsEnum = ref<string[]>([]);
  // 数据缓存
  //获取后，还需要手动初始化、更新后，需要手动更新，最新数据在数组开头
  const TotalCarRecordList = reactive<CarRecord[]>([]);
  // 直接从后端获取数据（v1.0后端插入数据库时就可以统计 后续可以使用数据库保存）
  const TotalActionCategoryComputed = ref<number[]>([]);
  // 直接从后端获取数据（v1.0后端插入数据库时就可以统计 后续可以使用数据库保存）
  const TotalActionCategoryGroupByTime = reactive<Record<number, number[]>>({});
  // 直接从后端获取数据（v1.0后端插入数据库时就可以统计 后续可以使用数据库保存）
  const SingleCarRecordList = reactive<Map<VideoStreamInfo["streamId"], CarRecord[]>>(new Map());
  // 直接从后端获取数据（v1.0后端插入数据库时就可以统计 后续可以使用数据库保存）
  const SingleActionCategoryComputed = reactive<Map<VideoStreamInfo["streamId"], number[]>>(
    new Map()
  );

  // actions
  function init_map(list: videos[]) {
    list.forEach((stream) => {
      //初始化单个流的记录数组
      if (!SingleCarRecordList.has(stream.streamId)) SingleCarRecordList.set(stream.streamId, []);
      //初始化单个流的行为统计数组
      const arr = Array(ActionsEnum.value.length).fill(0);
      if (!SingleActionCategoryComputed.has(stream.streamId))
        SingleActionCategoryComputed.set(stream.streamId, arr);
    });
    // 初始化当前视频流
    if (ActiveStream.value.streamName === "" && ActiveStream.value.streamId === -1 && list[0])
      set_active_stream(list[0]);
  }

  function set_stream_list(list: videos[]) {
    StreamList.value = list;
    init_map(StreamList.value);
  }

  function set_actions_enum(actions: actions[]) {
    ActionsEnum.value = actions.reduce(
      (pre, cur) => {
        pre[cur.actionId] = cur.actionName;
        return pre;
      },
      <string[]>[]
    );
  }

  function update_total_records(records: CarRecord[]) {
    TotalCarRecordList.unshift(...records);
    checkArraySize(TotalCarRecordList, MAX_RECORDS_SIZE);
  }

  function set_total_action_category(total_action_category: number[]) {
    TotalActionCategoryComputed.value = total_action_category;
  }

  function set_total_action_category_by_time(
    category_by_time: number[][],
    gap_time: number,
    start_time: number
  ) {
    category_by_time.forEach((category, gap) => {
      TotalActionCategoryGroupByTime[gap * gap_time + start_time] = category;
    });
  }

  async function update_single_records(streamId: number, records: CarRecord[]) {
    const arr = SingleCarRecordList.get(streamId);
    if (arr) {
      arr.unshift(...records);
      checkArraySize(arr, MAX_RECORDS_SIZE);
    } else {
      SingleCarRecordList.set(streamId, records);
      checkArraySize(SingleCarRecordList.get(streamId), MAX_RECORDS_SIZE);
    }
  }

  function set_single_action_category(streamId: number, action_category: number[]) {
    SingleActionCategoryComputed.set(streamId, action_category);
  }

  function set_active_stream(active: VideoStreamInfo) {
    ActiveStream.value = active;
  }

  return {
    StreamList,
    ActiveStream,
    SingleCarRecordList,
    TotalCarRecordList,
    SingleActionCategoryComputed,
    TotalActionCategoryComputed,
    TotalActionCategoryGroupByTime,
    update_total_records,
    set_active_stream,
    set_total_action_category,
    set_total_action_category_by_time,
    update_single_records,
    set_single_action_category,
    set_actions_enum,
    set_stream_list
  };
});

const InitialStream = {
  addr: "",
  latitude: -1,
  longitude: -1,
  streamId: -1,
  streamName: ""
};

/**
 * 异常行为
 * @deprecated
 * */
export const enum ActionCategory {
  /** 正常 */
  Normal,
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

/** @deprecated */
export const ActionsEnum: string[] = [
  "",
  "正常",
  "逆行",
  "超速",
  "变道",
  "占应急道",
  "低速",
  "停车"
];

const MAX_RECORDS_SIZE = 50;

export function checkArraySize(arr: any[] | undefined | null, maxSize: number = MAX_RECORDS_SIZE) {
  if (!Array.isArray(arr) || maxSize < 0 || !Number.isInteger(maxSize)) return;
  arr.length > maxSize && arr.splice(maxSize);
}
