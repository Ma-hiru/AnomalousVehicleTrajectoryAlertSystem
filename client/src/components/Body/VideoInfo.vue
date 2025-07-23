<template>
  <div class="video-info-container">
    <OnHover :scale="1.2">
      <dv-digital-flop :config="flopConfig" style="height: 50px" />
    </OnHover>
    <dv-border-box7
      v-if="tableConfig.data.length"
      style="padding: 10px; width: 100%; height: 120px">
      <div style="width: 100%; height: 100%">
        <CustomScrollBoard :config="tableConfig" style="width: 100%; height: 100%" />
      </div>
    </dv-border-box7>
    <div v-else class="tips">No Exceptions</div>
  </div>
</template>

<script setup lang="ts" name="VideoInfo">
  import { computed, ref } from "vue";
  import OnHover from "@/components/Ani/OnHover.vue";
  import { ActionsEnum } from "@/stores/pinia/modules/streamStore";
  import dayjs from "dayjs";
  import CustomScrollBoard from "@/components/Charts/CustomScrollBoard/CustomScrollBoard.vue";

  // const streamStore = useStreamStore();
  const total = ref(0);

  // 更改变量名，避免与dv-digital-flop的config冲突
  const flopConfig = computed(() => ({
    number: [total.value],
    content: "{nt}",
    formatter: Intl.NumberFormat("zh-CN").format
  }));

  // 更改变量名，避免与dv-scroll-board的config冲突
  const tableConfig = computed(() => {
    let count = 0;

    // 筛选出异常记录
    //TODO 需要总体记录，且实现滚动流；需要基于此筛选异常滚动记录
    const exceptionRecords = streamStore.TotalCarRecordList.filter((cur) => !cur.status);
    count = exceptionRecords.length;

    const data = {
      header: ["标识", "行为", "时间", "视频id"],
      data: exceptionRecords.map((cur) => [
        cur.carId,
        ActionsEnum[cur.actionId],
        dayjs(cur.time).format("HH:mm:ss"),
        cur.streamId
      ]),
      index: false,
      align: ["center", "center", "center", "center"],
      rowNum: 2,
      headerBGC: "transparent",
      headerHeight: 30,
      oddRowBGC: "rgba(0,0,0,0.2)",
      evenRowBGC: "rgba(0,0,0,0.1)"
    };

    total.value = count;
    return data;
  });
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
