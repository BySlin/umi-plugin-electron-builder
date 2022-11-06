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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/compile/index.ts
var compile_exports = {};
__export(compile_exports, {
  runBuild: () => runBuild,
  runDev: () => runDev
});
module.exports = __toCommonJS(compile_exports);
var import_utils = require("@umijs/utils");
var import_child_process = require("child_process");
var fse = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));
var import_vite = require("vite");
var import_utils2 = require("../utils");
var import_vite2 = require("./vite");
var import_webpack = require("./webpack");
var TIMEOUT = 500;
var buildMain = (api) => {
  const { buildType } = api.config.electronBuilder;
  if (buildType === "webpack") {
    return (0, import_webpack.build)((0, import_webpack.getMainWebpackConfig)(api));
  } else {
    return (0, import_vite.build)((0, import_vite2.getMainViteConfig)(api));
  }
};
var buildPreload = (api) => {
  const { preloadEntry, buildType } = api.config.electronBuilder;
  if (fse.pathExistsSync((0, import_utils2.getPreloadSrc)(api))) {
    const tasks = [];
    if (buildType === "webpack") {
      for (let inputFileName in preloadEntry) {
        tasks.push((0, import_webpack.build)((0, import_webpack.getPreloadWebpackConfig)(api, inputFileName, preloadEntry[inputFileName])));
      }
    } else {
      for (let inputFileName in preloadEntry) {
        tasks.push((0, import_vite.build)((0, import_vite2.getPreloadViteConfig)(api, inputFileName, preloadEntry[inputFileName])));
      }
    }
    return Promise.all(tasks);
  }
  return Promise.resolve();
};
var runDev = async (api) => {
  const { logProcess, debugPort, parallelBuild } = api.config.electronBuilder;
  const electronPath = require(import_path.default.join((0, import_utils2.getNodeModulesPath)(), "electron"));
  let spawnProcess = null;
  const runMain = (0, import_utils2.debounce)(() => {
    if (spawnProcess !== null) {
      spawnProcess.kill("SIGKILL");
      spawnProcess = null;
    }
    spawnProcess = (0, import_child_process.spawn)(String(electronPath), [
      `--inspect=${debugPort}`,
      import_path.default.join((0, import_utils2.getDevBuildDir)(api), "main.js")
    ]);
    spawnProcess.stdout.on("data", (data) => {
      const log = (0, import_utils2.filterText)(data.toString());
      if (log) {
        logProcess(log, "normal");
      }
    });
    spawnProcess.stderr.on("data", (data) => {
      const log = (0, import_utils2.filterText)(data.toString());
      if (log) {
        logProcess(log, "error");
      }
    });
    spawnProcess.on("close", (code, signal) => {
      if (signal != "SIGKILL") {
        process.exit(-1);
      }
    });
    return spawnProcess;
  }, TIMEOUT);
  const buildMainDebounced = (0, import_utils2.debounce)(() => buildMain(api), TIMEOUT);
  const buildPreloadDebounced = (0, import_utils2.debounce)(() => buildPreload(api), TIMEOUT);
  const runPreload = (0, import_utils2.debounce)(() => {
  }, TIMEOUT);
  if (!parallelBuild) {
    await Promise.all([buildMain(api), buildPreload(api)]);
  }
  const watcher = import_utils.chokidar.watch([
    `${(0, import_utils2.getMainSrc)(api)}/**`,
    `${(0, import_utils2.getPreloadSrc)(api)}/**`,
    `${(0, import_utils2.getDevBuildDir)(api)}/**`
  ], { ignoreInitial: true });
  watcher.on("unlink", (path2) => {
    if (spawnProcess !== null && path2.includes((0, import_utils2.getDevBuildDir)(api))) {
      spawnProcess.kill("SIGINT");
      spawnProcess = null;
    }
  }).on("add", (path2) => {
    if (path2.includes((0, import_utils2.getDevBuildDir)(api))) {
      return runMain();
    }
    if (spawnProcess !== void 0 && path2.includes("preload.js")) {
      return runPreload();
    }
  }).on("change", (path2) => {
    if (path2.includes((0, import_utils2.getMainSrc)(api))) {
      return buildMainDebounced();
    }
    if (path2.includes("main.js")) {
      return runMain();
    }
    if (path2.includes((0, import_utils2.getPreloadSrc)(api))) {
      return buildPreloadDebounced();
    }
    if (path2.includes("preload.js")) {
      return runPreload();
    }
  });
  await runMain();
};
var runBuild = async (api) => {
  await buildMain(api);
  await buildPreload(api);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  runBuild,
  runDev
});
