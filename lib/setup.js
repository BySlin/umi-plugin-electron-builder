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

// src/setup.ts
var setup_exports = {};
__export(setup_exports, {
  default: () => setup_default
});
module.exports = __toCommonJS(setup_exports);
var import_utils = require("@umijs/utils");
var import_path = __toESM(require("path"));
var import_utils2 = require("./utils");
var setup_default = (api) => {
  (0, import_utils2.setNpmClient)(api.userConfig.npmClient);
  const nodeModulesPath = (0, import_utils2.getNodeModulesPath)();
  let rootPkg = (0, import_utils2.getRootPkg)();
  const requiredDependencies = ["electron", "electron-builder"];
  const installDependencies = [];
  for (const dep of requiredDependencies) {
    if (rootPkg.devDependencies[dep] == null) {
      installDependencies.push(dep);
    }
  }
  if (installDependencies.length > 0) {
    (0, import_utils2.installRely)(installDependencies.join(" "));
  }
  rootPkg = (0, import_utils2.getRootPkg)();
  const electronPackageJson = import_utils.fsExtra.readJSONSync(
    import_path.default.join(nodeModulesPath, "electron", "package.json")
  );
  if (electronPackageJson.dependencies["@types/node"] !== rootPkg.devDependencies["@types/node"]) {
    const electronTypesNodeVersion = electronPackageJson.dependencies["@types/node"];
    (0, import_utils2.installRely)(`@types/node@${electronTypesNodeVersion}`);
  }
  rootPkg = (0, import_utils2.getRootPkg)();
  let isUpdateRootPkg = false;
  if (rootPkg.name == null) {
    rootPkg.name = "electron_builder_app";
    isUpdateRootPkg = true;
  }
  if (rootPkg.version == null) {
    rootPkg.version = "0.0.1";
    isUpdateRootPkg = true;
  }
  if (rootPkg.scripts["rebuild-deps"] == null) {
    rootPkg.scripts["rebuild-deps"] = "electron-builder install-app-deps";
    isUpdateRootPkg = true;
  }
  if (rootPkg.scripts["electron:init"] == null) {
    rootPkg.scripts["electron:init"] = "umi electron init";
    isUpdateRootPkg = true;
  }
  if (rootPkg.scripts["electron:dev"] == null) {
    rootPkg.scripts["electron:dev"] = "umi dev electron";
    isUpdateRootPkg = true;
  }
  if (rootPkg.scripts["electron:build:win"] == null) {
    rootPkg.scripts["electron:build:win"] = "umi build electron --win";
    isUpdateRootPkg = true;
  }
  if (rootPkg.scripts["electron:build:mac"] == null) {
    rootPkg.scripts["electron:build:mac"] = "umi build electron --mac";
    isUpdateRootPkg = true;
  }
  if (rootPkg.scripts["electron:build:linux"] == null) {
    rootPkg.scripts["electron:build:linux"] = "umi build electron --linux";
    isUpdateRootPkg = true;
  }
  if (isUpdateRootPkg) {
    api.logger.info("update package.json");
    import_utils.fsExtra.writeFileSync(
      import_path.default.join(process.cwd(), "package.json"),
      JSON.stringify(rootPkg, null, 2)
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
