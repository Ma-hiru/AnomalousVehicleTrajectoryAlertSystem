import { defineStore } from "pinia";
import { reactive, ref } from "vue";

/** 异常行为 */

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

export const ActionsEnum: string[] = ["正常", "逆行", "超速", "变道", "占应急道", "低速", "停车"];

// 最大记录数量限制
const MAX_RECORDS_PER_STREAM = 50;
// 统计时间间隔（分钟）
const STATS_INTERVAL_MINUTES = 1;
// 保存的最大统计时间点数量
const MAX_TIME_POINTS = 60;

export const useStreamStore = defineStore("streamStore", () => {
  // Pre
  const StreamList = ref<VideoStreamInfo[]>([]);
  const ActiveStream = ref<VideoStreamInfo>({
    addr: "",
    latitude: -1,
    longitude: -1,
    streamId: -1,
    streamName: ""
  });
  // Total
  const TotalCarRecordList = reactive<CarRecord[]>([]);
  const TotalActionCategoryComputed = reactive<number[]>([]);
  // 按分钟统计
  const TotalActionCategoryGroupByTime = reactive<Record<number, number[]>>({});
  //Single
  const SingleCarRecordList = reactive<Map<VideoStreamInfo["streamId"], CarRecord[]>>(new Map());
  const SingleActionCategoryComputed = reactive<Map<VideoStreamInfo["streamId"], number[]>>(
    new Map()
  );
  //Methods
  const GetStreamList = async (newList: VideoStreamInfo[]) => {
    StreamList.value = newList;
    newList.forEach((stream) => {
      if (!SingleCarRecordList.has(stream.streamId)) {
        // 修复：初始化为空数组而不是错误的填充0数组
        SingleCarRecordList.set(stream.streamId, []);
      }
      if (!SingleActionCategoryComputed.has(stream.streamId)) {
        SingleActionCategoryComputed.set(stream.streamId, Array(ActionsEnum.length).fill(0));
      }
    });
    if (ActiveStream.value.streamName === "" && ActiveStream.value.streamId === -1 && newList[0]) {
      ActiveStream.value = newList[0];
    }
    if (TotalActionCategoryComputed.length === 0) {
      TotalActionCategoryComputed.push(...Array(ActionsEnum.length).fill(0));
    }
  };

  const UpdateRecord = async (NewData: CarRecord[]) => {
    NewData.forEach((record) => {
      // 获取当前流的记录数组
      const streamRecords = SingleCarRecordList.get(record.streamId);

      if (streamRecords) {
        // 添加新记录到开头，保持最新记录在前
        streamRecords.unshift(record);

        // 限制每个流的记录数量
        if (streamRecords.length > MAX_RECORDS_PER_STREAM) {
          streamRecords.splice(MAX_RECORDS_PER_STREAM);
        }
      }

      // 限制总记录数量
      TotalCarRecordList.unshift(record);
      if (TotalCarRecordList.length > MAX_RECORDS_PER_STREAM * 3) {
        TotalCarRecordList.splice(MAX_RECORDS_PER_STREAM * 3);
      }

      //更新行为统计
      const recordArr = SingleActionCategoryComputed.get(record.streamId);
      if (recordArr) recordArr[record.actionId]++;
      TotalActionCategoryComputed[record.actionId]++;
    });

    // 按分钟统计
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();

    // 深拷贝当前统计数据，确保每个时间点有独立的数据副本
    TotalActionCategoryGroupByTime[currentMinute] = [...TotalActionCategoryComputed];

    // 清理过旧的数据点，只保留最近的MAX_TIME_POINTS个时间点
    const timePoints = Object.keys(TotalActionCategoryGroupByTime)
      .map(Number)
      .sort((a, b) => b - a);

    if (timePoints.length > MAX_TIME_POINTS) {
      const pointsToRemove = timePoints.slice(MAX_TIME_POINTS);
      pointsToRemove.forEach((point) => {
        delete TotalActionCategoryGroupByTime[point];
      });
    }
  };

  const SetActiveStream = (active: VideoStreamInfo) => {
    ActiveStream.value = active;
  };

  return {
    StreamList,
    ActiveStream,
    SingleCarRecordList,
    TotalCarRecordList,
    SingleActionCategoryComputed,
    TotalActionCategoryComputed,
    TotalActionCategoryGroupByTime,
    GetStreamList,
    UpdateRecord,
    SetActiveStream
  };
});
