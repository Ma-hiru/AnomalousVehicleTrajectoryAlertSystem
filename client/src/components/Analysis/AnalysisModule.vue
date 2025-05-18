<template>
  <div class="h-full flex justify-center items-center flex-col">
    <MapCharts />
    <div ref="MapModuleRef"/>
  </div>
</template>

<script setup lang="ts" name="AnalysisModule">
import MapCharts from "@/components/Charts/MapCharts.vue";
import { useTemplateRef } from "vue";
import { useReactComponent } from "@/hooks/useReactComponent.tsx";
import MapModule from "@/components/Map/MapModule.tsx";

const MapModuleRef = useTemplateRef("MapModuleRef");
useReactComponent(MapModule, MapModuleRef)
</script>

<style scoped lang="scss">

</style>
