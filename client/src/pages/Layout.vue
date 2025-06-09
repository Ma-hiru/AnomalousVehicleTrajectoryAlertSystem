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
  const setActiveTitle = (title: string) => {
    activeTitle.value = title;
  };
  provide(ActiveTitle, activeTitle);
  provide(SetActiveTitle, setActiveTitle);
</script>

<style scoped lang="scss"></style>
