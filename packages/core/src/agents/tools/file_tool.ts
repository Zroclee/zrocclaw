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

export const fileOperationsTool = tool(
  async ({ action, filePath, content }) => {
    // 特殊处理 list 根目录的情况（允许 filePath 为 '.' 或 '/' 等，但在 resolveSafePath 会报错，这里做下兼容）
    let targetPath: string;
    if (action === 'list' && (filePath === '.' || filePath === '/' || filePath === '')) {
      targetPath = getWorkspacePath();
    } else {
      targetPath = resolveSafePath(filePath);
    }

    try {
      switch (action) {
        case 'create': {
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          await fs.writeFile(targetPath, content || '', { encoding: 'utf-8', flag: 'wx' });
          return JSON.stringify({
            success: true,
            operation: 'create_file',
            filePath,
          });
        }
        case 'read': {
          const fileContent = await fs.readFile(targetPath, 'utf-8');
          return JSON.stringify({
            success: true,
            operation: 'read_file',
            filePath,
            content: fileContent,
          });
        }
        case 'write': {
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
        }
        case 'delete': {
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
        }
        case 'list': {
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
        }
        default:
          throw new Error(`不支持的文件操作类型: ${action}`);
      }
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        operation: action,
        filePath,
        error: error.message,
      });
    }
  },
  {
    name: 'file_operations',
    description: '在工作目录内执行文件或目录操作。支持操作：create(新建文件), read(读取文件), write(覆盖写入文件), delete(删除文件或目录), list(列出目录下文件)。注意：filePath必须是相对工作目录的路径。',
    schema: z.object({
      action: z.enum(['create', 'read', 'write', 'delete', 'list']).describe('要执行的文件操作类型'),
      filePath: z.string().describe('相对工作目录的文件或目录路径（读取根目录列表可传 "."）'),
      content: z.string().optional().describe('文件内容（仅在 create 或 write 操作时需要提供）'),
    }),
  }
);
