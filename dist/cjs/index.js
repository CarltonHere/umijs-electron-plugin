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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default,
  getTmpDir: () => getTmpDir
});
module.exports = __toCommonJS(src_exports);
var import_path = require("path");
var import_utils = require("./utils");
var import_buildElectron = require("./buildElectron");
var import_fs = require("fs");
var import_constants = require("./constants");
var import_dev = require("./dev");
var import_path2 = require("./utils/path");
var import_build = require("./build");
__reExport(src_exports, require("electron-builder"), module.exports);
var getTmpDir = (mode) => {
  return mode === "development" ? import_constants.TMP_DIR : import_constants.TMP_DIR_PRODUCTION;
};
var src_default = (api) => {
  api.describe({
    key: "electron",
    config: {
      schema(joi) {
        return joi.object({
          src: joi.string(),
          builder: joi.object({
            targets: joi.any(),
            config: joi.object()
          }),
          extraDevFiles: joi.object()
        });
      },
      default: {}
    },
    enableBy: () => !!api.userConfig.electron
  });
  let isFirstDevDone = true;
  api.onDevCompileDone(async () => {
    if (!isFirstDevDone) {
      return;
    }
    const currentMode = "development";
    const {
      src = process.platform === "win32" ? "src\\main" : "src/main",
      extraDevFiles = {}
    } = api.config.electron;
    const pathUtil = new import_path2.PathUtil(src, getTmpDir(currentMode));
    (0, import_utils.generateEnvJson)(currentMode);
    (0, import_dev.dev)(pathUtil.getSrcDir(), pathUtil.getOutputDir(), api.appData.port, async () => {
      (0, import_fs.copyFileSync)((0, import_path.join)(__dirname, "./template/entry-dev.js"), (0, import_path.join)(pathUtil.getOutputDir(), "entry.js"));
      (0, import_utils.regeneratePackageJson)(currentMode);
    });
    const tmpDir = getTmpDir(currentMode);
    Object.keys(extraDevFiles).forEach((filename) => {
      (0, import_fs.writeFileSync)((0, import_path.join)(process.cwd(), tmpDir, filename), extraDevFiles[filename]);
    });
    isFirstDevDone = false;
  });
  api.onBuildComplete(async ({ err }) => {
    if (err) {
      return;
    }
    const currentMode = "production";
    const { src = process.platform === "win32" ? "src\\main" : "src/main" } = api.config.electron;
    const timer = setTimeout(() => {
      console.log();
      console.log("[umi electron] \u6253\u5305\u65F6\u95F4\u8FC7\u957F\uFF0C\u8BF7\u5C1D\u8BD5\u6DFB\u52A0\u4EE5\u4E0B\u955C\u50CF\u5230 .npmrc \u4E2D\uFF1A\nelectron-mirror=https://registry.npmmirror.com/-/binary/electron/\nelectron-builder-binaries-mirror=https://registry.npmmirror.com/binary.html?path=electron-builder-binaries/");
      console.log();
    }, 5 * 60 * 1e3);
    (0, import_build.build)(src, getTmpDir(currentMode));
    (0, import_utils.generateEnvJson)(currentMode);
    (0, import_utils.regeneratePackageJson)(currentMode);
    clearTimeout(timer);
  });
  api.onBuildHtmlComplete(async () => {
    await (0, import_buildElectron.buildElectron)(api.config.electron.builder || {});
  });
  api.modifyConfig({
    fn: (initialValue) => {
      if (api.env === "production") {
        return {
          ...initialValue,
          outputPath: `./${getTmpDir("production")}/renderer`,
          history: {
            type: "hash"
          },
          publicPath: "./"
        };
      }
      return initialValue;
    },
    stage: Infinity
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getTmpDir
});
