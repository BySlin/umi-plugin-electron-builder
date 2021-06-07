import { InlineConfig } from 'vite';
import { IApi } from 'umi';
import { ConfigType, ElectronBuilder } from '../../types';
import externalPackages from '../../external-packages.config';
import * as path from 'path';
import {
  getBuildDir,
  getDevBuildDir,
  getMainSrc,
  getPreloadSrc,
} from '../../utils';

/**
 * 获取vite配置
 * @param api
 * @param type
 */
export function getViteConfig(api: IApi, type: ConfigType): InlineConfig {
  const mode = api.env || 'development';
  const { externals, viteConfig } = api.config
    .electronBuilder as ElectronBuilder;

  const external = [...externalPackages, ...externals];

  if (type === 'main') {
    const mainConfig: InlineConfig = {
      mode,
      resolve: {
        alias: {
          '@/common': path.join(process.cwd(), 'src/common'),
          '@': getMainSrc(api),
        },
      },
      root: getMainSrc(api),
      build: {
        sourcemap: mode === 'development' ? 'inline' : false,
        outDir: mode === 'development' ? getDevBuildDir(api) : getBuildDir(api),
        assetsDir: '.',
        minify: mode !== 'development',
        lib: {
          entry: 'index.ts',
          formats: ['cjs'],
        },
        rollupOptions: {
          external,
          output: {
            entryFileNames: 'main.js',
          },
        },
        emptyOutDir: false,
      },
    };
    viteConfig(mainConfig, 'main');
    return mainConfig;
  } else {
    const preloadConfig: InlineConfig = {
      mode,
      resolve: {
        alias: {
          '@/common': path.join(process.cwd(), 'src/common'),
          '@': getPreloadSrc(api),
        },
      },
      root: getPreloadSrc(api),
      build: {
        sourcemap: mode === 'development' ? 'inline' : false,
        outDir: mode === 'development' ? getDevBuildDir(api) : getBuildDir(api),
        assetsDir: '.',
        minify: mode !== 'development',
        lib: {
          entry: 'index.ts',
          formats: ['cjs'],
        },
        rollupOptions: {
          external,
          output: {
            entryFileNames: 'preload.js',
          },
        },
        emptyOutDir: false,
      },
    };
    viteConfig(preloadConfig, 'preload');
    return preloadConfig;
  }
}
