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
    const currentMap = map.get();
    const currentAMap = amap.get();
    if (!currentMap || !currentAMap) return;

    if (videoList.length === 0) {
      if (heatmapLayerRef.current) {
        try {
          if (heatmapLayerRef.current.hide) {
            heatmapLayerRef.current.hide();
          }
        } catch (e) {
          console.warn("隐藏热力图失败:", e);
        }
      }
      return;
    }

    // 数据准备：包含所有摄像头点位
    const rawData = videoList.map((v) => ({
      lng: v.longitude,
      lat: v.latitude,
      count: getAnomalyCount(v.streamId)
    }));

    // 智能权重分布优化
    const maxCount = rawData.reduce((max, p) => (p.count > max ? p.count : max), 0);
    // 权重增强处理：提高对比度和视觉效果
    const enhancedData = rawData.map((point) => {
      let enhancedCount: number;
      if (maxCount === 0) {
        // 全0情况：设置基础热力值
        enhancedCount = 50;
      } else if (maxCount <= 5) {
        // 低数值范围：大幅放大权重
        enhancedCount = Math.pow(point.count + 1, 2.5) * 20;
      } else if (maxCount <= 20) {
        // 中等数值范围：适度放大权重
        enhancedCount = Math.pow(point.count + 1, 1.8) * 10;
      } else {
        // 高数值范围：平滑权重分布
        const normalizedRatio = point.count / maxCount;
        enhancedCount = Math.pow(normalizedRatio, 0.7) * 100 + point.count * 2;
      }

      return {
        ...point,
        count: Math.round(Math.max(enhancedCount, 10)) // 确保最小权重为10
      };
    });
    // 处理重叠点：为同一位置的后续点添加微小偏移
    const positionSeen: Record<string, number> = {};
    const heatmapData = enhancedData.map((point) => {
      const posKey = `${point.lng.toFixed(6)},${point.lat.toFixed(6)}`;
      const count = (positionSeen[posKey] = (positionSeen[posKey] || 0) + 1);

      if (count > 1) {
        const offset = (count - 1) * 0.00003; // 约3米偏移
        return {
          lng: point.lng + offset,
          lat: point.lat + offset,
          count: point.count
        };
      }
      return point;
    });

    // 动态半径计算：更大的半径提升视觉效果
    const zoom = currentMap.getZoom();
    const dynamicRadius = Math.max(25, Math.min(80, 100 - zoom * 3));

    // 优化渐变配置：更强烈的对比度和更丰富的色彩
    const gradient = {
      0.0: "#000080", // 深蓝色
      0.15: "#0066CC", // 蓝色
      0.3: "#00CCCC", // 青色
      0.45: "#00FF00", // 绿色
      0.6: "#FFFF00", // 黄色
      0.75: "#FF8800", // 橙色
      0.9: "#FF4400", // 红橙色
      1.0: "#FF0000" // 纯红色
    };

    // 计算动态最大值：增强视觉效果
    const enhancedMax = Math.max(...heatmapData.map((p) => p.count));
    const visualMax = Math.max(enhancedMax * 1.2, 100); // 适当放大最大值范围

    // 使用 AMap.HeatMap 插件
    if (!heatmapLayerRef.current) {
      currentAMap.plugin(["AMap.HeatMap"], () => {
        const heatmap = new (currentAMap as any).HeatMap(currentMap, {
          radius: dynamicRadius,
          opacity: [0, 0.8], // 提高初始透明度
          gradient: gradient,
          zooms: [3, 20],
          blur: 0.85 // 添加模糊效果增强视觉
        });

        heatmap.setDataSet({
          data: heatmapData,
          max: visualMax // 使用优化的最大值
        });

        heatmapLayerRef.current = heatmap;
        heatmapLayerRef.current.__heatType = "amap";

        // 缩放事件处理：同时更新半径和透明度
        if (!(currentMap as any).__heatZoomBound) {
          (currentMap as any).__heatZoomBound = true;
          currentMap.on("zoomend", () => {
            if (!heatmapLayerRef.current) return;

            const newZoom = currentMap.getZoom();
            const newRadius = Math.max(25, Math.min(80, 100 - newZoom * 3));
            const newOpacity = Math.max(0.6, Math.min(0.9, 0.5 + newZoom * 0.05));

            try {
              heatmapLayerRef.current.setOptions({
                radius: newRadius,
                opacity: [0, newOpacity]
              });
            } catch (err) {
              console.warn("更新热力图参数失败:", err);
            }
          });
        }
      });
    } else {
      // 更新现有热力图数据
      try {
        heatmapLayerRef.current.setDataSet({
          data: heatmapData,
          max: visualMax // 使用优化的最大值
        });
        heatmapLayerRef.current.show();
      } catch (err) {
        console.warn("更新热力图数据失败:", err);
      }
    }
  }, [getAnomalyCount, map, amap, videoList]);

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
