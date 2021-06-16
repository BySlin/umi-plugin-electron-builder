import { InlineConfig } from 'vite';
import { IApi } from 'umi';
export declare function getMainViteConfig(api: IApi): InlineConfig;
export declare function getPreloadViteConfig(api: IApi, inputFileName: string, outputFileName: string): InlineConfig;
