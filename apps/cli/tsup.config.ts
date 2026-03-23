import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  clean: false, // 改为false，避免清理掉 gateway 复制过来的文件
  bundle: true,
});
