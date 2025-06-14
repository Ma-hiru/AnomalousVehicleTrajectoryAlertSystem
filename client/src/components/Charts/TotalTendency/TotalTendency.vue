<template>
  <div class="total-tendency-container">
    <div class="chart" ref="tendencyChart"></div>
  </div>
</template>

<script setup lang="ts" name="TotalTendency">
  import { useEcharts } from "@/hooks/useEcharts";
  import { reactive, useTemplateRef, watch, watchEffect } from "vue";
  import { ComposeOption } from "echarts/core";
  import {
    DatasetComponentOption,
    GridComponentOption,
    TitleComponentOption,
    TooltipComponentOption
  } from "echarts/components";
  import { LineSeriesOption } from "echarts/charts";
  import { SeriesOption } from "echarts";
  import { ActionsEnum, useStreamStore } from "@/stores/pinia/modules/streamStore";

  type EChartsOption = ComposeOption<
    | DatasetComponentOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | LineSeriesOption
  >;
  const option = reactive({
    backgroundColor: "transparent",
    animationDuration: 5000,
    textStyle: {
      color: "#ffffff"
    },
    tooltip: {
      order: "valueDesc",
      trigger: "axis",
      axisPointer: { type: "line" },
      backgroundColor: "rgba(40, 40, 60, 0.9)",
      borderColor: "#409EFF",
      borderWidth: 1,
      textStyle: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold"
      },
      extraCssText: "box-shadow: 0 0 15px rgba(0, 150, 255, 0.7);"
    },
    dataset: [] as DatasetComponentOption[],
    //@ts-ignore
    series: [] as SeriesOption[],
    xAxis: { type: "category", name: "时间", data: [] as string[] },
    yAxis: { name: "记录数" },
    grid: {
      bottom: 50,
      top: 50,
      left: 50,
      right: 50
    }
  } satisfies EChartsOption);
  useEcharts(useTemplateRef("tendencyChart"), option);
  const streamStore = useStreamStore();

  watch(
    () => streamStore.TotalActionCategoryGroupByTime,
    () => {
      type dataType = Array<{
        Name: string;
        Count: number;
        Time: string;
      }>;
      const data = streamStore.TotalActionCategoryGroupByTime.reduce((pre, cur, hour) => {
        if (hour <= new Date().getHours()) {
          cur.forEach((count, type) => {
            pre.push({
              Name: ActionsEnum[type],
              Count: count,
              Time: hour + "时"
            });
          });
        }
        return pre;
      }, [] as dataType);
      option.xAxis.data = [...new Set(data.map((item) => item.Time))];
      ActionsEnum.forEach((action) => {
        const datasetId = `dataset_${action}`;
        option.dataset!.push({
          id: datasetId,
          source: data.filter((item) => item.Name === action).map((item) => [item.Time, item.Count])
        });
        option.series.push({
          type: "line",
          showSymbol: false,
          datasetId: datasetId,
          encode: {
            x: 0,
            y: 1,
            label: ["Name", "Count"],
            itemName: "Name",
            tooltip: ["Count"]
          },
          name: action,
          endLabel: {
            show: true,
            formatter: (raw: any) => {
              return raw.seriesName + ": " + raw.value[1];
            }
          },
          emphasis: {
            focus: "series"
          }
        });
      });
    },
    { immediate: true }
  );
</script>

<style scoped lang="scss">
  .total-tendency-container {
    width: 100%;
    display: flex;
    justify-content: center;

    .chart {
      width: 100%;
      height: 390px;
      background: transparent;
    }
  }
</style>
