import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'pnpm',
  plugins: [require.resolve('umi-plugin-electron-builder')],
});
