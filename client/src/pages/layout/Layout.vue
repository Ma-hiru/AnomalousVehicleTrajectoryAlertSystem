<template>
  <div
    class="w-screen h-screen bg-[var(--layout-container-bg)] grid grid-cols-1 grid-rows-[auto_1fr]">
    <div>
      <LayoutBar>
        <template #tap>
          <LayoutMenu />
        </template>
        <template #user>
          <LayoutUser />
        </template>
      </LayoutBar>
    </div>
    <LayoutCard>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </LayoutCard>
  </div>
</template>

<script setup lang="ts" name='Layout'>
import LayoutBar from "@/components/vue/LayoutBar.vue";
import LayoutMenu from "@/components/vue/LayoutMenu.vue";
import LayoutUser from "@/components/vue/LayoutUser.vue";
import LayoutCard from "@/components/vue/LayoutCard.vue";
</script>

<style scoped lang="scss"></style>
