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
      const serverPath = path.join(__dirname, "gateway/server.js");
      if (!fs.existsSync(serverPath)) {
         console.error("❌ 启动失败：找不到 gateway 启动文件", serverPath);
         return;
      }
      
      const outLog = fs.openSync(path.join(os.homedir(), ".zrocclaw.out.log"), "a");
      const errLog = fs.openSync(path.join(os.homedir(), ".zrocclaw.err.log"), "a");

      const child = spawn("node", [serverPath], {
        detached: true,
        stdio: ["ignore", outLog, errLog],
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