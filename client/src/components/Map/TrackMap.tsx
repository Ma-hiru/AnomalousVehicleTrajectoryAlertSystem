import { FC, memo, useCallback, useEffect, useRef } from "react";
import { useMyState } from "@/hooks/useMyState";
import BaseMap from "@/components/Map/Map";
import "@amap/amap-jsapi-types";
import { getLocation } from "@/utils/getLocation";
import Logger from "@/utils/logger";
import { useMapZustandStore } from "@/stores/zustand/map";
import { useShallow } from "zustand/react/shallow";

const TrackMap: FC<object> = () => {
  const { videoList, anomalousCount } = useMapZustandStore(
    useShallow((state) => ({
      videoList: state.videoList,
      anomalousCount: state.anomalousCount
    }))
  );
  const map = useMyState<AMap.Map | null>(null);
  const amap = useMyState<typeof window.AMap | null>(null);
  const loca = useMyState<typeof Loca | null>(null);
  const markersRef = useRef<Array<AMap.Marker>>([]);
  const heatmapLayerRef = useRef<any>(null);
  // 获取摄像头的异常总数
  const getAnomalyCount = useCallback(
    (streamId: number) => anomalousCount.get(streamId) || 0,
    [anomalousCount]
  );
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
  //TODO 优化更新
  //显示摄像头标记
  useEffect(() => {
    const currentMap = map.get();
    const currentAMap = amap.get();
    if (currentMap && currentAMap && videoList.length > 0) {
      // 清除之前的标记
      if (markersRef.current.length > 0) {
        currentMap.remove(markersRef.current);
        markersRef.current = [];
      }
      // 为每个视频流创建标记
      markersRef.current = videoList.map((stream) => {
        // 获取该摄像头的异常行为数量
        const anomalyCount = getAnomalyCount(stream.streamId);
        // 创建标记
        const marker = new currentAMap.Marker({
          position: new currentAMap.LngLat(stream.longitude, stream.latitude),
          title: stream.streamName,
          icon: new currentAMap.Icon({
            size: new currentAMap.Size(20, 35),
            image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
            imageSize: new currentAMap.Size(15, 25)
          }),
          offset: new currentAMap.Pixel(-20, -40),
          label: {
            content: `<div style="padding:2px 4px;font-size:12px;color:#fff;background-color:mediumvioletred;border-radius:4px;">${anomalyCount}异常</div>`,
            direction: "bottom"
          }
        });
        // 创建信息窗口
        const infoWindow = new currentAMap.InfoWindow({
          isCustom: true,
          content: `
            <div style="padding: 12px; border-radius: 5px;background:rgba(0,0,0,0.6);">
              <h4 style="margin: 0 0 8px 0; color: #1890ff;">${stream.streamName}</h4>
              <p style="margin: 5px 0; font-size: 13px;"><b>位置:</b> ${stream.addr}</p>
              <p style="margin: 5px 0; font-size: 13px;"><b>异常行为:</b> <span style="color:${
                anomalyCount > 0 ? "#ff4d4f" : "#52c41a"
              }">${anomalyCount}次</span></p>
              <p style="margin: 5px 0; font-size: 13px;"><b>经纬度:</b> ${stream.longitude.toFixed(
                6
              )}, ${stream.latitude.toFixed(6)}</p>
            </div>
          `,
          offset: new currentAMap.Pixel(0, -30),
          anchor: "bottom-center"
        });

        // 鼠标悬停显示信息窗口
        marker.on("mouseover", () => {
          infoWindow.open(currentMap, marker.getPosition());
        });

        marker.on("mouseout", () => {
          infoWindow.close();
        });

        return marker;
      });

      // 添加标记到地图
      currentMap.add(markersRef.current);

      // 设置地图视图以包含所有标记
      if (markersRef.current.length > 0) {
        currentMap.setFitView(markersRef.current);
      } else {
        getLocation()
          .then((pos) => {
            if (pos) {
              currentMap.setCenter([112.86, 27.88]);
              currentMap.setZoom(12);
            }
          })
          .catch(() => {
            Logger.Message.Error("地点定位失败！");
          });
      }
    }
  }, [amap, getAnomalyCount, map, videoList]);
  // 热力图
  useEffect(() => {
    const currentLoca = loca.get();
    const currentMap = map.get();
    if (currentLoca && currentMap && videoList.length > 0) {
      // 清除现有热力图层
      if (heatmapLayerRef.current) {
        currentLoca.remove(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      // 准备热力图数据 - 转换为GeoJSON格式
      const heatmapData = {
        type: "FeatureCollection",
        features: videoList.reduce((pre, camera) => {
          const anomalyCount = getAnomalyCount(camera.streamId);
          if (anomalyCount >= 0) {
            pre.push({
              type: "Feature",
              properties: {
                count: anomalyCount
              },
              geometry: {
                type: "Point",
                coordinates: [camera.longitude, camera.latitude]
              }
            });
          }
          return pre;
        }, [] as HeatmapFeature[])
      };
      // 确保有数据点
      if (heatmapData.features.length > 0) {
        try {
          // 创建热力图数据源 - 使用GeoJSONSource而不是LocalSource
          const dataSource = new Loca.GeoJSONSource({
            data: heatmapData
          });
          // 创建热力图层
          const heatmapLayer = new Loca.HeatMapLayer({
            zIndex: 10,
            opacity: 0.8,
            visible: true,
            zooms: [3, 20]
          });
          // 设置热力图样式
          heatmapLayer.setSource(dataSource, {
            radius: 35,
            unit: "px",
            height: 100,
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
            // 使用properties中的count属性作为热力值
            value: (index: number, feature: HeatmapFeature) => {
              return feature.properties.count;
            },
            heightBezier: [0, 0.53, 0.37, 0.98]
          });
          // 添加到Loca容器
          currentLoca.add(heatmapLayer);
          heatmapLayerRef.current = heatmapLayer;
          // 添加动画效果
          heatmapLayer.addAnimate({
            key: "height",
            value: [0, 1],
            duration: 2000,
            easing: "BackOut"
          });
          // 添加点击事件
          currentMap.on("click", function (e: any) {
            const feature = heatmapLayer.queryFeature(e.pixel.toArray());
            if (feature) {
              const infoWindow = new AMap.InfoWindow({
                content: `<div style="padding: 10px;">
                  <p>热力值: ${feature.value.toFixed(2)}</p>
                  <p>位置: ${feature.lnglat[0].toFixed(6)}, ${feature.lnglat[1].toFixed(6)}</p>
                </div>`,
                offset: new AMap.Pixel(0, -30)
              });

              infoWindow.open(currentMap, new AMap.LngLat(feature.lnglat[0], feature.lnglat[1]));
            }
          });
        } catch (error) {
          // 如果Loca热力图创建失败，回退到使用AMap.HeatMap
          console.error("创建热力图出错:", error);
          try {
            console.log("尝试使用AMap.HeatMap...");
            const aMapHeatmapData = videoList
              .map((camera) => {
                const anomalyCount = getAnomalyCount(camera.streamId);
                if (anomalyCount > 0) {
                  return {
                    lng: camera.longitude,
                    lat: camera.latitude,
                    count: anomalyCount * 5 // 增大权重使效果更明显
                  };
                }
                return null;
              })
              .filter((item) => item !== null);
            if (aMapHeatmapData.length > 0) {
              window.AMap.plugin(["AMap.HeatMap"], function () {
                const heatmap = new (AMap as any).HeatMap(currentMap, {
                  radius: 25,
                  opacity: [0, 0.8],
                  gradient: {
                    0.4: "#2A85B8",
                    0.5: "#16B0A9",
                    0.6: "#29CF6F",
                    0.7: "#5CE182",
                    0.8: "#7DF675",
                    0.9: "#FFF100",
                    1.0: "#D04343"
                  },
                  zooms: [3, 18]
                });
                heatmap.setDataSet({
                  data: aMapHeatmapData,
                  max: Math.max(...aMapHeatmapData.map((p) => p.count)) || 10
                });
                heatmapLayerRef.current = heatmap;
              });
            }
          } catch (fallbackError) {
            console.error("AMap.HeatMap 也创建失败:", fallbackError);
          }
        }
      }
    }
  }, [getAnomalyCount, loca, map, videoList]);

  return (
    <BaseMap
      map={map}
      amap={amap}
      containerStyle={{
        width: "100%",
        height: "400px"
      }}
      id="TrackMap-container"
      mapOptions={{
        zooms: [3, 20],
        zoom: 12,
        showLabel: true,
        viewMode: "3D",
        pitch: 40
      }}
      loadOptions={{
        plugins: ["AMap.HeatMap"],
        Loca: {
          version: "2.0.0"
        }
      }}
    />
  );
};

export default memo(TrackMap);
