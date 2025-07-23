<template>
  <OnHover class="actions-category-container" :scale="1.1">
    <span class="title">视频（{{ streamStore.ActiveStream.streamName }}）的行为分布</span>
    <dv-conical-column-chart
      v-if="config.data.length"
      :config="config"
      style="width: 400px; height: 200px" />
    <div v-else class="tips">No Data</div>
  </OnHover>
</template>

<script setup lang="ts" name="ActionsCategoryChart">
  import { computed } from "vue";
  import OnHover from "@/components/Ani/OnHover.vue";
  import { ActionsEnum } from "@/stores/pinia/modules/streamStore";
  import { ActionsIcons } from "@/assets/actions/actions";

  const config = computed(() => {
    //TODO 单个视频流行为数据统计
    const dataArr =
      streamStore.SingleActionCategoryComputed.get(streamStore.ActiveStream.streamId) || [];
    return {
      data: dataArr.map((number, index) => {
        return {
          name: ActionsEnum[index],
          value: number
        };
      }),
      img: ActionsIcons,
      imgSideLength: 30,
      showValue: true,
      columnColor: "rgba(43,95,244,0.4)"
    };
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
  }
</style>
