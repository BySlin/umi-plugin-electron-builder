import * as fse from 'fs-extra';
import * as path from 'path';
import { IApi, utils } from 'umi';

const { execa, yargs, lodash: { merge } } = utils;

const electronWebpackCli = require.resolve('electron-webpack/out/cli');

interface ElectronBuilder {
  externals: string[];
  outputDir: string;
  builderOptions: any;
  routerMode: 'hash' | 'memory'
}

export default function(api: IApi) {
  const isElectron = api.args._[0] === 'electron';

  const commonOpts: any = {
    cwd: api.cwd,
    cleanup: true,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      FORCE_COLOR: 'true',
    },
  };

  if (api.pkg.devDependencies == undefined) {
    api.pkg.devDependencies = {};
  }

  //检测依赖是否安装
  const relys = ['electron', 'electron-builder', 'electron-webpack', 'electron-webpack-ts'];
  //需要安装的依赖
  const requiredRelys = [];
  for (let rely of relys) {
    if (api.pkg.devDependencies![rely] == null) {
      requiredRelys.push(rely);
    }
  }

  //安装需要的依赖
  if (requiredRelys.length > 0) {
    installRely(requiredRelys.join(' '));
    //将@types/node切换到electron对应的@types/node
    const electronPackageJson = fse.readJSONSync(path.join(api.paths.absNodeModulesPath!, 'electron', 'package.json'));
    if (electronPackageJson.dependencies['@types/node'] != api.pkg.devDependencies!['@types/node']) {
      const electronTypesNodeVersion = electronPackageJson.dependencies['@types/node'];
      installRely(`@types/node@${electronTypesNodeVersion}`);
    }
  }

  //重新读一遍package.json
  const pkg = fse.readJSONSync(path.join(api.paths.absSrcPath!, '..', 'package.json'));

  let isUpdatePkg = false;
  if (pkg.electronWebpack == null) {
    pkg.electronWebpack = {
      renderer: null,
    };
    isUpdatePkg = true;
  }
  if (pkg.name == null) {
    pkg.name = 'electron_builder_app';
    isUpdatePkg = true;
  }
  if (pkg.version == null) {
    pkg.version = '0.0.1';
    isUpdatePkg = true;
  }
  if (pkg.main !== 'main.js') {
    pkg.main = 'main.js';
    isUpdatePkg = true;
  }

  const installAppDeps = 'electron-builder install-app-deps';
  const scripts = ['postinstall', 'postuninstall'];

  for (let key of scripts) {
    if (pkg.scripts[key] == null) {
      pkg.scripts[key] = installAppDeps;
      isUpdatePkg = true;
    }
    if (pkg.scripts[key].indexOf(installAppDeps) == -1) {
      pkg.scripts[key] = `${pkg.scripts[key]} && ${installAppDeps}`;
      isUpdatePkg = true;
    }
  }

  if (pkg.scripts['electron:dev'] == null) {
    pkg.scripts['electron:dev'] = 'umi dev electron';
    isUpdatePkg = true;
  }

  if (pkg.scripts['electron:build:win'] == null) {
    pkg.scripts['electron:build:win'] = 'umi build electron --win';
    isUpdatePkg = true;
  }

  if (pkg.scripts['electron:build:mac'] == null) {
    pkg.scripts['electron:build:mac'] = 'umi build electron --mac';
    isUpdatePkg = true;
  }

  if (pkg.scripts['electron:build:linux'] == null) {
    pkg.scripts['electron:build:linux'] = 'umi build electron --linux';
    isUpdatePkg = true;
  }

  if (isUpdatePkg) {
    //更新package.json
    api.logger.info('update package.json');
    fse.writeFileSync(
      path.join(api.cwd, 'package.json'),
      JSON.stringify(pkg, null, 2),
    );
  }

  api.describe({
    key: 'electronBuilder',
    config: {
      default: {
        builderOptions: {},
        externals: [],
        outputDir: 'dist_electron',
        routerMode: 'hash',
      },
      schema(joi) {
        return joi.object({
          outputDir: joi.string(),
          externals: joi.array(),
          builderOptions: joi.object(),
          routerMode: joi.string(),
        });
      },
    },
  });

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
    config.target('electron-renderer');
    return config;
  });

  //start dev electron
  api.onDevCompileDone(({ isFirstCompile }) => {
    checkMainProcess();
    if (isFirstCompile) {
      api.logger.info('start dev electron');
      const child = execa.node(electronWebpackCli, ['dev'], commonOpts);
      child.on('close', () => {
        fse.removeSync(path.join(api.cwd, 'dist', 'main'));
        process.exit(0);
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
      const externalsPath = api.paths.absNodeModulesPath;

      delete api.pkg.scripts;
      delete api.pkg.devDependencies;
      delete api.pkg.electronWebpack;
      Object.keys(api.pkg.dependencies!).forEach((dependency) => {
        if (!externals.includes(dependency)) {
          delete api.pkg.dependencies![dependency];
        }
      });

      const buildDependencies = [
        'source-map-support',
        'electron-devtools-installer',
      ];

      for (const dep of buildDependencies) {
        let depPackageJsonPath = path.join(externalsPath!, dep, 'package.json');
        if (fse.existsSync(depPackageJsonPath)) {
          api.pkg.dependencies![dep] = require(depPackageJsonPath).version;
        } else {
          api.pkg.dependencies![dep] = require(path.join(
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
        JSON.stringify(api.pkg, null, 2),
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
      const child = execa.node(electronWebpackCli, ['main'], commonOpts);
      child.on('exit', () => {
        const distMainPath = path.join(api.cwd, 'dist', 'main');
        fse.moveSync(
          path.join(distMainPath, 'main.js'),
          path.join(absOutputDir, 'bundled', 'main.js'),
          {
            overwrite: true,
          },
        );
        fse.moveSync(
          path.join(distMainPath, 'main.js.map'),
          path.join(absOutputDir, 'bundled', 'main.js.map'),
          {
            overwrite: true,
          },
        );
        fse.removeSync(distMainPath);
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
      });
    }
  });

  //检测主进程相关文件是否存在
  function checkMainProcess() {
    const mainPath = path.join(api.paths.absSrcPath as string, 'main');
    if (!fse.pathExistsSync(mainPath)) {
      fse.copySync(path.join(__dirname, '..', 'template'), mainPath);
    }
  }

  //检测是否使用npm
  function isNpm() {
    const packageLockJsonPath = path.join(api.cwd, 'package-lock.json');
    return fse.pathExistsSync(packageLockJsonPath);
  }

  //检测是否使用yarn
  function isYarn() {
    const yarnLockPath = path.join(api.cwd, 'yarn.lock');
    return fse.pathExistsSync(yarnLockPath);
  }

  //安装依赖
  function installRely(command: string) {
    if (isNpm()) {
      execa.commandSync(`npm i ${command} --save-dev`, commonOpts);
    } else if (isYarn()) {
      execa.commandSync(`yarn add ${command} --dev`, commonOpts);
    } else {
      execa.commandSync(`yarn add ${command} --dev`, commonOpts);
    }
  }
}
