import { defineConfig } from 'umi';

export default defineConfig({
  fastRefresh: {},
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
