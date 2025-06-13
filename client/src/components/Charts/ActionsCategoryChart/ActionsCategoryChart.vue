<template>
  <OnHover class="actions-category-container" :scale="1.1">
    <span class="title">视频（）的行为分布</span>
    <dv-conical-column-chart :config="config" style="width: 400px; height: 200px" />
  </OnHover>
</template>

<script setup lang="ts" name="ActionsCategoryChart">
  import { reactive } from "vue";
  import OnHover from "@/components/Ani/OnHover.vue";

  withDefaults(
    defineProps<{
      title?: string;
    }>(),
    {
      title: ""
    }
  );
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
    showValue: true
  });
</script>

<style scoped lang="scss">
  .actions-category-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    flex-direction: column;

    .title {
      font-size: 16px;
      margin-bottom: 10px;
      font-family: title, sans-serif;
      text-align: center;
    }
  }
</style>
