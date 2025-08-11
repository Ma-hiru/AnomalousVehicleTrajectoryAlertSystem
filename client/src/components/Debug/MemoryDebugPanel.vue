<!-- 内存监控调试面板 -->
<template>
  <div v-if="showPanel" class="memory-debug-panel">
    <div class="panel-header">
      <h3>🔍 Memory Monitor</h3>
      <button @click="togglePanel" class="close-btn">✕</button>
    </div>

    <div class="memory-info">
      <div class="memory-item">
        <label>Used Memory:</label>
        <span :class="{ warning: memoryUsagePercent > 70, error: memoryUsagePercent > 85 }">
          {{ currentMemory.used }}MB ({{ memoryUsagePercent.toFixed(1) }}%)
        </span>
      </div>

      <div class="memory-item">
        <label>Total Memory:</label>
        <span>{{ currentMemory.total }}MB</span>
      </div>

      <div class="memory-item">
        <label>Memory Limit:</label>
        <span>{{ currentMemory.limit }}MB</span>
      </div>

      <div class="memory-item">
        <label>Memory Growth:</label>
        <span :class="{ warning: trend.averageGrowth > 2, error: trend.averageGrowth > 5 }">
          {{ trend.growing ? "+" : "" }}{{ trend.averageGrowth.toFixed(2) }}MB/snapshot
        </span>
      </div>
    </div>

    <div class="actions">
      <button @click="takeManualSnapshot" class="action-btn">📸 Take Snapshot</button>
      <button @click="clearSnapshots" class="action-btn">🗑️ Clear Data</button>
      <button @click="exportData" class="action-btn">💾 Export</button>
    </div>

    <div class="snapshots-list" v-if="recentSnapshots.length">
      <h4>Recent Snapshots ({{ recentSnapshots.length }})</h4>
      <div class="snapshot-item" v-for="snapshot in recentSnapshots" :key="snapshot.timestamp">
        <span class="time">{{ formatTime(snapshot.timestamp) }}</span>
        <span class="memory" v-if="snapshot.memory">
          {{ (snapshot.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) }}MB
        </span>
      </div>
    </div>
  </div>

  <!-- 悬浮按钮 -->
  <button
    v-if="!showPanel"
    @click="togglePanel"
    class="memory-toggle-btn"
    :class="{ warning: memoryUsagePercent > 70, error: memoryUsagePercent > 85 }">
    🧠 {{ currentMemory.used }}MB
  </button>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
  import { memoryMonitor } from "@/utils/memoryMonitor";

  const showPanel = ref(false);
  const updateInterval = ref<number | null>(null);

  const currentMemory = reactive({
    used: 0,
    total: 0,
    limit: 0
  });

  const trend = reactive({
    growing: false,
    averageGrowth: 0
  });

  const recentSnapshots = ref<any[]>([]);

  const memoryUsagePercent = computed(() =>
    currentMemory.limit > 0 ? (currentMemory.used / currentMemory.limit) * 100 : 0
  );

  function togglePanel() {
    showPanel.value = !showPanel.value;
    if (showPanel.value) {
      updateMemoryInfo();
    }
  }

  function updateMemoryInfo() {
    const snapshot = memoryMonitor.takeSnapshot();
    if (snapshot.memory) {
      currentMemory.used = Number((snapshot.memory.usedJSHeapSize / 1024 / 1024).toFixed(1));
      currentMemory.total = Number((snapshot.memory.totalJSHeapSize / 1024 / 1024).toFixed(1));
      currentMemory.limit = Number((snapshot.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1));
    }

    const memoryTrend = memoryMonitor.getMemoryTrend();
    trend.growing = memoryTrend.growing;
    trend.averageGrowth = memoryTrend.averageGrowth;

    // 获取最近的快照（最多显示5个）
    recentSnapshots.value = (memoryMonitor as any).snapshots.slice(-5).reverse();
  }

  function takeManualSnapshot() {
    const snapshot = memoryMonitor.takeSnapshot();
    if (import.meta.env.DEV) {
      memoryMonitor.logSnapshot(snapshot);
    }
    updateMemoryInfo();
  }

  function clearSnapshots() {
    memoryMonitor.clearSnapshots();
    updateMemoryInfo();
  }

  function exportData() {
    const data = memoryMonitor.exportSnapshots();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-snapshots-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  onMounted(() => {
    // 定期更新内存信息
    updateInterval.value = window.setInterval(updateMemoryInfo, 2000);
    updateMemoryInfo();
  });

  onUnmounted(() => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value);
    }
  });
</script>

<style scoped lang="scss">
  .memory-debug-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    color: white;
    font-size: 12px;
    z-index: 9999;
    max-height: 80vh;
    overflow-y: auto;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 14px;
      }

      .close-btn {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 16px;

        &:hover {
          color: white;
        }
      }
    }

    .memory-info {
      margin-bottom: 12px;

      .memory-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;

        label {
          color: #999;
        }

        span {
          &.warning {
            color: #ffa500;
          }

          &.error {
            color: #ff4444;
          }
        }
      }
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .action-btn {
        background: #333;
        border: 1px solid #555;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;

        &:hover {
          background: #444;
        }
      }
    }

    .snapshots-list {
      h4 {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #999;
      }

      .snapshot-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
        font-size: 11px;

        .time {
          color: #999;
        }

        .memory {
          color: #00ff88;
        }
      }
    }
  }

  .memory-toggle-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    z-index: 9998;

    &:hover {
      background: rgba(0, 0, 0, 0.9);
    }

    &.warning {
      border-color: #ffa500;
      background: rgba(255, 165, 0, 0.1);
    }

    &.error {
      border-color: #ff4444;
      background: rgba(255, 68, 68, 0.1);
    }
  }
</style>
