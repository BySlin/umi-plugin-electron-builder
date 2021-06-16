import webpack from 'webpack';
import { IApi } from 'umi';
export declare function getMainWebpackConfig(api: IApi): webpack.Configuration;
export declare function getPreloadWebpackConfig(api: IApi, inputFileName: string, outputFileName: string): webpack.Configuration;
export declare const build: (config: webpack.Configuration) => Promise<void>;
