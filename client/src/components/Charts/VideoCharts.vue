<template>
  <div class="charts-container">
    <div ref="sunburst" class="sunburst" />
    <VideoForm />
  </div>
</template>

<script setup lang="ts" name="VideoCharts">
  import * as echarts from "echarts/core";
  import { SunburstSeriesOption } from "echarts/charts";
  import { reactive, useTemplateRef } from "vue";
  import { useEcharts } from "@/hooks/useEcharts.ts";
  import VideoForm from "@/components/Table/VideoForm.vue";

  const sunburst = useTemplateRef("sunburst");
  type EChartsOption = echarts.ComposeOption<SunburstSeriesOption>;
  const data = [
    {
      name: "正常记录",
      value: 70
    },
    {
      name: "异常记录",
      children: [
        {
          name: "超速",
          value: 10
        },
        {
          name: "逆行",
          value: 10
        },
        {
          name: "变道",
          value: 10
        }
      ]
    }
  ];
  const option = reactive<EChartsOption>({
    series: {
      type: "sunburst",
      emphasis: {
        focus: "ancestor"
      },
      data: data,
      radius: [0, "90%"],
      label: {
        rotate: "radial"
      }
    }
  });
  useEcharts(sunburst, option);
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

    .sunburst {
      width: 300px;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
