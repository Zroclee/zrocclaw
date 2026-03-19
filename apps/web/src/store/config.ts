import { defineStore } from 'pinia';
import request from '../api/request';

export const useConfigStore = defineStore('config', {
  state: () => ({
    modelData: {} as Record<string, any>,
  }),
  actions: {
    // 获取模型信息
    async fetchModel() {
      try {
        // 由于在 axios 拦截器中直接返回了 response.data，所以这里的返回值即为实际数据
        const data = await request.get('/config/model');
        this.modelData = data as Record<string, any>;
        return data;
      } catch (error) {
        console.error('获取模型失败:', error);
        throw error;
      }
    },
    // 修改模型信息
    async updateModel(newModel: Record<string, any>) {
      try {
        const data = await request.post('/config/model', newModel);
        this.modelData = data as Record<string, any>;
        return data;
      } catch (error) {
        console.error('修改模型失败:', error);
        throw error;
      }
    }
  }
});
