<template>
  <div class="video-info-container">
    <OnHover :scale="1.2">
      <dv-digital-flop :config="flopConfig" style="height: 50px" />
    </OnHover>
    <dv-border-box7 v-if="tableConfig.data.length" style="padding: 10px; width: 100%; height: 120px">
      <div style="width: 100%; height: 100%">
        <CustomScrollBoard :config="tableConfig" style="width: 100%; height: 100%" />
      </div>
    </dv-border-box7>
    <div v-else class="tips">No Exceptions</div>
  </div>
</template>

<script setup lang="ts" name="VideoInfo">
import { reactive, watch } from "vue";
import OnHover from "@/components/Ani/OnHover.vue";
import { useStreamStore } from "@/stores/pinia";
import dayjs from "dayjs";
import CustomScrollBoard from "@/components/Charts/CustomScrollBoard/CustomScrollBoard.vue";

const streamStore = useStreamStore();
const flopConfig = reactive({
  number: [streamStore.TotalCarExceptionsCount],
  content: "{nt}",
  formatter: Intl.NumberFormat("zh-CN").format
});
const tableConfig = reactive({
  header: ["标识", "行为", "时间", "视频id"],
  data: <string[][]>[],
  index: false,
  align: ["center", "center", "center", "center"],
  rowNum: 2,
  headerBGC: "transparent",
  headerHeight: 30,
  oddRowBGC: "rgba(0,0,0,0.2)",
  evenRowBGC: "rgba(0,0,0,0.1)"
} satisfies ScrollBoardConfig);
watch(() => streamStore.updateTrigger, updateConfig);
watch(() => streamStore.TotalCarExceptionsCount, updateCount, { immediate: true });

function updateCount() {
  flopConfig.number = [streamStore.TotalCarExceptionsCount];
}

function updateConfig() {
  const exceptions = streamStore.TotalCarExceptionsRecordList || [];
  tableConfig.data = exceptions.map(newRow);
}

function newRow({ carId, actionId, time, streamId }: CarRecord): string[] {
  const actionName = streamStore.ActionsEnum[actionId] || "未知行为";
  return [carId, actionName, dayjs(time).format("HH:mm:ss"), streamId];
}
</script>

<style scoped lang="scss">
.video-info-container {
  display: flex;
  flex-direction: column;

  .tips {
    font-size: 24px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: title, sans-serif;
    text-align: center;
    color: white;
  }
}
</style>
