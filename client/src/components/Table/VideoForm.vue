<template>
  <div class="w-[65%] h-full">
    <el-table :data="data" class="w-full h-full" border :row-class-name="tableRowClassName">
      <el-table-column prop="id" label="标识"></el-table-column>
      <el-table-column prop="action" label="行为"></el-table-column>
      <el-table-column prop="time" label="时间"></el-table-column>
      <!-- TODO 根据标识查所有记录 -->
      <el-table-column label="详情"></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts" name="VideoForm">
  const data = [
    {
      id: 1,
      action: "正常",
      time: "2023-01-01 00:00:00",
      status: true
    },
    {
      id: 2,
      action: "超速",
      time: "2023-01-01 00:00:00",
      status: false
    }
  ];
  data.push(...data)
  data.push(...data)
  const tableRowClassName = ({ row }: {
    row: typeof data[number]
  }) => {
    if (!row.status) {
      return "warning-row";
    } else {
      return "success-row";
    }

  };

</script>

<style scoped lang="scss">
  :deep(.el-table .warning-row) {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }

  :deep(.el-table .success-row) {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
  }
</style>
