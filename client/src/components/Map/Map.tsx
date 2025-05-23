import "@amap/amap-jsapi-types";
import logger from "@/utils/logger.ts";
import AMapLoader from "@amap/amap-jsapi-loader";
import { CSSProperties, FC, memo, useEffect } from "react";
import { MyState } from "@/hooks/useMyState.ts";
import { useDarkModeReact } from "@/hooks/useDarkMode.ts";
import AppSettings from "@/settings";
import styled from "styled-components";

type props = {
  containerStyle?: CSSProperties;
  map: MyState<AMap.Map | null>;
  amap: MyState<typeof window.AMap | null>;
  id: string;
};

const Map: FC<props> = ({ containerStyle, map, amap, id }) => {
  const { isDark } = useDarkModeReact();
  useEffect(() => {
    if (map.get() === null) {
      window._AMapSecurityConfig = {
        securityJsCode: AppSettings.MAP_SECURITY_CODE
      };
      AMapLoader.load({
        key: AppSettings.MAP_KEY,
        version: "2.0",
        plugins: [
          "AMap.ToolBar",
          "AMap.PlaceSearch",
          "AMap.Scale",
          "AMap.Geolocation",
          "AMap.Geocoder",
          "AMap.MouseTool",
          "AMap.ControlBar",
          "AMap.AutoComplete"
        ]
      })
        .then((AMap: typeof window.AMap) => {
          amap.set(AMap);
          map.set(
            new AMap.Map(id, {
              viewMode: "3D",
              resizeEnable: true,
              zoom: 16,
              mapStyle: isDark ? AppSettings.MAP_THEME_DARK : AppSettings.MAP_THEME_Light
            })
          );
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
  useEffect(() => {
    const currentMap = map.get();
    if (currentMap) {
      isDark && currentMap.setMapStyle(AppSettings.MAP_THEME_DARK);
      !isDark && currentMap.setMapStyle(AppSettings.MAP_THEME_Light);
    }
  }, [isDark, map]);
  return <Container id={id} style={containerStyle} />;
};
export default memo(Map);

const Container = styled.div`
  padding: 0;
  margin: 0;
  width: 100%;
  height: 500px;
`;
