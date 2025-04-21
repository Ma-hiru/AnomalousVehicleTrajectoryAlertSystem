<template>
  <div ref="LayoutUserReact" />
</template>

<script setup lang="ts" name='LayoutUser'>
import { useTemplateRef } from "vue";
import { useReactComponent } from "@/hooks/useReactComponent.tsx";
import { useRouter } from "vue-router";
import LayoutUser from "@/components/Layout/LayoutUser.tsx";


const router = useRouter();
const reload = () => router.go(0);
const htmlContainer = useTemplateRef("LayoutUserReact");
useReactComponent(LayoutUser, htmlContainer, {
  reload,
});
</script>

<style scoped lang="scss">

</style>
