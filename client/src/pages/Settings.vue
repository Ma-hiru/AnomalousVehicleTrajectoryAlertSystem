<template>
  <div ref="ConfigReact" class="w-full h-full" />
</template>

<script setup lang="ts" name="Settings">
  import { onMounted, ref, useTemplateRef } from "vue";
  import { useReactComponent } from "@/hooks/useReactComponent.tsx";
  import SettingsLayout from "@/components/Settings/SettingsLayout.tsx";

  const key = ref(0);
  const ConfigReact = useTemplateRef("ConfigReact");
  onMounted(() => {
    useReactComponent(SettingsLayout, ConfigReact, {
      refresh: () => key.value++
    }, key);
  });
</script>

<style scoped lang="scss">

</style>
