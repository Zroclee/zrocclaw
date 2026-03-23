# 初始化命令行工具

## 初始化

1. 初始化package.json

```json
{
  "name": "zrocclaw",
  "version": "1.0.0",
  "description": "个人专属浏览器AI助手命令行工具",
  "bin": {
    "zrocclaw": "bin/zrocclaw.js"
  },
  "files": [
    "dist",
    "bin"
  ],
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc"
  },
  "dependencies": {
    "@zrocclaw/gateway": "workspace:*",
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "@types/node": "^24.12.0",
    "typescript": "^5.9.3"
  }
}
```

2. 初始化tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

3. 初始化bin/zrocclaw.js
```js
#!/usr/bin/env node
require('../dist/index.js');
```
4. 初始化核心逻辑/src/index.ts
```ts
import { Command } from "commander";
import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const program = new Command();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../package.json");
const PID_FILE = path.join(os.homedir(), ".zrocclaw.pid");

program
  .name("zrocclaw")
  .description(packageJson.description)
  .version(packageJson.version);

program
  .command("start")
  .description("启动 ZrocClaw 后台服务")
  .action(() => {
    if (fs.existsSync(PID_FILE)) {
      console.log(`⚠️ ZrocClaw 服务已在运行 (PID: ${fs.readFileSync(PID_FILE, "utf-8").trim()})`);
      return;
    }

    try {
      // 动态解析 @zrocclaw/gateway 包的入口路径
      const serverPath = require.resolve("@zrocclaw/gateway/dist/server.js");

      const child = spawn("node", [serverPath], {
        detached: true,
        stdio: "ignore",
        env: { ...process.env, NODE_ENV: "production" }
      });

      if (child.pid) {
        fs.writeFileSync(PID_FILE, child.pid.toString());
        console.log(`✅ ZrocClaw 服务已在后台启动 (PID: ${child.pid})`);
        console.log(`🌍 请在浏览器访问体验，默认端口请参考网关配置。`);
      }
      child.unref();
    } catch (e) {
      console.error("❌ 启动失败：找不到 @zrocclaw/gateway 模块，请确认它已正确安装和编译。");
    }
  });

program
  .command("stop")
  .description("停止 ZrocClaw 服务")
  .action(() => {
    if (!fs.existsSync(PID_FILE)) {
      console.log("❌ 未找到运行中的 ZrocClaw 服务记录");
      return;
    }
    const pid = parseInt(fs.readFileSync(PID_FILE, "utf-8").trim(), 10);
    try {
      process.kill(pid);
      console.log(`✅ ZrocClaw 服务 (PID: ${pid}) 已停止`);
    } catch (e: any) {
      console.log(`⚠️ 进程 ${pid} 不存在，可能已被关闭。`);
    } finally {
      fs.unlinkSync(PID_FILE);
    }
  });

program
  .command("update")
  .description("全局更新 ZrocClaw 到最新版本")
  .action(() => {
    console.log("⏳ 正在检查并更新 ZrocClaw...");
    try {
      execSync("npm install -g zrocclaw@latest", { stdio: "inherit" });
      console.log("✅ 更新完成！");
    } catch (e) {
      console.error("❌ 更新失败，请检查网络或权限");
    }
  });

program.parse(process.argv);
```

## 安装依赖和发布

1. 返回根目录，安装依赖

```bash
pnpm install
```

2. 编译项目

```bash
pnpm build
```
3. 进去 cli 目录做本地全局软链测试

```bash
cd apps/cli
npm link
# 验证命令
zrocclaw --help
```

4. 发布到npm

```bash
npm publish --access public

```

## 发布问题记录
NPM 官方在最近加强了发布包的安全策略。当您的 NPM 账户启用了 双重身份验证 (2FA - Two-Factor Authentication) ，并且配置为“不仅登录时需要，发布包时也需要（ auth-and-writes ）”时，单纯的 npm publish 命令会被拒绝，因为 NPM 服务器需要您提供实时的动态验证码。

如果您希望在 CI/CD 或终端直接发布而不想每次输验证码，可以去 NPM 官网生成一个绕过 2FA 的临时 Token：

1. 登录 npmjs.com 。
2. 点击右上角头像 -> Access Tokens 。
3. 点击 Generate New Token -> 选择 Granular Access Token 。
4. 勾选相关的发布权限，并确保勾选允许 Bypass 2FA （如果有该选项）。
5. 生成 Token 后，在本地终端设置环境变量：
```bash
export NPM_TOKEN=您的生成的Token
```

## 安装使用
1. 全局安装
```bash
# 之前通过npm link的需要先删除
npm uninstall -g zrocclaw
npm install -g zrocclaw
```
2. 验证安装
```bash
zrocclaw --help
```
