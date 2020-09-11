# umi-plugin-electron-builder
<a href="https://www.npmjs.com/package/umi-plugin-electron-builder"><img src="https://img.shields.io/npm/v/umi-plugin-electron-builder.svg?sanitize=true" alt="Version"></a>

本项目参考[vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)

## Installation

仅支持umi3
```
$ yarn add umi-plugin-electron-builder --dev
```

安装之后

执行umi dev electron 会生成相关文件

自动生成主进程文件src/main/main.ts

自动在package.json增加

```json
{
  "scripts": {
    "postinstall": "electron-builder install-app-deps",
    "postuninstall": "electron-builder install-app-deps",
    "electron:dev": "umi dev electron",
    "electron:build:win": "umi build electron --win",
    "electron:build:mac": "umi build electron --mac",
    "electron:build:linux": "umi build electron --linux"
  },
  "dependencies": {},
  "devDependencies": {
    "@babel/plugin-syntax-dynamic-import": "^7.8.3",
    "@types/electron-devtools-installer": "^2.2.0",
    "@types/node": "^12.12.57",
    "electron": "^10.1.1",
    "electron-builder": "^22.8.0",
    "electron-devtools-installer": "^3.1.1",
    "electron-webpack": "^2.8.2",
    "electron-webpack-ts": "^4.0.1",
    "typescript": "^4.0.2"
  },
  "electronWebpack": {
    "renderer": null
  },
  "name": "electron_builder_app",
  "version": "0.0.1",
  "main": "main.js"
}

```

### Electron 版本降级
你可以手动将package.json中的electron修改至低版本，插件与electron版本无关

## Usage

### 开发

```
$ umi dev electron
```

### 打包 
如报错请在对应系统上打包，路径不能有中文

```
//windows
$ umi build electron --win
//mac
$ umi build electron --mac
//linux
$ umi build electron --linux
//按平台打包
$ umi build electron --win --ia32    //32位
$ umi build electron --win --x64     //64位
$ umi build electron --win --armv7l  //arm32位
$ umi build electron --win --arm64   //arm64位
```

### 使用node环境下运行的模块

例：使用serialport插件

```
$ npm i serialport @types/serialport -S
```

.umirc.ts

```javascript
import {defineConfig} from 'umi';

export default defineConfig({
  electronBuilder: {
    routerMode: 'hash',         //路由 只能是hash或memory
    outputDir: 'dist_electron', //默认打包目录
    externals: ['serialport'],  //不配置的无法使用
    builderOptions: {
      appId: 'com.test.test',
      productName: '测试',
      publish: [
        {
          provider: 'generic',
          url: 'http://localhost/test',
        },
      ],
    }//electronBuilder参数
  },
  routes: [
    {path: '/', component: '@/pages/index'},
  ],
});
```

builderOptions[参考Electron Builder](https://www.electron.build/configuration/configuration)
