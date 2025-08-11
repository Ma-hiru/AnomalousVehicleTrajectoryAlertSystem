/**
 * 内存泄漏检测工具
 * 用于检测和分析可能的内存泄漏源
 */

interface LeakDetectionResult {
  timestamp: number;
  suspiciousPatterns: SuspiciousPattern[];
  memoryGrowthRate: number;
  recommendations: string[];
}

interface SuspiciousPattern {
  type: "timer" | "listener" | "object" | "closure";
  description: string;
  severity: "low" | "medium" | "high";
  count?: number;
}

class MemoryLeakDetector {
  private detectionInterval: number | null = null;
  private baselineMemory: number = 0;
  private consecutiveGrowth = 0;
  private readonly GROWTH_THRESHOLD = 1; // MB
  private readonly MAX_CONSECUTIVE_GROWTH = 5;

  startDetection(intervalMs: number = 30000) {
    this.stopDetection();
    this.establishBaseline();

    this.detectionInterval = window.setInterval(() => {
      this.performDetection();
    }, intervalMs);

    if (import.meta.env.DEV) {
      console.log(`🕵️ Memory leak detection started (interval: ${intervalMs}ms)`);
    }
  }

  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
      if (import.meta.env.DEV) {
        console.log("🛑 Memory leak detection stopped");
      }
    }
  }

  private establishBaseline() {
    const memory = this.getCurrentMemory();
    if (memory) {
      this.baselineMemory = memory.usedJSHeapSize;
      if (import.meta.env.DEV) {
        console.log(
          `📊 Memory baseline established: ${(this.baselineMemory / 1024 / 1024).toFixed(2)}MB`
        );
      }
    }
  }

  private getCurrentMemory() {
    if ("memory" in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  private performDetection(): LeakDetectionResult {
    const memory = this.getCurrentMemory();
    const result: LeakDetectionResult = {
      timestamp: Date.now(),
      suspiciousPatterns: [],
      memoryGrowthRate: 0,
      recommendations: []
    };

    if (memory) {
      const currentMemory = memory.usedJSHeapSize;
      const growthMB = (currentMemory - this.baselineMemory) / 1024 / 1024;
      result.memoryGrowthRate = growthMB;

      if (growthMB > this.GROWTH_THRESHOLD) {
        this.consecutiveGrowth++;

        if (this.consecutiveGrowth >= this.MAX_CONSECUTIVE_GROWTH) {
          if (import.meta.env.DEV) {
            console.warn(
              `🚨 Potential memory leak detected! Growth: ${growthMB.toFixed(2)}MB over baseline`
            );
          }
          result.suspiciousPatterns = this.detectSuspiciousPatterns();
          result.recommendations = this.generateRecommendations(result.suspiciousPatterns);

          // 重置基线以避免持续报警
          this.baselineMemory = currentMemory;
          this.consecutiveGrowth = 0;
        }
      } else {
        this.consecutiveGrowth = 0;
      }
    }

    return result;
  }

  private detectSuspiciousPatterns(): SuspiciousPattern[] {
    const patterns: SuspiciousPattern[] = [];

    // 检测定时器
    const timerPattern = this.checkTimers();
    if (timerPattern) patterns.push(timerPattern);

    // 检测事件监听器
    const listenerPattern = this.checkEventListeners();
    if (listenerPattern) patterns.push(listenerPattern);

    // 检测DOM节点
    const domPattern = this.checkDOMNodes();
    if (domPattern) patterns.push(domPattern);

    // 检测闭包
    const closurePattern = this.checkClosures();
    if (closurePattern) patterns.push(closurePattern);

    return patterns;
  }

  private checkTimers(): SuspiciousPattern | null {
    // 这里无法直接检测定时器数量，但可以提供一般性建议
    return {
      type: "timer",
      description: "Check for uncleared setInterval/setTimeout calls",
      severity: "medium"
    };
  }

  private checkEventListeners(): SuspiciousPattern | null {
    // 检查是否有大量的事件监听器
    const elements = document.querySelectorAll("*");
    let suspiciousCount = 0;

    elements.forEach((element) => {
      // 这是一个简化的检查，实际中很难准确检测
      const listeners = (element as any)._listeners;
      if (listeners && Object.keys(listeners).length > 5) {
        suspiciousCount++;
      }
    });

    if (suspiciousCount > 10) {
      return {
        type: "listener",
        description: `Found ${suspiciousCount} elements with many event listeners`,
        severity: "high",
        count: suspiciousCount
      };
    }

    return null;
  }

  private checkDOMNodes(): SuspiciousPattern | null {
    const nodeCount = document.querySelectorAll("*").length;

    if (nodeCount > 10000) {
      return {
        type: "object",
        description: `High DOM node count: ${nodeCount}`,
        severity: "medium",
        count: nodeCount
      };
    }

    return null;
  }

  private checkClosures(): SuspiciousPattern | null {
    // 检查Vue组件实例
    if (typeof window !== "undefined" && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.apps) {
        const appCount = hook.apps.length;
        if (appCount > 5) {
          return {
            type: "closure",
            description: `Multiple Vue app instances detected: ${appCount}`,
            severity: "medium",
            count: appCount
          };
        }
      }
    }

    return null;
  }

  private generateRecommendations(patterns: SuspiciousPattern[]): string[] {
    const recommendations: string[] = [];

    patterns.forEach((pattern) => {
      switch (pattern.type) {
        case "timer":
          recommendations.push(
            "Review all setInterval/setTimeout calls and ensure clearInterval/clearTimeout are called"
          );
          recommendations.push("Check component lifecycle hooks (onUnmounted) for proper cleanup");
          break;
        case "listener":
          recommendations.push("Audit event listeners and ensure removeEventListener is called");
          recommendations.push("Use { passive: true } for passive listeners when possible");
          break;
        case "object":
          recommendations.push("Check for excessive DOM manipulation or unused elements");
          recommendations.push("Consider using virtual scrolling for large lists");
          break;
        case "closure":
          recommendations.push("Review Vue component creation and ensure proper cleanup");
          recommendations.push("Check for circular references in reactive objects");
          break;
      }
    });

    // 通用建议
    recommendations.push("Use browser DevTools Memory tab for detailed analysis");
    recommendations.push("Consider taking heap snapshots before and after user actions");

    return [...new Set(recommendations)]; // 去重
  }

  // 手动检测方法
  performManualCheck(): LeakDetectionResult {
    if (import.meta.env.DEV) {
      console.log("🔍 Performing manual memory leak check...");
    }
    const result = this.performDetection();

    if (import.meta.env.DEV) {
      if (result.suspiciousPatterns.length > 0) {
        console.group("🚨 Suspicious patterns found:");
        result.suspiciousPatterns.forEach((pattern) => {
          console.warn(
            `[${pattern.severity.toUpperCase()}] ${pattern.type}: ${pattern.description}`
          );
        });
        console.groupEnd();

        console.group("💡 Recommendations:");
        result.recommendations.forEach((rec) => {
          console.info(`• ${rec}`);
        });
        console.groupEnd();
      } else {
        console.log("✅ No suspicious patterns detected");
      }
    }

    return result;
  }

  // 生成内存报告
  generateReport(): string {
    const memory = this.getCurrentMemory();
    const result = this.performDetection();

    const report = {
      timestamp: new Date().toISOString(),
      memory: memory
        ? {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
            totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
            limitMB: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
          }
        : null,
      growthFromBaseline: result.memoryGrowthRate.toFixed(2) + "MB",
      suspiciousPatterns: result.suspiciousPatterns,
      recommendations: result.recommendations,
      domNodeCount: document.querySelectorAll("*").length
    };

    return JSON.stringify(report, null, 2);
  }
}

// 导出单例
export const memoryLeakDetector = new MemoryLeakDetector();

// 在开发环境自动启动检测
if (import.meta.env.DEV) {
  setTimeout(() => {
    memoryLeakDetector.startDetection(60000); // 每分钟检测一次
  }, 10000); // 启动后10秒开始检测
}

// 暴露到全局供调试使用
if (typeof window !== "undefined") {
  (window as any).memoryLeakDetector = memoryLeakDetector;
}
