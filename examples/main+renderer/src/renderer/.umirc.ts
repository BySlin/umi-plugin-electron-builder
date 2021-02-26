import { defineConfig } from 'umi';
import { Configuration } from 'webpack';
import { resolve } from 'path';

export default defineConfig({
  routes: [{ path: '/', component: '@/pages/index' }],
  plugins: [resolve(__dirname, '../../../../lib')],
  alias: {
    '@/common': resolve(__dirname, '../common'),
  },
  electronBuilder: {
    externals: ['electron-updater'],
    mainWebpackConfig(config: Configuration) {
      config.resolve!.alias = {
        '@/common': resolve(__dirname, '../common'),
        '@': resolve(__dirname, '../main'),
      };
    },
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
