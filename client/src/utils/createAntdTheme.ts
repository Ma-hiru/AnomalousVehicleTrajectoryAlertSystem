import { ConfigProvider } from "antd";
import { FC } from "react";

type props = typeof ConfigProvider extends FC<infer P> ? P : never
type theme = props["theme"] extends (infer P | undefined) ? P : never;
type components = theme["components"];
export const createAntdTheme = <T extends Record<string, components>>(data: T) => {
  const theme: Record<keyof T, { components: components }> = {} as any;
  for (const name in data) {
    theme[name] = { components: data[name] };
  }
  return theme;
};
