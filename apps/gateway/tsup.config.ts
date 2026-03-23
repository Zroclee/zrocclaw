import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node18',
  clean: true,
  bundle: true,
  noExternal: ['@zrocclaw/core'],
  external: ['cors', 'dotenv', 'express', 'helmet', 'http-proxy-middleware', 'fsevents', 'playwright', 'chromium-bidi/lib/cjs/bidiMapper/BidiMapper', 'chromium-bidi/lib/cjs/cdp/CdpConnection'],
  onSuccess: 'cp -r dist/* ../cli/dist/gateway/'
});