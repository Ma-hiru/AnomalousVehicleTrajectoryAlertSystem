import { FC, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import "./Map.scss";
import { MAP_SECURITY_CODE, MAP_KEY } from "@/settings.ts";
import "@amap/amap-jsapi-types";

type props = object;

const Map: FC<props> = () => {
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
    }).catch((e) => {
      console.log(e);
    });
    return () => {
      map?.destroy();
    };
  }, []);
  return (
    <>
      <div id="Map-container"></div>
    </>
  );
};
export default Map;
