import * as go2rtc from "./go2rtc";
import * as gin from "./server";

export const API = {
  ...go2rtc,
  ...gin
} as const;
