<template>
  <nav>
    <div ref="TabsMenuContainer" />
  </nav>
</template>

<script setup lang="ts" name='LayoutMenu'>
import { useTemplateRef } from "vue";
import TabsMenu from "@/components/react/TabsMenu.tsx";
import { useReactComponent } from "@/hooks";
import { useRouter } from "vue-router";


const { currentRoute, push } = useRouter();
const TabsMenuContainer = useTemplateRef("TabsMenuContainer");
useReactComponent(TabsMenu, TabsMenuContainer, {
  currentRoute: currentRoute.value.path,
  setRoute: push
});
</script>

<style scoped lang="scss">

</style>
