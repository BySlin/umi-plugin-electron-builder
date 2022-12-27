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

// src/compile/webpack/index.ts
var webpack_exports = {};
__export(webpack_exports, {
  build: () => build,
  getMainWebpackConfig: () => getMainWebpackConfig,
  getPreloadWebpackConfig: () => getPreloadWebpackConfig
});
module.exports = __toCommonJS(webpack_exports);
var import_webpack = __toESM(require("@umijs/deps/compiled/webpack"));
var import_webpack_chain = __toESM(require("@umijs/deps/compiled/webpack-chain"));
var import_external_packages = __toESM(require("../../external-packages.config"));
var import_path = __toESM(require("path"));
var import_utils = require("../../utils");
function getBaseWebpackConfig(api) {
  const mode = api.env === "development" ? "development" : "production";
  const { externals } = api.config.electronBuilder;
  const external = [...import_external_packages.default, ...externals];
  const config = new import_webpack_chain.default();
  config.mode(mode);
  config.node.set("__filename", false).set("__dirname", false);
  config.devtool(mode === "development" ? "inline-source-map" : false);
  config.resolve.extensions.add(".ts").add(".js").add(".node");
  config.module.rule("ts").exclude.add(/node_modules/);
  config.module.rule("ts").test(/\.ts?$/).use("ts").loader("ts-loader").options({ transpileOnly: true });
  config.resolve.alias.set("@/common", import_path.default.join(process.cwd(), "src/common"));
  config.externals(external);
  config.output.path(
    mode === "development" ? (0, import_utils.getDevBuildDir)(api) : (0, import_utils.getBuildDir)(api)
  );
  if (api.config.mfsu != void 0 || api.config.webpack5 != void 0) {
    config.optimization.minimize(true).set("emitOnErrors", true).minimizer("terser").use(
      require("@umijs/bundler-webpack/lib/webpack/plugins/terser-webpack-plugin")
    );
  }
  return config;
}
function getMainWebpackConfig(api) {
  const { mainWebpackChain } = api.config.electronBuilder;
  const config = getBaseWebpackConfig(api);
  config.resolve.alias.set("@", (0, import_utils.getMainSrc)(api));
  config.context((0, import_utils.getMainSrc)(api));
  config.entry("main").add("./index.ts");
  config.output.filename("main.js");
  config.target("electron-main");
  config.output.library("main").libraryTarget("commonjs2");
  if (process.env.PROGRESS !== "none") {
    config.plugin("progress").use(require.resolve("@umijs/deps/compiled/webpackbar"), [
      {
        name: "electron-main",
        color: "#1890ff"
      }
    ]);
  }
  mainWebpackChain(config, "main");
  return config.toConfig();
}
function getPreloadWebpackConfig(api, inputFileName, outputFileName) {
  const { mainWebpackChain } = api.config.electronBuilder;
  const config = getBaseWebpackConfig(api);
  config.resolve.alias.set("@", (0, import_utils.getPreloadSrc)(api));
  config.context((0, import_utils.getPreloadSrc)(api));
  config.entry("preload").add(`./${inputFileName}`);
  config.output.filename(outputFileName);
  config.target("electron-renderer");
  config.output.library("preload").libraryTarget("commonjs2");
  if (process.env.PROGRESS !== "none") {
    config.plugin("progress").use(require.resolve("@umijs/deps/compiled/webpackbar"), [
      {
        name: "electron-preload",
        color: "#eb2f96"
      }
    ]);
  }
  mainWebpackChain(config, "preload");
  return config.toConfig();
}
var build = async (config) => {
  return await new Promise((resolve, reject) => {
    const compiler = (0, import_webpack.default)(config);
    compiler.run((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  build,
  getMainWebpackConfig,
  getPreloadWebpackConfig
});
