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

// src/compile/vite/index.ts
var vite_exports = {};
__export(vite_exports, {
  getMainViteConfig: () => getMainViteConfig,
  getPreloadViteConfig: () => getPreloadViteConfig
});
module.exports = __toCommonJS(vite_exports);
var import_external_packages = __toESM(require("../../external-packages.config"));
var path = __toESM(require("path"));
var import_utils = require("../../utils");
function getMainViteConfig(api) {
  const mode = api.env || "development";
  const { externals, viteConfig } = api.config.electronBuilder;
  const external = [...import_external_packages.default, ...externals];
  const mainConfig = {
    mode,
    resolve: {
      alias: {
        "@/common": path.join(process.cwd(), "src/common"),
        "@": (0, import_utils.getMainSrc)(api)
      }
    },
    root: (0, import_utils.getMainSrc)(api),
    build: {
      sourcemap: mode === "development" ? "inline" : false,
      outDir: mode === "development" ? (0, import_utils.getDevBuildDir)(api) : (0, import_utils.getBuildDir)(api),
      assetsDir: ".",
      minify: mode !== "development",
      lib: {
        entry: "index.ts",
        formats: ["cjs"]
      },
      rollupOptions: {
        external,
        output: {
          entryFileNames: "main.js"
        }
      },
      emptyOutDir: false
    }
  };
  viteConfig(mainConfig, "main");
  return mainConfig;
}
function getPreloadViteConfig(api, inputFileName, outputFileName) {
  const mode = api.env || "development";
  const { externals, viteConfig } = api.config.electronBuilder;
  const external = [...import_external_packages.default, ...externals];
  const preloadConfig = {
    mode,
    resolve: {
      alias: {
        "@/common": path.join(process.cwd(), "src/common"),
        "@": (0, import_utils.getPreloadSrc)(api)
      }
    },
    root: (0, import_utils.getPreloadSrc)(api),
    build: {
      sourcemap: mode === "development" ? "inline" : false,
      outDir: mode === "development" ? (0, import_utils.getDevBuildDir)(api) : (0, import_utils.getBuildDir)(api),
      assetsDir: ".",
      minify: mode !== "development",
      lib: {
        entry: inputFileName,
        formats: ["cjs"]
      },
      rollupOptions: {
        external,
        output: {
          entryFileNames: outputFileName
        }
      },
      emptyOutDir: false
    }
  };
  viteConfig(preloadConfig, "preload");
  return preloadConfig;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMainViteConfig,
  getPreloadViteConfig
});
