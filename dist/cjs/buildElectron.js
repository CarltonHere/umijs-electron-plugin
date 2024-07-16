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

// src/buildElectron.ts
var buildElectron_exports = {};
__export(buildElectron_exports, {
  buildElectron: () => buildElectron
});
module.exports = __toCommonJS(buildElectron_exports);
var import_electron_builder = require("electron-builder");
var import_lodash = __toESM(require("lodash"));
var import_path = require("path");
var import_constants = require("./constants");
var buildElectron = (userConfig) => {
  const { targets, config = {} } = userConfig || {};
  const PROJECT_DIR = (0, import_path.join)(process.cwd(), import_constants.TMP_DIR_PRODUCTION);
  const DEFAULT_OUTPUT = "dist";
  const DEFAULT_RELATIVE_OUTPUT = (0, import_path.join)("../", DEFAULT_OUTPUT);
  const builderConfigMerged = {
    config: import_lodash.default.merge({
      directories: { output: DEFAULT_RELATIVE_OUTPUT },
      dmg: {
        title: `\${productName}-\${version}`,
        artifactName: `\${productName}-\${version}-\${arch}.\${ext}`
      },
      nsis: {
        artifactName: `\${productName}-setup-\${version}.\${ext}`
      }
    }, {
      electronDownload: {
        mirror: "https://registry.npmmirror.com/-/binary/electron/"
      },
      files: ["./**"]
    }, config || {}),
    projectDir: PROJECT_DIR,
    targets
  };
  const getOutput = () => {
    return import_lodash.default.get(builderConfigMerged, ["config", "directories", "output"], DEFAULT_OUTPUT);
  };
  const output = getOutput();
  if (!output.startsWith("..")) {
    import_lodash.default.set(builderConfigMerged, ["config", "directories", "output"], (0, import_path.join)("../", output));
  }
  return (0, import_electron_builder.build)(builderConfigMerged);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildElectron
});
