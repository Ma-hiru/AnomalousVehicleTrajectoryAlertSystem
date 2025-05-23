import * as echarts from "echarts/core";
import { SunburstChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { onBeforeUnmount, onMounted, Reactive, ref, ShallowRef, watch } from "vue";

echarts.use([SunburstChart, CanvasRenderer]);

export const useEcharts = <T extends echarts.EChartsCoreOption>(
  container: Readonly<ShallowRef<HTMLDivElement | null>>,
  options: Reactive<T>
) => {
  const instance = ref<echarts.ECharts>();
  const updateChart = () => {
    if (instance.value) {
      instance.value.setOption(options);
    }
  };
  onMounted(() => {
    instance.value = echarts.init(container.value);
    instance.value.setOption(options);
  });
  onBeforeUnmount(() => {
    instance.value?.dispose();
  });
  watch(options, updateChart);
  return { instance, updateChart };
};
