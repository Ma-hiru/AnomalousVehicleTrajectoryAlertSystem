<template>
  <div ref="MapRef" />
</template>

<script setup lang="ts" name='Track'>
  import { useReactComponent } from "@/hooks/useReactComponent.tsx";
  import Map from "@/components/Map/Map.tsx";
  import { useTemplateRef } from "vue";
  const MapRef = useTemplateRef("MapRef");
  useReactComponent(Map, MapRef);
</script>

<style scoped lang="scss">

</style>
