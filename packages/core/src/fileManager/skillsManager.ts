import { getWorkspacePath, getSkillsPath } from './manager';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SkillConfig {
  id: string;
  name: string;
  summary: string;
  path: string;
}

export class SkillsManager {
  /**
   * 获取技能列表配置文件的绝对路径
   */
  private get workspaceSkillsPath(): string {
    return path.join(getWorkspacePath(), 'SKILLS.json');
  }

  /**
   * 统一读取方法：读取技能配置文件
   */
  private async readSkillsConfig(): Promise<SkillConfig[]> {
    const filePath = this.workspaceSkillsPath;
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * 统一写入方法：将技能数据写入配置文件
   */
  private async writeSkillsConfig(config: SkillConfig[]): Promise<void> {
    const filePath = this.workspaceSkillsPath;
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * 获取所有技能列表
   */
  public async getSkills(): Promise<SkillConfig[]> {
    try {
      await fs.access(this.workspaceSkillsPath);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await this.writeSkillsConfig([]);
        return [];
      }
    }
    return await this.readSkillsConfig();
  }

  /**
   * 新增技能
   */
  public async addSkill(name: string, summary: string, content: string): Promise<SkillConfig> {
    const id = crypto.randomUUID();
    const newSkill: SkillConfig = {
      id,
      name,
      summary,
      path: `./skills/${id}.md`
    };

    const skills = await this.readSkillsConfig();
    if (!Array.isArray(skills)) {
      throw new Error('skills.json 格式错误');
    }
    
    skills.unshift(newSkill);
    await this.writeSkillsConfig(skills);

    // 保存内容到 markdown 文件
    const skillsDir = getSkillsPath();
    await fs.mkdir(skillsDir, { recursive: true });
    const mdPath = path.join(skillsDir, `${id}.md`);
    await fs.writeFile(mdPath, content || '', 'utf-8');

    return newSkill;
  }

  /**
   * 编辑技能
   */
  public async updateSkill(id: string, name: string, summary: string, content: string): Promise<SkillConfig | null> {
    const skills = await this.readSkillsConfig();
    if (!Array.isArray(skills)) {
      throw new Error('skills.json 格式错误');
    }

    const index = skills.findIndex((s) => s.id === id);
    if (index === -1) {
      return null;
    }

    skills[index] = { ...skills[index], name, summary };
    await this.writeSkillsConfig(skills);

    // 替换对应的 markdown 文件内容
    const skillsDir = getSkillsPath();
    await fs.mkdir(skillsDir, { recursive: true });
    const mdPath = path.join(skillsDir, `${id}.md`);
    await fs.writeFile(mdPath, content || '', 'utf-8');

    return skills[index];
  }

  /**
   * 删除技能
   */
  public async deleteSkill(id: string): Promise<boolean> {
    let skills = await this.readSkillsConfig();
    if (!Array.isArray(skills)) {
      throw new Error('skills.json 格式错误');
    }

    const initialLength = skills.length;
    skills = skills.filter((s) => s.id !== id);

    if (skills.length === initialLength) {
      return false; // 技能不存在
    }

    await this.writeSkillsConfig(skills);

    // 删除对应的 markdown 文件
    const skillsDir = getSkillsPath();
    const mdPath = path.join(skillsDir, `${id}.md`);
    try {
      await fs.unlink(mdPath);
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        console.error('删除技能文件失败:', e);
      }
    }

    return true;
  }

  /**
   * 获取技能详情（Markdown 内容）
   */
  public async getSkillDetail(id: string): Promise<string> {
    const skillsDir = getSkillsPath();
    const mdPath = path.join(skillsDir, `${id}.md`);
    
    try {
      await fs.access(mdPath);
      const content = await fs.readFile(mdPath, 'utf-8');
      return content;
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        throw new Error('技能文件不存在');
      }
      throw e;
    }
  }
}

export const skillsManager = new SkillsManager();