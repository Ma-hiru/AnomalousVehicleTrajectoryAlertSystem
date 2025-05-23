import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState, Persistor } from "./persist";

export default RootState;
export const PersistedRootState = Persistor;
export type RootStateType = ReturnType<typeof RootState.getState>;
export type AppDispatch = typeof RootState.dispatch;
export const useAppDispatch = useDispatch as () => AppDispatch;
export const useAppSelector = useSelector as TypedUseSelectorHook<RootStateType>;

export * from "./slice/userSlice";
