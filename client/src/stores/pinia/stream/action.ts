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
    // 清理Map中不存在的streamId
    cleanupInvalidStreamIds(list);
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
    state.TotalCarExceptionsRecordList.unshift(...records.filter((r) => !r.status));
    checkArraySize(state.TotalCarRecordList);
    checkArraySize(state.TotalCarExceptionsRecordList);
    // 触发响应式更新
    state.updateTrigger.value++;
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
      const timeKey = gap * gap_time + start_time;
      // 确保category是有效的数组
      if (Array.isArray(category)) {
        state.TotalActionCategoryGroupByTime[timeKey] = category;
      }
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
    // 触发响应式更新
    state.updateTrigger.value++;
  }

  function set_single_action_category(streamId: number, action_category: number[]) {
    state.SingleActionCategoryComputed.set(streamId, action_category);
    // 触发响应式更新
    state.updateTrigger.value++;
  }

  function set_active_stream(active: VideoStreamInfo) {
    state.ActiveStream.value = active;
  }

  // 获取正常行为的索引（动态查找名称包含"正常"的行为）
  function getNormalBehaviorIndex(): number {
    return state.ActionsEnum.value.findIndex(
      (action) => action && (action.includes("正常") || action.toLowerCase().includes("normal"))
    );
  }

  // 切换是否显示正常行为
  function toggleShowNormalBehavior() {
    state.showNormalBehavior.value = !state.showNormalBehavior.value;
  }

  // 清理无效的streamId
  function cleanupInvalidStreamIds(validStreams: videos[]) {
    const validStreamIds = new Set(validStreams.map((stream) => stream.streamId));

    // 清理SingleCarRecordList中无效的streamId
    for (const [streamId] of state.SingleCarRecordList) {
      if (!validStreamIds.has(streamId)) {
        state.SingleCarRecordList.delete(streamId);
      }
    }

    // 清理SingleActionCategoryComputed中无效的streamId
    for (const [streamId] of state.SingleActionCategoryComputed) {
      if (!validStreamIds.has(streamId)) {
        state.SingleActionCategoryComputed.delete(streamId);
      }
    }
  }

  // 定期清理函数，清理所有可能造成内存泄漏的数据
  function performPeriodicCleanup() {
    // console.log("开始定期清理:");
    // console.log(`- TotalCarRecordList长度: ${state.TotalCarRecordList.length}`);
    // console.log(`- TotalCarExceptionsRecordList长度: ${state.TotalCarExceptionsRecordList.length}`);
    // console.log(
    //   `- TotalActionCategoryGroupByTime条目数: ${Object.keys(state.TotalActionCategoryGroupByTime).length}`
    // );
    // console.log(`- SingleCarRecordList Map大小: ${state.SingleCarRecordList.size}`);
    // console.log(
    //   `- SingleActionCategoryComputed Map大小: ${state.SingleActionCategoryComputed.size}`
    // );

    // 清理时间数据
    cleanupTimeBasedData(state.TotalActionCategoryGroupByTime);

    // 清理Map数据
    cleanupMapData(state.SingleCarRecordList);
    cleanupMapData(state.SingleActionCategoryComputed);

    // 确保所有数组都在限制范围内
    checkArraySize(state.TotalCarRecordList);
    checkArraySize(state.TotalCarExceptionsRecordList);

    // console.log("定期清理完成，清理后状态:");
    // console.log(`- TotalCarRecordList长度: ${state.TotalCarRecordList.length}`);
    // console.log(`- TotalCarExceptionsRecordList长度: ${state.TotalCarExceptionsRecordList.length}`);
    // console.log(
    //   `- TotalActionCategoryGroupByTime条目数: ${Object.keys(state.TotalActionCategoryGroupByTime).length}`
    // );
    // console.log(`- SingleCarRecordList Map大小: ${state.SingleCarRecordList.size}`);
    // console.log(
    //   `- SingleActionCategoryComputed Map大小: ${state.SingleActionCategoryComputed.size}`
    // );
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
    set_active_stream,
    getNormalBehaviorIndex,
    toggleShowNormalBehavior,
    cleanupInvalidStreamIds,
    performPeriodicCleanup
  };
};

export type ActionType = ReturnType<typeof action>;

const MAX_RECORDS_SIZE = 50;
// 限制Map中最大的streamId数量
const MAX_MAP_SIZE = 20;
// 限制时间数据的最大数量
const MAX_TIME_RECORDS = 60;

function checkArraySize(arr: any[] | undefined | null, maxSize: number = MAX_RECORDS_SIZE) {
  if (!Array.isArray(arr) || maxSize < 0 || !Number.isInteger(maxSize)) return;
  arr.length > maxSize && arr.splice(maxSize);
}

// 清理Map数据，限制Map的大小
function cleanupMapData<T>(map: Map<number, T>) {
  if (map.size <= MAX_MAP_SIZE) return;
  const entries = Array.from(map.entries());
  const keysToDelete = entries.slice(0, entries.length - MAX_MAP_SIZE).map(([key]) => key);
  keysToDelete.forEach((key) => map.delete(key));
}

// 清理时间相关数据，只保留最近的时间段
function cleanupTimeBasedData(timeData: Record<number, number[]>) {
  const timeKeys = Object.keys(timeData)
    .map(Number)
    .sort((a, b) => b - a); // 按时间戳降序排列
  if (timeKeys.length <= MAX_TIME_RECORDS) return;
  // 删除最旧的数据，只保留最新的MAX_TIME_RECORDS个
  const keysToDelete = timeKeys.slice(MAX_TIME_RECORDS);
  keysToDelete.forEach((key) => delete timeData[key]);
}
