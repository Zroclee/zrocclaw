<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">大模型配置</h2>
      <button class="btn btn-primary btn-sm" @click="openModal()">添加模型</button>
    </div>

    <div class="overflow-x-auto bg-base-100 border border-base-300 rounded-box">
      <table class="table">
        <thead>
          <tr>
            <th>模型名称</th>
            <th>模型供应商</th>
            <th>API Key</th>
            <th>Base URL</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="models.length === 0">
            <td colspan="5" class="text-center text-gray-500 py-8">暂无配置的大模型，请添加</td>
          </tr>
          <tr v-for="model in models" :key="model.id">
            <td>
              {{ model.modelName }}
              <span v-if="defaultModel?.id === model.id" class="badge badge-primary badge-sm ml-2">默认</span>
            </td>
            <td>{{ model.provider }}</td>
            <td class="max-w-[150px] truncate" :title="model.apiKey">
              {{ maskApiKey(model.apiKey) }}
            </td>
            <td class="max-w-[200px] truncate" :title="model.baseURL">
              {{ model.baseURL || '-' }}
            </td>
            <td>
              <button 
                class="btn btn-ghost btn-xs text-primary" 
                v-if="defaultModel?.id !== model.id"
                @click="setDefaultModel(model)"
              >
                设为默认
              </button>
              <button class="btn btn-ghost btn-xs text-info" :class="{ 'ml-2': defaultModel?.id !== model.id }" @click="openModal(model)">编辑</button>
              <button class="btn btn-ghost btn-xs text-error ml-2" @click="deleteModel(model.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dialog -->
    <dialog id="model_modal" class="modal" ref="modalRef">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{{ isEditing ? '编辑模型' : '添加模型' }}</h3>
        
        <form @submit.prevent="saveModel" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text">模型名称</span></label>
            <input type="text" v-model="formData.modelName" placeholder="例如: gpt-4o, claude-3-5-sonnet" class="input input-bordered w-full" required />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">模型供应商</span></label>
            <input type="text" v-model="formData.provider" placeholder="例如: OpenAI, Anthropic" class="input input-bordered w-full" required />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">API Key</span></label>
            <input type="password" v-model="formData.apiKey" placeholder="sk-..." class="input input-bordered w-full" required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Base URL <span class="text-gray-400 text-xs">(可选)</span></span>
            </label>
            <input type="text" v-model="formData.baseURL" placeholder="例如: https://api.openai.com/v1" class="input input-bordered w-full" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useConfigStore } from '../../store/config';

interface ModelConfig {
  id: string;
  modelName: string;
  provider: string;
  apiKey: string;
  baseURL?: string;
}

const configStore = useConfigStore();
const models = computed<ModelConfig[]>(() => {
  return Array.isArray(configStore.modelData.models) ? configStore.modelData.models : [];
});

const defaultModel = computed<ModelConfig | null>(() => {
  return configStore.modelData.defaultModel || null;
});

const modalRef = ref<HTMLDialogElement | null>(null);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const formData = reactive<Omit<ModelConfig, 'id'>>({
  modelName: '',
  provider: '',
  apiKey: '',
  baseURL: '',
});

onMounted(async () => {
  try {
    await configStore.fetchModel();
  } catch (error) {
    console.error('Failed to fetch models config on mount', error);
  }
});

const saveToStore = async (updates: Record<string, any>) => {
  try {
    const payload = { ...updates };
    
    if (!('models' in payload)) {
      payload.models = models.value;
    }
    if (!('defaultModel' in payload)) {
      payload.defaultModel = defaultModel.value;
    }

    if (payload.models && payload.models.length > 0) {
      if (payload.defaultModel) {
        const existModel = payload.models.find((m: ModelConfig) => m.id === payload.defaultModel.id);
        if (!existModel) {
          payload.defaultModel = payload.models[0];
        } else {
          payload.defaultModel = existModel;
        }
      } else {
        payload.defaultModel = payload.models[0];
      }
    } else {
      payload.defaultModel = null;
    }

    await configStore.updateModel(payload);
  } catch (error) {
    console.error('Failed to update models config', error);
  }
};

const setDefaultModel = async (model: ModelConfig) => {
  await saveToStore({ defaultModel: model });
};

const openModal = (model?: ModelConfig) => {
  if (model) {
    isEditing.value = true;
    editingId.value = model.id;
    formData.modelName = model.modelName;
    formData.provider = model.provider;
    formData.apiKey = model.apiKey;
    formData.baseURL = model.baseURL || '';
  } else {
    isEditing.value = false;
    editingId.value = null;
    resetForm();
  }
  modalRef.value?.showModal();
};

const closeModal = () => {
  modalRef.value?.close();
  resetForm();
};

const resetForm = () => {
  formData.modelName = '';
  formData.provider = '';
  formData.apiKey = '';
  formData.baseURL = '';
};

const saveModel = async () => {
  const currentModels = [...models.value];

  if (isEditing.value && editingId.value) {
    const index = currentModels.findIndex(m => m.id === editingId.value);
    if (index !== -1) {
      currentModels[index] = {
        id: editingId.value,
        ...formData,
      };
    }
  } else {
    currentModels.push({
      id: crypto.randomUUID(),
      ...formData,
    });
  }
  
  await saveToStore({ models: currentModels });
  closeModal();
};

const deleteModel = async (id: string) => {
  if (confirm('确定要删除该模型配置吗？')) {
    const newModels = models.value.filter(m => m.id !== id);
    await saveToStore({ models: newModels });
  }
};

const maskApiKey = (key: string) => {
  if (!key) return '';
  if (key.length <= 8) return '*'.repeat(key.length);
  return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
};
</script>
