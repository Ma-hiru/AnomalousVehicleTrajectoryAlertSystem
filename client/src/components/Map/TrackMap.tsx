import { FC, memo, useEffect } from "react";
import Map from "@/components/Map/Map.tsx";
import { useMyState } from "@/hooks/useMyState.ts";
import "@amap/amap-jsapi-types";
import { getLocation } from "@/utils/getLocation.ts";
import Logger from "@/utils/logger.ts";
import "./SelectMap.scss";


type props = object;
const TrackMap: FC<props> = () => {
    const map = useMyState<AMap.Map | null>(null);
    const amap = useMyState<typeof window.AMap | null>(null);
    //初始化当前位置作为中心点
    useEffect(() => {
      const currentMap = map.get();
      const currentAMap = amap.get();
      if (currentMap !== null && currentAMap !== null) {
        getLocation().then((pos) => {
          if (pos) currentMap.setCenter(new currentAMap.LngLat(112.86, 27.88));
        }).catch(() => {
          Logger.Message.Error("地点定位失败！");
        });
      }
    }, [amap, map]);
    //使用插件
    useEffect(() => {
      const currentAMap = amap.get();
      const currentMap = map.get();
      if (currentAMap && currentMap) {
        const ToolBar = new currentAMap.ToolBar({
          position: {
            bottom: "4rem",
            right: "1rem"
          }
        });
        currentMap.addControl(ToolBar);
        const Scale = new currentAMap.Scale({
          position: "LT"
        });
        currentMap.addControl(Scale);
        const Geolocation = new currentAMap.Geolocation();
        currentMap.addControl(Geolocation);
        return () => {
          if (currentMap) {
            currentMap.removeControl(ToolBar);
            currentMap.removeControl(Scale);
            currentMap.removeControl(Geolocation);
          }
        };
      }
    }, [amap, map]);
    return (
      <>
        <Map
          map={map}
          amap={amap}
          containerStyle={{
            width: "100%",
            height: "var(--layout-card-content-height-calc)"
          }}
        />
      </>
    );
  }
;
export default memo(TrackMap);
