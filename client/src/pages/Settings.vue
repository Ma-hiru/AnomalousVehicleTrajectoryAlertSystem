<template>
  <div ref="ConfigReact" class="w-full h-full" />
</template>

<script setup lang="ts" name='Settings'>
  import { ref, useTemplateRef } from "vue";
  import { useReactComponent } from "@/hooks/useReactComponent.tsx";
  import Config from "@/components/Settings/Config.tsx";

  const key = ref(0);
  const ConfigReact = useTemplateRef("ConfigReact");
  useReactComponent(Config, ConfigReact, {
    refresh: () => key.value++
  },key);
</script>

<style scoped lang="scss">

</style>
