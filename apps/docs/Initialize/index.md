# 初始化项目

## github 仓库
[ZrocClaw仓库地址] https://github.com/Zroclee/zrocclaw

## Monorepo 初始化
1. 克隆项目
```bash
git clone https://github.com/Zroclee/zrocclaw.git
cd zrocclaw
```
2. pnpm 初始化
```bash
pnpm init
mkdir apps packages
echo "packages:
  - apps/*
  - packages/*" > pnpm-workspace.yaml
```
3. turbo 初始化
```bash
pnpm install turbo --global
pnpm add turbo --save-dev --workspace-root
```
4. 创建turbo.json并写入以下内容 （⚠️： 这里的任务依赖和输出物是根据Vite的默认配置来的，实际项目中可能需要根据具体情况调整。）（⚠️：如要复制JSON，要删掉注释）
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // 任务依赖：表示该任务的执行依赖于工作区内所有依赖包的`build`任务先完成。
      "dependsOn": ["^build"],
      // 输出物：定义哪些文件或目录的变化会影响缓存。这里参考Vite默认输出目录。
      "outputs": ["dist/**", ".vite/**"]
    },
    "dev": {
      // 开发服务器不需要缓存
      "cache": false
    },
    "lint": {
      // 代码检查任务的输出通常是控制台日志，可以缓存
      "outputs": []
    },
    "test": {
      // 测试任务可能依赖构建产物
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

## 应用初始化

1. gateway 应用初始化
初始化过程请查看[gateway.md](gateway.md)
2. core 应用初始化
初始化过程请查看[core.md](core.md)
3. docs 应用初始化
初始化过程请查看[docs.md](docs.md)
4. ui 组件库应用初始化
初始化过程请查看[ui.md](ui.md)


## 项目结构

```
zrocclaw/
├── apps
│   ├── docs
│   ├── gateway
│   └── web
├── packages
│   ├── core
│   └── ui
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── turbo.json
```

项目说明
- `apps` 目录：存放应用代码，每个应用都是一个独立的项目。
- `packages` 目录：存放共享代码，这些代码可以被多个应用使用。
其中
- `apps/gateway`：网关项目，负责实现网关的功能。基于 Express + Typescript 实现。
- `apps/web`：Web 项目，负责实现 Web 端的功能。基于 Vue + Typescript + Vite 实现。
- `apps/docs`：文档项目，负责实现文档的功能。基于 VitePress 实现。
- `packages/core`：网关的核心代码，负责处理网关的业务逻辑 。基于 Typescript + LangChain + Playwright 实现。
- `packages/ui`：网关的 UI 代码，负责实现网关的用户界面。基于 Vue + Typescript + Vite 实现。


## 参考

- [turbo 文档](https://turbo.build/docs/getting-started)
- [vitepress 文档](https://vitepress.dev/guide/getting-started)
- [vite 文档](https://vitejs.cn/vite3-cn/guide/)
