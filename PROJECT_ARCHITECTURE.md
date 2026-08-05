# Personal Blog 项目结构与技术架构

## 1. 项目概览

这是一个个人博客全栈项目，包含 Blog、日记、标签和作品集功能。文章支持纯文本、Markdown 与 MDX；上传的 `.md` / `.mdx` 文件内容作为文本保存到数据库，并在博客详情页渲染。

```
浏览器
  -> Next.js 16 前端（frontend/）
  -> FastAPI 后端（backend/）
  -> Supabase Auth + PostgreSQL（supabase/）
```

## 2. 仓库目录

```
personal-blog/
├── frontend/                 # Next.js App Router 前端
│   ├── src/app/              # 页面与路由
│   ├── src/components/       # Blog、认证、布局、UI 组件
│   ├── src/lib/api/          # 后端 API、Supabase Auth、React Query
│   └── src/lib/markdown.ts   # MD/MDX Frontmatter 解析与 slug 工具
├── backend/                  # FastAPI 后端
│   ├── app/routes/           # auth、posts、tags、projects API
│   ├── app/auth/             # 当前用户与管理员鉴权依赖
│   ├── app/models.py         # SQLAlchemy ORM 模型
│   ├── app/schemas.py        # Pydantic 请求/响应模型
│   ├── app/database.py       # asyncpg / SQLAlchemy 异步连接
│   └── app/main.py           # FastAPI 应用与路由注册
├── supabase/                 # 建表 SQL、RLS 策略、迁移
│   ├── init.sql              # 完整初始化结构
│   └── migrations/           # 增量数据库迁移
└── PROJECT_ARCHITECTURE.md   # 本文档
```

## 3. 前端

### 框架与依赖

| 范畴 | 技术 |
| --- | --- |
| 应用框架 | Next.js 16.2（App Router） |
| 语言 | TypeScript 5、React 19 |
| UI | Tailwind CSS 4、shadcn/ui、Radix UI、Lucide 图标 |
| 数据请求 | TanStack React Query |
| 认证 | `@supabase/supabase-js` |
| Markdown | `react-markdown`、`remark-gfm` |
| MDX | `next-mdx-remote/rsc`、`gray-matter` |

### 页面路由

| 路径 | 用途 |
| --- | --- |
| `/` | 首页 |
| `/blog` | Blog 列表、搜索与发布入口 |
| `/blog/[slug]` | Blog 详情与 Markdown/MDX 内容渲染 |
| `/diary` | 日记列表与发布入口 |
| `/tags`、`/tags/[slug]` | 标签聚合与筛选 |
| `/portfolio`、`/portfolio/[slug]` | 作品集 |
| `/about` | 关于页面 |

### 内容发布与删除流程

1. 管理员在发布弹窗中选择 Blog 并上传 `.md` 或 `.mdx` 文件，或直接输入正文。
2. 前端使用 `gray-matter` 解析 YAML Frontmatter，读取 `title`、`slug`、`description`、`tags`。
3. 正文、内容格式和源文件名通过 `POST /api/posts` 保存到 `posts` 表。
4. 发布成功后跳转至 `/blog/[slug]`；详情页按 `content_format` 选择纯文本、Markdown 或 MDX 渲染器。
5. 管理员可在 Blog 卡片或详情页删除文章。调用 `DELETE /api/posts/{id}` 后，文章正文、源文件名和关联记录会从数据库移除。

MDX 仅允许受控内容。包含顶层 `import` 或 `export` 的文件会被拒绝，避免运行任意导入代码。

## 4. 后端

### 框架与运行方式

| 范畴 | 技术 |
| --- | --- |
| Web 框架 | FastAPI 0.115 |
| ORM | SQLAlchemy 2 异步模式 |
| PostgreSQL 驱动 | asyncpg |
| 数据校验 | Pydantic 2 |
| 开发服务器 | Uvicorn |
| 认证来源 | Supabase Auth Bearer Token |

后端使用 `DATABASE_URL` 或 `SUPABASE_DATABASE_URL` 建立异步 PostgreSQL 连接。连接池使用 `NullPool`，并关闭 asyncpg 语句缓存，以适配 Supabase 事务池。

### API 模块

| 前缀 | 文件 | 功能 |
| --- | --- | --- |
| `/api/auth` | `backend/app/routes/auth.py` | 注册、登录、当前用户、登出 |
| `/api/posts` | `backend/app/routes/posts.py` | Blog/日记的查询、创建、更新、删除 |
| `/api/tags` | `backend/app/routes/tags.py` | 标签查询与管理员维护 |
| `/api/projects` | `backend/app/routes/projects.py` | 作品集管理 |
| `/api/health` | `backend/app/main.py` | 健康检查 |

### 权限模型

- 前端从 Supabase Session 读取访问令牌，并以 `Authorization: Bearer <token>` 调用后端。
- 后端通过 `get_current_user` 验证令牌并定位 `profiles` 用户。
- 文章创建需要已登录用户；页面发布入口仅对管理员展示。
- 文章更新与删除允许文章作者或管理员执行。
- 标签和作品集写操作仅允许管理员。

## 5. 数据库

数据库为 Supabase PostgreSQL。完整基础结构位于 `supabase/init.sql`，增量变更位于 `supabase/migrations/`。

### 数据表

| 表 | 作用 | 主要关系 |
| --- | --- | --- |
| `profiles` | 用户资料、角色、状态 | `auth.users` 的一对一扩展；关联文章、评论 |
| `posts` | Blog 与日记正文 | 关联作者、标签、评论 |
| `tags` | 标签定义 | 通过 `post_tags`、`project_tags` 多对多关联 |
| `post_tags` | 文章与标签关系 | 删除文章或标签时级联删除 |
| `comments` | 文章评论与回复 | 关联文章、用户和父评论 |
| `projects` | 作品集项目 | 可关联标签 |
| `project_tags` | 项目与标签关系 | 删除项目或标签时级联删除 |

### `posts` 关键字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | UUID | 主键 |
| `title` | TEXT | 文章标题 |
| `slug` | TEXT | 唯一 URL 标识 |
| `content` | TEXT | 正文，保存上传文件的文本内容 |
| `content_format` | TEXT | `plain`、`markdown` 或 `mdx` |
| `source_filename` | TEXT | 原始上传文件名，可为空 |
| `description` | TEXT | 摘要 |
| `diary_date` | DATE | 非空时表示日记 |
| `author_id` | UUID | 关联 `profiles.id` |
| `is_published` | BOOLEAN | 发布状态 |
| `view_count` | INT | 阅读次数 |
| `created_at` / `updated_at` | TIMESTAMPTZ | 创建与更新时间 |

### 删除行为

文章删除为物理删除：后端直接删除 `posts` 记录。根据外键 `ON DELETE CASCADE`：

- `post_tags` 中的文章标签关系会自动删除。
- `comments` 表存在时，该文章的评论会自动删除。
- 上传的 Markdown/MDX 不在 Supabase Storage 中，而是存放于 `posts.content`，因此正文随记录一并删除。

### RLS 策略

所有业务表已启用 Row Level Security。

- 已发布且未软删除的文章可公开读取。
- 作者与管理员可读取、更新、删除自己的文章或管理全部文章。
- 标签和项目可公开读取，写操作仅管理员可执行。
- 评论仅对已发布文章公开，用户可管理自己的评论。

## 6. 迁移与当前数据库状态

关键迁移：

| 迁移 | 内容 |
| --- | --- |
| `202607300001_initial_schema_and_rls.sql` | 初始表、索引、RLS 策略 |
| `202607310001_repair_profile_foreign_keys.sql` | 修复用户资料外键 |
| `202607310002_add_posts_soft_delete.sql` | 增加 `deleted_at` 与文章可见性策略 |
| `202607310003_add_post_content_format.sql` | 增加 `content_format` 与 `source_filename` |
| `202608030001_add_mdx_content_format.sql` | 将 `mdx` 加入 `content_format` 枚举约束 |

注意：当前运行环境曾返回 `relation "comments" does not exist`。这说明实际 Supabase 数据库尚未具备 `init.sql` 定义的完整结构，至少缺少 `comments` 表。文章删除已改为不依赖该表，但若需启用评论功能，应先在 Supabase 应用对应建表/迁移。

## 7. 环境变量

后端 `.env`：

```env
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=...
ADMIN_EMAIL=...
REGISTRATION_ENABLED=false
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

前端 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_ADMIN_EMAIL=...
```

## 8. 本地启动

```bash
# 终端 1：后端
cd backend
./start.sh

# 终端 2：前端
cd frontend
npm run dev
```

默认访问地址：前端 `http://localhost:3000`，后端 API `http://127.0.0.1:8000/api`，接口文档 `http://127.0.0.1:8000/docs`。
