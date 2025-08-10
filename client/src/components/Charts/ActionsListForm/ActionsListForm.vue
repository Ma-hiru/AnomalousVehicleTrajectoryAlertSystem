<template>
  <div class="action-list-container">
    <span class="title">
      视频（{{ streamStore.ActiveStream.streamName || "No Data" }}）的监测动态
    </span>
    <dv-border-box8 v-show="config.data.length" style="width: 90%; height: 500px; padding: 10px">
      <div style="width: 100%; height: 100%">
        <CustomScrollBoard :config="config" style="width: 100%; height: 100%" />
      </div>
    </dv-border-box8>
    <Tips :show="!config.data.length" tips="No Data" />
  </div>
</template>

<script setup lang="ts" name="ActionsListForm">
import dayjs from "dayjs";
import Tips from "@/components/Tips.vue";
import CustomScrollBoard from "@/components/Charts/CustomScrollBoard/CustomScrollBoard.vue";
import { reactive, watch } from "vue";
import { useStreamStore } from "@/stores/pinia";

const streamStore = useStreamStore();

const config = reactive({
  header: ["标识", "行为", "时间", "异常"],
  data: <string[][]>[],
  index: false,
  columnWidth: [100, 100, 80, 100],
  align: ["center", "center", "center", "center"],
  rowNum: 12,
  hoverPause: true,
  waitTime: 2000,
  headerBGC: "rgba(14, 54, 153, 0.6)",
  oddRowBGC: "rgba(6, 30, 93, 0.4)",
  evenRowBGC: "rgba(6, 30, 93, 0.2)"
} satisfies ScrollBoardConfig);
watch(() => streamStore.ActiveStream.streamId, updateConfig, { immediate: true });
watch(() => streamStore.updateTrigger, updateConfig);
// watch(() => streamStore.SingleCarRecordList, updateConfig, { deep: true });

function updateConfig() {
  const records = streamStore.SingleCarRecordList.get(streamStore.ActiveStream.streamId) || [];
  config.data = records.map(newRow);
}

function newRow({ carId, actionId, time, status }: CarRecord): string[] {
  return [
    carId || "未知", //"标识"
    streamStore.ActionsEnum[actionId] || "未知", //"行为"
    dayjs(time).format("HH:mm:ss"), //"时间"
    isNormal(status) //"异常"
  ];
}

function isNormal(status: boolean): string {
  return status
    ? `<span style="color:#9fe6b8;">正常</span>`
    : `<span style="color:#fb7293;">异常</span>`;
}
</script>

<style scoped lang="scss">
.action-list-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px;
  flex-direction: column;
  align-items: center;

  .title {
    font-size: 16px;
    margin-bottom: 10px;
    font-family: title, sans-serif;
    text-align: center;
  }
}
</style>
