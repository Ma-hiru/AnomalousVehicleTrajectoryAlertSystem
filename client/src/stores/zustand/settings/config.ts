export const Config: ZustandConfig<States & Actions, States> = (set, get, api) => ({
  ...InitialState,
  addModifiedVideos: (streamName: string, position: { latitude: number; longitude: number }) =>
    set((state) => {
      state.modifiedVideos.set(streamName, position);
      state.modifiedVideos = new Map(state.modifiedVideos);
    }),
  removeModifiedVideos: (streamName: string) =>
    set((state) => {
      state.modifiedVideos.delete(streamName);
      state.modifiedVideos = new Map(state.modifiedVideos);
    }),
  clearModifiedVideos: () =>
    set((state) => {
      state.modifiedVideos = new Map();
    })
});

const InitialState: States = {
  modifiedVideos: new Map()
};

interface States {
  modifiedVideos: Map<string, { latitude: number; longitude: number }>;
}

interface Actions {
  addModifiedVideos: (
    streamName: string,
    position: { latitude: number; longitude: number }
  ) => void;
  removeModifiedVideos: (streamName: string) => void;
  clearModifiedVideos: () => void;
}
