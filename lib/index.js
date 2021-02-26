"use strict";

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

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

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var fse = __importStar(require("fs-extra"));

var path = __importStar(require("path"));

var umi_1 = require("umi");

var util_1 = require("electron-webpack/out/util");

var devUtil_1 = require("electron-webpack/out/dev/devUtil");

var HmrServer_1 = require("electron-webpack/out/electron-main-hmr/HmrServer");

var chalk_1 = __importDefault(require("chalk"));

var webpack_1 = __importDefault(require("webpack"));

var child_process_1 = require("child_process");

var webpack_2 = require("./webpack");

var utils_1 = require("./utils");

var setup_1 = __importDefault(require("./setup"));

var yargs = umi_1.utils.yargs,
    merge = umi_1.utils.lodash.merge;

var debug = require('debug')('electron-webpack');

var socketPath = null;

function default_1(api) {
  var _a;

  setup_1.default(api);
  api.describe({
    key: 'electronBuilder',
    config: {
      default: {
        mainSrc: 'src/main',
        builderOptions: {},
        externals: [],
        outputDir: 'dist_electron',
        routerMode: 'hash',
        rendererTarget: 'electron-renderer',
        mainWebpackConfig: function mainWebpackConfig() {}
      },
      schema: function schema(joi) {
        return joi.object({
          mainSrc: joi.string(),
          outputDir: joi.string(),
          externals: joi.array(),
          builderOptions: joi.object(),
          routerMode: joi.string(),
          rendererTarget: joi.string(),
          mainWebpackConfig: joi.func()
        });
      }
    }
  });
  var isElectron = ((_a = api.args) === null || _a === void 0 ? void 0 : _a._[0]) === 'electron';

  if (!isElectron) {
    return;
  }

  api.skipPlugins(['./node_modules/umi/node_modules/@@/features/fastRefresh']);
  api.modifyConfig(function (config) {
    var _a = config.electronBuilder,
        outputDir = _a.outputDir,
        externals = _a.externals,
        routerMode = _a.routerMode;
    config.outputPath = path.join(outputDir, 'bundled');
    config.history = {
      type: routerMode
    };
    var configExternals = {
      electron: "require('electron')"
    };

    if (externals.length > 0) {
      for (var _i = 0, externals_1 = externals; _i < externals_1.length; _i++) {
        var moduleName = externals_1[_i];
        configExternals[moduleName] = "require('" + moduleName + "')";
      }
    }

    config.externals = __assign(__assign({}, configExternals), config.externals);
    return config;
  });
  api.chainWebpack(function (config) {
    var rendererTarget = api.config.electronBuilder.rendererTarget;
    config.target(rendererTarget);
    return config;
  });
  api.onDevCompileDone(function (_a) {
    var isFirstCompile = _a.isFirstCompile;
    copyMainProcess();

    if (isFirstCompile) {
      api.logger.info('start dev electron');
      runInDevMode(api).catch(function (error) {
        console.error(error);
      });
    }
  });
  api.onBuildComplete(function (_a) {
    var err = _a.err;
    copyMainProcess();

    if (err == null) {
      var _b = api.config.electronBuilder,
          builderOptions_1 = _b.builderOptions,
          externals_2 = _b.externals;
      var absOutputDir = getAbsOutputDir(api);
      var buildPkg_1 = utils_1.getRootPkg();
      buildPkg_1.main = 'main.js';
      delete buildPkg_1.scripts;
      delete buildPkg_1.devDependencies;
      Object.keys(buildPkg_1.dependencies).forEach(function (dependency) {
        if (!externals_2.includes(dependency)) {
          delete buildPkg_1.dependencies[dependency];
        }
      });
      var buildDependencies = ['source-map-support', 'electron-devtools-installer'];

      for (var _i = 0, buildDependencies_1 = buildDependencies; _i < buildDependencies_1.length; _i++) {
        var dep = buildDependencies_1[_i];
        var depPackageJsonPath = path.join(utils_1.getNodeModulesPath(), dep, 'package.json');

        if (fse.existsSync(depPackageJsonPath)) {
          buildPkg_1.dependencies[dep] = require(depPackageJsonPath).version;
        } else {
          buildPkg_1.dependencies[dep] = require(path.join(process.cwd(), 'node_modules', dep, 'package.json')).version;
        }
      }

      fse.ensureDirSync(absOutputDir + "/bundled/node_modules");
      fse.writeFileSync(absOutputDir + "/bundled/package.json", JSON.stringify(buildPkg_1, null, 2));
      var defaultBuildConfig_1 = {
        directories: {
          output: absOutputDir,
          app: absOutputDir + "/bundled"
        },
        files: ['**'],
        extends: null
      };
      api.logger.info('build main process');
      runInMainBuild(api).then(function () {
        api.logger.info('build electron');

        var configureBuildCommand = require('electron-builder/out/builder').configureBuildCommand;

        var builderArgs = yargs.command(['build', '*'], 'Build', configureBuildCommand).parse(process.argv);

        require('electron-builder').build(merge(__assign({
          config: merge(defaultBuildConfig_1, builderOptions_1)
        }, builderArgs))).then(function () {
          api.logger.info('build electron success');
        });
      }).catch(function (error) {
        console.error(error);
      });
    }
  });

  function copyMainProcess() {
    var mainSrc = api.config.electronBuilder.mainSrc;
    var mainPath = path.join(process.cwd(), mainSrc);

    if (!fse.pathExistsSync(mainPath)) {
      fse.copySync(path.join(__dirname, '..', 'template'), mainPath);
    }
  }
}

exports.default = default_1;

function getAbsOutputDir(api) {
  var outputDir = api.config.electronBuilder.outputDir;
  return path.join(process.cwd(), outputDir);
}

function runInDevMode(api) {
  return __awaiter(this, void 0, void 0, function () {
    var wdsHost, wdsPort, env, hmrServer, electronArgs, args, _a, _b;

    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          wdsHost = 'localhost';
          return [4, util_1.getFreePort(wdsHost, 9080)];

        case 1:
          wdsPort = _c.sent();
          env = __assign(__assign({}, devUtil_1.getCommonEnv()), {
            ELECTRON_WEBPACK_WDS_HOST: wdsHost,
            ELECTRON_WEBPACK_WDS_PORT: wdsPort
          });
          hmrServer = new HmrServer_1.HmrServer();
          return [4, Promise.all([hmrServer.listen().then(function (it) {
            socketPath = it;
          }), startMainDevWatch(api, hmrServer)])];

        case 2:
          _c.sent();

          hmrServer.ipc.on('error', function (error) {
            devUtil_1.logError('Main', error);
          });
          electronArgs = process.env.ELECTRON_ARGS;
          if (!(electronArgs != null && electronArgs.length > 0)) return [3, 3];
          _a = JSON.parse(electronArgs);
          return [3, 5];

        case 3:
          _b = "--inspect=";
          return [4, util_1.getFreePort('127.0.0.1', 5858)];

        case 4:
          _a = [_b + _c.sent()];
          _c.label = 5;

        case 5:
          args = _a;
          args.push(path.join(api.paths.absTmpPath, 'main/main.js'));
          args.push.apply(args, process.argv.slice(3));
          startElectron(args, env);
          return [2];
      }
    });
  });
}

function runInMainBuild(api) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, mainWebpackConfig, mainSrc, mainConfig;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _a = api.config.electronBuilder, mainWebpackConfig = _a.mainWebpackConfig, mainSrc = _a.mainSrc;
          return [4, webpack_2.getMainWebpackConfig(mainSrc, true)];

        case 1:
          mainConfig = _b.sent();
          mainConfig.output.path = path.join(getAbsOutputDir(api), 'bundled');
          mainWebpackConfig(mainConfig);
          return [4, new Promise(function (resolve, reject) {
            var compiler = webpack_1.default(mainConfig);
            compiler.run(function (err) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })];

        case 2:
          _b.sent();

          return [2];
      }
    });
  });
}

function startMainDevWatch(api, hmrServer) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, mainWebpackConfig, mainSrc, mainConfig;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _a = api.config.electronBuilder, mainWebpackConfig = _a.mainWebpackConfig, mainSrc = _a.mainSrc;
          return [4, webpack_2.getMainWebpackConfig(mainSrc, false)];

        case 1:
          mainConfig = _b.sent();
          mainConfig.output.path = path.join(api.paths.absTmpPath, 'main');
          mainWebpackConfig(mainConfig);
          return [4, new Promise(function (resolve, reject) {
            var compiler = webpack_1.default(mainConfig);
            var printCompilingMessage = new devUtil_1.DelayedFunction(function () {
              devUtil_1.logProcess('Main', 'Compiling...', chalk_1.default.yellow);
            });
            compiler.hooks.compile.tap('electron-webpack-dev-runner', function () {
              hmrServer.beforeCompile();
              printCompilingMessage.schedule();
            });
            var watcher = compiler.watch({}, function (error, stats) {
              printCompilingMessage.cancel();

              if (watcher == null) {
                return;
              }

              if (error != null) {
                if (reject == null) {
                  devUtil_1.logError('Main', error);
                } else {
                  reject(error);
                  reject = null;
                }

                return;
              }

              devUtil_1.logProcess('Main', stats.toString({
                colors: true
              }), chalk_1.default.yellow);

              if (resolve != null) {
                resolve();
                resolve = null;
                return;
              }

              hmrServer.built(stats);
            });

            require('async-exit-hook')(function (callback) {
              debug("async-exit-hook: " + (callback == null));
              var w = watcher;

              if (w == null) {
                return;
              }

              watcher = null;
              w.close(function () {
                return callback();
              });
            });
          })];

        case 2:
          _b.sent();

          return [2];
      }
    });
  });
}

function startElectron(electronArgs, env) {
  var electronProcess = child_process_1.spawn(require('electron').toString(), electronArgs, {
    env: __assign(__assign({}, env), {
      ELECTRON_HMR_SOCKET_PATH: socketPath
    })
  });

  require('async-exit-hook')(function () {
    electronProcess.kill('SIGINT');
  });

  var queuedData = null;
  electronProcess.stdout.on('data', function (data) {
    data = data.toString();

    if (data.trim() === '[HMR] Updated modules:') {
      queuedData = data;
      return;
    }

    if (queuedData != null) {
      data = queuedData + data;
      queuedData = null;
    }

    devUtil_1.logProcess('Electron', data, chalk_1.default.blue);
  });
  devUtil_1.logProcessErrorOutput('Electron', electronProcess);
  electronProcess.on('close', function (exitCode) {
    debug("Electron exited with exit code " + exitCode);

    if (exitCode === 100) {
      setImmediate(function () {
        startElectron(electronArgs, env);
      });
    } else {
      process.emit('message', 'shutdown');
    }
  });
}