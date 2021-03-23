"use strict";

var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runBuild = exports.runDev = void 0;

var child_process_1 = require("child_process");

var vite_1 = require("vite");

var external_packages_config_1 = __importDefault(require("./external-packages.config"));

var chokidar = __importStar(require("chokidar"));

var path = __importStar(require("path"));

var fse = __importStar(require("fs-extra"));

var utils_1 = require("../utils");

var chalk_1 = __importDefault(require("chalk"));

var electronPath = require('electron');

var TIMEOUT = 500;

function debounce(f, ms) {
  var isCoolDown = false;
  return function () {
    if (isCoolDown) return;
    f();
    isCoolDown = true;
    setTimeout(function () {
      return isCoolDown = false;
    }, ms);
  };
}

function getViteConfig(api, type) {
  var mode = api.env || 'development';
  var _a = api.config.electronBuilder,
      externals = _a.externals,
      viteConfig = _a.viteConfig;
  console.log(path.join(process.cwd(), 'src/common'));

  if (type === 'main') {
    var mainConfig = {
      mode: mode,
      resolve: {
        alias: {
          '@/common': path.join(process.cwd(), 'src/common'),
          '@': path.join(process.cwd(), 'src/main')
        }
      },
      root: utils_1.getMainSrc(api),
      build: {
        sourcemap: 'inline',
        outDir: mode === 'development' ? utils_1.getDevBuildDir(api) : utils_1.getBuildDir(api),
        assetsDir: '.',
        minify: mode !== 'development',
        lib: {
          entry: 'index.ts',
          formats: ['cjs']
        },
        rollupOptions: {
          external: __spreadArray(__spreadArray([], external_packages_config_1.default), externals),
          output: {
            entryFileNames: 'main.cjs'
          }
        },
        emptyOutDir: false
      }
    };
    viteConfig(mainConfig, 'main');
    return mainConfig;
  } else {
    var preloadConfig = {
      mode: mode,
      resolve: {
        alias: {
          '@/common': path.join(process.cwd(), 'src/common'),
          '@': path.join(process.cwd(), 'src/preload')
        }
      },
      root: utils_1.getPreloadSrc(api),
      build: {
        sourcemap: 'inline',
        outDir: mode === 'development' ? utils_1.getDevBuildDir(api) : utils_1.getBuildDir(api),
        assetsDir: '.',
        minify: mode !== 'development',
        lib: {
          entry: 'index.ts',
          formats: ['cjs']
        },
        rollupOptions: {
          external: __spreadArray(__spreadArray([], external_packages_config_1.default), externals),
          output: {
            entryFileNames: 'preload.cjs'
          }
        },
        emptyOutDir: false
      }
    };
    viteConfig(preloadConfig, 'preload');
    return preloadConfig;
  }
}

var runDev = function runDev(api) {
  return __awaiter(void 0, void 0, void 0, function () {
    var spawnProcess, runMain, buildMain, buildMainDebounced, buildPreload, buildPreloadDebounced, runPreload, watcher;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          spawnProcess = null;
          runMain = debounce(function () {
            if (spawnProcess !== null) {
              spawnProcess.kill('SIGINT');
              spawnProcess = null;
            }

            spawnProcess = child_process_1.spawn(String(electronPath), [path.join(utils_1.getDevBuildDir(api), 'main.cjs')]);
            spawnProcess.stdout.on('data', function (d) {
              return utils_1.logProcess('Electron', d.toString(), chalk_1.default.blue);
            });
            utils_1.logProcessErrorOutput('Electron', spawnProcess);
            spawnProcess.on('close', function (code, signal) {
              if (signal != 'SIGINT') {
                process.exit(-1);
              }
            });
            return spawnProcess;
          }, TIMEOUT);

          buildMain = function buildMain() {
            return vite_1.build(getViteConfig(api, 'main'));
          };

          buildMainDebounced = debounce(buildMain, TIMEOUT);

          buildPreload = function buildPreload() {
            if (fse.pathExistsSync(utils_1.getPreloadSrc(api))) {
              return vite_1.build(getViteConfig(api, 'preload'));
            }

            return Promise.resolve();
          };

          buildPreloadDebounced = debounce(buildPreload, TIMEOUT);
          runPreload = debounce(function () {
            api.getServer().sockets.forEach(function (socket) {
              socket.write(JSON.stringify({
                type: 'ok',
                data: {
                  reload: true
                }
              }));
            });
          }, TIMEOUT);
          return [4, Promise.all([buildMain(), buildPreload()])];

        case 1:
          _a.sent();

          watcher = chokidar.watch([utils_1.getMainSrc(api) + "/**", utils_1.getPreloadSrc(api) + "/**", utils_1.getDevBuildDir(api) + "/**"], {
            ignoreInitial: true
          });
          watcher.on('unlink', function (path) {
            var normalizedPath = vite_1.normalizePath(path);

            if (spawnProcess !== null && normalizedPath.includes(utils_1.getDevBuildDir(api))) {
              spawnProcess.kill('SIGINT');
              spawnProcess = null;
            }
          }).on('add', function (path) {
            var normalizedPath = vite_1.normalizePath(path);

            if (normalizedPath.includes(utils_1.getDevBuildDir(api))) {
              return runMain();
            }

            if (spawnProcess !== undefined && normalizedPath.includes('preload.cjs')) {
              return runPreload();
            }
          }).on('change', function (path) {
            var normalizedPath = vite_1.normalizePath(path);

            if (normalizedPath.includes(utils_1.getMainSrc(api))) {
              return buildMainDebounced();
            }

            if (normalizedPath.includes('main.cjs')) {
              return runMain();
            }

            if (normalizedPath.includes(utils_1.getPreloadSrc(api))) {
              return buildPreloadDebounced();
            }

            if (normalizedPath.includes('preload.cjs')) {
              return runPreload();
            }
          });
          return [4, runMain()];

        case 2:
          _a.sent();

          return [2];
      }
    });
  });
};

exports.runDev = runDev;

var runBuild = function runBuild(api) {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4, vite_1.build(getViteConfig(api, 'main'))];

        case 1:
          _a.sent();

          if (!fse.pathExistsSync(utils_1.getPreloadSrc(api))) return [3, 3];
          return [4, vite_1.build(getViteConfig(api, 'preload'))];

        case 2:
          _a.sent();

          _a.label = 3;

        case 3:
          return [2];
      }
    });
  });
};

exports.runBuild = runBuild;