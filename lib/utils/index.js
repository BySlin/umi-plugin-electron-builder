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

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logProcess = exports.logError = exports.logProcessErrorOutput = exports.getAbsOutputDir = exports.getBuildDir = exports.getDevBuildDir = exports.getPreloadSrc = exports.getMainSrc = exports.getNodeModulesPath = exports.getRootPkg = exports.installRely = exports.debounce = void 0;

var path_1 = __importDefault(require("path"));

var fse = __importStar(require("fs-extra"));

var umi_1 = require("umi");

var chalk_1 = __importDefault(require("chalk"));

var execa = umi_1.utils.execa;

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

exports.debounce = debounce;

function isNpm() {
  var packageLockJsonPath = path_1.default.join(process.cwd(), 'package-lock.json');
  return fse.pathExistsSync(packageLockJsonPath);
}

function isYarn() {
  var yarnLockPath = path_1.default.join(process.cwd(), 'yarn.lock');
  return fse.pathExistsSync(yarnLockPath);
}

function installRely(pkgName) {
  var commandOpts = {
    cwd: process.cwd(),
    cleanup: true,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      FORCE_COLOR: 'true'
    }
  };

  if (isNpm()) {
    execa.commandSync("npm i " + pkgName + " --save-dev", commandOpts);
  } else if (isYarn()) {
    execa.commandSync("yarn add " + pkgName + " --dev", commandOpts);
  } else {
    execa.commandSync("yarn add " + pkgName + " --dev", commandOpts);
  }
}

exports.installRely = installRely;

function getRootPkg() {
  var pkg = fse.readJSONSync(path_1.default.join(process.cwd(), 'package.json'));

  if (pkg.devDependencies == null) {
    pkg.devDependencies = {};
  }

  return pkg;
}

exports.getRootPkg = getRootPkg;

function getNodeModulesPath() {
  return path_1.default.join(process.cwd(), 'node_modules');
}

exports.getNodeModulesPath = getNodeModulesPath;

function getMainSrc(api) {
  var mainSrc = api.config.electronBuilder.mainSrc;
  return path_1.default.join(process.cwd(), mainSrc);
}

exports.getMainSrc = getMainSrc;

function getPreloadSrc(api) {
  var preloadSrc = api.config.electronBuilder.preloadSrc;
  return path_1.default.join(process.cwd(), preloadSrc);
}

exports.getPreloadSrc = getPreloadSrc;

function getDevBuildDir(api) {
  return path_1.default.join(api.paths.absTmpPath, 'electron');
}

exports.getDevBuildDir = getDevBuildDir;

function getBuildDir(api) {
  return path_1.default.join(getAbsOutputDir(api), 'bundled');
}

exports.getBuildDir = getBuildDir;

function getAbsOutputDir(api) {
  var outputDir = api.config.electronBuilder.outputDir;
  return path_1.default.join(process.cwd(), outputDir);
}

exports.getAbsOutputDir = getAbsOutputDir;

function filterText(s, lineFilter) {
  var lines = s.trim().split(/\r?\n/).filter(function (it) {
    if (lineFilter != null && !lineFilter.filter(it)) {
      return false;
    }

    if (it.includes('Couldn\'t set selectedTextBackgroundColor from default ()')) {
      return false;
    }

    if (it.includes('Use NSWindow\'s -titlebarAppearsTransparent=YES instead.')) {
      return false;
    }

    return !it.includes('Warning: This is an experimental feature and could change at any time.') && !it.includes('No type errors found') && !it.includes('webpack: Compiled successfully.');
  });

  if (lines.length === 0) {
    return null;
  }

  return '  ' + lines.join("\n  ") + '\n';
}

function logProcessErrorOutput(label, childProcess) {
  childProcess.stderr.on('data', function (data) {
    logProcess(label, data.toString(), chalk_1.default.red);
  });
}

exports.logProcessErrorOutput = logProcessErrorOutput;

function logError(label, error) {
  logProcess(label, error.stack || error.toString(), chalk_1.default.red);
}

exports.logError = logError;

function logProcess(label, data, labelColor, lineFilter) {
  if (lineFilter === void 0) {
    lineFilter = null;
  }

  var LABEL_LENGTH = 28;
  var log = filterText(data.toString(), lineFilter);

  if (log == null || log.length === 0 || log.trim().length === 0) {
    return;
  }

  process.stdout.write(labelColor.bold("\u250F " + label + " " + '-'.repeat(LABEL_LENGTH - label.length - 1)) + '\n\n' + log + '\n' + labelColor.bold("\u2517 " + '-'.repeat(LABEL_LENGTH)) + '\n');
}

exports.logProcess = logProcess;