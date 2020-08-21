# umi-plugin-electron-builder
<a href="https://www.npmjs.com/package/umi-plugin-electron-builder"><img src="https://img.shields.io/npm/v/umi-plugin-electron-builder.svg?sanitize=true" alt="Version"></a>

本项目参考[vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)

## Installation

仅支持umi3

```
$ npm i umi-plugin-electron-builder --save-dev
```

or

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
    "electron:pack": "umi build electron pack",
    "electron:dev": "umi dev electron",
    "electron:build": "umi build electron"
  },
  "devDependencies": {
    "@babel/plugin-syntax-dynamic-import": "^7.8.3",
    "@types/electron-devtools-installer": "^2.2.0",
    "@types/node": "^12.12.54",
    "electron": "^9.2.1",
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
第一次增加完成后，关闭Electron，再次执行yarn更鞋依赖，由于umijs自带@types/node版本过高，
与electron内置node版本不匹配，需要将@types/node的版本与electron内置node版本匹配，
版本不不匹配会产生ValidationError: ForkTsCheckerWebpackPlugin Invalid Options 报错

## Usage

### 开发

```
$ umi dev electron
```

### 打包

```
$ umi build electron pack
```

### 打包并封装安装包

```
$ umi build electron
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
