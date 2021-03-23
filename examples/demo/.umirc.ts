import { defineConfig } from 'umi';
import path from 'path';

export default defineConfig({
  fastRefresh: {},
  plugins: [path.join(__dirname, '../../lib')],
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  electronBuilder: {
    rendererTarget: 'web',
  },
});
