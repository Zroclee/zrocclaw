# 核心库开发

## 初始化

1. 基于 Vite 初始化核心库
```bash
cd packages
pnpm create vite

│
◇  Project name:
│  core
│
◇  Select a framework:
│  vanilla
│
◇  Select a variant:
│  TypeScript
│
◇  Install with pnpm and start now?
│  No
│
◇  Scaffolding project in xxx/packages/core
│
└  Done. Now run:

  cd core
  pnpm install
  pnpm dev
```
2. 配置 Vite 构建
```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"),
			name: "@browserclaw/core",
			fileName: "@browserclaw/core",  
		},
	},
});

```

## 初始化项目目录
```
packages/core
├── src
│   ├── xxxxx
│   └── index.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```


## 智能体开发

```bash
pnpm add langchain @langchain/core @langchain/openai zod
pnpm add -D @types/node
```


## 浏览器自动化

```bash
pnpm add playwright
```

## 渠道接入

