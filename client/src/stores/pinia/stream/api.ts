import { fetchDataAsync } from "@/utils/fetchData";
import { StateType } from "./state";
import { ActionType } from "./action";
import { useMapZustandStore } from "@/stores/zustand/map";
import { useTrackZustandStore } from "@/stores/zustand/track";

//Link Zustand
const { setVideoList, updateAnomalousCount } = useMapZustandStore.getState();
const { setTotalExceptionsCount } = useTrackZustandStore.getState();

export const api = (states: StateType, actions: ActionType) => {
  const { SingleCarRecordList, TotalCarRecordList } = states;
  const {
    set_stream_list,
    set_actions_enum,
    set_total_action_category,
    set_total_action_category_by_time,
    update_single_records,
    set_single_action_category,
    update_total_records
  } = actions;

  async function GetActionsEnum() {
    const { ok, data } = await fetchDataAsync("req_actions_get", []);
    ok && set_actions_enum(data);
    return ok;
  }

  async function GetVideoList() {
    const { data, ok } = await fetchDataAsync("req_videos_get", []);
    ok && set_stream_list(data);
    ok && setVideoList(data);
    return ok;
  }

  async function GetTotalRecords() {
    const latestRecord =
      (TotalCarRecordList[0] && TotalCarRecordList[0].time) || new Date().setHours(0, 0, 0, 0);
    const { ok, data } = await fetchDataAsync("req_records_get", [
      {
        from: latestRecord.toString(),
        to: new Date().getTime().toString()
      }
    ]);
    ok && data.length && update_total_records(data);
    return ok;
  }

  async function GetTotalExceptionsCount() {
    const today = new Date().setHours(0, 0, 0, 0);
    const { ok, data } = await fetchDataAsync("req_exceptions_count_get", [
      {
        from: today.toString(),
        to: new Date().getTime().toString()
      }
    ]);
    if (ok && Number.isInteger(data)) {
      states.TotalCarExceptionsCount.value = data;
      setTotalExceptionsCount(data);
    }
    return ok;
  }

  async function GetTotalCategory() {
    const today = new Date().setHours(0, 0, 0, 0);
    const { ok, data } = await fetchDataAsync("req_category_get", [
      {
        from: today.toString(),
        to: new Date().getTime().toString()
      }
    ]);
    if (ok && data && Array.isArray(data)) {
      set_total_action_category(data);
    }
    return ok;
  }

  async function GetTotalCategoryByTime(minute: number, start: number) {
    const { ok, data } = await fetchDataAsync("req_category_minute_get", [
      {
        from: start.toString(),
        to: new Date().getTime().toString(),
        gap: minute.toString()
      }
    ]);
    if (ok && data && Array.isArray(data)) {
      set_total_action_category_by_time(data, minute, start);
    }
    return ok;
  }

  async function GetSingleRecords(streamId: number) {
    const list = SingleCarRecordList.get(streamId);
    if (!list) {
      SingleCarRecordList.set(streamId, []);
      return GetSingleRecords(streamId);
    }
    const latestRecord = (list[0] && list[0].time) || new Date().setHours(0, 0, 0, 0);
    const { ok, data } = await fetchDataAsync("req_records_get", [
      {
        streamId: streamId.toString(),
        from: latestRecord.toString(),
        to: new Date().getTime().toString()
      }
    ]);
    ok && update_single_records(streamId, data);
    return ok;
  }

  async function GetSingleCategory(streamId: number) {
    const today = new Date().setHours(0, 0, 0, 0);
    const { ok, data } = await fetchDataAsync("req_category_get", [
      {
        streamId: streamId.toString(),
        from: today.toString(),
        to: new Date().getTime().toString()
      }
    ]);
    if (ok && data && Array.isArray(data)) {
      set_single_action_category(streamId, data);
    }
    return ok;
  }

  async function GetAnomalousCount() {
    const from = new Date().setHours(0, 0, 0, 0).toString();
    const to = new Date().getTime().toString();
    const { ok, data } = await fetchDataAsync("req_anomaly_count", [{ from, to }]);
    ok && data.length && updateAnomalousCount(data);
    return ok;
  }

  return {
    GetActionsEnum,
    GetVideoList,
    GetTotalRecords,
    GetTotalCategory,
    GetTotalCategoryByTime,
    GetSingleRecords,
    GetSingleCategory,
    GetAnomalousCount,
    GetTotalExceptionsCount
  };
};

export type ApiType = ReturnType<typeof api>;
