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

// src/utils/getPkgName.ts
var getPkgName_exports = {};
__export(getPkgName_exports, {
  getPkgName: () => getPkgName
});
module.exports = __toCommonJS(getPkgName_exports);
var getPkgName = (depName) => {
  let finalDepName = depName;
  if (depName.startsWith(".")) {
    if (!depName.includes("node_modules")) {
      return;
    }
    finalDepName = depName.slice(depName.indexOf("node_modules") + "node_modules".length + 1);
  }
  if (finalDepName.startsWith("@")) {
    finalDepName = finalDepName.split("/").slice(0, 2).join("/");
  } else {
    finalDepName = finalDepName.split("/")[0];
  }
  return finalDepName;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPkgName
});
