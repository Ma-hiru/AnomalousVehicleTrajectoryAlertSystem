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
  { actionId: 3, actionName: "随意变道" },
  { actionId: 4, actionName: "占用应急车道" },
  { actionId: 5, actionName: "低速" },
  { actionId: 6, actionName: "停车" }
];
const recordsDB: CarRecord[] = [];
/** GetData */
export const ReqRecords = (): CarRecord[] => {
  return [GenerateRecords(), GenerateRecords()];
};
export const ReqVideoList = (): VideoStreamInfo[] => {
  return MockVideo;
};
export const ReqTrackList = (options?: {
  start: number;
  end: number;
  keyword: string;
}): (TrackList & { key: Key })[] => {
  const exceptionsCarId = FilterExceptionsCarId(options?.keyword);
  return exceptionsCarId.reduce(
    (pre, carId) => {
      const [records, actionIds, streamIds] = FilterRecordsAndActionsAndStreamsByCarId(carId);
      const track = ComputeTrack(records, streamIds);
      if (options && records[0].time > options.start) {
        pre.push({
          carId,
          time: records[0],
          actionIds,
          track,
          key: carId
        });
      } else if (!options) {
        pre.push({
          carId,
          time: records[0],
          actionIds: [],
          track: [],
          key: carId
        });
      }
      return pre;
    },
    [] as (TrackList & { key: Key })[]
  );
};
/** utils */
const GenerateRecords = (): CarRecord => {
  const carId = MockCar[Math.floor(Math.random() * MockCar.length)].carId;
  const streamId = MockVideo[Math.floor(Math.random() * MockVideo.length)].streamId;
  const actionId = MockAction[Math.floor(Math.random() * MockAction.length)].actionId;
  const status = actionId === 0;
  const mockData = {
    recordId: carId + Date.now(),
    carId,
    streamId,
    actionId,
    time: Date.now(),
    status
  };
  recordsDB.push(mockData);
  return mockData;
};
const FilterExceptionsCarId = (keyword?: string) => {
  return [
    ...recordsDB.reduce((pre, cur) => {
      if (!cur.status && cur.carId.includes(keyword || "")) {
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
