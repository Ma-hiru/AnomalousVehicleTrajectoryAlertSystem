import { reactive } from "vue";
import RootState, { RootStateType } from "@/stores/redux";

export const useUserRedux = (): [userStore: RootStateType["userStore"], dispatch: typeof RootState.dispatch] => {
  const state = reactive<RootStateType["userStore"]>(RootState.getState().userStore);
  RootState.subscribe(() => {
    Object.assign(state, RootState.getState().userStore);
  });
  return [
    state,
    RootState.dispatch
  ];
};
