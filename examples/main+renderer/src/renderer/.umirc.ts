import { defineConfig } from 'umi';
import { resolve } from 'path';

export default defineConfig({
  fastRefresh: {},
  routes: [{ path: '/', component: '@/pages/index' }],
  plugins: [resolve(__dirname, '../../../../lib')],
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
