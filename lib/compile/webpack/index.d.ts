import { IApi } from 'umi';
import webpack from '@umijs/bundler-webpack/compiled/webpack';
export declare function getMainWebpackConfig(api: IApi): Configuration;
export declare function getPreloadWebpackConfig(api: IApi, inputFileName: string, outputFileName: string): webpack.Configuration;
export declare const build: (config: webpack.Configuration) => Promise<void>;
