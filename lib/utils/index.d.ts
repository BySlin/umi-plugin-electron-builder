/// <reference types="node" />
import { IApi } from 'umi';
import { ChildProcess } from 'child_process';
export declare function debounce(f: () => void, ms: number): () => void;
export declare function installRely(pkgName: string): void;
export declare function getRootPkg(): any;
export declare function getNodeModulesPath(): string;
export declare function getMainSrc(api: IApi): string;
export declare function getPreloadSrc(api: IApi): string;
export declare function getDevBuildDir(api: IApi): string;
export declare function getBuildDir(api: IApi): string;
export declare function getAbsOutputDir(api: IApi): string;
export interface LineFilter {
    filter(line: string): boolean;
}
export declare function logProcessErrorOutput(label: 'Electron' | 'Renderer' | 'Main', childProcess: ChildProcess): void;
export declare function logError(label: 'Electron' | 'Renderer' | 'Main', error: Error): void;
export declare function logProcess(label: 'Electron' | 'Renderer' | 'Main', data: string | Buffer, labelColor: any, lineFilter?: LineFilter | null): void;
