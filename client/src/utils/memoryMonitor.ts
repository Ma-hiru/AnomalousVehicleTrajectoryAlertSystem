/**
 * 内存监控工具
 * 用于检测和监控可能的内存泄漏
 */

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemorySnapshot {
  timestamp: number;
  memory: MemoryInfo | null;
  components: number;
  watchers: number;
  timers: number;
}

class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 100;
  private monitorInterval: number | null = null;

  private getMemoryInfo(): MemoryInfo | null {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  private getComponentCount(): number {
    // 尝试获取Vue组件实例数量
    if (typeof window !== "undefined" && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.apps && hook.apps.length > 0) {
        // 这是一个近似值
        return hook.apps.reduce((total: number, app: any) => {
          return total + (app._instance ? 1 : 0);
        }, 0);
      }
    }
    return 0;
  }

  private getWatcherCount(): number {
    // 这个很难准确获取，返回一个估算值
    return document.querySelectorAll("[data-v-]").length;
  }

  private getTimerCount(): number {
    // 无法直接获取定时器数量，返回0
    return 0;
  }

  takeSnapshot(): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      memory: this.getMemoryInfo(),
      components: this.getComponentCount(),
      watchers: this.getWatcherCount(),
      timers: this.getTimerCount()
    };

    this.snapshots.push(snapshot);

    // 限制快照数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }

    return snapshot;
  }

  startMonitoring(intervalMs: number = 10000) {
    this.stopMonitoring();

    this.monitorInterval = window.setInterval(() => {
      const snapshot = this.takeSnapshot();
      this.analyzeSnapshot(snapshot);
    }, intervalMs);

    if (import.meta.env.DEV) {
      console.log(`内存监控已启动，每${intervalMs}ms记录一次快照`);
    }
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      if (import.meta.env.DEV) {
        console.log("内存监控已停止");
      }
    }
  }

  private analyzeSnapshot(snapshot: MemorySnapshot) {
    if (this.snapshots.length < 2) return;

    const previous = this.snapshots[this.snapshots.length - 2];
    const current = snapshot;

    if (current.memory && previous.memory) {
      const memoryGrowth = current.memory.usedJSHeapSize - previous.memory.usedJSHeapSize;
      const memoryGrowthMB = memoryGrowth / 1024 / 1024;

      if (memoryGrowthMB > 5) {
        // 如果内存增长超过5MB
        if (import.meta.env.DEV) {
          console.warn(`🚨 检测到内存增长: ${memoryGrowthMB.toFixed(2)}MB`);
          this.logSnapshot(current);
        }
      }

      // 检查内存使用率
      const memoryUsagePercent =
        (current.memory.usedJSHeapSize / current.memory.jsHeapSizeLimit) * 100;
      if (memoryUsagePercent > 80) {
        if (import.meta.env.DEV) {
          console.error(`🚨 内存使用率过高: ${memoryUsagePercent.toFixed(2)}%`);
        }
      }
    }
  }

  logSnapshot(snapshot: MemorySnapshot) {
    if (!import.meta.env.DEV) return;

    console.group("📊 内存快照");
    console.log("时间:", new Date(snapshot.timestamp).toLocaleTimeString());

    if (snapshot.memory) {
      console.log("内存使用:", {
        已用: `${(snapshot.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        总计: `${(snapshot.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        限制: `${(snapshot.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        使用率: `${((snapshot.memory.usedJSHeapSize / snapshot.memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
      });
    }

    console.log("组件数量:", snapshot.components);
    console.log("监听器数量:", snapshot.watchers);
    console.groupEnd();
  }

  getMemoryTrend(): { growing: boolean; averageGrowth: number } {
    if (this.snapshots.length < 3) {
      return { growing: false, averageGrowth: 0 };
    }

    const recent = this.snapshots.slice(-10); // 最近10个快照
    let totalGrowth = 0;
    let validComparisons = 0;

    for (let i = 1; i < recent.length; i++) {
      const current = recent[i];
      const previous = recent[i - 1];

      if (current.memory && previous.memory) {
        const growth = current.memory.usedJSHeapSize - previous.memory.usedJSHeapSize;
        totalGrowth += growth;
        validComparisons++;
      }
    }

    if (validComparisons === 0) {
      return { growing: false, averageGrowth: 0 };
    }

    const averageGrowth = totalGrowth / validComparisons / 1024 / 1024; // MB
    return {
      growing: averageGrowth > 1, // 平均增长超过1MB认为是在增长
      averageGrowth
    };
  }

  exportSnapshots(): string {
    return JSON.stringify(this.snapshots, null, 2);
  }

  clearSnapshots() {
    this.snapshots = [];
    if (import.meta.env.DEV) {
      console.log("已清空内存快照");
    }
  }
}

// 创建单例
export const memoryMonitor = new MemoryMonitor();

// 在开发环境自动启动监控
if (import.meta.env.DEV) {
  // 延迟启动，避免初始化时的内存变化干扰
  setTimeout(() => {
    memoryMonitor.startMonitoring(15000); // 每15秒监控一次
  }, 5000);
}

// 暴露到全局，方便调试
if (typeof window !== "undefined") {
  (window as any).memoryMonitor = memoryMonitor;
}
