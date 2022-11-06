import path from 'path';
import { IApi } from 'umi';
import webpack from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import externalPackages from '../../external-packages.config';
import { ElectronBuilder } from '../../types';
import {
  getBuildDir,
  getDevBuildDir,
  getMainSrc,
  getPreloadSrc,
} from '../../utils';

// const WebpackBar = require('@umijs/deps/compiled/webpackbar');

function getBaseWebpackConfig(api: IApi): Config {
  const mode: 'none' | 'development' | 'production' =
    api.env === 'development' ? 'development' : 'production';
  const { externals } = api.config.electronBuilder as ElectronBuilder;

  const external = [...externalPackages, ...externals];
  const config = new Config();
  config.mode(mode);
  config.node.set('__filename', false).set('__dirname', false);
  config.devtool(mode === 'development' ? 'inline-source-map' : false);
  config.resolve.extensions.add('.ts').add('.js').add('.node');
  config.module.rule('ts').exclude.add(/node_modules/);
  config.module
    .rule('ts')
    .test(/\.ts?$/)
    .use('ts')
    .loader('ts-loader')
    .options({ transpileOnly: true });
  config.resolve.alias.set('@/common', path.join(process.cwd(), 'src/common'));

  config.externals(external);
  config.output.path(
    mode === 'development' ? getDevBuildDir(api) : getBuildDir(api),
  );
  if (api.config.mfsu != undefined || api.config.webpack5 != undefined) {
    config.optimization
      .minimize(true)
      .set('emitOnErrors', true)
      .minimizer('terser')
      .use(require('terser-webpack-plugin'));
  }
  return config;
}

/**
 * 获取主进程webpack配置
 * @param api
 */
export function getMainWebpackConfig(api: IApi) {
  const { mainWebpackChain } = api.config.electronBuilder as ElectronBuilder;
  const config = getBaseWebpackConfig(api);
  config.resolve.alias.set('@', getMainSrc(api));
  config.context(getMainSrc(api));
  config.entry('main').add('./index.ts');
  config.output.filename('main.js');
  config.target('electron-main');
  config.output.library('main').libraryTarget('commonjs2');

  if (process.env.PROGRESS !== 'none') {
    // config
    //   .plugin('progress')
    //   .use(require.resolve('@umijs/deps/compiled/webpackbar'), [{
    //     name: 'electron-main',
    //     color: '#1890ff',
    //   }]);
  }

  mainWebpackChain(config, 'main');
  return config.toConfig();
}

/**
 * 获取preload webpack配置
 * @param api
 * @param inputFileName
 * @param outputFileName
 */
export function getPreloadWebpackConfig(
  api: IApi,
  inputFileName: string,
  outputFileName: string,
): webpack.Configuration {
  const { mainWebpackChain } = api.config.electronBuilder as ElectronBuilder;
  const config = getBaseWebpackConfig(api);
  config.resolve.alias.set('@', getPreloadSrc(api));
  config.context(getPreloadSrc(api));
  config.entry('preload').add(`./${inputFileName}`);
  config.output.filename(outputFileName);
  config.target('electron-renderer');
  config.output.library('preload').libraryTarget('commonjs2');

  if (process.env.PROGRESS !== 'none') {
    // config
    //   .plugin('progress')
    //   .use(require.resolve('@umijs/deps/compiled/webpackbar'), [
    //     {
    //       name: 'electron-preload',
    //       color: '#eb2f96',
    //     },
    //   ]);
  }

  mainWebpackChain(config, 'preload');
  return config.toConfig();
}

/**
 * 打包构建
 * @param config
 */
export const build = async (config: webpack.Configuration) => {
  return await new Promise<void>((resolve, reject) => {
    const compiler = webpack(config);
    compiler.run((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
