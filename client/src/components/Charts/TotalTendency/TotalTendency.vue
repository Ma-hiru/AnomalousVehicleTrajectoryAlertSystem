<template>
  <div class="total-tendency-container">
    <div class="chart-controls" v-if="showControls">
      <el-switch
        v-model="showNormalBehavior"
        active-text="显示正常行为"
        inactive-text="隐藏正常行为"
        @change="updateChartVisibility" />
    </div>
    <div class="chart" ref="tendencyChart"></div>
  </div>
</template>

<script setup lang="ts" name="TotalTendency">
  import { useEcharts } from "@/hooks/useEcharts";
  import { reactive, useTemplateRef, watch, computed, ref } from "vue";
  import { ComposeOption } from "echarts/core";
  import {
    DatasetComponentOption,
    GridComponentOption,
    TitleComponentOption,
    TooltipComponentOption
  } from "echarts/components";
  import { LineSeriesOption } from "echarts/charts";
  import { useStreamStore } from "@/stores/pinia";

  type EChartsOption = ComposeOption<
    | DatasetComponentOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | LineSeriesOption
  >;

  // 配置项，控制是否显示控件和正常行为的曲线
  const props = withDefaults(
    defineProps<{
      normalBehaviorIndex?: number; // 正常行为的索引，默认为0
      showControls?: boolean; // 是否显示控制开关
    }>(),
    {
      normalBehaviorIndex: 0,
      showControls: true
    }
  );

  const streamStore = useStreamStore();
  const tendencyChart = useTemplateRef("tendencyChart");
  const showNormalBehavior = ref(false); // 默认不显示正常行为

  // 更新图表可见性的函数
  const updateChartVisibility = () => {
    if (!instance.value) return;
    const legendSelected: Record<string, boolean> = {};
    streamStore.ActionsEnum.forEach((action, index) => {
      // 如果是正常行为且不显示正常行为，则设为false
      if (index === props.normalBehaviorIndex) {
        legendSelected[action] = showNormalBehavior.value;
      } else {
        legendSelected[action] = true;
      }
    });
    instance.value.setOption({
      legend: {
        selected: legendSelected
      }
    });
  };

  const option = reactive({
    backgroundColor: "transparent",
    animationDuration: 1000,
    textStyle: {
      color: "#ffffff"
    },
    tooltip: {
      order: "valueDesc",
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "#409EFF",
          width: 2
        }
      },
      backgroundColor: "rgba(40, 40, 60, 0.9)",
      borderColor: "#409EFF",
      borderWidth: 1,
      textStyle: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold"
      },
      extraCssText: "box-shadow: 0 0 15px rgba(0, 150, 255, 0.7);",
      formatter: function (params: any[]) {
        if (!params || ("length" in params && params.length === 0)) return "";
        // 格式化时间显示
        const minute = parseInt(params[0].axisValue);
        const hour = Math.floor(minute / 60);
        const min = minute % 60;
        const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

        let result = `<div style="font-weight: bold; color: #fff; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.3); padding: 3px 0 7px;">时间: ${timeStr}</div>`;

        // 按数值从大到小排序，确保重要数据在前
        const sortedParams = [...params].sort((a, b) => b.value - a.value);

        // 过滤出有值的行为
        const validParams = sortedParams.filter((param) => param.value > 0);

        if (validParams.length === 0) {
          result += `<div style="padding: 3px 0; color: #fff;">暂无记录</div>`;
        } else {
          validParams.forEach((param) => {
            const color = param.color;
            const seriesName = param.seriesName;
            const value = param.value;

            result += `<div style="display:flex; align-items:center; padding: 5px 0">
              <span style="display:inline-block; width:10px; height:10px; margin-right:8px; border-radius:50%; background-color:${color}"></span>
              <span style="margin-right:15px; color: #fff;">${seriesName}:</span>
              <span style="font-weight:bold; color: #fff;">${value}</span>
            </div>`;
          });
        }

        return result;
      }
    } as any,
    legend: {
      data: streamStore.ActionsEnum,
      textStyle: {
        color: "#fff"
      },
      top: 30,
      selected: streamStore.ActionsEnum.reduce((acc: any, name, index) => {
        // 默认只显示异常行为，不显示正常行为
        acc[name] = index !== props.normalBehaviorIndex || showNormalBehavior.value;
        return acc;
      }, {})
    },
    xAxis: {
      type: "category",
      name: "时间",
      data: [] as string[],
      nameTextStyle: {
        color: "#fff"
      },
      axisLabel: {
        color: "#fff",
        formatter: (value: string) => {
          // 将分钟转为更易读的时:分格式
          const minute = parseInt(value);
          const hour = Math.floor(minute / 60);
          const min = minute % 60;
          return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        }
      },
      axisLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.3)"
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      name: "记录数",
      nameTextStyle: {
        color: "#fff"
      },
      axisLabel: {
        color: "#fff"
      },
      axisLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.3)"
        }
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.1)"
        }
      }
    },
    grid: {
      bottom: 60,
      top: 80,
      left: 60,
      right: 80 // 增加右侧边距，为末端标签留出空间
    },
    series: [] as any[]
  } satisfies EChartsOption);
  const { instance } = useEcharts(tendencyChart, option);
  // 获取所有时间点，按时间排序
  const getTimePoints = computed(() => {
    return Object.keys(streamStore.TotalActionCategoryGroupByTime)
      .map(Number)
      .sort((a, b) => a - b);
  });
  // 监听数据变化，更新图表
  watch(
    () => [streamStore.TotalActionCategoryGroupByTime, getTimePoints.value.length],
    () => {
      // 如果没有数据，不进行处理
      if (getTimePoints.value.length === 0) return;

      // 设置X轴数据
      option.xAxis.data = getTimePoints.value.map(String);
      // 准备每种行为的数据系列
      const seriesData: Record<string, Array<number>> = {};
      // 初始化每种行为的数据数组
      streamStore.ActionsEnum.forEach((action) => {
        seriesData[action] = new Array(getTimePoints.value.length).fill(0);
      });
      // 填充数据
      getTimePoints.value.forEach((timePoint, timeIndex) => {
        const stats = streamStore.TotalActionCategoryGroupByTime[timePoint] || [];
        stats.forEach((count, actionIndex) => {
          if (actionIndex < streamStore.ActionsEnum.length) {
            seriesData[streamStore.ActionsEnum[actionIndex]][timeIndex] = count;
          }
        });
      });
      // 创建系列
      option.series = streamStore.ActionsEnum.map((action, index) => {
        // 计算该行为的总数
        const totalCount = seriesData[action].reduce((sum, curr) => sum + curr, 0);

        return {
          name: action,
          type: "line",
          data: seriesData[action],
          showSymbol: true,
          symbolSize: 8,
          emphasis: {
            focus: "series",
            scale: 1.5
          },
          lineStyle: {
            width: index === 0 ? 1 : 3,
            type: index === 0 ? "dashed" : "solid"
          },
          itemStyle: {
            color: getActionColor(index)
          },
          areaStyle:
            index === 0
              ? undefined
              : {
                  opacity: 0.15
                },
          // 添加末端标签，显示每条曲线的名称和总数
          endLabel: {
            show: true,
            formatter: `{a}: ${totalCount}`,
            color: getActionColor(index),
            fontSize: 12,
            fontWeight: "bold",
            backgroundColor: "rgba(40, 40, 60, 0.7)",
            padding: [3, 6],
            borderRadius: 3,
            distance: 8
          },
          // 标记线表示最大值
          markPoint: {
            data: [{ type: "max", name: "最大值", symbolSize: 50 }],
            label: {
              color: "#fff"
            }
          }
        };
      });
      // 强制更新图表
      instance.value?.setOption(option, true);

      // 确保设置了正确的可见性
      updateChartVisibility();
    },
    { immediate: true, deep: true }
  );

  // 获取行为对应的颜色
  function getActionColor(index: number): string {
    const colors = [
      "#91cc75", // 正常 - 绿色
      "#ee6666", // 逆行 - 红色
      "#5470c6", // 超速 - 蓝色
      "#fac858", // 变道 - 黄色
      "#73c0de", // 占应急道 - 浅蓝
      "#3ba272", // 低速 - 深绿
      "#fc8452" // 停车 - 橙色
    ];
    return colors[index % colors.length];
  }
</script>

<style scoped lang="scss">
  .total-tendency-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .chart-controls {
      margin-bottom: 10px;
      padding: 0 10px;
      display: flex;
      justify-content: flex-end;
    }

    .chart {
      width: 100%;
      height: 390px;
      background: transparent;
    }
  }
</style>
