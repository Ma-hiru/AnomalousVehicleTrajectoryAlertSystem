interface Track {
  streamId: records.streamId;
  timeRange: [records.time, records.time];
  records: records[];
}

interface TrackList {
  carId: records.carId;
  actionIds: records.actionId[];
  time: records.time;
  track: Track[];
}

interface AnomalyCountResult {
  count: number;
  streamId: number;
}
