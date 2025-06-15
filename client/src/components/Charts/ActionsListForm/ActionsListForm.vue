<template>
  <div class="action-list-container">
    <span class="title">视频（{{ streamStore.ActiveStream.streamName }}）的监测动态</span>
    <dv-border-box8 v-if="config.data.length" style="width: 90%; height: 500px; padding: 10px">
      <dv-scroll-board ref="scrollBoard" :config="config" style="height: 100%; width: 100%" />
    </dv-border-box8>
    <div v-else class="tips">No Data</div>
  </div>
</template>

<script setup lang="ts" name="ActionsListForm">
  import { computed, onMounted, reactive, ref, watchEffect } from "vue";
  import { ActionsEnum, useStreamStore } from "@/stores/pinia/modules/streamStore";
  import dayjs from "dayjs";
  import { type ScrollBoard } from "@kjgl77/datav-vue3";

  const streamStore = useStreamStore();
  const scrollBoard = ref<InstanceType<typeof ScrollBoard>>();
  const records = streamStore.SingleCarRecordList.get(streamStore.ActiveStream.streamId) || [];
  const data = records.reduce(
    (pre, cur) => {
      pre.push([
        cur.carId,
        ActionsEnum[cur.actionId],
        dayjs(cur.time).format("HH:mm:ss"),
        cur.status
          ? `<span style="color:#9fe6b8;">正常</span>`
          : `<span style="color:#fb7293;">异常</span>`
      ]);
      return pre;
    },
    [] as Array<string[]>
  );
  const config = reactive({
    header: ["标识", "行为", "时间", "异常"],
    data: data,
    index: true,
    columnWidth: [100, 100, 80, 100, 50],
    align: ["center"],
    rowNum: 10,
    hoverPause: true,
    waitTime: 2000
  });
  const updateRows = (rows: string[][], animationIndex?: number) => {
    if (scrollBoard.value) {
      scrollBoard.value.updateRows(rows, 14995);
    }
  };
  const lastPosition = new Map<number, number>();
  onMounted(() => {
    watchEffect(() => {
      const records = streamStore.SingleCarRecordList.get(streamStore.ActiveStream.streamId) || [];
      if (!lastPosition.has(streamStore.ActiveStream.streamId)) {
        lastPosition.set(streamStore.ActiveStream.streamId, 0);
      }
      const lastPos = lastPosition.get(streamStore.ActiveStream.streamId)!;
      const data = records.reduce(
        (pre, cur) => {
          cur.carId &&
            pre.push([
              cur.carId,
              ActionsEnum[cur.actionId],
              dayjs(cur.time).format("HH:mm:ss"),
              cur.status
                ? `<span style="color:#9fe6b8;">正常</span>`
                : `<span style="color:#fb7293;">异常</span>`
            ]);
          return pre;
        },
        [] as Array<string[]>
      );
      updateRows(data, lastPos);
      lastPosition.set(streamStore.ActiveStream.streamId, lastPos + data.length);
    });
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
