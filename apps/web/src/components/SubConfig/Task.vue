<template>
  <div>
    <!-- 头部操作区 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">定时任务配置</h2>
      <button class="btn btn-primary btn-sm" @click="openModal('add')">
        新增任务
      </button>
    </div>

    <!-- 任务列表表格 -->
    <div class="overflow-x-auto bg-base-100 border border-base-300 rounded-box">
      <table class="table">
        <thead>
          <tr>
            <th class="w-16">序号</th>
            <th>任务名称 (name)</th>
            <th>Cron 表达式</th>
            <th>任务消息 (message)</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tasks.length === 0">
            <td colspan="6" class="text-center text-gray-500 py-8">暂无任务数据</td>
          </tr>
          <tr v-for="(task, index) in tasks" :key="task.id">
            <td>{{ index + 1 }}</td>
            <td class="font-medium">{{ task.name }}</td>
            <td class="font-mono text-sm">{{ task.cron }}</td>
            <td class="max-w-xs truncate" :title="task.message">{{ task.message }}</td>
            <td>
              <input 
                type="checkbox" 
                class="toggle toggle-success toggle-sm" 
                :checked="task.isActive" 
                @change="toggleTaskStatus(task)" 
              />
            </td>
            <td>
              <button class="btn btn-ghost btn-xs text-primary" @click="openResultsModal(task)">执行结果</button>
              <button class="btn btn-ghost btn-xs text-info ml-2" @click="openModal('edit', task)">编辑</button>
              <button class="btn btn-ghost btn-xs text-error ml-2" @click="confirmDelete(task)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <dialog id="task_modal" class="modal">
      <div class="modal-box w-11/12 max-w-3xl">
        <h3 class="font-bold text-lg mb-4">{{ modalMode === 'add' ? '新增任务' : '编辑任务' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text">任务名称 (name)</span></label>
            <input type="text" v-model="formData.name" placeholder="请输入任务名称" class="input input-bordered w-full" required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Cron 表达式 (执行时间规则)</span>
              <a href="https://crontab.guru/" target="_blank" class="label-text-alt link link-primary">参考语法</a>
            </label>
            <CronSelector v-model="formData.cron" />
            <input type="hidden" v-model="formData.cron" required />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">任务消息 (message)</span></label>
            <textarea v-model="formData.message" placeholder="请输入要发给大模型的信息..." class="textarea textarea-bordered w-full" rows="3" required></textarea>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">是否立即启用</span></label>
            <div class="pt-1">
              <input type="checkbox" v-model="formData.isActive" class="toggle toggle-success" />
            </div>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal">关闭</button>
      </form>
    </dialog>

    <!-- 执行结果弹窗 -->
    <dialog id="results_modal" class="modal">
      <div class="modal-box w-11/12 max-w-4xl h-[80vh] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">任务 [{{ currentResultTask?.name }}] 执行结果</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="closeResultsModal">✕</button>
        </div>
        
        <div class="flex-1 overflow-y-auto bg-base-200 rounded-box p-4">
          <div v-if="isLoadingResults" class="flex justify-center items-center h-full">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
          <div v-else-if="taskResults.length === 0" class="flex justify-center items-center h-full text-base-content/50">
            暂无执行结果
          </div>
          <div v-else class="space-y-4">
            <div v-for="(result, index) in taskResults" :key="index" class="card bg-base-100 shadow-sm border border-base-300">
              <div class="card-body p-4">
                <div class="flex justify-between items-center mb-2 border-b border-base-200 pb-2">
                  <span class="font-medium text-sm text-primary">执行时间：{{ result.executeTime }}</span>
                </div>
                <div class="bg-base-300/30 rounded p-3 text-sm font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                  {{ result.result }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeResultsModal">关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import request from '../../api/request';
import CronSelector from './CronSelector.vue';

interface TaskItem {
  id: string;
  name: string;
  cron: string;
  message: string;
  isActive: boolean;
}

interface TaskResult {
  id: string;
  name: string;
  message: string;
  executeTime: string;
  result: string;
}

const tasks = ref<TaskItem[]>([]);

// 表单及弹窗状态
const modalMode = ref<'add' | 'edit'>('add');
const formData = reactive<{
  id?: string;
  name: string;
  cron: string;
  message: string;
  isActive: boolean;
}>({
  name: '',
  cron: '0 0 0 * * *',
  message: '',
  isActive: true,
});

// 执行结果弹窗状态
const taskResults = ref<TaskResult[]>([]);
const currentResultTask = ref<TaskItem | null>(null);
const isLoadingResults = ref(false);

// 加载任务列表
const loadTasks = async () => {
  try {
    const res = await request.get('/task');
    // 根据拦截器，返回的是直接数据
    tasks.value = res as unknown as TaskItem[];
  } catch (error) {
    console.error('Failed to load tasks', error);
  }
};

onMounted(() => {
  loadTasks();
});

// 弹窗控制
const openModal = (mode: 'add' | 'edit', task?: TaskItem) => {
  modalMode.value = mode;
  if (mode === 'edit' && task) {
    formData.id = task.id;
    formData.name = task.name;
    formData.cron = task.cron;
    formData.message = task.message;
    formData.isActive = task.isActive;
  } else {
    formData.id = undefined;
    formData.name = '';
    formData.cron = '0 0 0 * * *';
    formData.message = '';
    formData.isActive = true;
  }
  const modal = document.getElementById('task_modal') as HTMLDialogElement;
  modal?.showModal();
};

const closeModal = () => {
  const modal = document.getElementById('task_modal') as HTMLDialogElement;
  modal?.close();
};

// 打开执行结果弹窗
const openResultsModal = async (task: TaskItem) => {
  currentResultTask.value = task;
  taskResults.value = [];
  isLoadingResults.value = true;
  
  const modal = document.getElementById('results_modal') as HTMLDialogElement;
  modal?.showModal();

  try {
    const res = await request.post('/task/results', { id: task.id });
    // 对结果按执行时间倒序排列（最新的在前面）
    taskResults.value = (res as unknown as TaskResult[]).sort((a, b) => {
      return new Date(b.executeTime).getTime() - new Date(a.executeTime).getTime();
    });
  } catch (error) {
    console.error('Failed to load task results', error);
  } finally {
    isLoadingResults.value = false;
  }
};

const closeResultsModal = () => {
  const modal = document.getElementById('results_modal') as HTMLDialogElement;
  modal?.close();
  currentResultTask.value = null;
  taskResults.value = [];
};

// 提交表单
const handleSubmit = async () => {
  if (!formData.name || !formData.cron || !formData.message) {
    alert('请完整填写必填项：任务名称、Cron 表达式和任务消息');
    return;
  }
  
  try {
    if (modalMode.value === 'add') {
      await request.post('/task/add', {
        name: formData.name,
        cron: formData.cron,
        message: formData.message,
        isActive: formData.isActive
      });
    } else {
      await request.post('/task/edit', {
        id: formData.id,
        name: formData.name,
        cron: formData.cron,
        message: formData.message,
        isActive: formData.isActive
      });
    }
    closeModal();
    loadTasks();
  } catch (error) {
    console.error('Failed to save task', error);
    alert('保存失败，请检查控制台错误');
  }
};

// 切换任务状态
const toggleTaskStatus = async (task: TaskItem) => {
  const newStatus = !task.isActive;
  try {
    // 乐观更新 UI
    task.isActive = newStatus;
    await request.post('/task/toggle', {
      id: task.id,
      isActive: newStatus
    });
  } catch (error) {
    // 失败时回滚状态
    task.isActive = !newStatus;
    console.error('Failed to toggle task status', error);
    alert('状态切换失败');
  }
};

// 删除任务 (原生 confirm 二次确认)
const confirmDelete = async (task: TaskItem) => {
  if (window.confirm(`确定要删除任务 [${task.name}] 吗？`)) {
    try {
      await request.post('/task/delete', { id: task.id });
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
      alert('删除失败');
    }
  }
};
</script>

<style scoped>
/* 可以根据需要在此补充额外的样式 */
</style>
