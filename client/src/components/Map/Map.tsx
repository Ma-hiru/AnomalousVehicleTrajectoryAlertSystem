import "@amap/amap-jsapi-types";
import logger from "@/utils/logger.ts";
import AMapLoader from "@amap/amap-jsapi-loader";
import { CSSProperties, FC, useEffect } from "react";
import { MAP_SECURITY_CODE, MAP_KEY } from "@/settings.ts";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { MyState } from "@/hooks/useMyState.ts";


type props = {
  containerStyle?: CSSProperties;
  map: MyState<AMap.Map | null>;
  amap: MyState<typeof window.AMap | null>;
};

const Map: FC<props> = (
  {
    containerStyle = styles.container,
    map,
    amap
  }) => {
  useEffect(() => {
    if (map.get() === null) {
      window._AMapSecurityConfig = {
        securityJsCode: MAP_SECURITY_CODE
      };
      AMapLoader.load({
        key: MAP_KEY,
        version: "2.0",
        plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.Geolocation", "AMap.Geocoder", "AMap.MouseTool", "AMap.ControlBar"]
      }).then((AMap: typeof window.AMap) => {
        map.set(new AMap.Map("Map-container", {
          viewMode: "3D",
          zoom: 16,
          mapStyle: "amap://styles/whitesmoke"
        }));
        amap.set(AMap);
      }).catch((err) => {
        logger.Message.Error("地图加载失败！");
        logger.Echo({ err });
      });
      return () => {
        map.get()?.destroy();
      };
    }
  }, [amap, map]);
  return (
    <>
      <div id="Map-container" style={containerStyle} />
    </>
  );
};
export default Map;
const styles = createStyleSheet({
  container: {
    padding: 0,
    margin: 0,
    width: "100%",
    height: "500px"
  }
});
