import { DraftFunction, useImmer } from "use-immer";
import { useMemo, useRef } from "react";

export type MyState<T> = {
  get: () => T;
  set: (newValue: T | DraftFunction<T>) => void;
  clear: () => void;
}
export const useMyState = <T>(initialState: T): MyState<T> => {
  const initial = useRef(initialState);
  const [data, updater] = useImmer<T>(initialState);
  return useMemo(() => ({
    get() {
      return data;
    },
    set(newValue) {
      updater(newValue);
    },
    clear() {
      updater(initial.current);
    }
  }), [data, updater]);
};
