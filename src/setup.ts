import path from 'path';
import { getNodeModulesPath, getRootPkg, installRely } from './utils';
import * as fse from 'fs-extra';
import type { IApi } from 'umi';

/**
 * 检查环境是否满足运行，不满足则自动配置环境
 * @param api
 */
export default (api: IApi) => {
  // 根项目node_modules路径
  const nodeModulesPath = getNodeModulesPath();
  // 依赖安装到根项目
  let rootPkg = getRootPkg();
  // 必须安装的依赖
  const requiredDependencies = ['electron', 'electron-builder', 'electron-webpack', 'electron-webpack-ts'];
  // 需要安装的依赖
  const installDependencies = [];
  for (const dep of requiredDependencies) {
    // 通过package.json检查依赖是否安装
    if (rootPkg.devDependencies[dep] == null) {
      installDependencies.push(dep);
    }
  }

  // 安装需要的依赖
  if (installDependencies.length > 0) {
    installRely(installDependencies.join(' '));
  }

  // 依赖安装到根项目
  rootPkg = getRootPkg();

  // 将@types/node切换到electron对应的@types/node
  const electronPackageJson = fse.readJSONSync(path.join(nodeModulesPath, 'electron', 'package.json'));
  if (electronPackageJson.dependencies['@types/node'] !== rootPkg.devDependencies!['@types/node']) {
    const electronTypesNodeVersion = electronPackageJson.dependencies['@types/node'];
    installRely(`@types/node@${electronTypesNodeVersion}`);
  }

  // 根项目pkg
  rootPkg = getRootPkg();
  let isUpdateRootPkg = false;

  // electron包名
  if (rootPkg.name == null) {
    rootPkg.name = 'electron_builder_app';
    isUpdateRootPkg = true;
  }
  // 版本号
  if (rootPkg.version == null) {
    rootPkg.version = '0.0.1';
    isUpdateRootPkg = true;
  }

  // 基于electron重新构建native模块
  if (rootPkg.scripts['rebuild-deps'] == null) {
    rootPkg.scripts['rebuild-deps'] = 'electron-builder install-app-deps';
    isUpdateRootPkg = true;
  }

  // 以开发环境启动electron
  if (rootPkg.scripts['electron:dev'] == null) {
    rootPkg.scripts['electron:dev'] = 'umi dev electron';
    isUpdateRootPkg = true;
  }

  // 打包electron windows平台
  if (rootPkg.scripts['electron:build:win'] == null) {
    rootPkg.scripts['electron:build:win'] = 'umi build electron --win';
    isUpdateRootPkg = true;
  }

  // 打包electron mac平台
  if (rootPkg.scripts['electron:build:mac'] == null) {
    rootPkg.scripts['electron:build:mac'] = 'umi build electron --mac';
    isUpdateRootPkg = true;
  }

  // 打包electron linux平台
  if (rootPkg.scripts['electron:build:linux'] == null) {
    rootPkg.scripts['electron:build:linux'] = 'umi build electron --linux';
    isUpdateRootPkg = true;
  }

  // 更新package.json
  if (isUpdateRootPkg) {
    api.logger.info('update package.json');
    fse.writeFileSync(
      path.join(process.cwd(), 'package.json'),
      JSON.stringify(rootPkg, null, 2),
    );
  }
}
