import { Ref, ref } from "vue";
import RootState, { RootStateType } from "@/stores/redux";

const state = ref<RootStateType["userStore"]>(RootState.getState().userStore);
RootState.subscribe(() => {
  state.value = RootState.getState().userStore;
});
export const useUserRedux = (): [
  userStore: Ref<RootStateType["userStore"]>,
  dispatch: typeof RootState.dispatch
] => {
  return [state, RootState.dispatch];
};
