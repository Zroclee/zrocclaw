#!/usr/bin/env node
const { Command } = require("commander");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const pm2 = require("pm2");

const program = new Command();
const packageJson = require("../package.json");

program
  .name("zrocclaw")
  .description(packageJson.description)
  .version(packageJson.version);

const PM2_APP_NAME = "zrocclaw-gateway";

program
  .command("start")
  .description("启动 ZrocClaw 后台服务")
  .action(() => {
    pm2.connect((err) => {
      if (err) {
        console.error("❌ PM2 连接失败:", err);
        process.exit(2);
      }

      pm2.describe(PM2_APP_NAME, (err, processDescriptionList) => {
        if (err) {
          console.error("❌ 获取进程状态失败:", err);
          pm2.disconnect();
          return;
        }

        const isRunning = processDescriptionList && processDescriptionList.some(p => p.pm2_env.status === "online");
        if (isRunning) {
          console.log("⚠️ ZrocClaw 服务已在运行");
          pm2.disconnect();
          return;
        }

        const serverPath = path.join(__dirname, "../server/server.js");

        if (!serverPath || !fs.existsSync(serverPath)) {
          console.error("❌ 启动失败：找不到 gateway 启动文件。请确认它已正确安装和编译。");
          pm2.disconnect();
          return;
        }

        const logDir = path.join(os.homedir(), ".zrocclaw", "log");
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        const outLogPath = path.join(logDir, "pm2out.log");
        const errLogPath = path.join(logDir, "pm2err.log");

        pm2.start({
          name: PM2_APP_NAME,
          script: serverPath,
          env: {
            NODE_ENV: "production",
          },
          output: outLogPath,
          error: errLogPath,
          merge_logs: true
        }, (err, apps) => {
          pm2.disconnect();
          if (err) {
            console.error("❌ 启动失败:", err);
            return;
          }
          console.log(`✅ ZrocClaw 服务已通过 PM2 在后台启动 (进程名: ${PM2_APP_NAME})`);
          console.log(`🌍 请在浏览器访问体验，默认端口请参考网关配置。`);
        });
      });
    });
  });

program
  .command("stop")
  .description("停止 ZrocClaw 服务")
  .action(() => {
    pm2.connect((err) => {
      if (err) {
        console.error("❌ PM2 连接失败:", err);
        process.exit(2);
      }

      pm2.describe(PM2_APP_NAME, (err, processDescriptionList) => {
        if (err || !processDescriptionList || processDescriptionList.length === 0) {
          console.log("❌ 未找到运行中的 ZrocClaw 服务记录");
          pm2.disconnect();
          return;
        }

        pm2.stop(PM2_APP_NAME, (err) => {
          if (err) {
            console.error("❌ 停止服务失败:", err);
            pm2.disconnect();
          } else {
            console.log(`✅ ZrocClaw 服务 (进程名: ${PM2_APP_NAME}) 已停止`);
            pm2.delete(PM2_APP_NAME, () => {
              pm2.disconnect();
            });
          }
        });
      });
    });
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