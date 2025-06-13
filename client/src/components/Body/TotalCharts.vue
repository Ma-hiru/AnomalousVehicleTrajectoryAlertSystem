<template>
  <OnEnter mode="FromRight" :duration="0.8" :delay="0.6">
    <div class="total-charts-container w-full">
      <span class="title-1">热力图</span>
      <dv-border-box8 :dur="5" style="padding: 10px; width: 90%; height: 420px">
        <MapReact />
      </dv-border-box8>
      <span class="title-2">异常行为总体分布和趋势</span>
      <dv-border-box8 :dur="5" :reverse="true" style="margin-top: 20px; padding: 10px; width: 90%">
        <TotalTendency />
      </dv-border-box8>
    </div>
  </OnEnter>
</template>

<script setup lang="ts" name="TotalCharts">
  import OnEnter from "@/components/Ani/OnEnter.vue";
  import TotalTendency from "@/components/Charts/TotalTendency/TotalTendency.vue";
  import { applyPureReactInVue } from "veaury";
  import TrackMap from "@/components/Map/TrackMap";

  const MapReact = applyPureReactInVue(TrackMap);
</script>

<style scoped lang="scss">
  .total-charts-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title-1 {
      font-size: 16px;
      margin-bottom: 10px;
      font-family: title, sans-serif;
      text-align: center;
    }

    .title-2 {
      margin-top: 20px;
      font-size: 16px;
      margin-bottom: -10px;
      font-family: title, sans-serif;
      text-align: center;
    }
  }
</style>
