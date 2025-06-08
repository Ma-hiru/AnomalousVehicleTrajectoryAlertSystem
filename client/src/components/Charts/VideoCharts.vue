<template>
  <div class="charts-container">
    <div ref="barchart" class="barchart" />
    <div class="table">
      <VideoTableReact />
    </div>
  </div>
</template>

<script setup lang="ts" name="VideoCharts">
  import * as echarts from "echarts/core";
  import { BarSeriesOption } from "echarts/charts";
  import { GridComponentOption } from "echarts/components";
  import { reactive, useTemplateRef } from "vue";
  import { useEcharts } from "@/hooks/useEcharts.ts";
  import { applyReactInVue } from "veaury";
  import VideoTable from "@/components/Table/VideoTable.tsx";

  const VideoTableReact = applyReactInVue(VideoTable);
  const barchart = useTemplateRef("barchart");
  type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

  const actionTypes = ["超速", "逆行", "抛锚", "慢速"];
  const option = reactive<EChartsOption>({
    xAxis: {
      type: "category",
      data: actionTypes
    },
    yAxis: {
      type: "value"
    },
    tooltip: {
      show: true
    },
    series: [
      {
        data: [120, 200, 150, 80],
        type: "bar",
        showBackground: true,
        backgroundStyle: {
          color: "rgba(180, 180, 180, 0.2)"
        }
      }
    ]
  });
  useEcharts(barchart, option);
</script>

<style scoped lang="scss">
  .charts-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;

    .barchart {
      width: 300px;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .table {
      width: 500px;
    }
  }
</style>
