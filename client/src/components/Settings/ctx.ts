import { createContext } from "react";
import type { Updater } from "use-immer";

interface value {
  updater: Updater<Go2rtcConfigYaml>,
  currentTabs: string;
  currentItem: string;
}

export const SettingsCtx = createContext<value>({
  updater: () => {
  },
  currentTabs: "",
  currentItem: ""
});
