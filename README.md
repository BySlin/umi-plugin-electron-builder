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
  }
}
```

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
