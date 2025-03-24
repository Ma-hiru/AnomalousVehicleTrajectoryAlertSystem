<template>
  <div ref="LayoutUserReact" />
</template>

<script setup lang="ts" name='LayoutUser'>
import { useTemplateRef } from "vue";
import { useReactComponent } from "@/hooks";
import LayoutUser from "@/components/react/LayoutUser.tsx";

const htmlContainer = useTemplateRef("LayoutUserReact");

useReactComponent(LayoutUser, htmlContainer);
</script>

<style scoped lang="scss">

</style>
