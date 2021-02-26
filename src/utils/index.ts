import path from 'path';
import * as fse from 'fs-extra';
import { utils } from 'umi';

const { execa } = utils;

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
