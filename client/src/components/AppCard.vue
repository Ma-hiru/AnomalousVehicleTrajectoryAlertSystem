<template>
  <motion.div :whileHover="{ scale: 1.02 }">
    <BasicCard>
      <slot name="default" />
    </BasicCard>
  </motion.div>
</template>

<script setup lang="ts" name="AppCard">
  import { motion } from "motion-v";
  import BasicCard from "@/components/BasicCard.vue";
</script>

<style scoped lang="scss"></style>
