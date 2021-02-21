## <small>1.0.16 (2021-02-19)</small>

* mainSrc和outputDir修改为基于根目录
* 从1.0.15升级需要删除mainSrc配置
* mainSrc默认src/main，在main+renderer双目录结构下不需要在配置

## <small>1.0.15 (2021-02-17)</small>

* 适配main+renderer双目录结构，参考([main+renderer](https://github.com/BySlin/umi-plugin-electron-builder/tree/master/examples/main%2Brenderer))
* 增加mainSrc配置，路径基于APP_ROOT
