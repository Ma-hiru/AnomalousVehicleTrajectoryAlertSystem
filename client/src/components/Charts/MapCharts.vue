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
import { reactive, onMounted, useTemplateRef, watch } from "vue";
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
import { useStreamStore } from "@/stores/pinia/modules/streamStore";

type EChartsOption = echarts.ComposeOption<
  TitleComponentOption | PolarComponentOption | TooltipComponentOption | BarSeriesOption
>;

const totalChart = useTemplateRef("totalChart");
const streamStore = useStreamStore();

const option = reactive<EChartsOption>({
  title: [
    {
      text: "异常统计",
      textStyle: {
        color: "#fff",
        fontSize: 16
      },
      left: 'center'
    }
  ],
  tooltip: {
    show: true,
    formatter: function (params: any) {
      return `${params.name}: ${params.value}次`;
    },
    backgroundColor: "rgba(40, 40, 60, 0.9)",
    borderColor: "#409EFF",
    borderWidth: 1,
    textStyle: {
      color: "#FFF",
      fontSize: 14
    }
  },
  angleAxis: {
    type: 'category',
    data: ['超速', '逆行', '变道', '占应急道', '低速', '停车'],
    axisLine: {
      lineStyle: {
        color: '#fff'
      }
    },
    axisLabel: {
      color: '#fff'
    }
  },
  radiusAxis: {
    axisLine: {
      lineStyle: {
        color: '#fff'
      }
    },
    axisLabel: {
      color: '#fff'
    }
  },
  polar: {
    radius: '70%'
  },
  series: [{
    type: 'bar',
    data: [0, 0, 0, 0, 0, 0],
    coordinateSystem: 'polar',
    name: '异常行为',
    itemStyle: {
      color: (params) => {
        const colors = ['#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#E91E63'];
        return colors[params.dataIndex % colors.length];
      }
    },
    label: {
      show: true,
      position: 'middle',
      formatter: '{c}',
      color: '#fff',
      fontSize: 12
    }
  }]
});

const { instance } = useEcharts(totalChart, option);
const MapTableReact = applyReactInVue(MapTable);

// 监听异常行为数据变化
watch(
  () => streamStore.TotalActionCategoryComputed,
  () => {
    if (streamStore.TotalActionCategoryComputed.length > 0) {
      // 跳过第一个指标（正常行为），只显示异常行为数据
      const abnormalData = streamStore.TotalActionCategoryComputed.slice(1);

      // 更新图表数据
      option.series[0].data = abnormalData;

      // 强制更新图表
      instance.value?.setOption(option, true);
    }
  },
  { immediate: true, deep: true }
);
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
