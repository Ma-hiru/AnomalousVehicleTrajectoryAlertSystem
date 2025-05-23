<template>
  <div class="layout-container">
    <TopBarReact class="layout-bar" />
    <div class="layout-content">
      <a-split min="0.2" max="0.8" v-model:size="size" class="layout-split">
        <template #resize-trigger>
          <div class="trigger">
            <span />
          </div>
        </template>
        <template #first>
          <VideoModule />
        </template>
        <template #second>
          <AnalysisModule />
        </template>
      </a-split>
    </div>
  </div>
</template>

<script setup lang="ts" name="Layout">
  import { provide, ref } from "vue";
  import TopBar from "@/components/TopBar/TopBar.tsx";
  import VideoModule from "@/components/Video/VideoModule.vue";
  import AnalysisModule from "@/components/Analysis/AnalysisModule.vue";
  import { LayoutSplitSize } from "@/ctx/vueKey.ts";
  import { applyReactInVue } from "veaury";

  const TopBarReact = applyReactInVue(TopBar);

  const size = ref(0.6);
  provide(LayoutSplitSize, size);
</script>

<style scoped lang="scss">
  .layout-container {
    background: var(--layout-bg-color);

    .layout-bar {
      height: var(--layout-bar-height);
    }

    .layout-content {
      height: calc(100vh - var(--layout-bar-height));
      padding: calc(var(--spacing) * 4);

      .layout-split {
        height: 100%;
        width: 100%;

        .trigger {
          background: #999999;
          width: 98%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          span {
            height: 3rem;
            background: #ffffff;
            border-radius: 0.1rem;
            width: 0.15rem;
            margin: 2px;
          }
        }
      }
    }
  }
</style>
