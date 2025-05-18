<template>
  <div class="layout-container">
    <div ref="TopBarRef" class="layout-bar" />
    <div class="layout-content">
      <VideoModule />
      <AnalysisModule />
    </div>
  </div>
</template>

<script setup lang="ts" name='Layout'>
  import { useTemplateRef } from "vue";
  import { useReactComponent } from "@/hooks/useReactComponent.tsx";
  import TopBar from "@/components/TopBar/TopBar.tsx";
  import VideoModule from "@/components/Video/VideoModule.vue";
  import AnalysisModule from "@/components/Analysis/AnalysisModule.vue";

  const TopBarRef = useTemplateRef("TopBarRef");
  useReactComponent(TopBar, TopBarRef);
</script>

<style scoped lang="scss">
  .layout-container {
    background: var(--layout-bg-color);

    .layout-bar {
      height: var(--layout-bar-height);
    }

    .layout-content {
      display: grid;
      height: calc(100vh - var(--layout-bar-height));
      grid-template-rows: 1fr;
      grid-template-columns: 1fr 1fr;
      padding: calc(var(--spacing)*4);
    }
  }
</style>
