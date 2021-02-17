import { defineConfig } from 'umi';

export default defineConfig({
  routes: [{ path: '/', component: '@/pages/index' }],
  plugins: [require.resolve('../')],
  electronBuilder: {
    mainSrc: '../main',
    outputDir: '../../dist_electron',
    externals: ['electron-updater'],
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
