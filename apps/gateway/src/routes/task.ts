import { Router } from 'express';
import { taskManager, scheduler, TaskConfig } from '@zrocclaw/core/scheduler';
import { browser_invoke } from '@zrocclaw/core/agents';
import { modelManager } from '@zrocclaw/core/fileManager';
import { BusinessError } from '../middlewares/errorHandler';


const router = Router();

async function executeAgentTask(taskId: string, taskName: string, message: string) {
  try {
    const modelConfig = await modelManager.getDefaultModel();
    const threadId = `task-${taskId}`;

    if (!modelConfig) {
      console.error(`[Task Execution Error] defaultModel not found in config for task [${taskName}]`);
      return;
    }

    console.log(`[Task Execution Start] 任务 [${taskName}] 开始执行，消息: ${message}`);
    const result = await browser_invoke(message, threadId, modelConfig);
    const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
    console.log(`[Task Execution Success] 任务 [${taskName}] 执行完成。结果: ${resultStr}`);
    
    // 保存执行结果
    await taskManager.saveTaskResult(taskId, resultStr);
  } catch (error) {
    console.error(`[Task Execution Error] 任务 [${taskName}] 执行失败:`, error);
    // 保存执行失败的结果
    await taskManager.saveTaskResult(taskId, `执行失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 1. 查询接口，GET，返回任务数组
router.get('/', async (req, res) => {
  const tasks = await taskManager.getTasks();
  res.success(tasks, '获取任务列表成功');
});

// 2. 新增接口，POST，返回携带ID的完整任务对象
router.post('/add', async (req, res) => {
  const { name, cron, message, isActive } = req.body;
  
  if (!name || !cron || !message) {
    throw new BusinessError(400, '缺少必填字段: name, cron 或 message');
  }

  const newTask = await taskManager.addTask({
    name,
    cron,
    message,
    isActive: !!isActive
  });

  // 如果新增时 isActive 为 true，则自动启动任务
  if (newTask.isActive) {
    scheduler.startTask({
      id: newTask.id,
      name: newTask.name,
      cron: newTask.cron,
      handler: async () => {
        // 使用新建的函数统一调用
        await executeAgentTask(newTask.id, newTask.name, newTask.message);
      }
    });
  }

  res.success(newTask, '新增任务成功');
});

// 3. 编辑接口，POST，参数必须携带ID
router.post('/edit', async (req, res) => {
  const { id, ...updates } = req.body;
  
  if (!id) {
    throw new BusinessError(400, '必须提供任务ID');
  }

  const updatedTask = await taskManager.updateTask(id, updates);
  if (!updatedTask) {
    throw new BusinessError(404, `未找到 ID 为 ${id} 的任务`);
  }

  // 编辑后重新评估调度器状态
  if (updatedTask.isActive) {
    scheduler.startTask({
      id: updatedTask.id,
      name: updatedTask.name,
      cron: updatedTask.cron,
      handler: async () => {
        await executeAgentTask(updatedTask.id, updatedTask.name, updatedTask.message);
      }
    });
  } else {
    scheduler.stopTask(updatedTask.id);
  }

  res.success(updatedTask, '更新任务成功');
});

// 4. 删除接口，POST，参数任务ID
router.post('/delete', async (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    throw new BusinessError(400, '必须提供任务ID');
  }

  const success = await taskManager.deleteTask(id);
  if (!success) {
    throw new BusinessError(404, `未找到 ID 为 ${id} 的任务`);
  }

  // 删除任务后也要从调度器中停止
  scheduler.stopTask(id);

  res.success({ id }, '删除任务成功');
});

// 5. 激活/停止任务，POST，参数任务对象（或仅包含ID和isActive状态）
router.post('/toggle', async (req, res) => {
  const { id, isActive } = req.body;

  if (!id || typeof isActive !== 'boolean') {
    throw new BusinessError(400, '必须提供任务ID以及isActive(布尔值)');
  }

  const updatedTask = await taskManager.updateTask(id, { isActive });
  if (!updatedTask) {
    throw new BusinessError(404, `未找到 ID 为 ${id} 的任务`);
  }

  if (updatedTask.isActive) {
    scheduler.startTask({
      id: updatedTask.id,
      name: updatedTask.name,
      cron: updatedTask.cron,
      handler: async () => {
        await executeAgentTask(updatedTask.id, updatedTask.name, updatedTask.message);
      }
    });
  } else {
    scheduler.stopTask(updatedTask.id);
  }

  res.success(updatedTask, isActive ? '任务已激活并启动' : '任务已停止');
});

// 6. 获取任务执行结果，POST，参数任务ID
router.post('/results', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    throw new BusinessError(400, '必须提供任务ID');
  }

  const results = await taskManager.getTaskResults(id);
  res.success(results, '获取任务执行结果成功');
});

export default router;

