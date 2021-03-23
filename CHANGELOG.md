## <small>2.0.0(2021-03-23)</small>
1、重构，不在基于Webpack，现在基于Vite

2、去掉electron-webpack，electron-webpack-ts依赖

3、主进程文件src/main/main.ts变更为src/main/index.ts

4、删除mainWebpackConfig，增加viteConfig，配置参考 https://vitejs.dev/config/

5、src/main/tsconfig.json变为可选

6、增加src/preload/index.ts（可选），src/preload/tsconfig.json（可选）

7、修复与fastRefresh冲突

8、默认配置alias

* main下

![img.png](img.png)

* preload下

![img_1.png](img_1.png)

* renderer下

![img_2.png](img_2.png)

## <small>1.x更新日志</small>
* [更新日志](https://github.com/BySlin/umi-plugin-electron-builder/blob/1.x/CHANGELOG.md)

