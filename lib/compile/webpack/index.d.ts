import webpack from 'webpack';
import { IApi } from 'umi';
import { ConfigType } from '../../types';
export declare function getWebpackConfig(api: IApi, type: ConfigType): webpack.Configuration;
export declare const build: (config: webpack.Configuration) => Promise<void>;
