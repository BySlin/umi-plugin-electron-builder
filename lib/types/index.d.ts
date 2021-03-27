import { Configuration } from 'electron-builder';
import { InlineConfig } from 'vite';
import Config from 'webpack-chain';
export declare type ConfigType = 'main' | 'preload';
export declare type BuildType = 'vite' | 'webpack';
export interface ElectronBuilder {
    buildType: BuildType;
    mainSrc: string;
    preloadSrc: string;
    externals: string[];
    outputDir: string;
    builderOptions: Configuration;
    routerMode: 'hash' | 'memory';
    rendererTarget: 'electron-renderer' | 'web';
    viteConfig: (config: InlineConfig, type: ConfigType) => void;
    mainWebpackChain: (config: Config, type: ConfigType) => void;
}
