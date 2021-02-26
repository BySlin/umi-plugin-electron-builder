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
exports.getNodeModulesPath = exports.getRootPkg = exports.installRely = void 0;

var path_1 = __importDefault(require("path"));

var fse = __importStar(require("fs-extra"));

var umi_1 = require("umi");

var execa = umi_1.utils.execa;

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