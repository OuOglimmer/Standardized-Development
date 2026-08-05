/**
 * 首页占位数据：角色卡片、技能/习惯分组、个人资料。
 * 后续接入真实数据源（CMS / 文件）时，只需替换本文件。
 */

export type Agent = {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  /** 选中后在预留聊天区显示的提示语 */
  prompt: string;
  /** Tailwind 渐变类，用于卡片头像背景 */
  accent: string;
};

/** Agent 交互口的角色列表（占位，后续可抽象为 skill 注册表） */
export const AGENTS: Agent[] = [
  {
    id: "yupi",
    name: "鱼皮",
    avatar: "🐟",
    tagline: "全栈导师 · 项目驱动学习",
    prompt: "🐟 鱼皮已就位，准备好一起做项目了吗？交互能力即将上线。",
    accent: "from-sky-400/30 to-cyan-300/20",
  },
  {
    id: "fengge",
    name: "峰哥",
    avatar: "🏔️",
    tagline: "架构视角 · 技术深度分享",
    prompt: "🏔️ 峰哥已就位，今天聊聊架构与底层原理？交互能力即将上线。",
    accent: "from-violet-400/30 to-indigo-300/20",
  },
  {
    id: "glow",
    name: "Glimmer",
    avatar: "✨",
    tagline: "本站作者 · 记录与思考",
    prompt: "✨ Glimmer 已就位，欢迎来到我的博客。交互能力即将上线。",
    accent: "from-amber-400/30 to-rose-300/20",
  },
];

export type SkillGroup = {
  title: string;
  emoji: string;
  items: string[];
};

/** 个人习惯 / 技能分组，用于第二屏卡片网格 */
export const SKILLS: SkillGroup[] = [
  {
    title: "技术栈",
    emoji: "🛠️",
    items: ["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "PostgreSQL"],
  },
  {
    title: "日常习惯",
    emoji: "🌱",
    items: ["每日阅读", "写技术笔记", "开源贡献", "早起", "运动"],
  },
  {
    title: "兴趣领域",
    emoji: "🎯",
    items: ["全栈架构", "性能优化", "AI 应用", "开发者体验", "产品设计"],
  },
];

export type Profile = {
  name: string;
  bio: string;
  location: string;
  links: { label: string; href: string }[];
};

/** GitHub 个人页风格的资料卡内容 */
export const PROFILE: Profile = {
  name: "OuOglimmer",
  bio: "一个记录技术、思考与生活的个人博客。在代码里找秩序，在文字里找节奏。",
  location: "Earth · Remote",
  links: [
    { label: "GitHub", href: "https://github.com/OuOglimmer" },
    { label: "RSS", href: "/rss.xml" },
  ],
};
