import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "@zrocclaw/ui",
      fileName: "@zrocclaw/ui",
    },
    rollupOptions: {
      external: ["vue"], // Vue 作为外部依赖
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
