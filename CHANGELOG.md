## <small>1.0.16 (2021-02-19)</small>

* mainSrc和outputDir修改为基于根目录
* 从1.0.15升级需要删除mainSrc配置
* mainSrc默认src/main，在main+renderer双目录结构下不需要在配置

## <small>1.0.15 (2021-02-17)</small>

* 适配main+renderer双目录结构，参考([main+renderer](https://github.com/BySlin/umi-plugin-electron-builder/tree/master/examples/main%2Brenderer))
* 增加mainSrc配置，路径基于APP_ROOT
* 去掉package.json中的electronWebpack配置
* 增加mainWebpackConfig配置，配置主进程Webpack
* 在非main+renderer双目录结构下与fastRefresh冲突，需关闭fastRefresh，原因待定

## <small>1.0.2 (2021-02-16)</small>

* 修复与umi ui兼容性问题

## <small>1.0.1 (2020-11-18)</small>

* 增加rendererTarget配置，支持Electron contextIsolation 上下文隔离

## <small>1.0.0 (2020-11-18)</small>

* 正式版发布

## <small>0.0.12 - 0.0.46 (2020-4-1 - 2020-11-6)</small>
* 测试版本，不推荐使用
