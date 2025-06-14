/** 汽车数据库类型 */
interface cars {
  carId: string;
}

/** 视频流数据库类型 */
interface videos {
  streamId: number;
  streamName: string;
  addr: string;
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
}

/** 行为数据库类型 */
interface actions {
  actionId: number;
  actionName: string;
}

/** 记录数据库类型 */
interface records {
  recordId: string;
  carId: cars.carId;
  streamId: videos.streamId;
  actionId: actions.actionId;
  time: number;
}

/** 行为记录类型 */
interface CarRecord extends records {
  status: boolean;
}

/** 视频流类型 */
interface VideoStreamInfo extends videos {}

/** 检测框类型 */
interface CarBox {
  streamId: videos.streamName;
  carId: cars.carId;
  timestamp: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
