<template>
  <div ref="MapRef" />
</template>

<script setup lang="ts" name='Track'>
  import { useReactComponent } from "@/hooks/useReactComponent.tsx";
  import { useTemplateRef } from "vue";
  import TrackMap from "@/components/Map/TrackMap.tsx";
  const MapRef = useTemplateRef("MapRef");
  useReactComponent(TrackMap, MapRef);
</script>

<style scoped lang="scss">

</style>
