var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/path.ts
var path_exports = {};
__export(path_exports, {
  PathUtil: () => PathUtil
});
module.exports = __toCommonJS(path_exports);
var import_path = require("path");
var PathUtil = class {
  constructor(srcDir, outputDir) {
    this.srcDir = srcDir;
    this.outputDir = outputDir;
    this.getSrcDir = () => this.srcDir;
    this.getOutputDir = () => this.outputDir;
    if (!(0, import_path.isAbsolute)(srcDir)) {
      this.srcDir = (0, import_path.join)(process.cwd(), srcDir);
    }
    if (!(0, import_path.isAbsolute)(outputDir)) {
      this.outputDir = (0, import_path.join)(process.cwd(), outputDir);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PathUtil
});
