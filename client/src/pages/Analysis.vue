<template>
  <div class="grid grid-rows-1" :style="styles.container">
    <div class="h-full inline-block overflow-y-scroll"
         :style="{scrollbarWidth: 'thin', scrollbarColor: '#fff'}">
      <VideoList :container-style="styles.LeftContainer" />
    </div>
    <div ref="ChartsContainer" />
  </div>
</template>

<script setup lang="ts" name="Home">
import { useTemplateRef } from "vue";
import { useReactComponent } from "@/hooks/useReactComponent.tsx";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import VideoList from "@/components/Analysis/VideoList.vue";
import Charts from "@/components/Analysis/Charts.tsx";

const ChartsContainer = useTemplateRef("ChartsContainer");
const styles = createStyleSheet({
  container: {
    height: "calc(100vh - var(--layout-bar-height) - var(--layout-content-padding)*2 - var(--layout-card-inset-padding)*2",
    gridTemplateColumns: "var(--analysis-divider-ratio)"
  },
  BaseItemContainer: {
    scrollbarWidth: "none",
    display: "flex",
    flexDirection: "column",
    overflowY: "scroll",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%"
  },
  LeftContainer: {
    padding: "10px"
  },
  RightContainer: {}
});
useReactComponent(Charts, ChartsContainer, { containerStyle: { ...styles.BaseItemContainer, ...styles.RightContainer } });
</script>

<style scoped lang="scss"></style>
