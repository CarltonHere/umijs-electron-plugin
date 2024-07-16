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

// src/dev.ts
var dev_exports = {};
__export(dev_exports, {
  dev: () => dev
});
module.exports = __toCommonJS(dev_exports);
var rimraf = require("rimraf");
var proc = require("child_process");
var electron = require("electron");
var fs = require("fs");
var chokidar = require("chokidar");
var babel = require("@babel/core");
var { join, parse } = require("path");
var glob = require("glob");
var isWindows = process.platform === "win32";
var createContextProvider = (content, filepath) => `
"use strict";
module.exports = (context) => {
  if(context.electron.ipcMain.on._hof) {
    context.electron.ipcMain.on = context.electron.ipcMain.on("${isWindows ? filepath.replace(/\\/g, "\\\\") : filepath}");
    context.electron.ipcMain.once = context.electron.ipcMain.once("${isWindows ? filepath.replace(/\\/g, "\\\\") : filepath}");
  }

  return ((require, getBrowserWindowRuntime) => {
    const exports = {};
    

    ${content.trim().replace(/"use strict";/g, "")}
    

    return exports;
  })((moduleId) => {
    const __require = require;
    if (context[moduleId]) {
      return context[moduleId];
    }
    if(moduleId.startsWith('.')) {
      return __require(moduleId)(context);
    }
    return __require(moduleId);
  },()=>context.browserWindow)
};
`;
var dev = (srcDir, outputDir, port, beforeStartApp) => {
  const tmpDir = outputDir;
  outputDir = join(tmpDir, "dist");
  console.log(`[dev] src: ${srcDir}, output: ${outputDir}`);
  rimraf.sync(outputDir);
  const initAllFile = /* @__PURE__ */ new Set();
  const globPath = `${srcDir}/**/*`;
  glob.sync(isWindows ? globPath.replace(/\\/g, "/") : globPath).forEach((filepath) => {
    if (fs.statSync(filepath).isFile()) {
      initAllFile.add(isWindows ? filepath.replace(/\//g, "\\") : filepath);
    }
  });
  const isTransformFile = (ext, base) => {
    if (/\.d\.ts$/.test(base)) {
      return false;
    }
    if (/\.(js|ts|mjs)$/.test(ext)) {
      return true;
    }
    return false;
  };
  const getFileOutputInfo = (filepath, srcDir2, toDir) => {
    const { base, ext, dir, name } = parse(filepath);
    const basePath = dir.replace(srcDir2, "");
    const outputDir2 = join(toDir, basePath);
    if (isTransformFile(ext)) {
      return {
        dir: outputDir2,
        filepath: join(outputDir2, `${name}.js`)
      };
    }
    const copyToDir = join(toDir, basePath);
    const copyToPath = join(copyToDir, base);
    return {
      dir: copyToDir,
      filepath: copyToPath
    };
  };
  const transformFile = (filepath, srcDir2, toDir) => {
    const { base, ext, name, dir } = parse(filepath);
    const subDir = dir.replace(srcDir2, "");
    let needProvider = false;
    if ([".js", ".ts"].includes(ext)) {
      if (subDir === "/forks" || subDir === "\\forks") {
        needProvider = false;
      } else if (!["preload", "config"].includes(name)) {
        needProvider = true;
      }
    }
    if (isTransformFile(ext, base)) {
      const { code } = babel.transformFileSync(filepath, {
        presets: ["@babel/preset-env", "@babel/preset-typescript"],
        plugins: []
      });
      const { dir: dir2, filepath: finalFilePath } = getFileOutputInfo(filepath, srcDir2, toDir);
      if (!fs.existsSync(dir2)) {
        fs.mkdirSync(dir2, { recursive: true });
      }
      fs.writeFileSync(finalFilePath, needProvider ? createContextProvider(code, finalFilePath) : code);
    } else {
      if (/tsconfig\.json$/.test(base) || /\.d\.ts$/.test(base)) {
        console.log(`[ignore] ${filepath}`);
      } else {
        const { dir: dir2, filepath: finalFilePath } = getFileOutputInfo(filepath, srcDir2, toDir);
        if (!fs.existsSync(dir2)) {
          fs.mkdirSync(dir2, { recursive: true });
        }
        fs.copyFileSync(filepath, finalFilePath);
      }
    }
  };
  const startApp = () => {
    const electronProcess = proc.spawn(electron, [tmpDir], {
      stdio: "pipe",
      env: {
        ...process.env,
        FORCE_COLOR: "1",
        UMI_APP_PORT: port
      },
      cwd: process.cwd()
    });
    electronProcess.stdout.pipe(process.stdout);
    electronProcess.stderr.pipe(process.stderr);
  };
  chokidar.watch(srcDir, {
    usePolling: true
  }).on("add", (path) => {
    if (initAllFile.has(path)) {
      console.log(`[init] ${path}`);
      initAllFile.delete(path);
      if (initAllFile.size === 0) {
        beforeStartApp().then(() => {
          startApp();
        });
      }
    } else {
      console.log(`[add] ${path}`);
    }
    transformFile(path, srcDir, outputDir);
  }).on("unlink", (path) => {
    console.log(`[unlink] ${path}`);
    const { filepath } = getFileOutputInfo(path, srcDir, outputDir);
    try {
      fs.unlinkSync(filepath);
    } catch (error) {
    }
  }).on("change", (path) => {
    console.log(`[change] ${path}`);
    transformFile(path, srcDir, outputDir);
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dev
});
