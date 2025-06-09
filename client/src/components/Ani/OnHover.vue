<template>
  <motion.div
    :initial="{ scale: 1 }"
    :animate="{ scale: 1 }"
    :transition="{ ease: 'easeInOut', duration: 0.5 }"
    :whileHover="{ scale }">
    <slot name="default" />
  </motion.div>
</template>

<script setup lang="ts" name="OnHover">
  import { motion } from "motion-v";

  withDefaults(
    defineProps<{
      scale?: number;
    }>(),
    {
      scale: 1.02
    }
  );
</script>

<style scoped lang="scss"></style>
