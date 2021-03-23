import { Configuration } from 'electron-builder';
import { InlineConfig } from 'vite';

export type ViteConfigType = 'main' | 'preload';

export interface ElectronBuilder {
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
  // vite配置
  viteConfig: (config: InlineConfig, type: ViteConfigType) => void;
}
