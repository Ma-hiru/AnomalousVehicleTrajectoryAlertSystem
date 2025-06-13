import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import AppSettings from "@/settings";
// import { fetchDataVue } from "@/hooks/useFetchData.ts";
// const { fetchData, API } = fetchDataVue();

export const useStreamStore = defineStore("streamStore", () => {
  const StreamList = ref<VideoStreamInfo[]>([]);
  const ActiveStream = ref<VideoStreamInfo>({
    id: -1,
    name: "",
    latitude: 0,
    longitude: 0
  });
  const SingleCarRecordList = reactive<Map<VideoStreamInfo["name"], CarRecord[]>>(new Map());
  const TotalCarRecordList = reactive<CarRecord[]>([]);
  const SingleActionCategoryComputed = reactive<Map<VideoStreamInfo["name"], number[]>>(new Map());
  const TotalActionCategoryComputed = reactive<number[]>([]);
  const GetStreamList = async (newList: VideoStreamInfo[]) => {
    StreamList.value = newList;
    newList.forEach((stream) => {
      if (!SingleCarRecordList.has(stream.name)) {
        SingleCarRecordList.set(stream.name, Array(AppSettings.ActionCategoryMaxLen).fill(0));
      }
      if (!SingleActionCategoryComputed.has(stream.name)) {
        SingleActionCategoryComputed.set(
          stream.name,
          Array(AppSettings.ActionCategoryMaxLen).fill(0)
        );
      }
    });
    if (ActiveStream.value.name === "" && ActiveStream.value.id === -1) {
      ActiveStream.value = newList[0];
    }
    if (TotalActionCategoryComputed.length === 0) {
      TotalActionCategoryComputed.push(...Array(AppSettings.ActionCategoryMaxLen).fill(0));
    }
    if (TotalCarRecordList.length === 0) {
      TotalCarRecordList.push(...Array(AppSettings.ActionCategoryMaxLen).fill(0));
    }
  };
  const UpdateRecord = async () => {
    const NewData: CarRecord[] = [];
    NewData.forEach((record) => {
      SingleCarRecordList.get(record.stream)!.push(record);
      TotalCarRecordList.push(record);
      //TODO MAXLEN AND DELETE
      const recordArr = SingleActionCategoryComputed.get(record.stream);
      recordArr && recordArr[record.types]++;
      TotalActionCategoryComputed[record.types]++;
    });
  };
  return {
    StreamList,
    ActiveStream,
    SingleCarRecordList,
    TotalCarRecordList,
    SingleActionCategoryComputed,
    TotalActionCategoryComputed,
    GetStreamList,
    UpdateRecord
  };
});
