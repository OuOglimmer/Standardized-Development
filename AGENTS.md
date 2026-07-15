# Agent 工作指令

## 项目概述
Next.js 16 + FastAPI + Supabase 全栈博客项目。
你负责协助我完成编码、调试和项目配置。

## 工作模式
我发指令，你生成代码。
遇到不确定的问题必须先提问，不要自行猜测。
每个任务完成后列出下一步建议。

## 项目结构
frontend/ 是 Next.js 前端。
backend/ 是 FastAPI 后端。
数据库用 Supabase PostgreSQL。

## 代码规范
TypeScript 严格模式，禁止使用 any。
前端组件必须用 shadcn/ui，不自己造轮子。
后端用 SQLAlchemy 操作数据库，不用原生 SQL。
所有 API 必须用 Pydantic 做数据校验。
所有敏感信息走环境变量，不硬编码。
所有异步操作必须正确处理错误。

## 前端规范
使用 App Router，页面组件放在 app/ 下。
业务组件放在 components/ 下。
API 调用放在 lib/api/ 下。
数据请求用 @tanstack/react-query。
页面数据获取优先使用 Server Component。
客户端交互组件必须加 "use client"。

## 后端规范
路由定义在 app/routes/ 下。
模型定义在 app/models.py。
Schema 定义在 app/schemas.py。
认证依赖注入在 app/auth/dependencies.py。
所有路由必须标注 tags 以便 Swagger 分组。

## 认证规则
JWT Token 有效期 30 分钟。
受保护路由统一用 Depends(get_current_user)。
密码统一用 bcrypt 哈希。
Token 从 Authorization: Bearer 头解析。

## 回答格式
给出可直接运行的代码。
说明文件路径和创建/修改操作。
列出关键点解释。
最终给出验证步骤。
不解释基础概念。
不输出冗长的说明文档。

## 禁止行为
不生成测试数据。
不生成 README。
不生成 docker-compose。
不做代码评审。
不主动优化性能。
不写单元测试。
不生成 Swagger 以外的文档。
不处理部署配置。