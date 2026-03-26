import { Router } from 'express';
import { getConfigPath } from '@zrocclaw/core/fileManager';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const router = Router();

router.get('/', (req, res) => {
  res.json({ configPath: getConfigPath()});
});

const configDir = getConfigPath();
const configFilePath = path.join(configDir, 'model.json');

// 辅助方法：读取和写入配置文件
async function readModelConfig() {
  try {
    await fs.access(configFilePath);
    const data = await fs.readFile(configFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeModelConfig(config: any) {
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8');
}

// 4. 查询接口 get
router.get('/model', async (req, res) => {
  try {
    const config = await readModelConfig();
    if (Object.keys(config).length === 0) {
      await writeModelConfig({});
      return res.json({});
    }
    res.json(config);
  } catch (error) {
    console.error('获取模型失败:', error);
    res.status(500).json({ error: '获取模型失败' });
  }
});

// 1. 新增接口 post
router.post('/model', async (req, res) => {
  try {
    const { modelName, provider, apiKey, baseURL } = req.body;
    const newModel = {
      id: crypto.randomUUID(),
      modelName,
      provider,
      apiKey,
      baseURL
    };

    const config = await readModelConfig();
    
    if (!Array.isArray(config.models)) {
      config.models = [];
    }
    
    // unshift到models字段下第一条
    config.models.unshift(newModel);

    // 如果defaultModel的值为空，自动配置到defaultModel
    if (!config.defaultModel) {
      config.defaultModel = newModel; // 存完整对象
    }

    await writeModelConfig(config);
    
    // 返回带ID的完整数据
    res.json(newModel);
  } catch (error) {
    console.error('新增模型失败:', error);
    res.status(500).json({ error: '新增模型失败' });
  }
});

// 2. 编辑接口 post
router.post('/model/edit', async (req, res) => {
  try {
    const modelData = req.body;
    if (!modelData || !modelData.id) {
      return res.status(400).json({ error: '缺少模型ID' });
    }

    const config = await readModelConfig();
    if (!Array.isArray(config.models)) {
      config.models = [];
    }

    const index = config.models.findIndex((m: any) => m.id === modelData.id);
    if (index === -1) {
      return res.status(404).json({ error: '模型不存在' });
    }

    // 替换模型数据
    config.models[index] = { ...config.models[index], ...modelData };

    // 如果编辑的是默认模型，同步更新
    if (config.defaultModel && config.defaultModel.id === modelData.id) {
      config.defaultModel = config.models[index];
    }

    await writeModelConfig(config);
    res.json(config.models[index]);
  } catch (error) {
    console.error('编辑模型失败:', error);
    res.status(500).json({ error: '编辑模型失败' });
  }
});

// 3. 删除接口 post
router.post('/model/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: '缺少模型ID' });
    }

    const config = await readModelConfig();
    if (!Array.isArray(config.models)) {
      config.models = [];
    }

    const initialLength = config.models.length;
    config.models = config.models.filter((m: any) => m.id !== id);

    if (config.models.length === initialLength) {
      return res.status(404).json({ error: '模型不存在' });
    }

    // 如果删除的是默认模型，清除或更新defaultModel
    if (config.defaultModel && config.defaultModel.id === id) {
      config.defaultModel = config.models.length > 0 ? config.models[0] : null;
    }

    await writeModelConfig(config);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除模型失败:', error);
    res.status(500).json({ error: '删除模型失败' });
  }
});

// 5. 设置defaultmodel接口 post
router.post('/model/default', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: '缺少模型ID' });
    }

    const config = await readModelConfig();
    if (!Array.isArray(config.models)) {
      config.models = [];
    }

    const model = config.models.find((m: any) => m.id === id);
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    config.defaultModel = model; // 写入defaultModel完整对象
    await writeModelConfig(config);
    
    res.json({ success: true, defaultModel: config.defaultModel });
  } catch (error) {
    console.error('设置默认模型失败:', error);
    res.status(500).json({ error: '设置默认模型失败' });
  }
});

export default router;