import { chalk, fsExtra, lodash } from '@umijs/utils';

import * as path from 'path';
import { IApi } from 'umi';
import yargs from 'yargs';
import { runBuild, runDev } from './compile';
import externalPackages from './external-packages.config';
import setup from './setup';
import { ElectronBuilder, LogType } from './types';
import {
  getAbsOutputDir,
  getBuildDir,
  getBundledDir,
  getMainSrc,
  getNodeModulesPath,
  getPreloadSrc,
  getRootPkg,
  logProcess,
} from './utils';

const defaultConfig = {
  buildType: 'vite',
  parallelBuild: false,
  mainSrc: 'src/main',
  preloadSrc: 'src/preload',
  builderOptions: {},
  externals: [],
  outputDir: 'dist_electron',
  routerMode: 'hash',
  rendererTarget: 'web',
  debugPort: 5858,
  preloadEntry: {
    'index.ts': 'preload.js',
  },
  viteConfig: () => {},
  mainWebpackChain: () => {},
  logProcess: (log: string, type: LogType) => {
    if (type === 'normal') {
      logProcess('Main', log, chalk.blue);
    } else if (type === 'error') {
      logProcess('Main', log, chalk.red);
    }
  },
};

export default function (api: IApi) {
  // 检查环境并安装配置
  setup(api);

  api.describe({
    key: 'electronBuilder',
    config: {
      default: defaultConfig,
      schema({ zod }) {
        return zod.object({
          buildType: zod.enum(['vite', 'webpack']).optional(),
          parallelBuild: zod.boolean().optional(),
          mainSrc: zod.string().optional(),
          preloadSrc: zod.string().optional(),
          outputDir: zod.string().optional(),
          externals: zod.string().array().optional(),
          builderOptions: zod.record(zod.string(), zod.any()).optional(),
          routerMode: zod.enum(['hash', 'memory', 'browser']).optional(),
          rendererTarget: zod.enum(['electron-renderer', 'web']).optional(),
          debugPort: zod.number().optional(),
          preloadEntry: zod.record(zod.string(), zod.string()).optional(),
          viteConfig: zod
            .function()
            .args(zod.any(), zod.enum(['main', 'preload']))
            .returns(zod.void())
            .optional(),
          mainWebpackChain: zod
            .function()
            .args(zod.any(), zod.enum(['main', 'preload']))
            .returns(zod.void())
            .optional(),
          logProcess: zod
            .function()
            .args(zod.string(), zod.enum(['normal', 'error']))
            .returns(zod.void())
            .optional(),
        });
      },
    },
  });

  //初始化模板
  api.registerCommand({
    name: 'electron',
    fn({ args }) {
      const arg = args._[0];
      if (arg === 'init') {
        copyMainProcess();
      }
    },
  });

  const isElectron = api.args?._[0] === 'electron';
  if (!isElectron) {
    return;
  }

  api.modifyConfig((oldConfig) => {
    // console.log(oldConfig);
    const config = lodash.merge({ electronBuilder: defaultConfig }, oldConfig);
    // console.log(config);

    const { outputDir, externals, routerMode } =
      config.electronBuilder as ElectronBuilder;
    config.outputPath = process.env.APP_ROOT
      ? path.join('../..', outputDir, 'bundled')
      : path.join(outputDir, 'bundled');
    config.alias = config.alias || {};
    config.alias['@/common'] = path.join(process.cwd(), 'src/common');

    config.history = config.history || {
      type: routerMode,
    };
    config.history.type = routerMode;

    //umi4没有此功能
    // if (config.history.type === 'browser') {
    //   config.exportStatic = { dynamicRoot: true, htmlSuffix: true };
    // }

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

  // 配置页面Target ElectronTarget
  api.chainWebpack((config) => {
    const { rendererTarget } = api.config.electronBuilder as ElectronBuilder;
    config.target(rendererTarget);

    if (process.env.PROGRESS !== 'none') {
      // config
      //   .plugin('progress')
      //   .use(require.resolve('@umijs/deps/compiled/webpackbar'), [
      //     {
      //       name: 'electron-renderer',
      //     },
      //   ]);
    }
    return config;
  });

  // start dev electron
  api.onStart(() => {
    const { parallelBuild } = api.config.electronBuilder as ElectronBuilder;
    if (parallelBuild) {
      runBuild(api).catch((error) => {
        console.error(error);
      });
    }
  });

  // start dev electron
  api.onDevCompileDone(({ isFirstCompile }) => {
    if (isFirstCompile) {
      runDev(api).catch((error) => {
        console.error(error);
      });
    }
  });

  // build electron
  api.onBuildComplete(({ err }) => {
    const { parallelBuild } = api.config.electronBuilder as ElectronBuilder;

    if (err == null) {
      if (parallelBuild) {
        buildDist();
      } else {
        runBuild(api)
          .then(buildDist)
          .catch((error) => {
            console.error(error);
          });
      }
    }
  });

  /**
   * 打包
   */
  function buildDist() {
    const { builderOptions, externals } = api.config
      .electronBuilder as ElectronBuilder;

    const absOutputDir = getAbsOutputDir(api);
    const buildPkg = getRootPkg();
    buildPkg.main = 'main.js';

    delete buildPkg.scripts;
    delete buildPkg.devDependencies;

    //删除不需要的依赖
    Object.keys(buildPkg.dependencies!).forEach((dependency) => {
      if (
        !externals.includes(dependency) ||
        !externalPackages.includes(dependency)
      ) {
        delete buildPkg.dependencies![dependency];
      }
    });

    externals.forEach((external) => {
      if (!buildPkg.dependencies![external]) {
        buildPkg.dependencies![external] = require(path.join(
          process.cwd(),
          'node_modules',
          external,
          'package.json',
        ))?.version;
      }
    });

    //处理内置依赖
    const buildDependencies: string[] = [];
    for (const dep of buildDependencies) {
      const depPackageJsonPath = path.join(
        getNodeModulesPath(),
        dep,
        'package.json',
      );
      if (fsExtra.existsSync(depPackageJsonPath)) {
        buildPkg.dependencies![dep] = require(depPackageJsonPath).version;
      } else {
        buildPkg.dependencies![dep] = require(path.join(
          process.cwd(),
          'node_modules',
          dep,
          'package.json',
        ))?.version;
      }
    }

    const buildDir = getBuildDir(api);

    fsExtra.copySync(buildDir, getBundledDir(api), { overwrite: true });
    fsExtra.rmSync(buildDir, { recursive: true, force: true });

    // Prevent electron-builder from installing app deps
    fsExtra.ensureDirSync(`${absOutputDir}/bundled/node_modules`);

    fsExtra.writeFileSync(
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

    // 打包electron
    api.logger.info('build electron');
    const { configureBuildCommand } = require('electron-builder/out/builder');
    const builderArgs = yargs
      .command(['build', '*'], 'Build', configureBuildCommand)
      .parse(process.argv);
    require('electron-builder')
      .build(
        lodash.merge({
          config: lodash.merge(defaultBuildConfig, builderOptions),
          ...builderArgs,
        }),
      )
      .then(() => {
        api.logger.info('build electron success');
        process.exit();
      });
  }

  // 检测主进程相关文件是否存在,不存在则复制模板到主进程目录
  function copyMainProcess() {
    const mainSrc = getMainSrc(api);
    if (!fsExtra.pathExistsSync(mainSrc)) {
      fsExtra.copySync(
        path.join(__dirname, '..', 'template', 'main'),
        mainSrc,
        {
          overwrite: true,
        },
      );
    }

    const preloadSrc = getPreloadSrc(api);
    if (!fsExtra.pathExistsSync(preloadSrc)) {
      fsExtra.copySync(
        path.join(__dirname, '..', 'template', 'preload'),
        preloadSrc,
        { overwrite: true },
      );
    }
  }
}
