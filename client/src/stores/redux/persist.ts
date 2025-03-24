import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE
} from "redux-persist";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import rootReducer from "@/stores/redux/reducers";

/** 分开配置 以免丢失类型推导 */
const persistConfig = {
  key: "root",
  storage: storage,
  // whitelist: [],
  // blacklist: [],
  version: 1,
  migrate: (state: any) => Promise.resolve(state)
};

const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

export const RootState = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});
export const Persistor = persistStore(RootState);

Persistor.subscribe(() => {
  const { bootstrapped } = Persistor.getState();
  if (bootstrapped) {
    /*empty*/
  }
});
