<template>
  <dv-full-screen-container>
    <div class="layout-container">
      <dv-loading v-if="loading">
        <span class="text-white"> 加载中...</span>
      </dv-loading>
      <template v-else>
        <TopBarReact class="layout-bar" />
        <div class="layout-content">
          <a-split min="0.2" max="0.8" v-model:size="size" class="layout-split">
            <template #first>
              <VideoModule />
            </template>
            <template #resize-trigger>
              <div class="trigger">
                <span />
              </div>
            </template>
            <template #second>
              <AnalysisModule />
            </template>
          </a-split>
        </div>
      </template>
    </div>
  </dv-full-screen-container>
</template>

<script setup lang="ts" name="Layout">
  import { onMounted, provide, ref } from "vue";
  import TopBar from "@/components/TopBar/TopBar.tsx";
  import VideoModule from "@/components/Video/VideoModule.vue";
  import AnalysisModule from "@/components/Analysis/AnalysisModule.vue";
  import { LayoutSplitSize } from "@/ctx/vueKey.ts";
  import { applyReactInVue } from "veaury";

  const TopBarReact = applyReactInVue(TopBar);
  const size = ref(0.6);
  provide(LayoutSplitSize, size);
  const loading = ref(true);
  onMounted(() => {
    cancelLoading();
  });
  const cancelLoading = () => {
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  };
</script>

<style scoped lang="scss">
  .layout-container {
    background: var(--layout-bg);
    background-size: cover;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .layout-bar {
      height: var(--layout-bar-height);
    }

    .layout-content {
      height: calc(100% - var(--layout-bar-height));
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
