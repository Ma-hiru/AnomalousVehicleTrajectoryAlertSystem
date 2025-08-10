interface ScrollBoardConfig {
  header: string[];
  data: any[][];
  index?: boolean;
  columnWidth?: number[];
  align?: ("center" | "left" | "right")[];
  rowNum?: number;
  hoverPause?: boolean;
  waitTime?: number;
  headerBGC?: string; // 添加表头背景色
  headerHeight?: number; // 添加表头高度
  oddRowBGC?: string; // 添加奇数行背景色
  evenRowBGC?: string; // 添加偶数行背景色
}
