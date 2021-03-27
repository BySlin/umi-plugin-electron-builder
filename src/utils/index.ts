import path from 'path';
import * as fse from 'fs-extra';
import { IApi, utils } from 'umi';
import chalk from 'chalk';
import { ChildProcess } from 'child_process';
import { ElectronBuilder } from '../types';

const { execa } = utils;

/**
 * 防抖动，避免方法重复执行
 * @param f 方法
 * @param ms 检测时间
 */
export function debounce(f: () => void, ms: number) {
  let isCoolDown = false;
  return () => {
    if (isCoolDown) return;
    f();
    isCoolDown = true;
    setTimeout(() => isCoolDown = false, ms);
  };
}

/**
 * 检查是否使用npm
 */
function isNpm() {
  const packageLockJsonPath = path.join(process.cwd(), 'package-lock.json');
  return fse.pathExistsSync(packageLockJsonPath);
}

/**
 * 检查是否使用yarn
 */
function isYarn() {
  const yarnLockPath = path.join(process.cwd(), 'yarn.lock');
  return fse.pathExistsSync(yarnLockPath);
}

/**
 * 安装依赖
 * @param pkgName 依赖名
 */
export function installRely(pkgName: string) {
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
    execa.commandSync(`npm i ${pkgName} --save-dev`, commandOpts);
  } else if (isYarn()) {
    execa.commandSync(`yarn add ${pkgName} --dev`, commandOpts);
  } else {
    execa.commandSync(`yarn add ${pkgName} --dev`, commandOpts);
  }
}


/**
 * 获取根项目package.json
 */
export function getRootPkg() {
  const pkg = fse.readJSONSync(path.join(process.cwd(), 'package.json'));
  if (pkg.devDependencies == null) {
    pkg.devDependencies = {};
  }
  return pkg;
}

/**
 * 获取依赖目录
 */
export function getNodeModulesPath() {
  return path.join(process.cwd(), 'node_modules');
}

/**
 * 获取主进程目录
 * @param api
 */
export function getMainSrc(api: IApi) {
  const { mainSrc } = api.config
    .electronBuilder as ElectronBuilder;
  return path.join(process.cwd(), mainSrc);
}

/**
 * 获取preload目录
 * @param api
 */
export function getPreloadSrc(api: IApi) {
  const { preloadSrc } = api.config
    .electronBuilder as ElectronBuilder;
  return path.join(process.cwd(), preloadSrc);
}

/**
 * 获取开发环境编译目录
 * @param api
 */
export function getDevBuildDir(api: IApi) {
  return path.join(api.paths.absTmpPath!, 'electron');
}

/**
 * 获取electron打包目录
 * @param api
 */
export function getBuildDir(api: IApi) {
  return path.join(getAbsOutputDir(api), 'bundled');
}

/**
 * 获取打包目录
 * @param api
 */
export function getAbsOutputDir(api: IApi) {
  const { outputDir } = api.config
    .electronBuilder as ElectronBuilder;
  return path.join(process.cwd(), outputDir);
}

export interface LineFilter {
  filter(line: string): boolean
}

/**
 * 过滤electron输出
 */
function filterText(s: string, lineFilter: LineFilter | null) {
  const lines = s
    .trim()
    .split(/\r?\n/)
    .filter(it => {
      if (lineFilter != null && !lineFilter.filter(it)) {
        return false;
      }

      // https://github.com/electron/electron/issues/4420
      // this warning can be safely ignored
      if (it.includes('Couldn\'t set selectedTextBackgroundColor from default ()')) {
        return false;
      }
      if (it.includes('Use NSWindow\'s -titlebarAppearsTransparent=YES instead.')) {
        return false;
      }
      return !it.includes('Warning: This is an experimental feature and could change at any time.')
        && !it.includes('No type errors found')
        && !it.includes('webpack: Compiled successfully.');
    });

  if (lines.length === 0) {
    return null;
  }
  return '  ' + lines.join(`\n  `) + '\n';
}

export function logProcessErrorOutput(label: 'Electron' | 'Renderer' | 'Main', childProcess: ChildProcess) {
  childProcess.stderr!!.on('data', data => {
    logProcess(label, data.toString(), chalk.red);
  });
}

export function logError(label: 'Electron' | 'Renderer' | 'Main', error: Error) {
  logProcess(label, error.stack || error.toString(), chalk.red);
}

export function logProcess(label: 'Electron' | 'Renderer' | 'Main', data: string | Buffer, labelColor: any, lineFilter: LineFilter | null = null) {
  const LABEL_LENGTH = 28;
  const log = filterText(data.toString(), lineFilter);
  if (log == null || log.length === 0 || log.trim().length === 0) {
    return;
  }

  process.stdout.write(
    labelColor.bold(`┏ ${label} ${'-'.repeat(LABEL_LENGTH - label.length - 1)}`) +
    '\n\n' + log + '\n' +
    labelColor.bold(`┗ ${'-'.repeat(LABEL_LENGTH)}`) +
    '\n',
  );
}
