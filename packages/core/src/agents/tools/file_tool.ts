import { tool } from '@langchain/core/tools';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as z from 'zod';
import { getWorkspacePath } from '../../fileManager';

const resolveSafePath = (relativePath: string): string => {
  const normalizedInput = relativePath.trim();
  if (!normalizedInput) {
    throw new Error('路径不能为空');
  }

  if (path.isAbsolute(normalizedInput)) {
    throw new Error('不允许使用绝对路径');
  }

  const workspaceRoot = getWorkspacePath();
  const absolutePath = path.resolve(workspaceRoot, normalizedInput);
  const relativeToRoot = path.relative(workspaceRoot, absolutePath);

  if (
    relativeToRoot === '' ||
    relativeToRoot.startsWith('..') ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new Error('禁止访问工作目录之外的路径');
  }

  return absolutePath;
};

export const createFileTool = tool(
  async ({ filePath, content, isDirectory }) => {
    const targetPath = resolveSafePath(filePath);
    try {
      const hasExtension = path.extname(filePath) !== '';
      const shouldCreateDir = isDirectory || (!hasExtension && !content);

      if (shouldCreateDir) {
        await fs.mkdir(targetPath, { recursive: true });
        return JSON.stringify({
          success: true,
          operation: 'create_directory',
          filePath,
        });
      } else {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content || '', { encoding: 'utf-8', flag: 'wx' });
        return JSON.stringify({
          success: true,
          operation: 'create_file',
          filePath,
        });
      }
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        operation: 'create',
        filePath,
        error: error.message,
      });
    }
  },
  {
    name: 'create_file_or_directory',
    description: '在工作目录内新建文件或目录。注意：filePath必须是相对工作目录的路径。',
    schema: z.object({
      filePath: z.string().describe('相对工作目录的文件或目录路径'),
      content: z.string().optional().describe('文件内容'),
      isDirectory: z.boolean().optional().describe('是否创建目录（为 true 时创建目录）'),
    }),
  }
);

export const readFileTool = tool(
  async ({ filePath }) => {
    const targetPath = resolveSafePath(filePath);
    try {
      const fileContent = await fs.readFile(targetPath, 'utf-8');
      return JSON.stringify({
        success: true,
        operation: 'read_file',
        filePath,
        content: fileContent,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        operation: 'read',
        filePath,
        error: error.message,
      });
    }
  },
  {
    name: 'read_file',
    description: '在工作目录内读取文件。注意：filePath必须是相对工作目录的路径。',
    schema: z.object({
      filePath: z.string().describe('相对工作目录的文件路径'),
    }),
  }
);

export const writeFileTool = tool(
  async ({ filePath, content }) => {
    const targetPath = resolveSafePath(filePath);
    try {
      const stat = await fs.stat(targetPath);
      if (!stat.isFile()) {
        throw new Error('目标路径不是文件');
      }
      await fs.writeFile(targetPath, content || '', { encoding: 'utf-8' });
      return JSON.stringify({
        success: true,
        operation: 'write_file',
        filePath,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        operation: 'write',
        filePath,
        error: error.message,
      });
    }
  },
  {
    name: 'write_file',
    description: '在工作目录内覆盖写入已有文件。注意：filePath必须是相对工作目录的路径。',
    schema: z.object({
      filePath: z.string().describe('相对工作目录的文件路径'),
      content: z.string().describe('要写入的文件内容'),
    }),
  }
);

export const deleteFileTool = tool(
  async ({ filePath }) => {
    const targetPath = resolveSafePath(filePath);
    try {
      const stat = await fs.stat(targetPath);
      if (stat.isDirectory()) {
        await fs.rm(targetPath, { recursive: true, force: true });
      } else {
        await fs.unlink(targetPath);
      }
      return JSON.stringify({
        success: true,
        operation: 'delete_file',
        filePath,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        operation: 'delete',
        filePath,
        error: error.message,
      });
    }
  },
  {
    name: 'delete_file_or_directory',
    description: '在工作目录内删除文件或目录。注意：filePath必须是相对工作目录的路径。',
    schema: z.object({
      filePath: z.string().describe('相对工作目录的文件或目录路径'),
    }),
  }
);

export const listFilesTool = tool(
  async ({ filePath }) => {
    let targetPath: string;
    if (filePath === '.' || filePath === '/' || filePath === '') {
      targetPath = getWorkspacePath();
    } else {
      targetPath = resolveSafePath(filePath);
    }

    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      const files = entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
      }));
      return JSON.stringify({
        success: true,
        operation: 'list_files',
        filePath,
        files,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        operation: 'list',
        filePath,
        error: error.message,
      });
    }
  },
  {
    name: 'list_files',
    description: '列出工作目录内的目录内容。读取根目录列表可传 "."。',
    schema: z.object({
      filePath: z.string().describe('相对工作目录的目录路径（读取根目录列表可传 "."）'),
    }),
  }
);
