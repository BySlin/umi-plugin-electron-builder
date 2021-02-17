import * as fse from 'fs-extra';
import * as path from 'path';
import { IApi, utils } from 'umi';
import { getFreePort } from 'electron-webpack/out/util';
import {
  DelayedFunction,
  getCommonEnv,
  logError,
  logProcess,
  logProcessErrorOutput,
} from 'electron-webpack/out/dev/devUtil';
import { HmrServer } from 'electron-webpack/out/electron-main-hmr/HmrServer';
import chalk from 'chalk';
import webpack, { Compiler, Configuration } from 'webpack';
import { spawn } from 'child_process';
import { getMainConfiguration } from 'electron-webpack/out/main';

const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { execa, yargs, lodash: { merge } } = utils;
const debug = require('debug')('electron-webpack');
let socketPath: string | null = null;

interface ElectronBuilder {
  //主进程src目录
  mainSrc: string;
  //node模块
  externals: string[];
  //打包目录
  outputDir: string;
  //打包参数
  builderOptions: any;
  //路由模式
  routerMode: 'hash' | 'memory'
  //页面构建目标
  rendererTarget: 'electron-renderer' | 'web';
  //主进程webpack配置
  mainWebpackConfig: (config: Configuration) => void;
}

export default function(api: IApi) {
  //根项目node_modules路径
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');

  //检测依赖是否安装
  const relys = ['electron', 'electron-builder', 'electron-webpack', 'electron-webpack-ts'];
  //需要安装的依赖
  const requiredRelys = [];
  for (let rely of relys) {
    //通过目录检查依赖是否安装
    if (!fse.pathExistsSync(path.join(nodeModulesPath, rely))) {
      requiredRelys.push(rely);
    }
  }

  //安装需要的依赖
  if (requiredRelys.length > 0) {
    installRely(requiredRelys.join(' '));
  }

  //依赖安装到根项目
  let rootPkg = getRootPkg();

  //将@types/node切换到electron对应的@types/node
  const electronPackageJson = fse.readJSONSync(path.join(nodeModulesPath, 'electron', 'package.json'));
  if (electronPackageJson.dependencies['@types/node'] !== rootPkg.devDependencies!['@types/node']) {
    const electronTypesNodeVersion = electronPackageJson.dependencies['@types/node'];
    installRely(`@types/node@${electronTypesNodeVersion}`);
  }

  //根项目pkg
  rootPkg = getRootPkg();
  let isUpdateRootPkg = false;

  //electron包名
  if (rootPkg.name == null) {
    rootPkg.name = 'electron_builder_app';
    isUpdateRootPkg = true;
  }
  //版本号
  if (rootPkg.version == null) {
    rootPkg.version = '0.0.1';
    isUpdateRootPkg = true;
  }

  //基于electron重新构建native模块
  if (rootPkg.scripts['rebuild-deps'] == null) {
    rootPkg.scripts['rebuild-deps'] = 'electron-builder install-app-deps';
    isUpdateRootPkg = true;
  }

  //以开发环境启动electron
  if (rootPkg.scripts['electron:dev'] == null) {
    rootPkg.scripts['electron:dev'] = 'umi dev electron';
    isUpdateRootPkg = true;
  }

  //打包electron windows平台
  if (rootPkg.scripts['electron:build:win'] == null) {
    rootPkg.scripts['electron:build:win'] = 'umi build electron --win';
    isUpdateRootPkg = true;
  }

  //打包electron mac平台
  if (rootPkg.scripts['electron:build:mac'] == null) {
    rootPkg.scripts['electron:build:mac'] = 'umi build electron --mac';
    isUpdateRootPkg = true;
  }

  //打包electron linux平台
  if (rootPkg.scripts['electron:build:linux'] == null) {
    rootPkg.scripts['electron:build:linux'] = 'umi build electron --linux';
    isUpdateRootPkg = true;
  }

  //更新package.json
  if (isUpdateRootPkg) {
    api.logger.info('update package.json');
    fse.writeFileSync(
      path.join(process.cwd(), 'package.json'),
      JSON.stringify(rootPkg, null, 2),
    );
  }

  api.describe({
    key: 'electronBuilder',
    config: {
      default: {
        mainSrc: 'src/main',
        builderOptions: {},
        externals: [],
        outputDir: 'dist_electron',
        routerMode: 'hash',
        rendererTarget: 'electron-renderer',
        mainWebpackConfig: () => {
        },
      },
      schema(joi) {
        return joi.object({
          mainSrc: joi.string(),
          outputDir: joi.string(),
          externals: joi.array(),
          builderOptions: joi.object(),
          routerMode: joi.string(),
          rendererTarget: joi.string(),
          mainWebpackConfig: joi.func(),
        });
      },
    },
  });

  const isElectron = api.args?._[0] === 'electron';
  if (!isElectron) {
    return;
  }

  api.modifyConfig((config) => {
    const {
      outputDir,
      externals,
      routerMode,
    } = config.electronBuilder as ElectronBuilder;
    config.outputPath = path.join(outputDir, 'bundled');
    //Electron模式下路由更改为hash|memory
    config.history = {
      type: routerMode,
    };

    const configExternals: any = {
      electron: `require('electron')`,
    };

    if (externals.length > 0) {
      for (const moduleName of externals) {
        configExternals[moduleName] = `require('${moduleName}')`;
      }
    }

    config.externals = { ...configExternals, ...config.externals };
    return config;
  });

  //配置ElectronTarget
  api.chainWebpack((config) => {
    const {
      rendererTarget,
    } = api.config.electronBuilder as ElectronBuilder;

    config.target(rendererTarget);
    return config;
  });

  //start dev electron
  api.onDevCompileDone(({ isFirstCompile }) => {
    checkMainProcess();
    if (isFirstCompile) {
      api.logger.info('start dev electron');
      runInDevMode(api)
        .catch(error => {
          console.error(error);
        });
    }
  });

  //build electron
  api.onBuildComplete(({ err }) => {
    checkMainProcess();
    if (err == null) {
      const { builderOptions, externals, outputDir } = api.config
        .electronBuilder as ElectronBuilder;

      const absOutputDir = path.join(api.cwd, outputDir);

      const buildPkg = getRootPkg();
      buildPkg.main = 'main.js';

      delete buildPkg.scripts;
      delete buildPkg.devDependencies;
      Object.keys(buildPkg.dependencies!).forEach((dependency) => {
        if (!externals.includes(dependency)) {
          delete buildPkg.dependencies![dependency];
        }
      });

      const buildDependencies = [
        'source-map-support',
        'electron-devtools-installer',
      ];

      for (const dep of buildDependencies) {
        let depPackageJsonPath = path.join(nodeModulesPath, dep, 'package.json');
        if (fse.existsSync(depPackageJsonPath)) {
          buildPkg.dependencies![dep] = require(depPackageJsonPath).version;
        } else {
          buildPkg.dependencies![dep] = require(path.join(
            process.cwd(),
            'node_modules',
            dep,
            'package.json',
          )).version;
        }
      }

      // Prevent electron-builder from installing app deps
      fse.ensureDirSync(`${absOutputDir}/bundled/node_modules`);

      fse.writeFileSync(
        `${absOutputDir}/bundled/package.json`,
        JSON.stringify(buildPkg, null, 2),
      );

      const defaultBuildConfig = {
        directories: {
          output: absOutputDir,
          app: `${absOutputDir}/bundled`,
        },
        files: ['**'],
        extends: null,
      };

      api.logger.info('build main process');
      runInMainBuild(api)
        .then(() => {
          //打包electron
          api.logger.info('build electron');
          const configureBuildCommand = require('electron-builder/out/builder')
            .configureBuildCommand;
          const builderArgs = yargs
            .command(['build', '*'], 'Build', configureBuildCommand)
            .parse(process.argv);
          require('electron-builder')
            .build(merge({
              config: merge(
                defaultBuildConfig,
                builderOptions,
              ),
              ...builderArgs,
            }))
            .then(() => {
              api.logger.info('build electron success');
            });
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  //获取根项目package.json
  function getRootPkg() {
    const pkg = fse.readJSONSync(path.join(process.cwd(), 'package.json'));
    if (pkg.devDependencies == undefined) {
      pkg.devDependencies = {};
    }
    return pkg;
  }

  //检测主进程相关文件是否存在
  function checkMainProcess() {
    const { mainSrc } = api.config.electronBuilder as ElectronBuilder;
    const mainPath = path.join(api.cwd, mainSrc);

    if (!fse.pathExistsSync(mainPath)) {
      fse.copySync(path.join(__dirname, '..', 'template'), mainPath);
    }
  }

  //检测是否使用npm
  function isNpm() {
    const packageLockJsonPath = path.join(process.cwd(), 'package-lock.json');
    return fse.pathExistsSync(packageLockJsonPath);
  }

  //检测是否使用yarn
  function isYarn() {
    const yarnLockPath = path.join(process.cwd(), 'yarn.lock');
    return fse.pathExistsSync(yarnLockPath);
  }

  //安装依赖
  function installRely(command: string) {
    const commandOpts: any = {
      cwd: process.cwd(),
      cleanup: true,
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
      env: {
        FORCE_COLOR: 'true',
      },
    };
    if (isNpm()) {
      execa.commandSync(`npm i ${command} --save-dev`, commandOpts);
    } else if (isYarn()) {
      execa.commandSync(`yarn add ${command} --dev`, commandOpts);
    } else {
      execa.commandSync(`yarn add ${command} --dev`, commandOpts);
    }
  }
}

/**
 * 从dev启动electron
 * @param api
 */
async function runInDevMode(api: IApi) {
  const wdsHost = 'localhost';
  const wdsPort = await getFreePort(wdsHost, 9080);
  const env = {
    ...getCommonEnv(),
    ELECTRON_WEBPACK_WDS_HOST: wdsHost,
    ELECTRON_WEBPACK_WDS_PORT: wdsPort,
  };

  const hmrServer = new HmrServer();
  await Promise.all([
    hmrServer.listen()
      .then(it => {
        socketPath = it;
      }),
    startMainDevWatch(api, hmrServer),
  ]);

  hmrServer.ipc.on('error', (error: Error) => {
    logError('Main', error);
  });

  const electronArgs = process.env.ELECTRON_ARGS;
  const args = electronArgs != null && electronArgs.length > 0 ? JSON.parse(electronArgs) : [`--inspect=${await getFreePort('127.0.0.1', 5858)}`];
  args.push(path.join(api.paths.absTmpPath!, 'main/main.js'));
  // Pass remaining arguments to the application. Remove 3 instead of 2, to remove the `dev` argument as well.
  args.push(...process.argv.slice(3));
  // we should start only when both start and main are started
  startElectron(args, env);
}

/**
 * 打包主进程
 * @param api
 */
async function runInMainBuild(api: IApi) {
  const { outputDir, mainWebpackConfig } = api.config
    .electronBuilder as ElectronBuilder;
  const absOutputDir = path.join(api.cwd, outputDir);

  const mainConfig = await getMainConfig(api, true);

  mainConfig.output!.path = path.join(absOutputDir, 'bundled');

  //自定义主进程配置
  mainWebpackConfig(mainConfig);

  await new Promise<void>((resolve, reject) => {
    const compiler: Compiler = webpack(mainConfig!!);

    compiler.run((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * 启动主进程并监听主进程变化
 * @param api
 * @param hmrServer
 */
async function startMainDevWatch(api: IApi, hmrServer: HmrServer) {
  const {
    mainWebpackConfig,
  } = api.config.electronBuilder as ElectronBuilder;

  const mainConfig = await getMainConfig(api, false);
  //修改dev模式下主进程编译目录为src/.umi/main
  mainConfig.output!.path = path.join(api.paths.absTmpPath!, 'main');

  //自定义主进程配置
  mainWebpackConfig(mainConfig);

  // @ts-ignore
  await new Promise((resolve: (() => void) | null, reject: ((error: Error) => void) | null) => {
    const compiler: Compiler = webpack(mainConfig);

    const printCompilingMessage = new DelayedFunction(() => {
      logProcess('Main', 'Compiling...', chalk.yellow);
    });
    compiler.hooks.compile.tap('electron-webpack-dev-runner', () => {
      hmrServer.beforeCompile();
      printCompilingMessage.schedule();
    });

    let watcher: Compiler.Watching | null = compiler.watch({}, (error, stats) => {
      printCompilingMessage.cancel();

      if (watcher == null) {
        return;
      }

      if (error != null) {
        if (reject == null) {
          logError('Main', error);
        } else {
          reject(error);
          reject = null;
        }
        return;
      }

      logProcess('Main', stats.toString({
        colors: true,
      }), chalk.yellow);

      if (resolve != null) {
        resolve();
        resolve = null;
        return;
      }

      hmrServer.built(stats);
    });

    require('async-exit-hook')((callback: () => void) => {
      debug(`async-exit-hook: ${callback == null}`);
      const w = watcher;
      if (w == null) {
        return;
      }

      watcher = null;
      w.close(() => callback());
    });
  });
}

/**
 * 获取主进程配置
 * @param api
 * @param production
 */
async function getMainConfig(api: IApi, production: boolean) {
  const { mainSrc } = api.config.electronBuilder as ElectronBuilder;

  const mainConfig = await getMainConfiguration({
    configuration: {
      projectDir: process.cwd(),
      main: {
        sourceDirectory: path.join(api.cwd, mainSrc),
      },
    },
    production,
    autoClean: false,
    forkTsCheckerLogger: {
      info: () => {
        // ignore
      },

      warn: (message: string) => {
        logProcess('Main', message, chalk.yellow);
      },

      error: (message: string) => {
        logProcess('Main', message, chalk.red);
      },
    },
  });
  mainConfig?.plugins?.push(new ProgressBarPlugin());
  return mainConfig!!;
}

/**
 * 启动Electron
 * @param electronArgs
 * @param env
 */
function startElectron(electronArgs: Array<string>, env: any) {
  const electronProcess = spawn(require('electron').toString(), electronArgs, {
    env: {
      ...env,
      ELECTRON_HMR_SOCKET_PATH: socketPath,
    },
  });

  // required on windows
  require('async-exit-hook')(() => {
    electronProcess.kill('SIGINT');
  });

  let queuedData: string | null = null;
  electronProcess.stdout.on('data', data => {
    data = data.toString();
    // do not print the only line - doesn't make sense
    if (data.trim() === '[HMR] Updated modules:') {
      queuedData = data;
      return;
    }

    if (queuedData != null) {
      data = queuedData + data;
      queuedData = null;
    }

    logProcess('Electron', data, chalk.blue);
  });

  logProcessErrorOutput('Electron', electronProcess);

  electronProcess.on('close', exitCode => {
    debug(`Electron exited with exit code ${exitCode}`);
    if (exitCode === 100) {
      setImmediate(() => {
        startElectron(electronArgs, env);
      });
    } else {
      (process as any).emit('message', 'shutdown');
    }
  });
}
