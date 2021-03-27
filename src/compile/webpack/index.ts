import webpack from 'webpack';
import Config from 'webpack-chain';
import { IApi } from 'umi';
import { ConfigType, ElectronBuilder } from '../../types';
import externalPackages from '../external-packages.config';
import path from 'path';
import { getBuildDir, getDevBuildDir, getMainSrc, getPreloadSrc } from '../../utils';

/**
 * 获取webpack配置
 * @param api
 * @param type
 */
export function getWebpackConfig(api: IApi, type: ConfigType): webpack.Configuration {
  const mode: 'none' | 'development' | 'production' = api.env === 'development' ? 'development' : 'production';
  const { externals, mainWebpackChain } = api.config
    .electronBuilder as ElectronBuilder;

  const external = [...externalPackages, ...externals];

  const config = new Config();
  config.mode(mode);
  config.node.set('__filename', false).set('__dirname', false);
  config.devtool(mode === 'development' ? 'inline-source-map' : false);
  config.resolve.extensions.add('.ts').add('.js').add('.node');
  config.module.rule('ts').exclude.add(/node_modules/);
  config.module.rule('ts').test(/\.ts?$/).use('ts').loader('ts-loader');
  config
    .resolve
    .alias
    .set('@/common', path.join(process.cwd(), 'src/common'));

  config.externals(external);
  config.output.path(mode === 'development' ? getDevBuildDir(api) : getBuildDir(api));

  if (type === 'main') {
    config
      .resolve
      .alias
      .set('@', getMainSrc(api));

    config.context(getMainSrc(api));

    config.entry('main').add('./index.ts');

    config.output.filename('main.js');

    config.target('electron-main');

    config.output.library('main').libraryTarget('commonjs2');

    mainWebpackChain(config, 'main');
  } else {
    config
      .resolve
      .alias
      .set('@', getPreloadSrc(api));
    config.context(getPreloadSrc(api));

    config.entry('preload').add('./index.ts');

    config.output.filename('preload.js');

    config.target('electron-renderer');

    config.output.library('preload').libraryTarget('commonjs2');

    mainWebpackChain(config, 'preload');
  }

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
