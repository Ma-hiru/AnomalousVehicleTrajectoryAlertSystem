import { Key } from "react";

/** MockData */
export const MockCar: cars[] = [
  { carId: "湘A11101" },
  { carId: "湘A11102" },
  { carId: "湘A11103" },
  { carId: "湘A11104" },
  { carId: "湘A11105" },
  { carId: "湘A11106" },
  { carId: "湘A11107" },
  { carId: "湘A11108" }
];
export const MockVideo: videos[] = [
  {
    streamId: 1,
    streamName: "编号一",
    addr: "湘潭市长城中学",
    longitude: 112.856493,
    latitude: 27.87448
  },
  {
    streamId: 2,
    streamName: "编号二",
    addr: "湘潭大学铜像广场",
    longitude: 112.863231,
    latitude: 27.876965
  },
  {
    streamId: 3,
    streamName: "编号三",
    addr: "湘潭大学体育馆",
    longitude: 112.870999,
    latitude: 27.879392
  }
];
export const MockAction: actions[] = [
  { actionId: 0, actionName: "正常" },
  { actionId: 1, actionName: "逆行" },
  { actionId: 2, actionName: "超速" },
  { actionId: 3, actionName: "变道" },
  { actionId: 4, actionName: "占应急道" },
  { actionId: 5, actionName: "低速" },
  { actionId: 6, actionName: "停车" }
];
const recordsDB: CarRecord[] = [];
const MAX_RECORDS_DB_SIZE = 1000; // 限制全局记录数量

/** GetData */
export const ReqRecords = (): CarRecord[] => {
  // 生成2-5条随机记录
  const count = Math.floor(Math.random() * 4) + 2;
  const records = [];

  for (let i = 0; i < count; i++) {
    records.push(GenerateRecords());
  }

  return records;
};
export const ReqVideoList = (): VideoStreamInfo[] => {
  return MockVideo;
};
export const ReqTrackList = (options?: {
  start?: number;
  end?: number;
  keyword?: string;
}): (TrackList & { key: Key })[] => {
  // 确保有一些异常记录存在
  if (recordsDB.length < 20) {
    // 初始生成一些记录，确保有足够的测试数据
    for (let i = 0; i < 30; i++) {
      GenerateRecords(false); // 生成异常记录
    }
  }
  // 获取异常车辆ID
  const exceptionsCarId = FilterExceptionsCarId(options?.keyword || "");
  return exceptionsCarId.reduce(
    (pre, carId) => {
      const [records, actionIds, streamIds] = FilterRecordsAndActionsAndStreamsByCarId(carId);
      if (records.length === 0) return pre;
      // 时间筛选 - 筛选时间范围内的记录
      let filteredRecords = records;
      if (options?.start || options?.end) {
        filteredRecords = records.filter((record) => {
          // 如果设置了开始时间，检查记录时间是否大于等于开始时间
          const afterStart = options.start ? record.time >= options.start : true;
          // 如果设置了结束时间，检查记录时间是否小于等于结束时间
          const beforeEnd = options.end ? record.time <= options.end : true;
          return afterStart && beforeEnd;
        });
        // 如果筛选后没有记录，跳过这个车辆
        if (filteredRecords.length === 0) return pre;
      }
      // 重新计算轨迹
      const track = ComputeTrack(filteredRecords, streamIds);
      pre.push({
        carId,
        time: filteredRecords[0], // 使用筛选后的记录
        actionIds,
        track,
        key: carId
      });
      return pre;
    },
    [] as (TrackList & { key: Key })[]
  );
};
/** utils */
const GenerateRecords = (allowNormal: boolean = true): CarRecord => {
  const carId = MockCar[Math.floor(Math.random() * MockCar.length)].carId;
  const streamId = MockVideo[Math.floor(Math.random() * MockVideo.length)].streamId;
  // 增加异常行为出现的概率，提高可视化效果
  let actionId;
  if (allowNormal && Math.random() < 0.3) {
    // 30%概率是正常行为
    actionId = 0;
  } else {
    // 异常行为 (1-6)
    actionId = Math.floor(Math.random() * 6) + 1;
  }
  const status = actionId === 0;
  const mockData = {
    recordId: carId + Date.now() + Math.random().toString(36).substring(2, 8),
    carId,
    streamId,
    actionId,
    time: Date.now() - Math.floor(Math.random() * 3600000), // 随机生成过去1小时内的时间
    status
  };
  // 添加到记录库
  recordsDB.push(mockData);
  // 限制记录库大小
  if (recordsDB.length > MAX_RECORDS_DB_SIZE) {
    recordsDB.splice(0, recordsDB.length - MAX_RECORDS_DB_SIZE);
  }
  return mockData;
};
const FilterExceptionsCarId = (keyword: string = "") => {
  return [
    ...recordsDB.reduce((pre, cur) => {
      if (!cur.status && cur.carId.includes(keyword)) {
        pre.add(cur.carId);
      }
      return pre;
    }, new Set() as Set<string>)
  ];
};
const FilterRecordsAndActionsAndStreamsByCarId = (
  carId: string
): [records: CarRecord[], actionIds: number[], streamIds: number[]] => {
  const actionIds = new Set<number>();
  const streamIds = new Set<number>();
  const records = recordsDB
    .filter((record) => {
      if (record.carId === carId) {
        actionIds.add(record.actionId);
        streamIds.add(record.streamId);
        return true;
      }
      return false;
    })
    .sort((a, b) => b.time - a.time);
  return [records, [...actionIds], [...streamIds]];
};
const FilterTimeRangeAndRecordsByStream = (
  records: CarRecord[],
  streamId: number
): [records: CarRecord[], timeRange: [number, number]] => {
  const recordsSet = records
    .filter((record) => record.streamId === streamId)
    .sort((a, b) => b.time - a.time);

  // 保护逻辑：确保有足够的记录
  if (recordsSet.length === 0) {
    return [[], [0, 0]];
  }

  const timeRange = [recordsSet[recordsSet.length - 1].time, recordsSet[0].time];
  return [recordsSet, timeRange as [number, number]];
};
const ComputeTrack = (recordSet: CarRecord[], streamIds: number[]): Track[] => {
  return streamIds.map((streamId) => {
    const [records, timeRange] = FilterTimeRangeAndRecordsByStream(recordSet, streamId);
    return {
      streamId,
      records,
      timeRange
    };
  });
};
