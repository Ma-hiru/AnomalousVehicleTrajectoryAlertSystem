<template>
  <OnEnter mode="FromLeft" :duration="0.8">
    <ActionsCategoryChart />
    <ActionsListForm />
    <ActionsTendency />
  </OnEnter>
</template>

<script setup lang="ts" name="PointCharts">
  import OnEnter from "@/components/Ani/OnEnter.vue";
  import ActionsCategoryChart from "@/components/Charts/ActionsCategoryChart/ActionsCategoryChart.vue";
  import ActionsListForm from "@/components/Charts/ActionsListForm/ActionsListForm.vue";
  import ActionsTendency from "@/components/Charts/ActionsTendency/ActionsTendency.vue";
</script>

<style scoped lang="scss"></style>
