import { FC, memo, useCallback, useEffect, useMemo, useRef } from "react";
import Map from "@/components/Map/Map.tsx";
import { MyState, useMyState } from "@/hooks/useMyState.ts";
import "@amap/amap-jsapi-types";
import { getLocation } from "@/utils/getLocation.ts";
import Logger from "@/utils/logger.ts";


type props = {
  position: MyState<StreamPosition>
};
const SelectMap: FC<props> = ({ position }) => {
    const map = useMyState<AMap.Map | null>(null);
    const amap = useMyState<typeof window.AMap | null>(null);
    const marker = useRef<InstanceType<typeof window.AMap.Marker>>();
    const markers: InstanceType<typeof AMap.Marker>[] = useMemo(() => {
      const currentAMap = amap.get();
      if (currentAMap) {
        marker.current = new currentAMap.Marker({
          position: new window.AMap.LngLat(position.get().longitude, position.get().latitude)
        });
        return [marker.current];
      }
      return [];
    }, [position]);

    //初始化当前位置作为中心点
    useEffect(() => {
      const currentMap = map.get();
      const currentAMap = amap.get();
      if (currentMap !== null && currentAMap !== null) {
        getLocation().then((pos) => {
          if (pos) {
            //TODO 模拟数据
            // currentMap.setCenter(new currentAMap.LngLat(pos.coords.longitude,pos.coords.latitude))
            currentMap.setCenter(new currentAMap.LngLat(112.86, 27.88));
          }
        }).catch(() => {
          Logger.Message.Error("地点定位失败！");
        });
      }
    }, [amap, map]);
    //更新标记点
    useEffect(() => {
      const currentMap = map.get();
      const currentAMap = amap.get();
      if (currentMap !== null && currentAMap !== null) {
        currentMap.add(markers);
      }
      return () => {
        if (currentMap !== null) {
          const allMarkers = currentMap.getAllOverlays("marker");
          currentMap.remove(allMarkers);
        }
      };
    }, [amap, map, markers, position]);
    //绑定点击事件以便于更新标记点
    const UpdatePosition = useCallback((e: AMap.MapsEvent) => {
      position.set(draft => {
        draft.latitude = e.lnglat.lat;
        draft.longitude = e.lnglat.lng;
      });
    }, []);
    useEffect(() => {
      const currentMap = map.get();
      const currentAMap = amap.get();
      if (currentMap !== null && currentAMap !== null) {
        currentMap.on("click", UpdatePosition);
      }
      return () => {
        if (currentMap !== null) {
          // eslint-disable-next-line
          //@ts-expect-error
          currentMap.off("click", UpdatePosition);
        }
      };
    }, [UpdatePosition, amap, map]);
    //使用插件
    useEffect(() => {
      const currentMap = map.get();
      const currentAMap = amap.get();
      if(currentMap && currentAMap){
        currentMap.plugin("AMap.AutoComplete",()=>{});
      }
    }, []);
    return (
      <>
        <Map
          map={map}
          amap={amap}
          containerStyle={{
            width: "100%",
            height: "90%"
          }}
        />
      </>
    );
  }
;
export default memo(SelectMap);
