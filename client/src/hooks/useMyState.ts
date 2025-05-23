import { DraftFunction, useImmer } from "use-immer";
import { useMemo } from "react";

export type MyState<T> = {
  get: () => T;
  set: (newValue: T | DraftFunction<T>) => void;
};
export const useMyState = <T>(initialState: T): MyState<T> => {
  const [data, updater] = useImmer<T>(initialState);
  return useMemo(
    () => ({
      get() {
        return data;
      },
      set(newValue) {
        updater(newValue);
      }
    }),
    [data, updater]
  );
};
