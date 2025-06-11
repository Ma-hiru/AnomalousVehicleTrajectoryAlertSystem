<template>
  <OnEnter mode="FromRight" :duration="0.8">
    <div class="w-full">
      <dv-border-box8 :dur="5" style="padding: 10px; width: 90%;height: 420px">
        <MapReact />
      </dv-border-box8>
      <dv-border-box8 :dur="5" :reverse="true" style="margin-top: 20px;padding: 10px; width: 90%">
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

<style scoped lang="scss"></style>
