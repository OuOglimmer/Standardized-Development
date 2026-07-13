# Agent: 个人博客全栈项目

## 项目定位
基于 Next.js 16 + TypeScript + Tailwind CSS + MDX 构建个人博客系统。
两周内完成从零到 Vercel 部署上线。
首屏加载 < 1.5s，Lighthouse 评分 > 90。

## 技术栈
框架：Next.js 16 (App Router)。
语言：TypeScript 严格模式。
样式：Tailwind CSS v4 + shadcn/ui。
内容：MDX + Frontmatter。
样式工具：clsx + tailwind-merge。
日期处理：date-fns。
评论：Giscus (GitHub Discussions)。
部署：Vercel。

## 目录结构
app/ 存放路由页面。
components/ 存放 UI 和业务组件。
content/posts/ 存放 MDX 文章。
lib/ 存放工具函数和数据加载。
types/ 存放 TypeScript 类型定义。
public/ 存放静态资源。

## 核心功能
首页展示 Hero 区域 + 最新 6 篇文章。
文章列表页支持分页（每页 6-10 篇）。
文章详情页渲染 MDX + 代码高亮 + TOC 目录。
全文搜索使用 ⌘K 弹窗，覆盖标题 + 正文。
标签系统包含聚合页 `/tags` 和筛选页 `/tags/[tag]`。
评论系统集成 Giscus，主题跟随暗色模式。
RSS Feed 输出最近 20 篇文章。
站点地图自动包含所有静态页面和文章。
暗色模式使用 next-themes，持久化到 localStorage。

## 数据层
文章类型定义包含 slug、title、description、date、tags、coverImage、readingTime、draft。
getAllPosts() 读取所有 MDX 文件，按日期排序，过滤草稿。
getPostBySlug(slug) 根据 slug 获取单篇文章数据。
generateStaticParams() 预生成所有文章静态路径。
使用 gray-matter 解析 Frontmatter。
使用 rehype-pretty-code 实现代码高亮。

## 交互增强
阅读进度条显示在文章顶部。
代码块右上角添加复制按钮。
文章卡片悬停上浮 + 阴影变化。
TOC 滚动高亮当前章节。
滚动超过 300px 显示回到顶部按钮。
页面切换使用 fade-in 过渡动效。

## 性能优化
图片使用 next/image + WebP 格式。
评论组件使用 next/dynamic 懒加载。
搜索组件使用 next/dynamic 懒加载。
启用 SWC 压缩。
使用 @vercel/analytics 监控流量。
使用 @vercel/speed-insights 监控 Core Web Vitals。
配置 404 和 500 错误页面。

## SEO
动态生成页面 metadata (title, description, openGraph)。
配置 robots.txt 和 sitemap.xml。
支持 Twitter Card 和 Open Graph 标签。
提供 RSS Feed 订阅。

## 环境变量
NEXT_PUBLIC_GISCUS_REPO: GitHub 仓库名 (username/repo)。
NEXT_PUBLIC_GISCUS_REPO_ID: 仓库 ID。
NEXT_PUBLIC_GISCUS_CATEGORY_ID: Discussion 分类 ID。

## 部署
Vercel 关联 GitHub 仓库，main 分支自动部署。
绑定自定义域名（可选）。
构建测试：pnpm build。
本地预览：pnpm start。

## 交付物
完整的 Next.js 项目源码（公开 GitHub 仓库）。
线上可访问的 Vercel 部署链接。
项目 README 文档（含启动指南和环境变量说明）。
10+ 篇示例博文。
功能测试报告（Lighthouse 评分 + 功能清单）。

## 后续迭代
v1.1: AI 摘要 + 相关推荐。
v1.2: 浏览量统计 + 文章热榜。
v1.3: 邮件订阅 Newsletter。
v2.0: 迁移到 Headless CMS (Sanity)。