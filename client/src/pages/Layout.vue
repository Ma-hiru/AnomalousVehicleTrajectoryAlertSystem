<template>
  <ScreenLoading>
    <TopBar />
    <Body />
  </ScreenLoading>
</template>

<script setup lang="ts" name="Layout">
  import ScreenLoading from "@/components/Loading/ScreenLoading.vue";
  import TopBar from "@/pages/TopBar.vue";
  import { provide, ref } from "vue";
  import { ActiveTitle, SetActiveTitle } from "@/ctx/vueKey";
  import Body from "@/pages/Body.vue";

  const activeTitle = ref("欢迎使用");
  provide(ActiveTitle, activeTitle);
  provide(SetActiveTitle, (title) => (activeTitle.value = title));
</script>

<style scoped lang="scss"></style>
