import { StateType } from "@/stores/pinia/stream/state";
import { useMapZustandStore } from "@/stores/zustand/map";

export const action = (state: StateType) => {
  function init_map(list: videos[]) {
    list.forEach((stream) => {
      //初始化单个流的记录数组
      if (!state.SingleCarRecordList.has(stream.streamId))
        state.SingleCarRecordList.set(stream.streamId, []);
      //初始化单个流的行为统计数组
      const arr = Array(state.ActionsEnum.value.length).fill(0);
      if (!state.SingleActionCategoryComputed.has(stream.streamId))
        state.SingleActionCategoryComputed.set(stream.streamId, arr);
    });
    // 初始化当前视频流
    if (
      state.ActiveStream.value.streamName === "" &&
      state.ActiveStream.value.streamId === -1 &&
      list[0]
    )
      set_active_stream(list[0]);
  }

  function set_stream_list(list: videos[]) {
    state.StreamList.value = list;
    init_map(state.StreamList.value);
  }

  function set_actions_enum(actions: actions[]) {
    state.ActionsEnum.value = actions.reduce(
      (pre, cur) => {
        pre[cur.actionId] = cur.actionName;
        return pre;
      },
      <string[]>[]
    );
    //Link Zustand
    const { setActionEnum } = useMapZustandStore.getState();
    setActionEnum(state.ActionsEnum.value);
  }

  function update_total_records(records: CarRecord[]) {
    state.TotalCarRecordList.unshift(...records);
    checkArraySize(state.TotalCarRecordList);
  }

  function set_total_action_category(total_action_category: number[]) {
    state.TotalActionCategoryComputed.value = total_action_category;
  }

  function set_total_action_category_by_time(
    category_by_time: number[][],
    //minute
    gap_minute: number,
    start_time: number
  ) {
    //ms
    const gap_time = gap_minute * 1000 * 60;
    category_by_time.forEach((category, gap) => {
      state.TotalActionCategoryGroupByTime[gap * gap_time + start_time] = category;
    });
  }

  function update_single_records(streamId: number, records: CarRecord[]) {
    const arr = state.SingleCarRecordList.get(streamId);
    if (arr) {
      arr.unshift(...records);
      checkArraySize(arr);
    } else {
      state.SingleCarRecordList.set(streamId, records);
      checkArraySize(state.SingleCarRecordList.get(streamId));
    }
  }

  function set_single_action_category(streamId: number, action_category: number[]) {
    state.SingleActionCategoryComputed.set(streamId, action_category);
  }

  function set_active_stream(active: VideoStreamInfo) {
    state.ActiveStream.value = active;
  }

  return {
    init_map,
    set_stream_list,
    set_actions_enum,
    update_total_records,
    set_total_action_category,
    set_total_action_category_by_time,
    update_single_records,
    set_single_action_category,
    set_active_stream
  };
};

export type ActionType = ReturnType<typeof action>;

const MAX_RECORDS_SIZE = 50;

function checkArraySize(arr: any[] | undefined | null, maxSize: number = MAX_RECORDS_SIZE) {
  if (!Array.isArray(arr) || maxSize < 0 || !Number.isInteger(maxSize)) return;
  arr.length > maxSize && arr.splice(maxSize);
}
