import { createAgent, createMiddleware } from "langchain";

const memoryMiddleware = createMiddleware({
  name: "MemoryMiddleware",
  beforeAgent: async ({ messages }) => {
    console.log('beforeAgent', messages);
  },
  afterAgent: async ({ messages }) => {
    console.log('afterAgent', messages);
  },
});