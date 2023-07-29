import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'yarn',
  plugins: ['umi-plugin-electron-builder'],
});
