<template>
  <div v-if="show" class="tips">{{ tips }}</div>
</template>

<script setup lang="ts" name="Tips">
  withDefaults(
    defineProps<{
      tips?: string;
      show?: boolean;
    }>(),
    {
      tips: "",
      show: true,
    }
  );
</script>

<style scoped lang="scss">
  .tips {
    font-size: 24px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: title, sans-serif;
    text-align: center;
    color: white;
  }
</style>
