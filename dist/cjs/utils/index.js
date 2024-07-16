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

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  generateDeps: () => generateDeps,
  generateEnvJson: () => generateEnvJson,
  regeneratePackageJson: () => regeneratePackageJson
});
module.exports = __toCommonJS(utils_exports);
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import__ = require("..");
var generateEnvJson = (mode) => {
  const outputPath = (0, import_path.join)(process.cwd(), (0, import__.getTmpDir)(mode));
  if (!(0, import_fs.existsSync)(outputPath)) {
    (0, import_fs.mkdirSync)(outputPath, { recursive: true });
  }
  (0, import_fs.writeFileSync)((0, import_path.join)(outputPath, "env.json"), JSON.stringify(process.env));
};
var regeneratePackageJson = (mode) => {
  const originPkgJson = require((0, import_path.join)(process.cwd(), "./package.json"));
  const { dependencies = {}, devDependencies = {} } = originPkgJson;
  originPkgJson.main = "./entry.js";
  const originDependencies = { ...devDependencies, ...dependencies };
  originPkgJson.dependencies = {};
  originPkgJson.devDependencies = {};
  if (mode === "production") {
    const userDependencies = require((0, import_path.join)(process.cwd(), `${(0, import__.getTmpDir)(mode)}/dependencies.json`));
    userDependencies.all.forEach((dep) => {
      if (dep === "electron") {
        return;
      }
      originPkgJson.dependencies[dep] = originDependencies[dep] || "*";
    });
  }
  originPkgJson.devDependencies["electron"] = originDependencies["electron"] || "*";
  import_fs.default.writeFileSync((0, import_path.join)(process.cwd(), `${(0, import__.getTmpDir)(mode)}/package.json`), JSON.stringify(originPkgJson, void 0, 2), "utf-8");
};
var generateDeps = (toGenerateDeps, depsOfFile, filesOfDep) => {
  (0, import_fs.writeFileSync)(import_path.default.resolve(process.cwd(), `${(0, import__.getTmpDir)("production")}/dependencies.json`), JSON.stringify({
    all: Array.from(toGenerateDeps),
    files: Object.keys(depsOfFile).reduce((memo, current) => {
      return {
        ...memo,
        [current]: Array.from(depsOfFile[current])
      };
    }, {}),
    deps: Object.keys(filesOfDep).reduce((memo, current) => {
      return {
        ...memo,
        [current]: Array.from(filesOfDep[current])
      };
    }, {})
  }, null, 2));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateDeps,
  generateEnvJson,
  regeneratePackageJson
});
