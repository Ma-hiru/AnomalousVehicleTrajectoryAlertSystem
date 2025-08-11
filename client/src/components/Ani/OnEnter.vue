<template>
  <motion.div
    :initial="initial as VariantLabels"
    :animate="animate as VariantLabels"
    :transition="{ ease: 'easeInOut', duration, delay }">
    <slot name="default" />
  </motion.div>
</template>

<!--suppress ES6UnusedImports -->
<script setup lang="ts" name="onEnter">
  import { motion, VariantLabels } from "motion-v";
  import { TargetAndTransition } from "motion/react";
  import { ref } from "vue";

  const props = withDefaults(
    defineProps<{
      duration?: number;
      delay?: number;
      mode?: "unset" | "FromTop" | "FromLeft" | "FromRight" | "FromBottom";
    }>(),
    {
      duration: 0.5,
      mode: "unset",
      delay: 0
    }
  );
  const initial = ref<TargetAndTransition | VariantLabels>({ opacity: 0 });
  const animate = ref<TargetAndTransition | VariantLabels>({ opacity: 1 });
  switch (props.mode) {
    case "FromTop": {
      initial.value = { opacity: 0, y: "-100%", position: "relative" };
      animate.value = { opacity: 1, y: 0, position: "relative" };
      break;
    }
    case "FromBottom": {
      initial.value = { opacity: 0, y: "100%", position: "relative" };
      animate.value = { opacity: 1, y: 0, position: "relative" };
      break;
    }
    case "FromLeft": {
      initial.value = { opacity: 0, x: "-100%", position: "relative" };
      animate.value = { opacity: 1, x: 0, position: "relative" };
      break;
    }
    case "FromRight": {
      initial.value = { opacity: 0, x: "100%", position: "relative" };
      animate.value = { opacity: 1, x: 0, position: "relative" };
      break;
    }
  }
</script>
<style scoped lang="scss"></style>
