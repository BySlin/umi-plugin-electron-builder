# umi-plugin-electron-builder

<a href="https://www.npmjs.com/package/umi-plugin-electron-builder"><img src="https://img.shields.io/npm/v/umi-plugin-electron-builder.svg?sanitize=true" alt="Version"></a>


[更新日志](https://github.com/BySlin/umi-plugin-electron-builder/blob/main/CHANGELOG.md)

## 安装

仅支持 umi3

```
$ yarn add umi-plugin-electron-builder --dev
```

安装之后执行 umi electron init 生成主进程文件 src/main/index.ts

```
$ yarn electron:init
```

默认安装最新版本的 electron

自动在 package.json 增加

```json5
{
  scripts: {
    'rebuild-deps': 'electron-builder install-app-deps',
    'electron:init': 'umi electron init',
    'electron:dev': 'umi dev electron',
    'electron:build:win': 'umi build electron --win',
    'electron:build:mac': 'umi build electron --mac',
    'electron:build:linux': 'umi build electron --linux',
  },
  //这里需要修改成你自己的应用名称
  name: 'electron_builder_app',
  version: '0.0.1',
}
```

### Electron 版本降级

你可以手动将 package.json 中的 electron 修改至低版本，插件与 electron 版本无关

### 开发

```
$ yarn electron:dev
```

### 调试主进程（VS Code）

```json5
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node-terminal",
      "request": "launch",
      "name": "debug electron:dev",
      "command": "yarn electron:dev",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "sourceMapPathOverrides": {
        "webpack://main/./*": "${workspaceFolder}/src/main/*"
      },
      "resolveSourceMapLocations": [
        "${workspaceFolder}/src/.umi/electron/**",
        "${workspaceFolder}/src/renderer/.umi/electron/**"
      ],
      "autoAttachChildProcesses": true
    }
  ]
}
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

### 使用 node 环境下运行的模块

例：使用 serialport 插件

```
$ yarn add serialport @types/serialport
```

### 配置 .umirc.ts

```javascript
import { defineConfig } from 'umi';

export default defineConfig({
  electronBuilder: {
    //可选参数
    buildType: 'vite', //webpack或vite，当编译出现问题，可尝试切换为webpack
    mainSrc: 'src/main', //默认主进程目录
    preloadSrc: 'src/preload', //默认preload目录，可选，不需要可删除
    routerMode: 'hash', //路由 hash或memory或browser 仅electron下有效
    outputDir: 'dist_electron', //默认打包目录
    externals: ['serialport'], //node原生模块配置，打包之后找不到包也需要配置在这里
    rendererTarget: 'web', //构建目标electron-renderer或web，使用上下文隔离时，必须设置为web
    viteConfig(config: InlineConfig, type: ConfigType) {
      //主进程Vite配置
      //配置参考 https://vitejs.dev/config/
      //ConfigType分为main和preload可分别配置
    },
    //通过 webpack-chain 的 API 修改 webpack 配置。
    mainWebpackChain(config: Config, type: ConfigType) {
      //ConfigType分为main和preload可分别配置
      // if (type === 'main') {}
      // if (type === 'preload') {}
    },
    preloadEntry: {
      //默认值 key为preload文件名 值为preload输出文件名
      //输出文件名不能为main.js会和主进程文件名冲突
      //文件名为preload目录下多文件名
      //多级目录时key为xxxx/xxxx.ts
      //使用时输出文件会和主进程在同一目录下 preload: path.join(__dirname, 'preload.js')
      'index.ts': 'preload.js',
    },
    builderOptions: {
      //配置参考 https://www.electron.build/configuration/configuration
      appId: 'com.test.test',
      productName: '测试',
      publish: [
        {
          provider: 'generic',
          url: 'http://localhost/test',
        },
      ],
    }, //electronBuilder参数
  },
  routes: [{ path: '/', component: '@/pages/index' }],
});
```

在 Electron10 以上使用[contextIsolation](https://www.electronjs.org/docs/tutorial/context-isolation)时 rendererTarget 需要设置成
web

builderOptions[参考 Electron Builder](https://www.electron.build/configuration/configuration)

### 已知问题

esbuild 暂不支持 typescript decorator metadata

Vite 与 typeorm 冲突，typeorm 在主进程无法使用

相关 Issue https://github.com/evanw/esbuild/issues/257
