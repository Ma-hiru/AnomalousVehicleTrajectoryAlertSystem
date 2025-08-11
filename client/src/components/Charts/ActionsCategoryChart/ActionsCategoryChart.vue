<template>
  <OnHover class="actions-category-container" :scale="1.1">
    <span class="title">
      视频（{{ streamStore.ActiveStream.streamName || "No Data" }}）的行为分布
    </span>
    <dv-conical-column-chart
      v-show="config.data.length"
      :config="config"
      style="width: 400px; height: 200px" />
    <Tips :show="!config.data.length" tips="No Data" />
  </OnHover>
</template>

<script setup lang="ts" name="ActionsCategoryChart">
  import Tips from "@/components/Tips.vue";
  import OnHover from "@/components/Ani/OnHover.vue";
  import { reactive, watch } from "vue";
  import { useStreamStore } from "@/stores/pinia";
  import { GetActionsIcons } from "@/assets/actions/actions";

  const streamStore = useStreamStore();
  const config = reactive({
    data: <{ name: string; value: number }[]>[],
    img: GetActionsIcons(streamStore.showNormalBehavior),
    imgSideLength: 30,
    showValue: true,
    columnColor: "rgba(43,95,244,0.4)",
    sort: false
  });
  watch(() => streamStore.ActiveStream.streamId, updateConfig, { immediate: true });
  watch(() => streamStore.updateTrigger, updateConfig);
  watch(() => streamStore.showNormalBehavior, updateConfig);

  function updateConfig() {
    const single_action_category =
      streamStore.SingleActionCategoryComputed.get(streamStore.ActiveStream.streamId) || [];
    const normalIndex = streamStore.getNormalBehaviorIndex();

    config.data = single_action_category.reduce(
      (pre, value, actionId) => {
        // 如果是正常行为且开关关闭，则跳过
        if (!streamStore.showNormalBehavior && actionId === normalIndex) {
          return pre;
        }

        const name = streamStore.ActionsEnum[actionId];
        if (name && value >= 0) {
          pre.push({ name, value });
        }
        return pre;
      },
      <{ name: string; value: number }[]>[]
    );
    config.img = GetActionsIcons(streamStore.showNormalBehavior);
  }
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
