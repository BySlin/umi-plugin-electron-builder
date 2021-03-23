import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { build, InlineConfig, normalizePath } from 'vite';
import { IApi } from 'umi';
import { ElectronBuilder, ViteConfigType } from '../types';
import externalPackages from './external-packages.config';
import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fse from 'fs-extra';
import { getBuildDir, getDevBuildDir, getMainSrc, getPreloadSrc, logProcess, logProcessErrorOutput } from '../utils';
import chalk from 'chalk';

const electronPath = require('electron');

const TIMEOUT = 500;

/**
 * 防抖动，避免方法重复执行
 * @param f 方法
 * @param ms 检测时间
 */
function debounce(f: () => void, ms: number) {
  let isCoolDown = false;
  return () => {
    if (isCoolDown) return;
    f();
    isCoolDown = true;
    setTimeout(() => isCoolDown = false, ms);
  };
}

/**
 * 获取vite配置
 * @param api
 * @param type
 */
function getViteConfig(api: IApi, type: ViteConfigType): InlineConfig {
  const mode = api.env || 'development';
  const { externals, viteConfig } = api.config
    .electronBuilder as ElectronBuilder;

  console.log(path.join(process.cwd(), 'src/common'));
  if (type === 'main') {
    const mainConfig: InlineConfig = {
      mode,
      resolve: {
        alias: {
          '@/common': path.join(process.cwd(), 'src/common'),
          '@': path.join(process.cwd(), 'src/main'),
        },
      },
      root: getMainSrc(api),
      build: {
        sourcemap: 'inline',
        outDir: mode === 'development' ? getDevBuildDir(api) : getBuildDir(api),
        assetsDir: '.',
        minify: mode !== 'development',
        lib: {
          entry: 'index.ts',
          formats: ['cjs'],
        },
        rollupOptions: {
          external: [...externalPackages, ...externals],
          output: {
            entryFileNames: 'main.cjs',
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
          '@': path.join(process.cwd(), 'src/preload'),
        },
      },
      root: getPreloadSrc(api),
      build: {
        sourcemap: 'inline',
        outDir: mode === 'development' ? getDevBuildDir(api) : getBuildDir(api),
        assetsDir: '.',
        minify: mode !== 'development',
        lib: {
          entry: 'index.ts',
          formats: ['cjs'],
        },
        rollupOptions: {
          external: [...externalPackages, ...externals],
          output: {
            entryFileNames: 'preload.cjs',
          },
        },
        emptyOutDir: false,
      },
    };
    viteConfig(preloadConfig, 'preload');
    return preloadConfig;
  }
}

/**
 * 开发环境下启动electron
 * @param api
 */
export const runDev = async (api: IApi) => {
  let spawnProcess: ChildProcessWithoutNullStreams | null = null;
  const runMain = debounce(() => {
    if (spawnProcess !== null) {
      spawnProcess.kill('SIGINT');
      spawnProcess = null;
    }

    spawnProcess = spawn(String(electronPath), [path.join(getDevBuildDir(api), 'main.cjs')]);
    spawnProcess.stdout.on('data', d => logProcess('Electron', d.toString(), chalk.blue));
    logProcessErrorOutput('Electron', spawnProcess);
    spawnProcess.on('close', (code, signal) => {
      if (signal != 'SIGINT') {
        process.exit(-1);
      }
    });

    return spawnProcess;

  }, TIMEOUT);

  const buildMain = () => {
    return build(getViteConfig(api, 'main'));
  };

  const buildMainDebounced = debounce(buildMain, TIMEOUT);

  const buildPreload = (): Promise<any> => {
    //preload目录存在才编译
    if (fse.pathExistsSync(getPreloadSrc(api))) {
      return build(getViteConfig(api, 'preload'));
    }
    return Promise.resolve();
  };

  const buildPreloadDebounced = debounce(buildPreload, TIMEOUT);

  const runPreload = debounce(() => {
    api.getServer().sockets.forEach(socket => {
      socket.write(JSON.stringify({
        type: 'ok',
        data: {
          reload: true,
        },
      }));
    });
  }, TIMEOUT);

  await Promise.all([
    buildMain(),
    buildPreload(),
  ]);

  const watcher = chokidar.watch([
    `${getMainSrc(api)}/**`,
    `${getPreloadSrc(api)}/**`,
    `${getDevBuildDir(api)}/**`,
  ], { ignoreInitial: true });

  watcher
    .on('unlink', path => {
      const normalizedPath = normalizePath(path);
      if (spawnProcess !== null && normalizedPath.includes(getDevBuildDir(api))) {
        spawnProcess.kill('SIGINT');
        spawnProcess = null;
      }
    })
    .on('add', path => {
      const normalizedPath = normalizePath(path);
      if (normalizedPath.includes(getDevBuildDir(api))) {
        return runMain();
      }

      if (spawnProcess !== undefined && normalizedPath.includes('preload.cjs')) {
        return runPreload();
      }
    })
    .on('change', (path) => {
      const normalizedPath = normalizePath(path);

      if (normalizedPath.includes(getMainSrc(api))) {
        return buildMainDebounced();
      }

      if (normalizedPath.includes('main.cjs')) {
        return runMain();
      }

      if (normalizedPath.includes(getPreloadSrc(api))) {
        return buildPreloadDebounced();
      }

      if (normalizedPath.includes('preload.cjs')) {
        return runPreload();
      }
    });

  await runMain();
};

/**
 * 打包主进程
 * @param api
 */
export const runBuild = async (api: IApi) => {
  await build(getViteConfig(api, 'main'));
  if (fse.pathExistsSync(getPreloadSrc(api))) {
    await build(getViteConfig(api, 'preload'));
  }
};
