import { defineConfig } from 'umi';

export default defineConfig({
  fastRefresh: {},
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  mfsu: {},
  webpack5: {},
  electronBuilder: {
    parallelBuild: true,
  },
});
