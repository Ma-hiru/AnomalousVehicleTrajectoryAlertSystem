import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Config } from "./config";

const middleware = immer(Config);
export const useTrackZustandStore = create<ReturnType<typeof Config>>()(middleware);
