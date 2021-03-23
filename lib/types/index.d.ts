import { Configuration } from 'electron-builder';
import { InlineConfig } from 'vite';
export declare type ViteConfigType = 'main' | 'preload';
export interface ElectronBuilder {
    mainSrc: string;
    preloadSrc: string;
    externals: string[];
    outputDir: string;
    builderOptions: Configuration;
    routerMode: 'hash' | 'memory';
    rendererTarget: 'electron-renderer' | 'web';
    viteConfig: (config: InlineConfig, type: ViteConfigType) => void;
}
