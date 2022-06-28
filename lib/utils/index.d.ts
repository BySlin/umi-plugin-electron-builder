import { IApi } from 'umi';
export declare function setNpmClient(_npmClient: string): void;
export declare function debounce(f: () => void, ms: number): () => void;
export declare function installRely(pkgName: string): void;
export declare function getRootPkg(): any;
export declare function getNodeModulesPath(): string;
export declare function getMainSrc(api: IApi): string;
export declare function getPreloadSrc(api: IApi): string;
export declare function getDevBuildDir(api: IApi): string;
export declare function getBuildDir(api: IApi): string;
export declare function getAbsOutputDir(api: IApi): string;
export declare function filterText(s: string): string | null;
export declare function logError(label: 'Electron' | 'Renderer' | 'Main', error: Error): void;
export declare function logProcess(label: 'Electron' | 'Renderer' | 'Main', log: string, labelColor: any): void;
