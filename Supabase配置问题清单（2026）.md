# Supabase 配置与认证问题清单（2026）

## 当前结论

本轮已完成 Supabase Auth 接入改造：

- 前端登录、注册改为使用 Supabase Client。
- FastAPI 不再自行签发 JWT。
- FastAPI 受保护路由改为校验 Supabase Access Token。
- 后端配置已补充 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。
- 数据库脚本已改为 `profiles` 关联 `auth.users.id`。
- `posts.author_id`、`comments.user_id` 已改为关联 `profiles.id`。
- `supabase/init.sql` 已补充 RLS 开启语句和基础 Policy。
- 已新增 `backend/.env.example` 和 `frontend/.env.example`。

按你的当前要求，`password_hash` 暂时保留在 `profiles` 表中，只保存 bcrypt 哈希，不作为登录认证依据。登录认证以 Supabase Auth 为准。

## 已解决项

### 1. 后端 Supabase 配置字段

文件：`backend/app/config.py`

已补充：

```python
supabase_url: str = Field(default="", validation_alias=AliasChoices("SUPABASE_URL"))
supabase_anon_key: str = Field(default="", validation_alias=AliasChoices("SUPABASE_ANON_KEY"))
```

结果：

- `backend/.env` 中的 `SUPABASE_URL` 可映射到 `settings.supabase_url`。
- `backend/.env` 中的 `SUPABASE_ANON_KEY` 可映射到 `settings.supabase_anon_key`。

### 2. 后端停止自建 JWT 登录认证

相关文件：

- `backend/app/routes/auth.py`
- `backend/app/auth/dependencies.py`
- `backend/app/auth/supabase.py`

当前行为：

- `/api/auth/register` 调用 Supabase Auth 注册。
- `/api/auth/login` 调用 Supabase Auth 登录。
- 返回给前端的 `access_token` 和 `refresh_token` 来自 Supabase。
- `get_current_user()` 使用 Supabase `/auth/v1/user` 校验 Bearer Token。
- 路由和依赖中不再调用 `create_access_token()` 或 `verify_token()`。

### 3. 前端使用 Supabase Client 管理 Session

相关文件：

- `frontend/src/lib/api/supabase-auth.ts`
- `frontend/src/components/auth/auth-provider.tsx`
- `frontend/package.json`
- `frontend/pnpm-lock.yaml`

当前行为：

- 使用 `@supabase/supabase-js`。
- `supabase.auth.signInWithPassword()` 负责登录。
- `supabase.auth.signUp()` 负责注册。
- `supabase.auth.getSession()` 恢复登录状态。
- `supabase.auth.onAuthStateChange()` 监听 Session 变化。
- API 请求使用当前 Supabase Session 的 Access Token。

### 4. 后端本地用户资料同步

新增接口：

```http
POST /api/auth/session
Authorization: Bearer <supabase-access-token>
```

用途：

- 前端使用 Supabase 登录或注册成功后，同步本地 `profiles` 资料。
- Token 有效但本地资料不存在时，后端会自动创建资料记录。
- 如果请求体包含 `password`，后端临时保存 bcrypt 哈希到 `profiles.password_hash`。

### 5. 数据库结构改为 Supabase 用户体系

相关文件：

- `backend/app/models.py`
- `supabase/init.sql`

当前目标表：

```sql
profiles.id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
posts.author_id UUID REFERENCES profiles(id) ON DELETE CASCADE
comments.user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
```

说明：

- 代码中仍保留 SQLAlchemy 类名 `User`，但对应表名已改为 `profiles`。
- 这样可以减少业务代码改动，同时让数据库结构对齐 Supabase Auth。

### 6. RLS Policy 已写入初始化脚本

文件：`supabase/init.sql`

已启用 RLS：

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
```

已补充基础策略：

- 匿名用户可读已发布文章。
- 匿名用户可读标签和项目。
- 登录用户只能创建自己的文章和评论。
- 作者可修改或删除自己的文章。
- 管理员可管理文章、标签、项目和资料。
- 管理员判断使用 `profiles.role = 'admin'`。

### 7. 环境变量模板已补充

新增文件：

- `backend/.env.example`
- `frontend/.env.example`
- `supabase/migrations/202607300001_initial_schema_and_rls.sql`

`.gitignore` 已允许 `.env.example` 被提交，真实 `.env` 仍保持忽略。

## 当前保留的过渡项

### 1. `profiles.password_hash` 暂时保留

原因：你明确要求“密码暂时保存在数据库”。

当前处理方式：

- 不保存明文密码。
- 只保存 bcrypt 哈希。
- 登录认证不使用该字段。
- Supabase Auth 是唯一登录认证来源。

后续如果完全切到 Supabase Auth，应删除：

- `profiles.password_hash`
- `backend/app/auth/password.py`
- `/api/auth/session` 中保存密码哈希的逻辑

### 2. FastAPI 仍通过 SQLAlchemy 访问数据库

当前后端仍使用 SQLAlchemy 直接连接 Supabase PostgreSQL。

注意：

- RLS 对前端直连 Supabase Data API 天然生效。
- SQLAlchemy 如果使用高权限数据库连接，不应假设 RLS 自动保护所有后端查询。
- 后续如果要让所有业务查询都严格走 RLS，需要把数据访问改为 Supabase Data API，或显式设计数据库连接角色和 JWT Claims 传递。

## 仍需人工在 Supabase 控制台确认

- [ ] Email 登录已开启。
- [ ] Site URL 已配置本地和生产地址。
- [ ] Redirect URLs 已配置。
- [ ] 邮箱验证策略已确认。
- [ ] `supabase/init.sql` 已在 Supabase SQL Editor 执行。
- [ ] 已创建至少一个管理员用户，并将对应 `profiles.role` 设为 `admin`。
- [ ] 匿名、普通用户、作者、管理员四种身份已实际验证 RLS 行为。

## 完成状态

- [x] `backend/app/config.py` 声明 Supabase 配置字段。
- [x] 前端使用 Supabase Auth Client 管理 Session。
- [x] FastAPI 不再自行签发 JWT。
- [x] `profiles.id` 关联 `auth.users.id`。
- [x] 业务表外键改为关联 `profiles.id`。
- [x] 所有业务表启用 RLS。
- [x] 主要业务表存在明确的 `SELECT`、`INSERT`、`UPDATE`、`DELETE` Policy。
- [x] 管理员权限由 `profiles.role` 和 RLS 判断。
- [x] `SUPABASE_SERVICE_ROLE_KEY` 不出现在前端配置。
- [x] 提供 `backend/.env.example` 和 `frontend/.env.example`。
- [ ] `profiles.password_hash` 删除。
- [x] 使用 Supabase CLI 迁移脚本维护数据库结构。
- [ ] 完成真实 Supabase 环境 RLS 验证。

## 验证记录

已执行：

```powershell
cd C:\project\personal-blog\backend
.\.venv\Scripts\python.exe -m pytest
```

结果：

```text
4 passed
```

已执行：

```powershell
cd C:\project\personal-blog\frontend
npm run build
```

结果：

```text
Compiled successfully
```
