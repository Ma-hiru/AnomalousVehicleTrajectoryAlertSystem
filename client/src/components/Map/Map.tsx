import "./Map.scss";
import "@amap/amap-jsapi-types";
import logger from "@/utils/logger.ts";
import AMapLoader from "@amap/amap-jsapi-loader";
import { CSSProperties, FC, useEffect } from "react";
import { MAP_SECURITY_CODE, MAP_KEY } from "@/settings.ts";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";

type props = {
  containerStyle?: CSSProperties
};

const Map: FC<props> = ({ containerStyle = styles.container }) => {
  // 地图实例
  let map: AMap.Map;
  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: MAP_SECURITY_CODE
    };
    AMapLoader.load({
      key: MAP_KEY,
      version: "2.0",
      plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.Geolocation", "AMap.Geocoder", "AMap.MouseTool", "AMap.ControlBar"]
    }).then((Amap) => {
      //eslint-disable-next-line
      map = new Amap.Map("Map-container", {
        viewMode: "3D",
        zoom: 11,
        center: [116.397428, 39.90923]
      });
    }).catch((err) => {
      logger.Message.Error("地图加载失败！");
      logger.Echo({ err });
    });
    return () => {
      map?.destroy();
    };
  }, []);
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
    height: " 500px"
  }
});
