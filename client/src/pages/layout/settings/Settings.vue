<template>
  <div ref="ConfigReact" class="w-full h-full"/>
</template>

<script setup lang="ts" name='Settings'>
  import { useTemplateRef } from "vue";
  import { useReactComponent } from "@/hooks";
  import Config from "@/pages/layout/settings/Config.tsx";

  const ConfigReact = useTemplateRef("ConfigReact");
  useReactComponent(Config, ConfigReact);
</script>

<style scoped lang="scss">

</style>
