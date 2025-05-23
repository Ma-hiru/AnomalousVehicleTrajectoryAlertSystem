import { CSSProperties } from "react";

export const createStyleSheet = <const T extends Record<string, CSSProperties>>(styles: T) => {
  return styles;
};
