import { Configuration } from 'electron-builder';
import { InlineConfig } from 'vite';
import Config from 'webpack-chain';

export type ConfigType = 'main' | 'preload';

export type BuildType = 'vite' | 'webpack';

export interface ElectronBuilder {
  // 使用Vite或Webpack编译主进程
  buildType: BuildType;
  // 主进程src目录
  mainSrc: string;
  // preload src目录
  preloadSrc: string;
  // node模块
  externals: string[];
  // 打包目录
  outputDir: string;
  // 打包参数
  builderOptions: Configuration;
  // 路由模式
  routerMode: 'hash' | 'memory';
  // 页面构建目标
  rendererTarget: 'electron-renderer' | 'web';
  // 主进程vite配置
  viteConfig: (config: InlineConfig, type: ConfigType) => void;
  // 主进程webpack配置
  mainWebpackChain: (config: Config, type: ConfigType) => void;
}
