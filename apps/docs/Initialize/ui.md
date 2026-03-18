# UI 组件库应用

## UI 应用初始化
1. 创建目录
```bash
mkdir packages/ui
cd packages/ui
```

2. 基于 Vite 初始化 UI 库
```bash
pnpm create vite

│
◇  Project name:
│  ui
│
◇  Select a framework:
│  Vue
│
◇  Select a variant:
│  TypeScript
│
◇  Install with pnpm and start now?
│  No
│
◇  Scaffolding project in xxx/packages/ui
│
└  Done. Now run:

  cd ui
  pnpm install
  pnpm dev
```
1. 配置 Vite 构建
```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"),
			name: "@browserclaw/ui",
			fileName: "@browserclaw/ui",
		},
	},
});

```

## 初始化项目目录
```
packages/core
├── src
│   ├── assets
│   ├── components
│   ├── style.css
│   └── index.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```


