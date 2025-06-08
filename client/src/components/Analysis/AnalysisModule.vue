<template>
  <div class="h-full flex justify-center items-center flex-col">
    <MapCharts />
    <TrackMapReact :layoutSpiltSize="layoutSplitSize" />
  </div>
</template>

<script setup lang="ts" name="AnalysisModule">
  import MapCharts from "@/components/Charts/MapCharts.vue";
  import { inject } from "vue";
  import TrackMap from "@/components/Map/TrackMap.tsx";
  import { LayoutSplitSize } from "@/ctx/vueKey.ts";
  import { applyReactInVue } from "veaury";
  import AppCard from "@/components/AppCard.vue";

  const layoutSplitSize = inject(LayoutSplitSize);
  const TrackMapReact = applyReactInVue(TrackMap);
</script>

<style scoped lang="scss"></style>
