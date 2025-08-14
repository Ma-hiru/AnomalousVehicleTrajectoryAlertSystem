export const Config: ZustandConfig<States & Actions, States> = (set, get, api) => ({
  ...InitialState,
  setTrackList(list: TrackList[]) {
    set((draft) => {
      draft.currentTrackList = [...list];
    });
  },
  setTrackDetail(list: Track[]) {
    set((draft) => {
      draft.currentTrackDetail = [...list];
    });
  },
  setTotalExceptionsCount(count: number) {
    set((draft) => {
      draft.totalExceptionsCount = count;
    });
  }
});

const InitialState: States = {
  currentTrackList: [],
  currentTrackDetail: [],
  totalExceptionsCount: 0
};

interface States {
  currentTrackList: TrackList[];
  currentTrackDetail: Track[];
  totalExceptionsCount: number;
}

interface Actions {
  setTrackList(list: TrackList[]): void;

  setTrackDetail(list: Track[]): void;

  setTotalExceptionsCount(count: number): void;
}
