export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  type: "wide" | "narrow";
  accent: string;
}

export interface PortfolioRow {
  wide: PortfolioItem;
  narrow: PortfolioItem;
}

export const PORTFOLIO_ROWS: PortfolioRow[] = [
  {
    wide: {
      id: "w1",
      title: "E-Commerce Platform",
      description: "全栈电商平台，实时库存管理、支付集成、多语言支持与后台仪表盘。",
      tags: ["React", "Node.js", "PostgreSQL"],
      type: "wide",
      accent: "from-sky-400/15 to-blue-500/10",
    },
    narrow: {
      id: "n1",
      title: "电商平台",
      description: "面向全球用户的现代化电商解决方案，注重转化率与用户体验的平衡。支持多币种结算与自动化运营。",
      tags: ["UX", "Full-stack"],
      type: "narrow",
      accent: "from-violet-400/15 to-purple-500/10",
    },
  },
  {
    wide: {
      id: "w2",
      title: "Blog Engine",
      description: "高性能博客引擎，支持 MDX、SSG、实时预览与标签体系。",
      tags: ["Next.js", "MDX", "Tailwind"],
      type: "wide",
      accent: "from-amber-400/15 to-orange-500/10",
    },
    narrow: {
      id: "n2",
      title: "内容引擎",
      description: "为开发者打造的内容创作平台，通过组件化 MDX 实现灵活排版，兼顾写作体验与渲染性能。",
      tags: ["CMS", "SSG"],
      type: "narrow",
      accent: "from-emerald-400/15 to-teal-500/10",
    },
  },
  {
    wide: {
      id: "w3",
      title: "Analytics Dashboard",
      description: "实时数据分析仪表盘，可视化图表、自定义报表与告警系统。",
      tags: ["D3.js", "FastAPI", "Redis"],
      type: "wide",
      accent: "from-rose-400/15 to-pink-500/10",
    },
    narrow: {
      id: "n3",
      title: "数据看板",
      description: "将复杂的数据流转化为直观的可视化界面，帮助团队快速发现业务趋势与异常。",
      tags: ["DataViz", "Real-time"],
      type: "narrow",
      accent: "from-cyan-400/15 to-sky-500/10",
    },
  },
];

export interface GridItem {
  id: string;
  type: "wide" | "narrow";
  label?: string;
  title: string;
  description: string;
  tags: string[];
}

export const GRID_ITEMS: GridItem[] = [
  { id: "gw1", type: "wide", label: "UI 页面", title: "E-Commerce Platform", description: "全栈电商平台，实时库存管理、支付集成、多语言支持与后台仪表盘。", tags: ["React", "Node.js", "PostgreSQL"] },
  { id: "gn1", type: "narrow", label: "简介", title: "电商平台", description: "面向全球用户的现代化电商解决方案，注重转化率与用户体验的平衡。", tags: ["UX", "Full-stack"] },
  { id: "gw2", type: "wide", title: "Blog Engine", description: "高性能博客引擎，支持 MDX、SSG、实时预览与标签体系。", tags: ["Next.js", "MDX", "Tailwind"] },
  { id: "gn2", type: "narrow", title: "内容引擎", description: "为开发者打造的内容创作平台，通过组件化 MDX 实现灵活排版。", tags: ["CMS", "SSG"] },
  { id: "gw3", type: "wide", title: "Analytics Dashboard", description: "实时数据分析仪表盘，可视化图表、自定义报表与告警系统。", tags: ["D3.js", "FastAPI", "Redis"] },
  { id: "gn3", type: "narrow", title: "数据看板", description: "将复杂的数据流转化为直观的可视化界面，帮助团队快速发现业务趋势。", tags: ["DataViz", "Real-time"] },
];