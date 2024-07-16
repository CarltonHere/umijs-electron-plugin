// src/template/entry-dev.js
var electron = require("electron");
var fs = require("fs");
var path = require("path");
var decache = require("clear-module");
var { join, parse } = require("path");
var _ = require("lodash");
var chokidar = require("chokidar");
var mPath = path.join(__dirname, "./dist/index.js");
var { UMI_APP_PORT = "8000" } = process.env;
var main = async () => {
  const context = { browserWindow: null, electron };
  let userConfig = {};
  if (fs.existsSync(join(__dirname, "./dist/config.js"))) {
    userConfig = require("./dist/config").default;
  } else {
    console.log(`[config] user config not found`);
  }
  const _config = _.merge(userConfig.browserWindow || {}, {
    webPreferences: {
      preload: join(__dirname, "./dist/preload.js")
    }
  });
  const _ipcMain = electron.ipcMain;
  const _ipcMainOnMap = {};
  const _ipcOnceMap = {};
  let _ipcHandleChannels = [];
  const _appUsingEvents = [];
  const hackContext = (_context) => {
    const _on = (filepath) => (channel, listener) => {
      if (!_ipcMainOnMap[filepath]) {
        _ipcMainOnMap[filepath] = {
          channels: [],
          listeners: []
        };
      }
      _ipcMainOnMap[filepath].channels.push(channel);
      _ipcMainOnMap[filepath].listeners.push(listener);
      _ipcMain.on(channel, listener);
    };
    const _once = (filepath) => (channel, listener) => {
      if (!_ipcOnceMap[filepath]) {
        _ipcOnceMap[filepath] = {
          channels: [],
          listeners: []
        };
      }
      _ipcOnceMap[filepath].channels.push(channel);
      _ipcOnceMap[filepath].listeners.push(listener);
      _ipcMain.once(channel, listener);
    };
    const _handle = (channel, listener) => {
      const handleResult = _ipcMain.handle(channel, listener);
      _ipcHandleChannels.push(channel);
      return handleResult;
    };
    const _handleOnce = (channel, listener) => {
      const handleResult = _ipcMain.handleOnce(channel, listener);
      _ipcHandleChannels.push(channel);
      return handleResult;
    };
    _on._hof = true;
    _context.electron = Object.assign({
      ipcMain: {
        ..._ipcMain,
        on: _on,
        once: _once,
        handle: _handle,
        handleOnce: _handleOnce
      },
      app: Object.assign({
        on: (event, listener) => {
          if (_appUsingEvents.includes(event)) {
            return;
          }
          _appUsingEvents.push(event);
          electron.app.on(event, listener);
        }
      }, electron.app)
    }, electron);
    return _context;
  };
  context.browserWindow = new electron.BrowserWindow(_config);
  await context.browserWindow.loadURL(`http://localhost:${UMI_APP_PORT}`);
  require(mPath).call(exports, hackContext(context));
  let ipcFiles = [];
  const unmountAllIpc = () => {
    ipcFiles.forEach((ipcPath) => hotReplaceModule(ipcPath));
  };
  const clearEvents = (filepath) => {
    if (_ipcMainOnMap[filepath]) {
      const { channels, listeners } = _ipcMainOnMap[filepath];
      channels.forEach((channel, index) => {
        _ipcMain.removeListener(channel, listeners[index]);
      });
      _ipcMainOnMap[filepath] = void 0;
    }
    if (_ipcOnceMap[filepath]) {
      const { channels, listeners } = _ipcOnceMap[filepath];
      channels.forEach((channel, index) => {
        _ipcMain.removeListener(channel, listeners[index]);
      });
      _ipcOnceMap[filepath] = void 0;
    }
    _ipcHandleChannels.forEach((channel) => {
      _ipcMain.removeHandler(channel);
    });
    _ipcHandleChannels = [];
  };
  const unmountModule = (filepath) => {
    clearEvents(filepath);
    decache(filepath);
  };
  const mountModule = (filepath) => {
    const _module = require(filepath);
    _module.call(exports, hackContext(context));
  };
  const hotReplaceModule = (filepath) => {
    console.log("[hrm] ", filepath);
    unmountModule(filepath);
    mountModule(filepath);
  };
  const hotReplacePreload = () => {
    context.browserWindow.reload();
  };
  const src = path.join(__dirname, "./dist");
  const isIpcFile = (filepath) => {
    return parse(filepath).dir === join(src, "ipc") && /\.js$/.test(filepath);
  };
  chokidar.watch(src, {
    usePolling: true
  }).on("change", (filepath) => {
    if (join(src, "preload.js") === filepath) {
      hotReplacePreload();
    } else if (join(src, "config.js") === filepath) {
      console.log("[info] config changed, restart application to take effect.");
    } else if (isIpcFile(filepath)) {
      hotReplaceModule(filepath);
    } else if (filepath === mPath) {
      hotReplaceModule(mPath);
    } else {
      hotReplaceModule(mPath);
      unmountAllIpc();
    }
  }).on("unlink", (filepath) => {
    if (isIpcFile(filepath)) {
      ipcFiles = ipcFiles.filter((ipcPath) => ipcPath !== filepath);
      unmountModule(filepath);
    }
  }).on("add", (filepath) => {
    if (isIpcFile(filepath)) {
      ipcFiles.push(filepath);
      mountModule(filepath);
    }
  });
};
electron.app.on("ready", () => {
  main();
});
