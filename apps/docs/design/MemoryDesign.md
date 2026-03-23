# Memory Design

## 记忆流程设置设计

依赖langchain的自定义中间件
在流程开始和流程结束的时候分别保存

```ts
const memoryMiddleware = createMiddleware({
  name: "MemoryMiddleware",
  beforeAgent: async ({ messages }) => {
    // console.log('beforeAgent', messages);
  },
  afterAgent: async ({ messages }) => {
    console.log('afterAgent', messages);
  },
});
```

目前打算统一在afterAgent中处理记忆
1. 先将messages保存到本地
2. 判断当前上下文是否超过70%，保留最近5轮对话内容，超出部分通过摘要保留。
3. 每次对话结束后，将当前上下文保存到本地。

本地设计两套记忆体系
一种是前端的对话体系，用于存储用户的对话记录。
一种是后端的记忆体系，用于存储对话的摘要。