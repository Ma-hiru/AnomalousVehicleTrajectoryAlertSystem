<template>
  <OnHover class="actions-category-container" :scale="1.1">
    <dv-conical-column-chart :config="config" style="width: 400px; height: 200px" />
  </OnHover>
</template>

<script setup lang="ts" name="ActionsCategoryChart">
  import { reactive } from "vue";
  import OnHover from "@/components/Ani/OnHover.vue";

  const config = reactive({
    data: [
      {
        name: "减速",
        value: 55
      },
      {
        name: "倒车",
        value: 120
      },
      {
        name: "掉头",
        value: 71
      },
      {
        name: "逆行",
        value: 66
      },
      {
        name: "变道",
        value: 80
      },
      {
        name: "停车",
        value: 35
      }
    ],
    img: [],
    showValue:true
  });
</script>

<style scoped lang="scss">
  .actions-category-container{
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
</style>
