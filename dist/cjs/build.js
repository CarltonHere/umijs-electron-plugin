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

// src/build.ts
var build_exports = {};
__export(build_exports, {
  build: () => build
});
module.exports = __toCommonJS(build_exports);
var import_utils = require("./utils");
var import_getPkgName = require("./utils/getPkgName");
var glob = require("glob");
var fs = require("fs");
var { parse, join } = require("path");
var babel = require("@babel/core");
var isWindows = process.platform === "win32";
var createBrowserWindowProvider = (content) => `
"use strict";
const getBrowserWindowRuntime = ()=>{
 return require('electron').BrowserWindow.getAllWindows()[0]; 
}
${content.trim().replace(/"use strict";/g, "")}
`;
var build = (srcDir, toDir) => {
  const deps = /* @__PURE__ */ new Set();
  const depsOfFile = {};
  const filesOfDep = {};
  const globPath = `${srcDir}/**/*`;
  glob.sync(isWindows ? globPath.replace(/\\/g, "/") : globPath).forEach((filepath) => {
    filepath = isWindows ? filepath.replace(/\//g, "\\") : filepath;
    if (fs.statSync(filepath).isFile()) {
      const { base, ext, dir, name } = parse(filepath);
      const basePath = dir.replace(srcDir, "");
      let needProvider = false;
      if ([".js", ".ts"].includes(ext)) {
        if (!["preload", "config"].includes(name)) {
          needProvider = true;
        }
      }
      if (/\.(js|ts|mjs)$/.test(ext)) {
        const { code } = babel.transformFileSync(filepath, {
          presets: ["@babel/preset-env", "@babel/preset-typescript"],
          plugins: [
            [
              require("./babel-plugin-import-analyze"),
              {
                onCollect: (filename, depName) => {
                  let finalDepName = (0, import_getPkgName.getPkgName)(depName);
                  if (!finalDepName) {
                    return;
                  }
                  deps.add(finalDepName);
                  if (!depsOfFile[filename]) {
                    depsOfFile[filename] = /* @__PURE__ */ new Set();
                  }
                  if (!filesOfDep[finalDepName]) {
                    filesOfDep[finalDepName] = /* @__PURE__ */ new Set();
                  }
                  filesOfDep[finalDepName].add(filename);
                  depsOfFile[filename].add(finalDepName);
                }
              }
            ]
          ]
        });
        const outputDir = join(toDir, basePath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputFilename = join(outputDir, `${name}.js`);
        fs.writeFileSync(outputFilename, needProvider ? createBrowserWindowProvider(code) : code);
      } else {
        if (/tsconfig\.json$/.test(base) || /\.d\.ts$/.test(base)) {
        } else {
          const copyToDir = join(toDir, basePath);
          const copyToPath = join(copyToDir, base);
          if (!fs.existsSync(copyToDir)) {
            fs.mkdirSync(copyToDir, { recursive: true });
          }
          fs.copyFileSync(filepath, copyToPath);
        }
      }
    }
  });
  fs.copyFileSync(join(__dirname, "./template/entry-prod.js"), join(toDir, "entry.js"));
  (0, import_utils.generateDeps)(deps, depsOfFile, filesOfDep);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  build
});
