import { IApi, utils } from 'umi';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { debounce, getDevBuildDir, getMainSrc, getPreloadSrc, logProcess, logProcessErrorOutput } from '../utils';
import path from 'path';
import chalk from 'chalk';
import { build as viteBuild } from 'vite';
import { build as webpackBuild, getWebpackConfig } from './webpack';
import * as fse from 'fs-extra';
import { ElectronBuilder } from '../types';
import { getViteConfig } from './vite';

const { chokidar } = utils;

const electronPath = require('electron');

const TIMEOUT = 1000;

/**
 * 以开发模式运行
 * @param api
 */
export const runDev = async (api: IApi) => {
  const { buildType } = api.config
    .electronBuilder as ElectronBuilder;

  let spawnProcess: ChildProcessWithoutNullStreams | null = null;
  const runMain = debounce(() => {
    if (spawnProcess !== null) {
      spawnProcess.kill('SIGINT');
      spawnProcess = null;
    }

    spawnProcess = spawn(String(electronPath), [path.join(getDevBuildDir(api), 'main.js')]);
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
    if (buildType === 'webpack') {
      return webpackBuild(getWebpackConfig(api, 'main'));
    } else {
      return viteBuild(getViteConfig(api, 'main'));
    }
  };

  const buildMainDebounced = debounce(buildMain, TIMEOUT);

  const buildPreload = (): Promise<any> => {
    //preload目录存在才编译
    if (fse.pathExistsSync(getPreloadSrc(api))) {
      if (buildType === 'webpack') {
        return webpackBuild(getWebpackConfig(api, 'preload'));
      } else {
        return viteBuild(getViteConfig(api, 'preload'));
      }
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
      if (spawnProcess !== null && path.includes(getDevBuildDir(api))) {
        spawnProcess.kill('SIGINT');
        spawnProcess = null;
      }
    })
    .on('add', path => {
      if (path.includes(getDevBuildDir(api))) {
        return runMain();
      }

      if (spawnProcess !== undefined && path.includes('preload.js')) {
        return runPreload();
      }
    })
    .on('change', (path) => {
      if (path.includes(getMainSrc(api))) {
        return buildMainDebounced();
      }

      if (path.includes('main.js')) {
        return runMain();
      }

      if (path.includes(getPreloadSrc(api))) {
        return buildPreloadDebounced();
      }

      if (path.includes('preload.js')) {
        return runPreload();
      }
    });

  await runMain();
};

/**
 * 打包
 * @param api
 */
export const runBuild = async (api: IApi) => {
  const { buildType } = api.config
    .electronBuilder as ElectronBuilder;
  const preloadSrc = getPreloadSrc(api);

  if (buildType === 'webpack') {
    await webpackBuild(getWebpackConfig(api, 'main'));
    if (fse.pathExistsSync(preloadSrc)) {
      await webpackBuild(getWebpackConfig(api, 'preload'));
    }
  } else {
    await viteBuild(getViteConfig(api, 'main'));
    if (fse.pathExistsSync(preloadSrc)) {
      await viteBuild(getViteConfig(api, 'preload'));
    }
  }
};
