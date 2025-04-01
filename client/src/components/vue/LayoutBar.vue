<template>
  <div
    class="w-screen bg-white grid grid-rows-1 grid-cols-[1fr_auto_auto] items-center layout-bar-container shadow-sm" style="height: var(--layout-bar-height);">
    <div style="color: var(--layout-bar-title-color)" class="select-none">
      AnomalousVehicleTrajectoryAlertSystem
    </div>
    <div class="h-full">
      <slot name="tap" />
    </div>
    <div>
      <slot name="user" />
    </div>
  </div>
</template>

<script setup lang="ts" name='LayoutBar'>

</script>

<style scoped lang="scss">
.layout-bar-container {
  padding-right: calc(var(--spacing) * 4);
  padding-left: calc(var(--spacing) * 4);
  background-color: var(--layout-bar-bg);
  color: var(--layout-bar-color);
}
</style>
