import { Router } from 'express';
import { getConfigPath, getWorkspacePath, getSkillsPath, modelManager, skillsManager } from '@zrocclaw/core/fileManager';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { BusinessError } from '../middlewares/errorHandler';

const router = Router();

router.get('/', (req, res) => {
  res.success({ configPath: getConfigPath() });
});

// 4. 查询接口 get
router.get('/model', async (req, res, next) => {
  try {
    const config = await modelManager.getModels();
    res.success(config);
  } catch (error) {
    next(error);
  }
});

// 1. 新增接口 post
router.post('/model', async (req, res, next) => {
  try {
    const { modelName, provider, apiKey, baseURL } = req.body;
    
    const newModel = await modelManager.addModel({
      modelName,
      provider,
      apiKey,
      baseURL
    });
    
    // 返回带ID的完整数据
    res.success(newModel);
  } catch (error) {
    next(error);
  }
});

// 2. 编辑接口 post
router.post('/model/edit', async (req, res, next) => {
  try {
    const modelData = req.body;
    if (!modelData || !modelData.id) {
      throw new BusinessError(400, '缺少模型ID');
    }

    const { id, ...updates } = modelData;
    const updatedModel = await modelManager.updateModel(id, updates);
    
    if (!updatedModel) {
      throw new BusinessError(404, '模型不存在');
    }

    res.success(updatedModel);
  } catch (error) {
    next(error);
  }
});

// 3. 删除接口 post
router.post('/model/delete', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      throw new BusinessError(400, '缺少模型ID');
    }

    const success = await modelManager.deleteModel(id);
    
    if (!success) {
      throw new BusinessError(404, '模型不存在');
    }

    res.success({ success: true }, '删除成功');
  } catch (error) {
    next(error);
  }
});

// 5. 设置defaultmodel接口 post
router.post('/model/default', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      throw new BusinessError(400, '缺少模型ID');
    }

    const defaultModel = await modelManager.setDefaultModel(id);
    
    if (!defaultModel) {
      throw new BusinessError(404, '模型不存在');
    }
    
    res.success({ success: true, defaultModel });
  } catch (error) {
    next(error);
  }
});

// 1. 获取技能列表接口 get
router.get('/skills', async (req, res, next) => {
  try {
    const config = await skillsManager.getSkills();
    res.success(config);
  } catch (error) {
    next(error);
  }
});

// 2. 新增技能接口 post
router.post('/skills', async (req, res, next) => {
  try {
    const { name, summary, content } = req.body;
    
    const newSkill = await skillsManager.addSkill(name, summary, content);
    res.success(newSkill);
  } catch (error) {
    if (error instanceof Error && error.message.includes('格式错误')) {
      next(new BusinessError(500, error.message));
    } else {
      next(error);
    }
  }
});

// 3. 编辑技能接口 post
router.post('/skills/edit', async (req, res, next) => {
  try {
    const { id, name, summary, content } = req.body;
    if (!id) {
      throw new BusinessError(400, '缺少技能ID');
    }

    const updatedSkill = await skillsManager.updateSkill(id, name, summary, content);
    
    if (!updatedSkill) {
      throw new BusinessError(404, '技能不存在');
    }

    res.success(updatedSkill);
  } catch (error) {
    if (error instanceof Error && error.message.includes('格式错误')) {
      next(new BusinessError(500, error.message));
    } else {
      next(error);
    }
  }
});

// 4. 删除技能接口 post
router.post('/skills/delete', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      throw new BusinessError(400, '缺少技能ID');
    }

    const success = await skillsManager.deleteSkill(id);

    if (!success) {
      throw new BusinessError(404, '技能不存在');
    }

    res.success({ success: true }, '删除成功');
  } catch (error) {
    if (error instanceof Error && error.message.includes('格式错误')) {
      next(new BusinessError(500, error.message));
    } else {
      next(error);
    }
  }
});

// 5. 获取技能详情接口 post
router.post('/skills/detail', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      throw new BusinessError(400, '缺少技能ID');
    }

    const content = await skillsManager.getSkillDetail(id);
    res.success({ content });
  } catch (error: any) {
    if (error.message === '技能文件不存在') {
      next(new BusinessError(404, '技能文件不存在'));
    } else {
      next(error);
    }
  }
});

export default router;