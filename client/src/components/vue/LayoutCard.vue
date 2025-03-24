<template>
    <el-card class="custom-card" style="margin: var(--layout-content-padding); ">
      <slot name="default" />
    </el-card>
</template>

<script setup lang="ts" name='LayoutCard'>

</script>

<style scoped lang="scss">
:deep(.el-card__body){
  width: 100%;
  height: 100%;
  padding: var(--layout-card-inset-padding);
}
</style>
