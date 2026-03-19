import { Router } from 'express';
import { getConfigPath } from '@browserclaw/core/fileManager';
import { PlaywrightManager } from '@browserclaw/core/playwright';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.json({ configPath: getConfigPath()});
});


const configDir = getConfigPath();
const configFilePath = path.join(configDir, 'model.json');

// 新增：获取模型信息
router.get('/model', async (req, res) => {
  try {

    try {
      await fs.access(configFilePath);
      const data = await fs.readFile(configFilePath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // 文件不存在，创建并返回 {}
        await fs.mkdir(configDir, { recursive: true });
        await fs.writeFile(configFilePath, '{}', 'utf-8');
        res.json({});
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('获取模型失败:', error);
    res.status(500).json({ error: '获取模型失败' });
  }
});

// 新增：修改模型信息
router.post('/model', async (req, res) => {
  try {
    // 确保目录存在
    await fs.mkdir(configDir, { recursive: true });

    // 读取现有配置
    let currentConfig = {};
    try {
      const data = await fs.readFile(configFilePath, 'utf-8');
      currentConfig = JSON.parse(data);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // 合并并写入新配置
    const newConfig = { ...currentConfig, ...req.body };
    await fs.writeFile(configFilePath, JSON.stringify(newConfig, null, 2), 'utf-8');
    res.json(newConfig);
  } catch (error) {
    console.error('修改模型失败:', error);
    res.status(500).json({ error: '修改模型失败' });
  }
});

router.get('/playwright', async (req, res) => {
  const page = await PlaywrightManager.getInstance().getPage();
  res.json({ playwrightPath: "启动playwright成功" });
});

export default router;