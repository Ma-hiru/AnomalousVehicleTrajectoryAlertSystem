<template>
  <div class="video-info-container">
    <OnHover :scale="1.2">
      <dv-digital-flop :config="config" style="height: 50px" />
    </OnHover>
    <dv-border-box7 style="padding: 10px; width: 100%">
      <dv-scroll-board :config="config2" style="width: 99%; height: 100px; margin: auto" />
    </dv-border-box7>
  </div>
</template>

<script setup lang="ts" name="VideoInfo">
  import { reactive } from "vue";
  import OnHover from "@/components/Ani/OnHover.vue";

  const config = reactive({
    number: [923490],
    content: "{nt}",
    formatter: Intl.NumberFormat("zh-CN").format
  });
  const config2 = reactive({
    header: ["标识", "行为", "时间", "视频id"],
    data: [
      ["行1列1", "行1列2", "行1列3", "行1列3"],
      ["行2列1", "行2列2", "行2列3", "行1列3"],
      ["行3列1", "行3列2", "行3列3", "行1列3"],
      ["行4列1", "行4列2", "行4列3", "行1列3"],
      ["行5列1", "行5列2", "行5列3", "行1列3"],
      ["行6列1", "行6列2", "行6列3", "行1列3"],
      ["行7列1", "行7列2", "行7列3", "行1列3"],
      ["行8列1", "行8列2", "行8列3", "行1列3"],
      ["行9列1", "行9列2", "行9列3", "行1列3"],
      ["行10列1", "行10列2", "行10列3", "行1列3"]
    ],
    index: false,
    align: ["center"],
    rowNum: 2,
    headerBGC: "transparent",
    headerHeight: 0,
    oddRowBGC: "rgba(0,0,0,0.2)",
    evenRowBGC: "rgba(255,255,255,0.2)"
  });
</script>

<style scoped lang="scss">
  .video-info-container {
    display: flex;
    flex-direction: column;
  }
</style>
