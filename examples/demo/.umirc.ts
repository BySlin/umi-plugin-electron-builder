import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'pnpm',
  plugins: ['umi-plugin-electron-builder'],
});
