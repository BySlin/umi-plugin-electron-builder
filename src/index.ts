import * as fse from 'fs-extra';
import * as path from 'path';
import type { IApi } from 'umi';
import { utils } from 'umi';
import { getAbsOutputDir, getMainSrc, getNodeModulesPath, getPreloadSrc, getRootPkg } from './utils';
import { runBuild, runDev } from './compile';
import { ElectronBuilder } from './types';
import setup from './setup';
import externalPackages from './external-packages.config';


const { yargs, lodash: { merge } } = utils;

export default function(api: IApi) {
  // 检查环境并安装配置
  setup(api);

  api.describe({
    key: 'electronBuilder',
    config: {
      default: {
        buildType: 'webpack',
        mainSrc: 'src/main',
        preloadSrc: 'src/preload',
        builderOptions: {},
        externals: [],
        outputDir: 'dist_electron',
        routerMode: 'hash',
        rendererTarget: 'web',
        viteConfig: () => {
        },
        mainWebpackChain: () => {
        },
      },
      schema(joi) {
        return joi.object({
          buildType: joi.string(),
          mainSrc: joi.string(),
          preloadSrc: joi.string(),
          outputDir: joi.string(),
          externals: joi.array(),
          builderOptions: joi.object(),
          routerMode: joi.string(),
          rendererTarget: joi.string(),
          viteConfig: joi.func(),
          mainWebpackChain: joi.func(),
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

  api.modifyConfig((config) => {
    const {
      outputDir,
      externals,
      routerMode,
    } = config.electronBuilder as ElectronBuilder;
    config.outputPath = process.env.APP_ROOT ? path.join('../..', outputDir, 'bundled') : path.join(outputDir, 'bundled');
    config.alias = config.alias || {};
    config.alias['@/common'] = path.join(process.cwd(), 'src/common');

    // Electron模式下路由更改为hash|memory
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

  // 配置页面Target ElectronTarget
  api.chainWebpack((config) => {
    const {
      rendererTarget,
    } = api.config.electronBuilder as ElectronBuilder;

    config.target(rendererTarget);
    return config;
  });

  // start dev electron
  api.onDevCompileDone(({ isFirstCompile }) => {
    if (isFirstCompile) {
      api.logger.info('start dev electron');
      runDev(api)
        .catch(error => {
          console.error(error);
        });
    }
  });

  // build electron
  api.onBuildComplete(({ err }) => {
    if (err == null) {
      const { builderOptions, externals } = api.config
        .electronBuilder as ElectronBuilder;

      const absOutputDir = getAbsOutputDir(api);

      const buildPkg = getRootPkg();
      buildPkg.main = 'main.js';

      delete buildPkg.scripts;
      delete buildPkg.devDependencies;
      Object.keys(buildPkg.dependencies!).forEach((dependency) => {
        if (!externals.includes(dependency) || !externalPackages.includes(dependency)) {
          delete buildPkg.dependencies![dependency];
        }
      });

      const buildDependencies = [
        'electron-devtools-installer',
      ];

      for (const dep of buildDependencies) {
        const depPackageJsonPath = path.join(getNodeModulesPath(), dep, 'package.json');
        if (fse.existsSync(depPackageJsonPath)) {
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
      runBuild(api)
        .then(() => {
          api.logger.info('build main process success');
          // 打包electron
          api.logger.info('build electron');
          const { configureBuildCommand } = require('electron-builder/out/builder');
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
              process.exit();
            });
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  // 检测主进程相关文件是否存在,不存在则复制模板到主进程目录
  function copyMainProcess() {
    const mainSrc = getMainSrc(api);
    if (!fse.pathExistsSync(mainSrc)) {
      fse.copySync(path.join(__dirname, '..', 'template', 'main'), mainSrc, { overwrite: true });
    }

    const preloadSrc = getPreloadSrc(api);
    if (!fse.pathExistsSync(preloadSrc)) {
      fse.copySync(path.join(__dirname, '..', 'template', 'preload'), preloadSrc, { overwrite: true });
    }
  }
}
