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

export const ActionsEnum: string[] = [
  "正常",
  "逆行",
  "超速",
  "变道",
  "占应急道",
  "低速",
  "停车"
];

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
  const TotalActionCategoryGroupByTime = reactive<Array<number[]>>([]);
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
        SingleCarRecordList.set(stream.streamId, Array(ActionsEnum.length).fill(0));
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
      SingleCarRecordList.get(record.streamId)!.push(record);
      TotalCarRecordList.push(record);
      //TODO MAXLEN AND DELETE
      const recordArr = SingleActionCategoryComputed.get(record.streamId);
      recordArr && recordArr[record.actionId]++;
      TotalActionCategoryComputed[record.actionId]++;
    });
    const hour = new Date().getHours();
    TotalActionCategoryGroupByTime[hour] = [...TotalActionCategoryComputed];
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
