"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var fse = _interopRequireWildcard(require("fs-extra"));

var path = _interopRequireWildcard(require("path"));

var _umi = require("umi");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _require = require('../package.json'),
    dependencies = _require.dependencies;

var execa = _umi.utils.execa;

var electronWebpackCli = require.resolve('electron-webpack/out/cli');

function _default(api) {
  var isUpdatePkg = false;

  if (api.pkg.electronWebpack == null) {
    api.pkg.electronWebpack = {
      renderer: null
    };
    isUpdatePkg = true;
  }

  if (api.pkg.name == null) {
    api.pkg.name = 'electron_builder_app';
    isUpdatePkg = true;
  }

  if (api.pkg.version == null) {
    api.pkg.version = '0.0.1';
    isUpdatePkg = true;
  }

  if (api.pkg.main !== 'main.js') {
    api.pkg.main = 'main.js';
    isUpdatePkg = true;
  }

  var installAppDeps = 'electron-builder install-app-deps';
  var scripts = ['postinstall', 'postuninstall'];

  for (var _i = 0, _scripts = scripts; _i < _scripts.length; _i++) {
    var key = _scripts[_i];

    if (api.pkg.scripts[key] == null) {
      api.pkg.scripts[key] = installAppDeps;
      isUpdatePkg = true;
    }

    if (api.pkg.scripts[key].indexOf(installAppDeps) == -1) {
      api.pkg.scripts[key] = "".concat(api.pkg.scripts[key], " && ").concat(installAppDeps);
      isUpdatePkg = true;
    }
  }

  if (api.pkg.scripts['electron:pack'] == null) {
    api.pkg.scripts['electron:pack'] = 'umi build electron pack';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['electron:dev'] == null) {
    api.pkg.scripts['electron:dev'] = 'umi dev electron';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['electron:build'] == null) {
    api.pkg.scripts['electron:build'] = 'umi build electron';
    isUpdatePkg = true;
  }

  for (var _key in dependencies) {
    if (api.pkg.devDependencies[_key] == null) {
      api.pkg.devDependencies[_key] = dependencies[_key];
      isUpdatePkg = true;
    }
  }

  if (isUpdatePkg) {
    fse.writeFileSync(path.join(api.cwd, 'package.json'), JSON.stringify(api.pkg, null, 2));
  }

  var isElectron = api.args._[0] === 'electron';
  var commonOpts = {
    cwd: api.cwd,
    cleanup: true,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      FORCE_COLOR: 'true'
    }
  };
  api.describe({
    key: 'electronBuilder',
    config: {
      default: {
        builderOptions: {},
        externals: [],
        outputDir: 'dist_electron',
        routerMode: 'hash'
      },
      schema: function schema(joi) {
        return joi.object({
          outputDir: joi.string(),
          externals: joi.array(),
          builderOptions: joi.object()
        });
      }
    }
  });
  api.modifyConfig(function (config) {
    if (isElectron) {
      var _config$electronBuild = config.electronBuilder,
          outputDir = _config$electronBuild.outputDir,
          externals = _config$electronBuild.externals,
          routerMode = _config$electronBuild.routerMode;
      config.outputPath = path.join(outputDir, 'bundled'); //Electron模式下路由更改为hash|memory

      config.history = {
        type: routerMode
      };
      var configExternals = {
        electron: "require('electron')"
      };

      if (externals.length > 0) {
        var _iterator = _createForOfIteratorHelper(externals),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var moduleName = _step.value;
            configExternals[moduleName] = "require('".concat(moduleName, "')");
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      config.externals = _objectSpread(_objectSpread({}, configExternals), config.externals);
    }

    return config;
  }); //配置ElectronTarget

  api.chainWebpack(function (config) {
    if (isElectron) {
      config.target('electron-renderer');
    }

    return config;
  }); //start dev electron

  api.onDevCompileDone(function (_ref) {
    var isFirstCompile = _ref.isFirstCompile;
    checkMainProcess();

    if (isElectron && isFirstCompile) {
      api.logger.info('start dev electron');
      var child = execa.node(electronWebpackCli, ['dev'], commonOpts);
      child.on('close', function () {
        fse.removeSync(path.join(api.cwd, 'dist', 'main'));
        process.exit(0);
      });
    }
  }); //build electron

  api.onBuildComplete(function (_ref2) {
    var err = _ref2.err;
    checkMainProcess();

    if (isElectron && err == null) {
      var _api$config$electronB = api.config.electronBuilder,
          builderOptions = _api$config$electronB.builderOptions,
          externals = _api$config$electronB.externals,
          outputDir = _api$config$electronB.outputDir;
      var absOutputDir = path.join(api.cwd, outputDir);
      var externalsPath = api.paths.absNodeModulesPath;
      delete api.pkg.scripts;
      delete api.pkg.devDependencies;
      delete api.pkg.electronWebpack;
      Object.keys(api.pkg.dependencies).forEach(function (dependency) {
        if (!externals.includes(dependency)) {
          delete api.pkg.dependencies[dependency];
        }
      });
      var buildDependencies = ['source-map-support', 'electron-devtools-installer'];

      for (var _i2 = 0, _buildDependencies = buildDependencies; _i2 < _buildDependencies.length; _i2++) {
        var dep = _buildDependencies[_i2];
        var depPackageJsonPath = path.join(externalsPath, dep, 'package.json');

        if (fse.existsSync(depPackageJsonPath)) {
          api.pkg.dependencies[dep] = require(depPackageJsonPath).version;
        } else {
          api.pkg.dependencies[dep] = require(path.join(process.cwd(), 'node_modules', dep, 'package.json')).version;
        }
      } // Prevent electron-builder from installing app deps


      fse.ensureDirSync("".concat(absOutputDir, "/bundled/node_modules"));
      fse.writeFileSync("".concat(absOutputDir, "/bundled/package.json"), JSON.stringify(api.pkg, null, 2));
      var defaultBuildConfig = {
        directories: {
          output: absOutputDir,
          app: "".concat(absOutputDir, "/bundled")
        },
        files: ['**'],
        extends: null
      };
      api.logger.info('build main process');
      var child = execa.node(electronWebpackCli, ['main'], commonOpts);
      child.on('exit', function () {
        var distMainPath = path.join(api.cwd, 'dist', 'main');
        fse.moveSync(path.join(distMainPath, 'main.js'), path.join(absOutputDir, 'bundled', 'main.js'), {
          overwrite: true
        });
        fse.moveSync(path.join(distMainPath, 'main.js.map'), path.join(absOutputDir, 'bundled', 'main.js.map'), {
          overwrite: true
        });
        fse.removeSync(distMainPath); //打包electron

        var command = api.args._[1];
        var dir = false;

        if (command === 'pack') {
          dir = true;
          api.logger.info('pack electron');
        } else {
          api.logger.info('build electron');
        }

        require('electron-builder').build({
          config: _objectSpread(_objectSpread({}, defaultBuildConfig), builderOptions),
          dir: dir
        }).then(function () {
          api.logger.info('build electron success');
        });
      });
    }
  }); //检测主进程相关文件是否存在

  function checkMainProcess() {
    var mainPath = path.join(api.paths.absSrcPath, 'main');

    if (!fse.pathExistsSync(mainPath)) {
      fse.copySync(path.join(__dirname, '..', 'template'), mainPath);
    }
  }
}