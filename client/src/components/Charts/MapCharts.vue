<template>
  <AppCard>
    <div class="map-charts">
      <div ref="totalChart" class="total-chart" />
      <div class="new-record">
        <MapTableReact />
      </div>
    </div>
  </AppCard>
</template>

<script setup lang="ts" name="MapCharts">
  import * as echarts from "echarts/core";
  import { reactive, useTemplateRef } from "vue";
  import { useEcharts } from "@/hooks/useEcharts.ts";
  import {
    TitleComponentOption,
    PolarComponentOption,
    TooltipComponentOption
  } from "echarts/components";
  import { BarSeriesOption } from "echarts/charts";
  import { applyReactInVue } from "veaury";
  import MapTable from "@/components/Table/MapTable.tsx";
  import AppCard from "@/components/AppCard.vue";

  type EChartsOption = echarts.ComposeOption<
    TitleComponentOption | PolarComponentOption | TooltipComponentOption | BarSeriesOption
  >;
  const totalChart = useTemplateRef("totalChart");
  const option = reactive<EChartsOption>({
    title: [
      {
        text: "异常统计",
        textStyle: {
          color: "#fff"
        }
      }
    ],
    polar: {
      radius: [30, "80%"]
    },
    angleAxis: {
      max: 4,
      startAngle: 75
    },
    radiusAxis: {
      type: "category",
      show: false,
      data: ["超速", "逆行", "抛锚", "慢速"]
    },
    tooltip: {
      show: true
    },
    series: {
      type: "bar",
      data: [2, 1.2, 2.4, 3.6],
      coordinateSystem: "polar",
      label: {
        show: true,
        position: "middle",
        formatter: "{b}: {c}"
      }
    }
  });
  useEcharts(totalChart, option);
  const MapTableReact = applyReactInVue(MapTable);
</script>

<style scoped lang="scss">
  .map-charts {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;

    .total-chart {
      width: 300px;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .new-record {
      width: 500px;

    }
  }
</style>
