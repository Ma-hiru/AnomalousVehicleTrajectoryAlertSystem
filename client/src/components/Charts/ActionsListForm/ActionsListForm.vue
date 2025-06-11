<template>
  <div class="action-list-container">
    <dv-border-box8 style="width:90%; height: 500px;padding: 10px;">
      <dv-scroll-board :config="config" style="height: 100%;width: 100%;"/>
    </dv-border-box8>
  </div>
</template>

<script setup lang="ts" name="ActionsListForm">
  import { reactive } from "vue";

  const config = reactive({
    header: ["标识", "行为", "时间"],
    data: [
      ["行1列1", "行1列2", "行1列3"],
      ["行2列1", "行2列2", "行2列3"],
      ["行3列1", "行3列2", "行3列3"],
      ["行4列1", "行4列2", "行4列3"],
      ["行5列1", "行5列2", "行5列3"],
      ["行6列1", "行6列2", "行6列3"],
      ["行7列1", "行7列2", "行7列3"],
      ["行8列1", "行8列2", "行8列3"],
      ["行9列1", "行9列2", "行9列3"],
      ["行10列1", "行10列2", "行10列3"],
      ["行10列1", "行10列2", "行10列3"]
    ],
    index: true,
    columnWidth: [100],
    align: ["center"],
    rowNum: 10,
    hoverPause: true,
    waitTime: 2000
  });
</script>

<style scoped lang="scss">
  .action-list-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
</style>
