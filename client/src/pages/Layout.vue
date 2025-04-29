<template>
  <div
    class="w-screen h-screen bg-[var(--layout-container-bg)] grid grid-cols-1 grid-rows-[auto_1fr]">
    <div ref="LayoutBarRef" />
    <LayoutCard>
      <router-view v-slot="{ Component }">
        <transition>
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </LayoutCard>
  </div>
</template>

<script setup lang="ts" name='Layout'>
  import LayoutCard from "@/components/Layout/LayoutCard.vue";
  import { useTemplateRef } from "vue";
  import { useReactComponent } from "@/hooks/useReactComponent.tsx";
  import LayoutBar from "@/components/Layout/LayoutBar.tsx";
  import { useRouter } from "vue-router";

  const { currentRoute, push, go } = useRouter();
  const LayoutBarRef = useTemplateRef("LayoutBarRef");
  useReactComponent(LayoutBar, LayoutBarRef, {
    currentRoute: currentRoute.value.path,
    setRoute: push,
    reload: () => go(0)
  });
</script>

<style scoped lang="scss">
  .v-enter-active {
    transition: all 0.5s ease-in-out;
  }

  .v-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
    transform: translateX(5rem);
  }

  .v-enter-to,
  .v-leave-form {
    opacity: 1;
    transform: translateX(0px);
  }
</style>
