import { CSSProperties } from "react";


export const createStyleSheet = <T extends Record<string, CSSProperties>>(styles: T) => {
  return styles;
};
