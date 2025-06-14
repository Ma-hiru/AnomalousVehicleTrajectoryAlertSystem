<template>
  <div class="video-info-container">
    <OnHover :scale="1.2">
      <dv-digital-flop :config="config" style="height: 50px" />
    </OnHover>
    <dv-border-box7 v-if="config2.data.length" style="padding: 10px; width: 100%">
      <dv-scroll-board :config="config2" style="width: 99%; height: 100px; margin: auto" />
    </dv-border-box7>
    <div v-else class="tips">No Exceptions</div>
  </div>
</template>

<script setup lang="ts" name="VideoInfo">
  import { computed, onMounted, reactive, ref } from "vue";
  import OnHover from "@/components/Ani/OnHover.vue";
  import { ActionsEnum, useStreamStore } from "@/stores/pinia/modules/streamStore";
  import dayjs from "dayjs";

  const streamStore = useStreamStore();
  const total = ref(0);
  const config = computed(() => ({
    number: [total.value],
    content: "{nt}",
    formatter: Intl.NumberFormat("zh-CN").format
  }));
  const config2 = computed(() => {
    let count = 0;
    const data = {
      header: ["标识", "行为", "时间", "视频id"],
      data: streamStore.TotalCarRecordList.reduce(
        (pre, cur) => {
          if (!cur.status) {
            pre.push([
              cur.carId,
              ActionsEnum[cur.actionId],
              dayjs(cur.time).format("HH:mm:ss"),
              cur.streamId
            ]);
            count++;
          }
          return pre;
        },
        [] as Array<(string | number)[]>
      ),
      index: false,
      align: ["center"],
      rowNum: 2,
      headerBGC: "transparent",
      headerHeight: 0,
      oddRowBGC: "rgba(0,0,0,0.2)",
      evenRowBGC: "rgba(255,255,255,0.2)"
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
