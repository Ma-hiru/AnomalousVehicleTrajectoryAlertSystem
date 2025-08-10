import { ref, reactive } from "vue";

export const state = () => {
  // 视频流列表及当前视频流
  const StreamList = ref<VideoStreamInfo[]>([]);
  const ActiveStream = ref<VideoStreamInfo>(InitialStream);
  const ActionsEnum = ref<string[]>([]);
  // 数据缓存
  //获取后，还需要手动初始化、更新后，需要手动更新，最新数据在数组开头
  const TotalCarRecordList = reactive<CarRecord[]>([]);
  const TotalCarExceptionsRecordList = reactive<CarRecord[]>([]);
  const TotalCarExceptionsCount = ref(0);
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
  return {
    StreamList,
    ActiveStream,
    ActionsEnum,
    TotalCarRecordList,
    TotalActionCategoryComputed,
    TotalActionCategoryGroupByTime,
    SingleCarRecordList,
    SingleActionCategoryComputed,
    TotalCarExceptionsRecordList,
    TotalCarExceptionsCount
  };
};

export type StateType = ReturnType<typeof state>;

const InitialStream = {
  addr: "",
  latitude: -1,
  longitude: -1,
  streamId: -1,
  streamName: ""
};
