import { defineConfig } from 'umi';
import { join } from 'path';

export default defineConfig({
  fastRefresh: {},
  routes: [{ path: '/', component: '@/pages/index' }],
  alias: {
    '@/common': join(__dirname, '../common'),
  },
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
