import { getMainConfiguration } from 'electron-webpack';
import path from 'path';
import { logProcess } from 'electron-webpack/out/dev/devUtil';
import chalk from 'chalk';

const ProgressBarPlugin = require('progress-bar-webpack-plugin');

/**
 * 获取主进程配置
 * @param mainSrc 主进程src目录
 * @param production 是否生产环境
 */
export async function getMainWebpackConfig(mainSrc: string, production: boolean) {
  const mainConfig = await getMainConfiguration({
    configuration: {
      projectDir: process.cwd(),
      main: {
        sourceDirectory: path.join(process.cwd(), mainSrc),
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
