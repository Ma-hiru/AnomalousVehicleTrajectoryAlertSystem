import { state, StateType } from "./state";
import { action, ActionType } from "./action";
import { api, ApiType } from "./api";
import { watch } from "vue";

export const setup = (): StateType & ActionType & ApiType => {
  const states = state();
  const actions = action(states);
  const apis = api(states, actions);

  watch(
    states.ActiveStream,
    (stream) => {
      // 确保streamId有效时才获取数据
      if (stream.streamId > 0) {
        apis.GetSingleRecords(stream.streamId);
        apis.GetSingleCategory(stream.streamId);
      }
    },
    { immediate: true } // 立即执行一次
  );

  return { ...states, ...actions, ...apis };
};
