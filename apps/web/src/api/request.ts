import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : '/',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等统一逻辑
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 直接返回业务数据
    return response.data;
  },
  (error) => {
    // 可以在这里统一处理错误提示
    return Promise.reject(error);
  }
);

export default request;
