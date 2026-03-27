import { getConfigPath } from './manager';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ModelConfig {
  id: string;
  modelName: string;
  provider: string;
  apiKey: string;
  baseURL: string;
}

export interface ModelData {
  models: ModelConfig[];
  defaultModel: ModelConfig | null;
}

export class ModelManager {
  /**
   * 获取模型配置文件的绝对路径
   */
  private get modelFilePath(): string {
    return path.join(getConfigPath(), 'model.json');
  }

  /**
   * 统一读取方法：读取 JSON 文件返回模型数据
   * 判断文件是否存在，没有则创建文件并写入 {}，返回默认空结构
   */
  private async readModelFile(): Promise<ModelData> {
    const filePath = this.modelFilePath;
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      // 保证返回的数据结构正确
      return {
        models: Array.isArray(parsed.models) ? parsed.models : [],
        defaultModel: parsed.defaultModel || null
      };
    } catch (error: any) {
      // 文件不存在的情况 (ENOENT) 或者 JSON 解析错误
      if (error.code === 'ENOENT' || error instanceof SyntaxError) {
        const emptyData: ModelData = { models: [], defaultModel: null };
        await this.writeModelFile(emptyData);
        return emptyData;
      }
      // 其他错误向上抛出
      throw error;
    }
  }

  /**
   * 统一写入方法：将模型数据写入 JSON 文件
   */
  private async writeModelFile(data: ModelData | any): Promise<void> {
    const filePath = this.modelFilePath;
    const dir = path.dirname(filePath);
    
    // 确保目标目录存在
    await fs.mkdir(dir, { recursive: true });
    // 将数据写入 model.json
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * 1. 查询模型数据
   * @returns 完整模型数据对象
   */
  public async getModels(): Promise<ModelData> {
    return await this.readModelFile();
  }

  /**
   * 2. 新增模型
   * @param model 包含 modelName, provider, apiKey, baseURL
   * @returns 新增的完整模型对象
   */
  public async addModel(model: Omit<ModelConfig, 'id'>): Promise<ModelConfig> {
    const data = await this.readModelFile();
    
    const newModel: ModelConfig = {
      id: crypto.randomUUID(),
      ...model
    };
    
    // unshift到models字段下第一条
    data.models.unshift(newModel);

    // 如果defaultModel的值为空，自动配置到defaultModel
    if (!data.defaultModel) {
      data.defaultModel = newModel; // 存完整对象
    }

    await this.writeModelFile(data);
    
    return newModel;
  }

  /**
   * 3. 编辑模型
   * @param id 要编辑的模型 ID
   * @param updates 包含要更新的字段
   * @returns 更新后的完整模型对象，如果未找到则返回 null
   */
  public async updateModel(id: string, updates: Partial<Omit<ModelConfig, 'id'>>): Promise<ModelConfig | null> {
    const data = await this.readModelFile();
    const index = data.models.findIndex(m => m.id === id);
    
    if (index === -1) {
      return null;
    }

    // 替换模型数据
    const updatedModel = { ...data.models[index], ...updates };
    data.models[index] = updatedModel;

    // 如果编辑的是默认模型，同步更新
    if (data.defaultModel && data.defaultModel.id === id) {
      data.defaultModel = updatedModel;
    }

    await this.writeModelFile(data);
    
    return updatedModel;
  }

  /**
   * 4. 删除模型
   * @param id 要删除的模型 ID
   * @returns 删除是否成功 (true表示找到了并删除，false表示未找到)
   */
  public async deleteModel(id: string): Promise<boolean> {
    const data = await this.readModelFile();
    const initialLength = data.models.length;
    
    data.models = data.models.filter(m => m.id !== id);
    
    if (data.models.length === initialLength) {
      return false; // 没有模型被删除
    }

    // 如果删除的是默认模型，清除或更新defaultModel
    if (data.defaultModel && data.defaultModel.id === id) {
      data.defaultModel = data.models.length > 0 ? data.models[0] : null;
    }

    await this.writeModelFile(data);
    return true;
  }

  /**
   * 5. 设置默认模型
   * @param id 要设置为默认模型的 ID
   * @returns 设置后的默认模型对象，如果未找到则返回 null
   */
  public async setDefaultModel(id: string): Promise<ModelConfig | null> {
    const data = await this.readModelFile();
    
    const model = data.models.find(m => m.id === id);
    if (!model) {
      return null;
    }

    data.defaultModel = model; // 写入defaultModel完整对象
    await this.writeModelFile(data);
    
    return data.defaultModel;
  }

  /**
   * 6. 获取默认模型
   * @returns 默认模型对象，如果未设置则返回 null
   */
  public async getDefaultModel(): Promise<ModelConfig | null> {
    const data = await this.readModelFile();
    return data.defaultModel;
  }
}

// 导出默认单例供其他模块直接使用
export const modelManager = new ModelManager();
