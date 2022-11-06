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

// src/createProtocol.ts
var createProtocol_exports = {};
__export(createProtocol_exports, {
  default: () => createProtocol_default
});
module.exports = __toCommonJS(createProtocol_exports);
var import_electron = require("electron");
var import_url = require("url");
var path = __toESM(require("path"));
var createProtocol_default = (scheme) => {
  import_electron.protocol.registerFileProtocol(scheme, (request, respond) => {
    let pathName = new import_url.URL(request.url).pathname;
    pathName = decodeURI(pathName);
    const filePath = path.join(__dirname, pathName);
    respond({ path: filePath });
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
