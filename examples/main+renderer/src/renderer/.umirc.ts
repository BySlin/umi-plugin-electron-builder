import { defineConfig } from 'umi';
import path from 'path';
import { Configuration } from 'webpack';

export default defineConfig({
  routes: [{ path: '/', component: '@/pages/index' }],
  plugins: [path.join(__dirname, '../../../../src')],
  electronBuilder: {
    mainSrc: '../main',
    outputDir: '../../dist_electron',
    externals: ['electron-updater'],
    mainWebpackConfig(config: Configuration) {
      config!.resolve!.alias!['@common'] = path.join(__dirname, '../common');
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
