import { defineConfig } from 'umi';

export default defineConfig({
  fastRefresh: {},
  routes: [{ path: '/', component: '@/pages/index' }],
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
