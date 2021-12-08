import { Configuration } from 'electron-builder';
import { InlineConfig } from 'vite';
import Config from 'webpack-chain';
export declare type ConfigType = 'main' | 'preload';
export declare type BuildType = 'vite' | 'webpack';
export declare type LogType = 'normal' | 'error';
export declare type RouterMode = 'hash' | 'memory' | 'browser';
export declare type RendererTarget = 'electron-renderer' | 'web';
export interface ElectronBuilder {
    buildType: BuildType;
    mainSrc: string;
    preloadSrc: string;
    externals: string[];
    outputDir: string;
    builderOptions: Configuration;
    routerMode: RouterMode;
    rendererTarget: RendererTarget;
    debugPort: number;
    preloadEntry: {
        [key: string]: string;
    };
    viteConfig: (config: InlineConfig, type: ConfigType) => void;
    mainWebpackChain: (config: Config, type: ConfigType) => void;
    logProcess: (log: string, type: LogType) => void;
}
