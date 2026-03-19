# UI 组件库应用

## UI 应用初始化
1. 基于 Vite 初始化 UI 库
```bash
cd apps
pnpm create vite
│
◇  Project name:
│  web
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
◇  Scaffolding project in xxx/apps/web...
│
└  Done. Now run:

  cd web
  pnpm install
  pnpm dev
```

## 依赖库
- Vue 3
- TypeScript
- Vite
- tailwindcss
- vue-router
- @browserclaw/ui
- daisyui

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


