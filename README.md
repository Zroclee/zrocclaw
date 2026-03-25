# ZrocClaw

你的专属浏览器AI助手，具备自我学习生成技能的能力。

## 项目目的

本项目旨在打造一个属于你个人的浏览器 AI 助手，**模拟 OpenClaw 的核心能力**，为您提供一个可定制、可扩展、拥有本地化特征的私人智能终端。不仅支持日常对话问答，还能利用核心能力包（如 LangChain / Playwright）实现自我学习和生成技能。

## 项目架构

本项目采用 **pnpm + Turborepo** 驱动的 Monorepo 架构，以确保模块的解耦、复用和高效构建。主要目录职责如下：

### Apps (应用层)
- **`apps/cli`**: 命令行工具，提供便捷的终端命令以控制整个后台网关的启停和更新。
- **`apps/gateway`**: 网关服务，负责核心业务逻辑的处理、API 转发与健康检查等功能。
- **`apps/web`**: Web 前端客户端，为您提供一个直观、现代化的聊天交互界面。
- **`apps/docs`**: 官方文档站，提供项目的详细说明和开发指南。

### Packages (依赖包层)
- **`packages/core`**: 核心能力包，计划承载大模型交互（LangChain）、浏览器自动化（Playwright）等底层原子能力。
- **`packages/ui`**: 跨应用复用的公共 UI 组件库。

## 技术选型

- **包管理与构建**: pnpm, Turborepo, Vite, tsup
- **前端技术栈**: Vue 3 (组合式 API), TypeScript, TailwindCSS, daisyui
- **后端技术栈**: Node.js, Express, TypeScript
- **CLI与进程管理**: Commander.js, PM2
- **文档站点**: VitePress
