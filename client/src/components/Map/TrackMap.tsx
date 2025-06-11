import { FC, memo, useEffect } from "react";
import Map from "@/components/Map/Map";
import { useMyState } from "@/hooks/useMyState";
import "@amap/amap-jsapi-types";
import { getLocation } from "@/utils/getLocation";
import Logger from "@/utils/logger";
import "./SelectMap.scss";
import AppCard from "@/components/AppCard";

type props = {
  layoutSpiltSize: number;
};
const TrackMap: FC<props> = ({ layoutSpiltSize }) => {
  const map = useMyState<AMap.Map | null>(null);
  const amap = useMyState<typeof window.AMap | null>(null);
  const loca = useMyState<typeof Loca | null>(null);
  //初始化当前位置作为中心点
  useEffect(() => {
    const currentMap = map.get();
    const currentAMap = amap.get();
    if (currentMap !== null && currentAMap !== null) {
      getLocation()
        .then((pos) => {
          //TODO 模拟数据
          // if (pos) currentMap.setCenter([112.86, 27.88]);
          if (pos) currentMap.setCenter([102.618687, 31.790976]);
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
  //使用Loca
  useEffect(() => {
    const currentLoca = loca.get();
    const currentMap = map.get();
    if (!currentLoca && currentMap) {
      loca.set(
        new Loca.Container({
          map: currentMap
        })
      );
    }
  }, [loca, map]);
  // heatmap
  useEffect(() => {
    const currentLoca = loca.get();
    const currentMap = map.get();
    if (currentLoca && currentMap) {
      const geo = new Loca.GeoJSONSource({
        url: "https://a.amap.com/Loca/static/loca-v2/demos/mock_data/traffic.json"
      });
      const heatmap = new Loca.HeatMapLayer({
        // loca,
        zIndex: 10,
        opacity: 1,
        visible: true,
        zooms: [2, 22]
      });
      heatmap.setSource(geo, {
        radius: 200000,
        unit: "meter",
        height: 500000,
        //radius: 35,
        //unit: 'px',
        //height: 100,
        gradient: {
          0.1: "#2A85B8",
          0.2: "#16B0A9",
          0.3: "#29CF6F",
          0.4: "#5CE182",
          0.5: "#7DF675",
          0.6: "#FFF100",
          0.7: "#FAA53F",
          1: "#D04343"
        },
        value: function (index: any, feature: any) {
          return feature.properties.avg;
          // const value = feature.properties.mom.slice(0, -1);
          // return value + 10 * Math.random();
        },
        // min: -100,
        // max: 100,
        heightBezier: [0, 0.53, 0.37, 0.98]
      });
      currentLoca.add(heatmap);
      console.log(heatmap);
      heatmap.addAnimate({
        key: "height",
        value: [0, 1],
        duration: 2000,
        easing: "BackOut"
        // yoyo: true,
        // repeat: 2,
      });
      heatmap.addAnimate({
        key: "radius",
        value: [0, 1],
        duration: 2000,
        easing: "BackOut",
        // 开启随机动画
        transform: 1000,
        random: true,
        delay: 5000
      });
      currentMap.on("click", function (e: any) {
        const feat = heatmap.queryFeature(e.pixel.toArray());
        if (feat) {
          currentMap.clearMap();
          currentMap.add(
            new AMap.Marker({
              position: feat.lnglat,
              anchor: "bottom-center",
              content:
                '<div style="margin-bottom: 15px; border:1px solid #fff; border-radius: 4px;color: #fff; width: 150px; text-align: center;">热力值: ' +
                feat.value.toFixed(2) +
                "</div>"
            }) as any
          );
        }
      });
    }
  }, [loca, map]);
  return (
    <Map
      map={map}
      amap={amap}
      containerStyle={{
        width: "100%",
        height: "400px"
      }}
      id="TrackMap-container"
      mapOptions={{
        zooms: [2, 22],
        zoom: 4.7,
        showLabel: true,
        // Tips:地图设置成 3D 模式，否则图层会失去高度信息
        viewMode: "3D",
        pitch: 40
      }}
      loadOptions={{
        Loca: {
          version: "2.0.0"
        }
      }}
    />
  );
};
export default memo(TrackMap);
