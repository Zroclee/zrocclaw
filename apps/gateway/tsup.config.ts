import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node18',
  clean: true,
  bundle: true,
  env: {
    NODE_ENV: 'production',
  },
  external: ['cors', 'dotenv', 'express', 'helmet', 'http-proxy-middleware'],
});