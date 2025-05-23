import { FC, memo, useEffect } from "react";
import Map from "@/components/Map/Map.tsx";
import { useMyState } from "@/hooks/useMyState.ts";
import "@amap/amap-jsapi-types";
import { getLocation } from "@/utils/getLocation.ts";
import Logger from "@/utils/logger.ts";
import "./SelectMap.scss";

type props = {
  layoutSpiltSize: number;
};
const TrackMap: FC<props> = ({ layoutSpiltSize }) => {
  const map = useMyState<AMap.Map | null>(null);
  const amap = useMyState<typeof window.AMap | null>(null);
  //初始化当前位置作为中心点
  useEffect(() => {
    const currentMap = map.get();
    const currentAMap = amap.get();
    if (currentMap !== null && currentAMap !== null) {
      getLocation()
        .then((pos) => {
          //TODO 模拟数据
          if (pos) currentMap.setCenter([112.86, 27.88]);
        })
        .catch(() => {
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
        const currentMap = map.get();
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
          width: `calc(${1 - layoutSpiltSize - 0.05}*(100vw - 8*var(--spacing)))`,
          height: "40vh"
        }}
        id="TrackMap-container"
      />
    </>
  );
};
export default memo(TrackMap);
