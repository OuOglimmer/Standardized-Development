export interface DiaryEntry {
  id: string;
  date: Date;
  emoji: string;
  content: string;
  tags: string[];
}

export const ENTRIES: DiaryEntry[] = [
  {
    id: "d3",
    date: new Date("2026-07-15"),
    emoji: "😌",
    content:
      "今天重构了博客的布局系统，把 CSS Grid 和 Flexbox 的职责彻底分开了。左侧时间轴用了 sticky 定位，右侧日记卡片做了交错入场动画。感受最深的是，好的排版就像呼吸一样自然，用户不会注意到它，但会感受到它。",
    tags: ["#重构", "#CSS", "#排版"],
  },
  {
    id: "d2",
    date: new Date("2026-07-14"),
    emoji: "☀️",
    content:
      "研究了一下 shadcn/ui 的 Radix Nova 风格组件库，发现它采用了全新的 data-slot API，不再依赖 forwardRef。这种设计让组件的组合性更强，也更容易被 React Compiler 优化。打算在后续页面中全面采用这套方案。",
    tags: ["#前端架构"],
  },
  {
    id: "d1",
    date: new Date("2026-07-12"),
    emoji: "🌙",
    content:
      "周末读完了《Designing Data-Intensive Applications》的第二章。对分布式系统中的复制与分区有了更深的理解。结合之前做的实时数据看板项目，终于明白了为什么选 Cassandra 而不是 MongoDB。",
    tags: ["#读书", "#分布式"],
  },
];
