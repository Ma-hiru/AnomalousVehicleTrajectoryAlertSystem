<template>
  <div class="total-tendency-container">
    <div class="chart" ref="tendencyChart"></div>
  </div>
</template>

<script setup lang="ts" name="TotalTendency">
  import { useEcharts } from "@/hooks/useEcharts";
  import { onMounted, reactive, useTemplateRef } from "vue";
  import { ComposeOption } from "echarts/core";
  import {
    DatasetComponentOption,
    GridComponentOption,
    TitleComponentOption,
    TooltipComponentOption
  } from "echarts/components";
  import { LineSeriesOption } from "echarts/charts";
  import { SeriesOption } from "echarts";

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
    title: {
      text: "异常行为总体分布和趋势",
      textStyle: {
        color: "#fff"
      },
      left: "center"
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
    yAxis: { name: "数量" },
    grid: {
      bottom: 50,
      top: 50,
      left: 50,
      right: 50
    }
  } satisfies EChartsOption);
  const tendencyChart = useTemplateRef("tendencyChart");
  useEcharts(tendencyChart, option);
  onMounted(() => {
    const salesData = [
      { Product: "Phone", Quarter: "Q1", Sales: 1200 },
      { Product: "Phone", Quarter: "Q2", Sales: 1800 },
      { Product: "Phone", Quarter: "Q3", Sales: 2000 },
      { Product: "Laptop", Quarter: "Q1", Sales: 800 },
      { Product: "Laptop", Quarter: "Q2", Sales: 1500 },
      { Product: "Laptop", Quarter: "Q3", Sales: 4000 }
    ];
    option.xAxis.data = [...new Set(salesData.map((item) => item.Quarter))];
    const products = ["Phone", "Laptop"];
    products.forEach((product) => {
      const datasetId = `dataset_${product}`;
      option.dataset!.push({
        id: datasetId,
        source: salesData
          .filter((item) => item.Product === product)
          .map((item) => [item.Quarter, item.Sales])
      });
      option.series.push({
        type: "line",
        showSymbol: false,
        datasetId: datasetId,
        encode: {
          x: 0,
          y: 1,
          label: ["Product", "Sales"],
          itemName: "Product",
          tooltip: ["Sales"]
        },
        name: product,
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
  });
</script>

<style scoped lang="scss">
  .total-tendency-container {
    width: 100%;
    display: flex;
    justify-content: center;

    .chart {
      width: 100%;
      height: 400px;
      background: transparent;
    }
  }
</style>
