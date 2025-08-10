<template>
  <div class="custom-scroll-board">
    <!-- 表头 -->
    <div class="board-header" :style="{ background: headerBGC }">
      <div
        v-for="(item, index) in config.header"
        :key="index"
        class="header-item"
        :style="{
          width: columnWidthStyle(index) as string,
          textAlign: columnAlignStyle(index)
        }">
        {{ item }}
      </div>
    </div>
    <!-- 表体 -->
    <div class="board-body" ref="boardBody">
      <transition-group
        name="scroll-list"
        tag="div"
        class="scroll-items"
        :style="{ transform: `translateY(${offset}px)` }">
        <div
          v-for="(row, rowIndex) in visibleData"
          :key="row.key || rowIndex"
          class="body-row"
          :class="{ odd: rowIndex % 2 === 0 }"
          :style="{
            height: `${rowHeight}px`,
            lineHeight: `${rowHeight}px`,
            backgroundColor: rowIndex % 2 === 0 ? oddRowBGC : evenRowBGC
          }">
          <div
            v-if="config.index"
            class="index-column"
            :style="{
              width: '50px',
              textAlign: 'center'
            }">
            {{ rowIndex + 1 }}
          </div>
          <div
            v-for="(item, colIndex) in row.data"
            :key="colIndex"
            class="body-item"
            :style="{
              width: columnWidthStyle(colIndex),
              textAlign: columnAlignStyle(colIndex)
            }"
            v-html="item" />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from "vue";

  const props = defineProps<{
    config: ScrollBoardConfig;
    width?: string;
    height?: string;
  }>();

  // 状态
  const offset = ref(0);
  const currentIndex = ref(0);
  const hovered = ref(false);
  const boardBody = ref<HTMLElement | null>(null);

  // 计算属性
  const rowHeight = computed(() => props.config.headerHeight || 35); // 默认行高
  const headerBGC = computed(() => props.config.headerBGC || "rgba(14, 54, 153, 0.6)");
  const oddRowBGC = computed(() => props.config.oddRowBGC || "rgba(6, 30, 93, 0.4)");
  const evenRowBGC = computed(() => props.config.evenRowBGC || "transparent");

  const visibleData = computed(() => {
    const result = [];
    const data = props.config.data;
    const rowNum = props.config.rowNum || 5;
    if (data.length <= rowNum) {
      return data.map((row, index) => ({
        data: row,
        key: `row-${index}`
      }));
    }
    for (let i = 0; i < rowNum; i++) {
      const index = (currentIndex.value + i) % data.length;
      result.push({
        data: data[index],
        key: `row-${index}`
      });
    }
    return result;
  });

  const columnWidthStyle = (index: number) => {
    if (!props.config.columnWidth) {
      return "auto";
    }
    const width = props.config.columnWidth[index];
    return width ? `${width}px` : "auto";
  };

  const columnAlignStyle = (index: number) => {
    if (!props.config.align) {
      return "left";
    }
    return props.config.align[index] || "left";
  };

  let scrollTimer: number | null = null;

  function startScroll() {
    scrollTimer && clearInterval(scrollTimer);
    const waitTime = props.config.waitTime || 2000;
    scrollTimer = window.setInterval(() => {
      if (hovered.value && props.config.hoverPause) return;
      if (props.config.data.length <= (props.config.rowNum || 5)) return;
      currentIndex.value = (currentIndex.value + 1) % props.config.data.length;
    }, waitTime);
  }

  function handleMouseEnter() {
    hovered.value = true;
  }

  function handleMouseLeave() {
    hovered.value = false;
  }

  watch(
    () => props.config.data,
    () => {
      startScroll();
    },
    { deep: true }
  );

  onMounted(() => {
    startScroll();
    if (boardBody.value) {
      boardBody.value.addEventListener("mouseenter", handleMouseEnter);
      boardBody.value.addEventListener("mouseleave", handleMouseLeave);
    }
  });
  onUnmounted(() => {
    if (scrollTimer) {
      clearInterval(scrollTimer);
    }
    if (boardBody.value) {
      boardBody.value.removeEventListener("mouseenter", handleMouseEnter);
      boardBody.value.removeEventListener("mouseleave", handleMouseLeave);
    }
  });
</script>

<style scoped>
  .custom-scroll-board {
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: #fff;
    background-color: rgba(6, 30, 93, 0.5);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
  }

  .board-header {
    display: flex;
    font-size: 15px;
    font-weight: bold;
    padding: 10px 0;
    flex-shrink: 0;
    border-bottom: 2px solid rgba(64, 158, 255, 0.6);
    text-shadow: 0 0 5px rgba(0, 200, 255, 0.8);
  }

  .header-item {
    padding: 0 10px;
    flex: 1;
  }

  .board-body {
    position: relative;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  }

  .scroll-items {
    transition: transform 0.3s ease;
    width: 100%;
  }

  .body-row {
    display: flex;
    transition: all 0.3s;
    border-bottom: 1px solid rgba(64, 158, 255, 0.2);
    width: 100%;
  }

  .body-row:hover {
    background-color: rgba(24, 144, 255, 0.2) !important;
    box-shadow: 0 0 10px rgba(24, 144, 255, 0.3);
    transform: translateY(-1px);
  }

  .body-item,
  .index-column {
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  /* 动画效果 */
  .scroll-list-enter-active,
  .scroll-list-leave-active {
    transition: all 0.5s ease;
  }

  .scroll-list-enter-from {
    opacity: 0;
    transform: translateY(30px);
  }

  .scroll-list-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
</style>
