import "@amap/amap-jsapi-types";
import logger from "@/utils/logger.ts";
import AMapLoader from "@amap/amap-jsapi-loader";
import { CSSProperties, FC, useEffect } from "react";
import { MAP_SECURITY_CODE, MAP_KEY } from "@/settings.ts";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { useMyState } from "@/hooks/useMyState.ts";

type props = {
  containerStyle?: CSSProperties;
  onDbClickMap?: (e: AMap.MapsEvent) => void;
  onClickMap?: (e: AMap.MapsEvent) => void;
};

const Map: FC<props> = ({ containerStyle = styles.container, onClickMap, onDbClickMap }) => {
  // 地图实例
  const map = useMyState<AMap.Map | null>(null);
  useEffect(() => {
    if (map.get() === null) {
      window._AMapSecurityConfig = {
        securityJsCode: MAP_SECURITY_CODE
      };
      AMapLoader.load({
        key: MAP_KEY,
        version: "2.0",
        plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.Geolocation", "AMap.Geocoder", "AMap.MouseTool", "AMap.ControlBar"]
      }).then((Amap) => {
        map.set(new Amap.Map("Map-container", {
          viewMode: "3D",
          zoom: 11
        }));
      }).catch((err) => {
        logger.Message.Error("地图加载失败！");
        logger.Echo({ err });
      });
      return () => {
        map.get()?.destroy();
      };
    }
  }, [map]);
  useEffect(() => {
    const currentMap = map.get();
    if (currentMap !== null) {
      onClickMap && currentMap.on("click", onClickMap);
      onDbClickMap && currentMap.on("dblclick", onDbClickMap);
    }
  }, [map, onClickMap, onDbClickMap]);
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
