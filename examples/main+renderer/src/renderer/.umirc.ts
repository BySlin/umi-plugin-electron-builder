import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'pnpm',
  plugins: ['umi-plugin-electron-builder'],
  electronBuilder: {
    rendererTarget: 'web',
    builderOptions: {
      appId: 'com.test.test',
      productName: '测试',
      publish: [
        {
          provider: 'generic',
          url: 'http://localhost/test',
        },
      ],
    },
  },
});
