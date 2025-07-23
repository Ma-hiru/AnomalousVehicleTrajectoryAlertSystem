<template>
  <div class="action-list-container">
    <span class="title">视频（{{ streamStore.ActiveStream.streamName }}）的监测动态</span>
    <dv-border-box8 v-if="config.data.length" style="width: 90%; height: 500px; padding: 10px">
      <div style="width: 100%; height: 100%;">
        <CustomScrollBoard :config="config" style="width: 100%; height: 100%;" />
      </div>
    </dv-border-box8>
    <div v-else class="tips">No Data</div>
  </div>
</template>

<script setup lang="ts" name="ActionsListForm">
import { computed } from "vue";
import { ActionsEnum } from "@/stores/pinia/modules/streamStore";
import dayjs from "dayjs";
import CustomScrollBoard from "@/components/Charts/CustomScrollBoard/CustomScrollBoard.vue";


const config = computed(() => {
  //TODO 单个视频流行为数据统计，随着Active切换
  const records = streamStore.SingleCarRecordList.get(streamStore.ActiveStream.streamId) || [];

  return {
    header: ["标识", "行为", "时间", "异常"],
    data: records.map((cur) => {
      return [
        cur.carId || '',
        ActionsEnum[cur.actionId],
        dayjs(cur.time).format("HH:mm:ss"),
        cur.status
          ? `<span style="color:#9fe6b8;">正常</span>`
          : `<span style="color:#fb7293;">异常</span>`
      ];
    }),
    index: false,
    columnWidth: [100, 100, 80, 100],
    align: ["center", "center", "center", "center"],
    rowNum: 12,
    hoverPause: true,
    waitTime: 2000,
    headerBGC: "rgba(14, 54, 153, 0.6)",
    oddRowBGC: "rgba(6, 30, 93, 0.4)",
    evenRowBGC: "rgba(6, 30, 93, 0.2)"
  };
});
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
