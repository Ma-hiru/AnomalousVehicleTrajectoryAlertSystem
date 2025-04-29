import { FC, memo, useEffect, useMemo, useRef } from "react";
import Map from "@/components/Map/Map.tsx";
import { MyState, useMyState } from "@/hooks/useMyState.ts";
import Logger from "@/utils/logger.ts";
import "@amap/amap-jsapi-types";


type props = {
  position: MyState<StreamPosition>
};
const SelectMap: FC<props> = ({ position }) => {
  const map = useMyState<AMap.Map | null>(null);
  const amap = useMyState<typeof window.AMap | null>(null);
  const marker = useRef<InstanceType<typeof window.AMap.Marker>>();
  const markers: InstanceType<typeof AMap.Marker>[] = useMemo(() => {
    marker.current = new window.AMap.Marker({
      position: new window.AMap.LngLat(position.get().longitude, position.get().latitude)
    });
    Logger.Console(window.AMap);
    return [marker.current];
  }, [position]);


  useEffect(() => {
    const currentMap = map.get();
    const currentAMap = amap.get();
    if (currentMap !== null && currentAMap !== null) {
      currentMap.on("click", (e: AMap.MapsEvent) => {
        position.set(draft => {
          draft.latitude = e.lnglat.lat;
          draft.longitude = e.lnglat.lng;
        });
      });
      const allMarkers = currentMap.getAllOverlays("marker");
      currentMap.remove(allMarkers);
      currentMap.add(markers);
    }
  }, [amap, map, markers, position]);

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
};
export default memo(SelectMap);
