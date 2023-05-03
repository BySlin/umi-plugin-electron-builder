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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  debounce: () => debounce,
  filterText: () => filterText,
  getAbsOutputDir: () => getAbsOutputDir,
  getBuildDir: () => getBuildDir,
  getBundledDir: () => getBundledDir,
  getDevBuildDir: () => getDevBuildDir,
  getMainSrc: () => getMainSrc,
  getNodeModulesPath: () => getNodeModulesPath,
  getPreloadSrc: () => getPreloadSrc,
  getRootPkg: () => getRootPkg,
  installRely: () => installRely,
  logError: () => logError,
  logProcess: () => logProcess,
  setNpmClient: () => setNpmClient
});
module.exports = __toCommonJS(utils_exports);
var import_utils = require("@umijs/utils");
var import_path = __toESM(require("path"));
var npmClient = "pnpm";
function setNpmClient(_npmClient) {
  if (_npmClient != null && _npmClient != "") {
    npmClient = _npmClient;
  }
}
function debounce(f, ms) {
  let isCoolDown = false;
  return () => {
    if (isCoolDown)
      return;
    f();
    isCoolDown = true;
    setTimeout(() => isCoolDown = false, ms);
  };
}
function installRely(pkgName) {
  const commandOpts = {
    cwd: process.cwd(),
    cleanup: true,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    env: {
      FORCE_COLOR: "true"
    }
  };
  switch (npmClient) {
    case "pnpm":
      import_utils.execa.execaCommandSync(`pnpm i ${pkgName} --save-dev`, commandOpts);
      break;
    case "npm":
      import_utils.execa.execaCommandSync(`npm i ${pkgName} --save-dev`, commandOpts);
      break;
    case "yarn":
      import_utils.execa.execaCommandSync(`yarn add ${pkgName} --dev`, commandOpts);
      break;
    default:
      import_utils.execa.execaCommandSync(`pnpm i ${pkgName} --save-dev`, commandOpts);
      break;
  }
}
function getRootPkg() {
  const pkg = import_utils.fsExtra.readJSONSync(import_path.default.join(process.cwd(), "package.json"));
  if (pkg.devDependencies == null) {
    pkg.devDependencies = {};
  }
  return pkg;
}
function getNodeModulesPath() {
  return import_path.default.join(process.cwd(), "node_modules");
}
function getMainSrc(api) {
  const { mainSrc } = api.config.electronBuilder;
  return import_path.default.join(process.cwd(), mainSrc);
}
function getPreloadSrc(api) {
  const { preloadSrc } = api.config.electronBuilder;
  return import_path.default.join(process.cwd(), preloadSrc);
}
function getDevBuildDir(api) {
  return import_path.default.join(api.paths.absTmpPath, "electron");
}
function getBuildDir(api) {
  return import_path.default.join(getAbsOutputDir(api), "electron");
}
function getBundledDir(api) {
  return import_path.default.join(getAbsOutputDir(api), "bundled");
}
function getAbsOutputDir(api) {
  const { outputDir } = api.config.electronBuilder;
  return import_path.default.join(process.cwd(), outputDir);
}
function filterText(s) {
  const lines = s.trim().split(/\r?\n/).filter((it) => {
    if (it.includes("Couldn't set selectedTextBackgroundColor from default ()")) {
      return false;
    }
    if (it.includes("Use NSWindow's -titlebarAppearsTransparent=YES instead.")) {
      return false;
    }
    if (it.includes("Debugger listening on")) {
      return false;
    }
    return !it.includes(
      "Warning: This is an experimental feature and could change at any time."
    ) && !it.includes("No type errors found") && !it.includes("webpack: Compiled successfully.");
  });
  if (lines.length === 0) {
    return null;
  }
  return "  " + lines.join(`
  `) + "\n";
}
function logError(label, error) {
  logProcess(label, error.stack || error.toString(), import_utils.chalk.red);
}
function logProcess(label, log, labelColor) {
  const LABEL_LENGTH = 28;
  if (log == null || log.length === 0 || log.trim().length === 0) {
    return;
  }
  process.stdout.write(
    labelColor.bold(
      `┏ ${label} ${"-".repeat(LABEL_LENGTH - label.length - 1)}`
    ) + "\n\n" + log + "\n" + labelColor.bold(`┗ ${"-".repeat(LABEL_LENGTH)}`) + "\n"
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  debounce,
  filterText,
  getAbsOutputDir,
  getBuildDir,
  getBundledDir,
  getDevBuildDir,
  getMainSrc,
  getNodeModulesPath,
  getPreloadSrc,
  getRootPkg,
  installRely,
  logError,
  logProcess,
  setNpmClient
});
