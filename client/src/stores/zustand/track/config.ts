export const Config: ZustandConfig<States & Actions, States> = (set, get, api) => ({
  ...InitialState,
  setTrackList(list: TrackList[]) {
    set((draft) => {
      draft.currentTrackList = list;
    });
  },
  setTrackDetail(list: Track[]) {
    set((draft) => {
      draft.currentTrackDetail = list;
    });
  }
});

const InitialState: States = {
  currentTrackList: [],
  currentTrackDetail: []
};

interface States {
  currentTrackList: TrackList[];
  currentTrackDetail: Track[];
}

interface Actions {
  setTrackList(list: TrackList[]): void;

  setTrackDetail(list: Track[]): void;
}
