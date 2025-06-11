import "@amap/amap-jsapi-types";
import logger from "@/utils/logger";
import AMapLoader from "@amap/amap-jsapi-loader";
import { CSSProperties, FC, memo, useEffect, useMemo } from "react";
import { MyState } from "@/hooks/useMyState";
import AppSettings from "@/settings";
import styled from "styled-components";

type props = {
  containerStyle?: CSSProperties;
  map: MyState<AMap.Map | null>;
  amap: MyState<typeof window.AMap | null>;
  id: string;
  mapOptions?: Partial<AMap.MapOptions>;
  loadOptions?: Partial<AMap.LoadOptions>;
};
const defaultOpt = {
  key: AppSettings.MAP_KEY,
  version: "2.0"
};
const defaultPlugins = [
  "AMap.ToolBar",
  "AMap.PlaceSearch",
  "AMap.Scale",
  "AMap.Geolocation",
  "AMap.Geocoder",
  "AMap.MouseTool",
  "AMap.ControlBar",
  "AMap.AutoComplete"
];
const defaultMapOpt = {
  viewMode: "3D",
  resizeEnable: true,
  zoom: 16,
  mapStyle: AppSettings.MAP_THEME_DARK
};
const Map: FC<props> = ({ containerStyle, map, amap, id, mapOptions, loadOptions }) => {
  const LoadOptions = useMemo<AMap.LoadOptions>(() => {
    if (loadOptions) {
      const plugins = [...defaultPlugins];
      loadOptions.plugins &&
      loadOptions.plugins.forEach((plugin) => {
        if (!plugins.find((item) => item === plugin)) {
          plugins.push(plugin);
        }
      });
      return {
        ...defaultOpt,
        ...loadOptions,
        plugins
      };
    }
    return {
      ...defaultOpt,
      plugins: defaultPlugins
    };
  }, [loadOptions]);
  const MapOptions = useMemo<AMap.MapOptions>(() => {
    if (mapOptions) {
      return {
        ...defaultMapOpt,
        ...mapOptions
      };
    }
    return defaultMapOpt;
  }, [mapOptions]);
  useEffect(() => {
    if (map.get() === null) {
      window._AMapSecurityConfig = {
        securityJsCode: AppSettings.MAP_SECURITY_CODE
      };
      AMapLoader.load(LoadOptions)
        .then((AMap: typeof window.AMap) => {
          amap.set(AMap);
          map.set(new AMap.Map(id, MapOptions));
        })
        .catch((err) => {
          logger.Message.Error("地图加载失败！");
          logger.Echo({ err });
        });
      return () => {
        map.get()?.destroy();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return <Container id={id} style={containerStyle} />;
};
export default memo(Map);

const Container = styled.div`
  padding: 0;
  margin: 0;
  width: 100%;
  height: 500px;
`;
