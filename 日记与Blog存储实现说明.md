# 日记与 Blog 存储实现说明

## 1. 总体设计

项目没有为“日记”和“Blog”分别建立数据表，两类内容统一存储在 Supabase PostgreSQL 的 `posts` 表中。

内容类型主要由 `diary_date` 字段区分：

- 日记：`diary_date` 有日期值，同时通常带有 `emoji`。
- Blog：`diary_date` 为 `NULL`，`emoji` 为空字符串。

两类内容共用同一套创建、查询、详情、更新和删除 API，即 `/api/posts`。这种设计使标题、正文、标签、发布状态、浏览量等通用字段不需要重复维护。

## 2. 数据库存储结构

数据库表定义位于：

- `supabase/migrations/202607300001_initial_schema_and_rls.sql`
- `supabase/migrations/202607310003_add_post_content_format.sql`
- `supabase/init.sql`

后端对应的 SQLAlchemy 模型位于 `backend/app/models.py` 中的 `Post` 类。

### posts 表主要字段

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `id` | UUID | 内容主键，由数据库或 SQLAlchemy 生成 |
| `title` | TEXT | 标题；日记会自动生成日期标题，Blog 使用用户输入标题 |
| `slug` | TEXT UNIQUE | 内容唯一访问标识 |
| `content` | TEXT | 日记或 Blog 正文 |
| `content_format` | TEXT | 正文格式：`plain` 或 `markdown`；已有数据默认 `plain` |
| `source_filename` | TEXT NULL | 上传 Markdown 文件时记录原文件名，手动输入时为空 |
| `description` | TEXT | 摘要，当前前端取正文前 120 个字符 |
| `cover_image` | TEXT | Blog 封面地址，当前发布表单尚未填写该字段 |
| `emoji` | TEXT | 日记心情符号；Blog 写入空字符串 |
| `diary_date` | DATE NULL | 日记归属日期；Blog 为 `NULL` |
| `author_id` | UUID | 关联 `profiles.id`，作者删除时内容级联删除 |
| `reading_time` | INT | 阅读时间，默认值为 0 |
| `is_published` | BOOLEAN | 是否公开发布 |
| `view_count` | INT | 详情页浏览次数 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |
| `deleted_at` | TIMESTAMPTZ NULL | 软删除时间；为空表示正常内容，有值表示已删除 |

标签不直接存储在 `posts` 中，而是通过 `post_tags` 中间表建立内容与 `tags` 的多对多关系。

## 3. 日记与 Blog 的字段差异

发布入口位于 `frontend/src/components/blog/diary-submit.tsx`。组件使用 `mode` 状态在 `diary` 和 `blog` 两种模式之间切换。

### 日记模式

前端生成的数据大致如下：

```json
{
  "slug": "diary-2026-07-31-时间戳",
  "title": "2026-07-31 日记",
  "content": "日记正文",
  "content_format": "plain",
  "description": "正文前 120 个字符",
  "emoji": "心情符号",
  "diary_date": "2026-07-31",
  "is_published": true
}
```

日记的关键特征是 `diary_date` 不为空。`slug` 由模式、日期和 `Date.now()` 时间戳拼接，以降低重复概率。

### Blog 模式

前端生成的数据大致如下：

```json
{
  "slug": "blog-2026-07-31-时间戳",
  "title": "用户输入的标题",
  "content": "Blog 正文",
  "content_format": "markdown",
  "source_filename": "article.mdx",
  "description": "正文前 120 个字符",
  "emoji": "",
  "is_published": true
}
```

Blog 不发送 `diary_date`，Pydantic 和 SQLAlchemy 最终将其保存为 `NULL`。Blog 标题始终由用户手动填写；正文可以直接输入，也可以上传 `.md` 或 `.mdx` 文件。上传后文件文本会载入原有正文输入框，允许继续编辑，最终仍以文本形式写入 `posts.content`，原文件名写入 `source_filename`。

## 4. 发布和写入流程

完整链路如下：

```text
DiarySubmit 发布表单
  -> React Query useMutation
  -> createPost(body)
  -> POST /api/posts
  -> Authorization: Bearer <Supabase Access Token>
  -> FastAPI get_current_user
  -> Pydantic PostCreate 校验
  -> SQLAlchemy 创建 Post
  -> Supabase PostgreSQL posts 表
  -> 提交事务并返回 PostOut
  -> React Query 刷新 posts 查询缓存
```

### 4.1 前端组装请求

`DiarySubmit` 根据发布模式组装 `CreatePostBody`，然后调用 `frontend/src/lib/api/posts.ts` 中的 `createPost()`。

`createPost()` 使用公共 API 客户端向 `/api/posts` 发送 JSON。`frontend/src/lib/api/client.ts` 会从当前 Supabase Session 取得 Access Token，并写入：

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

### 4.2 后端身份认证

`POST /api/posts` 使用 `Depends(get_current_user)` 保护。

`backend/app/auth/dependencies.py` 中的认证流程为：

1. 从 Bearer 请求头读取 Access Token。
2. 调用 Supabase Auth `/auth/v1/user` 验证 Token。
3. 使用 Supabase 返回的用户 UUID 查询 `profiles` 表。
4. 如果 Profile 不存在，则按认证用户信息创建 Profile。
5. 将查询到的用户作为当前作者传给路由。

前端发布按钮只对 `NEXT_PUBLIC_ADMIN_EMAIL` 对应的登录用户启用；后端创建接口当前要求“已认证用户”，创建记录时会把 `current_user.id` 写入 `author_id`。

### 4.3 Pydantic 数据校验

请求体由 `backend/app/schemas.py` 中的 `PostCreate` 校验，主要规则包括：

- `slug` 必须是 1 到 160 个字符，只允许小写字母、数字和连字符。
- `content` 至少包含 1 个字符。
- `content` 最多包含 1,048,576 个字符，前端同时把上传文件限制为 1 MB。
- `content_format` 只能是 `plain` 或 `markdown`。
- `source_filename` 最长 255 个字符，可以为空。
- `diary_date` 必须是有效日期或为空。
- `reading_time` 不能小于 0。
- `tag_ids` 必须是 UUID 数组。

### 4.4 SQLAlchemy 持久化

`backend/app/routes/posts.py` 中的 `create_post()` 执行以下操作：

1. 查询 `slug` 是否已经存在，重复时返回 HTTP 409。
2. 创建 `Post` ORM 对象并设置 `author_id`。
3. 调用 `flush()`，取得新内容的 UUID。
4. 如果请求带有 `tag_ids`，逐条创建 `PostTag` 关联记录。
5. 调用 `commit()` 一次性提交事务。
6. 刷新 ORM 对象，加载标签并返回 `PostOut`。

数据库会话由 `backend/app/database.py` 提供。它使用 SQLAlchemy 异步引擎连接 Supabase PostgreSQL；发生异常时会执行 `rollback()`。

## 5. 查询和展示方式

### 5.1 通用查询 API

`GET /api/posts` 同时查询日记和 Blog，支持以下参数：

| 参数 | 用途 |
| --- | --- |
| `diary_date` | 按日记日期精确筛选 |
| `content_type` | 按内容类型筛选：`blog` 查询 `diary_date IS NULL`，`diary` 查询 `diary_date IS NOT NULL` |
| `is_published` | 按发布状态筛选 |
| `q` | 在标题、摘要和正文中搜索 |
| `tag` | 按标签 slug 筛选 |
| `limit` / `offset` | 分页 |

Blog 默认按 `created_at` 倒序排列；日记按 `diary_date` 倒序排列，同一天的多篇日记再按 `created_at` 倒序排列。所有公开查询都会排除 `deleted_at` 不为空的记录。API 还会查询 `post_tags` 和 `tags`，把标签数组附加到每条 `PostOut` 中。

### 5.2 日记展示

日记时间线组件位于 `frontend/src/components/blog/diary-feed.tsx`：

1. 默认选中“全部”，使用 React Query 请求所有 `content_type=diary` 且已发布的记录。
2. 点击最近 7 天中的具体日期后，将日期转换为本地格式 `YYYY-MM-DD`，并追加 `diary_date` 参数进行精确筛选。
3. 使用 `diary_date` 展示用户发布时选择的日期，格式为 `YYYY年M月D日`，同时展示 `emoji`、正文和标签。

`frontend/src/app/diary/page.tsx` 将 `DiaryFeed` 挂载到 `/diary` 页面，顶部导航提供“日记”入口。“全部”与具体日期都会进入 React Query 查询键；全部模式使用 `limit` 和 `offset` 分页取完所有日记，切换日期时则触发对应日期的新请求。

### 5.3 Blog 列表与详情

`frontend/src/components/blog/post-list.tsx` 使用 `content_type=blog` 获取最多 10 条已发布 Blog，并支持关键词搜索。后端通过 `diary_date IS NULL` 排除日记。列表使用 `PostCard` 展示标题、摘要、创建日期、阅读时间、浏览量和标签。

详情页路径为 `/blog/[slug]`。Next.js Server Component 调用 `GET /api/posts/{slug}` 获取内容；后端每次成功读取详情后会将 `view_count` 加 1 并提交事务。`content_format=plain` 的旧内容继续以纯文本展示并保留换行，`content_format=markdown` 的 Blog 使用 `react-markdown` 和 `remark-gfm` 渲染。

`.mdx` 文件只作为 Markdown 文本处理，不经过 MDX 编译器，因此文件中的 JSX、`import` 和 JavaScript 不会执行。渲染器启用 `skipHtml`，不解析正文中的原始 HTML。当前只保存源文本和原文件名，不上传 Markdown 引用的本地图片或其他二进制资源；后续此类资源可独立存入 Supabase Storage。

## 6. 更新、删除与数据库权限

后端还提供：

- `PATCH /api/posts/{post_id}`：部分更新内容。
- `PUT /api/posts/{post_id}`：当前复用部分更新逻辑。
- `DELETE /api/posts/{post_id}`：将 `deleted_at` 设置为当前 UTC 时间，执行软删除。

更新和删除要求当前用户是内容作者，或者其邮箱与后端配置的 `ADMIN_EMAIL` 一致。

日记页面仅向管理员显示删除按钮。点击按钮后使用 shadcn/ui 确认弹窗再次确认；删除成功后刷新日记查询缓存。软删除不会移除 `posts`、标签关联或评论数据，但列表、详情、更新和再次删除均不会再匹配该记录。

Supabase SQL 初始化脚本还为 `posts` 和 `post_tags` 启用了 Row Level Security：

- 已发布内容可以公开读取。
- 内容所有者或管理员可以读取未发布内容。
- 新记录的 `author_id` 必须是当前认证用户，或当前用户是管理员。
- 只有内容所有者或管理员可以更新、删除内容和维护标签关联。

后端使用的 PostgreSQL 连接是否受这些 RLS 策略约束，取决于 `DATABASE_URL` 所使用的数据库角色；应用层仍通过 FastAPI 认证依赖和作者检查控制写操作。

## 7. 当前实现总结

- 日记与 Blog 共用 `posts` 表和 `/api/posts` API。
- `diary_date` 是当前区分日记与 Blog 的核心字段。
- 日记额外使用 `emoji` 和日期标题，Blog 使用用户输入标题。
- 日记以 `plain` 格式保存；Blog 默认以 `markdown` 格式保存并支持上传 `.md/.mdx` 源文件。
- 登录由 Supabase Auth 管理，发布请求携带 Supabase Access Token。
- FastAPI 负责认证、Pydantic 校验和业务流程。
- SQLAlchemy 异步会话负责向 Supabase PostgreSQL 写入并管理事务。
- React Query 负责前端请求状态和发布成功后的缓存刷新。
- `/blog` 通过 `content_type=blog` 只展示 Blog，`/diary` 按选中日期展示日记。
- 日记按日记日期倒序展示，管理员可通过确认弹窗软删除日记。
