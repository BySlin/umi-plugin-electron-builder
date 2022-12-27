var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var fse = __toESM(require("fs-extra"));
var path = __toESM(require("path"));
var import_umi = require("umi");
var import_utils = require("./utils");
var import_compile = require("./compile");
var import_setup = __toESM(require("./setup"));
var import_external_packages = __toESM(require("./external-packages.config"));
var {
  yargs,
  chalk,
  lodash: { merge }
} = import_umi.utils;
function src_default(api) {
  var _a;
  (0, import_setup.default)(api);
  api.describe({
    key: "electronBuilder",
    config: {
      default: {
        buildType: "vite",
        parallelBuild: false,
        mainSrc: "src/main",
        preloadSrc: "src/preload",
        builderOptions: {},
        externals: [],
        outputDir: "dist_electron",
        routerMode: "hash",
        rendererTarget: "web",
        debugPort: 5858,
        preloadEntry: {
          "index.ts": "preload.js"
        },
        viteConfig: () => {
        },
        mainWebpackChain: () => {
        },
        logProcess: (log, type) => {
          if (type === "normal") {
            (0, import_utils.logProcess)("Main", log, chalk.blue);
          } else if (type === "error") {
            (0, import_utils.logProcess)("Main", log, chalk.red);
          }
        }
      },
      schema(joi) {
        return joi.object({
          buildType: joi.string(),
          parallelBuild: joi.boolean(),
          mainSrc: joi.string(),
          preloadSrc: joi.string(),
          outputDir: joi.string(),
          externals: joi.array(),
          builderOptions: joi.object(),
          routerMode: joi.string(),
          rendererTarget: joi.string(),
          debugPort: joi.number(),
          preloadEntry: joi.object(),
          viteConfig: joi.func(),
          mainWebpackChain: joi.func(),
          logProcess: joi.func()
        });
      }
    }
  });
  api.registerCommand({
    name: "electron",
    fn({ args }) {
      const arg = args._[0];
      if (arg === "init") {
        copyMainProcess();
      }
    }
  });
  const isElectron = ((_a = api.args) == null ? void 0 : _a._[0]) === "electron";
  if (!isElectron) {
    return;
  }
  api.modifyConfig((config) => {
    const { outputDir, externals, routerMode } = config.electronBuilder;
    config.outputPath = process.env.APP_ROOT ? path.join("../..", outputDir, "bundled") : path.join(outputDir, "bundled");
    config.alias = config.alias || {};
    config.alias["@/common"] = path.join(process.cwd(), "src/common");
    config.history = config.history || {
      type: routerMode
    };
    config.history.type = routerMode;
    if (config.history.type === "browser") {
      config.exportStatic = { dynamicRoot: true, htmlSuffix: true };
    }
    const configExternals = {
      electron: `require('electron')`
    };
    if (externals.length > 0) {
      for (const moduleName of externals) {
        configExternals[moduleName] = `require('${moduleName}')`;
      }
    }
    config.externals = { ...configExternals, ...config.externals };
    return config;
  });
  api.chainWebpack((config) => {
    const { rendererTarget } = api.config.electronBuilder;
    config.target(rendererTarget);
    if (process.env.PROGRESS !== "none") {
      config.plugin("progress").use(require.resolve("@umijs/deps/compiled/webpackbar"), [
        {
          name: "electron-renderer"
        }
      ]);
    }
    return config;
  });
  api.onStart(() => {
    const { parallelBuild } = api.config.electronBuilder;
    if (parallelBuild) {
      (0, import_compile.runBuild)(api).catch((error) => {
        console.error(error);
      });
    }
  });
  api.onDevCompileDone(({ isFirstCompile }) => {
    if (isFirstCompile) {
      (0, import_compile.runDev)(api).catch((error) => {
        console.error(error);
      });
    }
  });
  api.onBuildComplete(({ err }) => {
    const { parallelBuild } = api.config.electronBuilder;
    if (err == null) {
      if (parallelBuild) {
        buildDist();
      } else {
        (0, import_compile.runBuild)(api).then(buildDist).catch((error) => {
          console.error(error);
        });
      }
    }
  });
  function buildDist() {
    var _a2;
    const { builderOptions, externals } = api.config.electronBuilder;
    const absOutputDir = (0, import_utils.getAbsOutputDir)(api);
    const buildPkg = (0, import_utils.getRootPkg)();
    buildPkg.main = "main.js";
    delete buildPkg.scripts;
    delete buildPkg.devDependencies;
    Object.keys(buildPkg.dependencies).forEach((dependency) => {
      if (!externals.includes(dependency) || !import_external_packages.default.includes(dependency)) {
        delete buildPkg.dependencies[dependency];
      }
    });
    externals.forEach((external) => {
      var _a3;
      if (!buildPkg.dependencies[external]) {
        buildPkg.dependencies[external] = (_a3 = require(path.join(
          process.cwd(),
          "node_modules",
          external,
          "package.json"
        ))) == null ? void 0 : _a3.version;
      }
    });
    const buildDependencies = [];
    for (const dep of buildDependencies) {
      const depPackageJsonPath = path.join(
        (0, import_utils.getNodeModulesPath)(),
        dep,
        "package.json"
      );
      if (fse.existsSync(depPackageJsonPath)) {
        buildPkg.dependencies[dep] = require(depPackageJsonPath).version;
      } else {
        buildPkg.dependencies[dep] = (_a2 = require(path.join(
          process.cwd(),
          "node_modules",
          dep,
          "package.json"
        ))) == null ? void 0 : _a2.version;
      }
    }
    fse.ensureDirSync(`${absOutputDir}/bundled/node_modules`);
    fse.writeFileSync(
      `${absOutputDir}/bundled/package.json`,
      JSON.stringify(buildPkg, null, 2)
    );
    const defaultBuildConfig = {
      directories: {
        output: absOutputDir,
        app: `${absOutputDir}/bundled`
      },
      files: ["**"],
      extends: null
    };
    api.logger.info("build electron");
    const { configureBuildCommand } = require("electron-builder/out/builder");
    const builderArgs = yargs.command(["build", "*"], "Build", configureBuildCommand).parse(process.argv);
    require("electron-builder").build(
      merge({
        config: merge(defaultBuildConfig, builderOptions),
        ...builderArgs
      })
    ).then(() => {
      api.logger.info("build electron success");
      process.exit();
    });
  }
  function copyMainProcess() {
    const mainSrc = (0, import_utils.getMainSrc)(api);
    if (!fse.pathExistsSync(mainSrc)) {
      fse.copySync(path.join(__dirname, "..", "template", "main"), mainSrc, {
        overwrite: true
      });
    }
    const preloadSrc = (0, import_utils.getPreloadSrc)(api);
    if (!fse.pathExistsSync(preloadSrc)) {
      fse.copySync(
        path.join(__dirname, "..", "template", "preload"),
        preloadSrc,
        { overwrite: true }
      );
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
