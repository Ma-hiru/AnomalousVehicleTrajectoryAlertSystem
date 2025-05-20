import { FC, memo, useEffect, useMemo, useRef } from "react";
import Map from "@/components/Map/Map.tsx";
import { MyState, useMyState } from "@/hooks/useMyState.ts";
import "@amap/amap-jsapi-types";
import { getLocation } from "@/utils/getLocation.ts";
import Logger from "@/utils/logger.ts";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./SelectMap.scss";
import { useMemoizedFn } from "ahooks";

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
    }, [amap, position]);
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
    const UpdatePosition = useMemoizedFn((e: AMap.MapsEvent) => {
      position.set(draft => {
        console.log(e);
        draft.latitude = e.lnglat.lat;
        draft.longitude = e.lnglat.lng;
      });
    });
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
    const searchText = useMyState("");
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
        const AutoComplete = new currentAMap.AutoComplete({
          city: "010",
          input: "tipinput"
        });
        const PlaceSearch = new currentAMap.PlaceSearch({ //设置PlaceSearch属性
          city: "北京",//城市
          map: currentMap
        });
        const handlePOI = (e: Parameters<Parameters<InstanceType<typeof AMap.AutoComplete>["on"]>[1]>[number]) => {
          PlaceSearch.search(e.poi.name);
          searchText.set(e.poi.name);
        };
        AutoComplete.on("select", handlePOI);
        return () => {
          if (currentMap) {
            currentMap.removeControl(ToolBar);
            currentMap.removeControl(Scale);
            currentMap.removeControl(Geolocation);
            currentMap.removeControl(AutoComplete);
            currentMap.removeControl(PlaceSearch);
            AutoComplete.off("select", handlePOI);
          }
        };
      }
      //eslint-disable-next-line
    }, [amap, map]);
    return (
      <>
        <div className="w-full h-full relative">
          <div className="absolute z-10 right-4 top-4 flex flex-row space-x-2">
            <Input
              type="text"
              id="tipinput"
              value={searchText.get()}
              onChange={(e) => {
                searchText.set(e.target.value);
              }}
            />
            <Button type="primary" shape="circle" icon={<SearchOutlined />} />
          </div>
          <Map
            id="SelectMap-container"
            map={map}
            amap={amap}
            containerStyle={{
              width: "100%",
              height: "95%"
            }}
          />
        </div>
      </>
    );
  }
;
export default memo(SelectMap);
