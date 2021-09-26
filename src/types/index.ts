import { Configuration } from 'electron-builder';
import { InlineConfig } from 'vite';
import Config from 'webpack-chain';

export type ConfigType = 'main' | 'preload';

export type BuildType = 'vite' | 'webpack';

export type LogType = 'normal' | 'error';

export type RouterMode = 'hash' | 'memory' | 'browser';

export type RendererTarget = 'electron-renderer' | 'web';

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
  routerMode: RouterMode;
  // 页面构建目标
  rendererTarget: RendererTarget;
  // preload配置 key为输入文件名，值为输出文件名
  preloadEntry: { [key: string]: string };
  // 主进程vite配置
  viteConfig: (config: InlineConfig, type: ConfigType) => void;
  // 主进程webpack配置
  mainWebpackChain: (config: Config, type: ConfigType) => void;
  //自定义主进程输出
  logProcess: (log: string, type: LogType) => void;
}
