import { contextBridge } from 'electron';

const apiKey = 'electron';

const api: any = {
  versions: process.versions,
};

contextBridge.exposeInMainWorld(apiKey, api);
