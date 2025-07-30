export const Config: ZustandConfig<States & Actions, States> = (set, get, api) => ({
  ...InitialState,
  setVideoList(list: VideoStreamInfo[]) {
    set((draft) => {
      draft.videoList = list;
    });
  },
  updateRecords() {
    set((draft) => {
      if (draft.isUpdatedRecords >= Number.MAX_SAFE_INTEGER - 1) {
        draft.isUpdatedRecords = 1;
      } else {
        draft.isUpdatedRecords += 1;
      }
    });
  },
  setActionEnum(actions: string[]) {
    set((draft) => {
      draft.actionEnum = actions;
    });
  },
  updateAnomalousCount(count: AnomalyCountResult[]) {
    set((draft) => {
      draft.anomalousCount = count.reduce(
        (newMap, AnomalyCount) => newMap.set(AnomalyCount.streamId, AnomalyCount.count),
        new Map<number, number>()
      );
    });
  }
});

const InitialState: States = {
  videoList: [],
  actionEnum: [],
  anomalousCount: new Map<number, number>(),
  isUpdatedRecords: 0
};

interface States {
  videoList: VideoStreamInfo[];
  actionEnum: string[];
  isUpdatedRecords: number;
  anomalousCount: Map<number, number>;
}

interface Actions {
  setVideoList(list: VideoStreamInfo[]): void;

  updateRecords(): void;

  setActionEnum(actions: string[]): void;

  updateAnomalousCount(count: AnomalyCountResult[]): void;
}
