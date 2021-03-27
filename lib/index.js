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

var utils_1 = require("./utils");

var compile_1 = require("./compile");

var setup_1 = __importDefault(require("./setup"));

var yargs = umi_1.utils.yargs,
    merge = umi_1.utils.lodash.merge;

function default_1(api) {
  var _a;

  setup_1.default(api);
  api.describe({
    key: 'electronBuilder',
    config: {
      default: {
        buildType: 'webpack',
        mainSrc: 'src/main',
        preloadSrc: 'src/preload',
        builderOptions: {},
        externals: [],
        outputDir: 'dist_electron',
        routerMode: 'hash',
        rendererTarget: 'web',
        viteConfig: function viteConfig() {},
        mainWebpackChain: function mainWebpackChain() {}
      },
      schema: function schema(joi) {
        return joi.object({
          mainSrc: joi.string(),
          preloadSrc: joi.string(),
          outputDir: joi.string(),
          externals: joi.array(),
          builderOptions: joi.object(),
          routerMode: joi.string(),
          rendererTarget: joi.string(),
          viteConfig: joi.func(),
          mainWebpackChain: joi.func()
        });
      }
    }
  });
  api.registerCommand({
    name: 'electron',
    fn: function fn(_a) {
      var args = _a.args;
      var arg = args._[0];

      if (arg === 'init') {
        copyMainProcess();
      }
    }
  });
  var isElectron = ((_a = api.args) === null || _a === void 0 ? void 0 : _a._[0]) === 'electron';

  if (!isElectron) {
    return;
  }

  api.modifyConfig(function (config) {
    var _a = config.electronBuilder,
        outputDir = _a.outputDir,
        externals = _a.externals,
        routerMode = _a.routerMode;
    config.outputPath = path.join(outputDir, 'bundled');
    config.alias = config.alias || {};
    config.alias['@/common'] = path.join(process.cwd(), 'src/common');
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

    if (isFirstCompile) {
      api.logger.info('start dev electron');
      compile_1.runDev(api).catch(function (error) {
        console.error(error);
      });
    }
  });
  api.onBuildComplete(function (_a) {
    var err = _a.err;

    if (err == null) {
      var _b = api.config.electronBuilder,
          builderOptions_1 = _b.builderOptions,
          externals_2 = _b.externals;
      var absOutputDir = utils_1.getAbsOutputDir(api);
      var buildPkg_1 = utils_1.getRootPkg();
      buildPkg_1.main = 'main.js';
      delete buildPkg_1.scripts;
      delete buildPkg_1.devDependencies;
      Object.keys(buildPkg_1.dependencies).forEach(function (dependency) {
        if (!externals_2.includes(dependency)) {
          delete buildPkg_1.dependencies[dependency];
        }
      });
      var buildDependencies = ['electron-devtools-installer'];

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
      compile_1.runBuild(api).then(function () {
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
    var mainSrc = utils_1.getMainSrc(api);

    if (!fse.pathExistsSync(mainSrc)) {
      fse.copySync(path.join(__dirname, '..', 'template', 'main'), mainSrc, {
        overwrite: true
      });
    }

    var preloadSrc = utils_1.getPreloadSrc(api);

    if (!fse.pathExistsSync(preloadSrc)) {
      fse.copySync(path.join(__dirname, '..', 'template', 'preload'), preloadSrc, {
        overwrite: true
      });
    }
  }
}

exports.default = default_1;