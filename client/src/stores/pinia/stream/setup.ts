import { state, StateType } from "./state";
import { action, ActionType } from "./action";
import { api, ApiType } from "./api";
import { watch } from "vue";

export const setup = (): StateType & ActionType & ApiType => {
  const states = state();
  const actions = action(states);
  const apis = api(states, actions);
  watch(states.ActiveStream, (stream) => {
    apis.GetSingleRecords(stream.streamId);
    apis.GetSingleCategory(stream.streamId);
  });
  return { ...states, ...actions, ...apis };
};
