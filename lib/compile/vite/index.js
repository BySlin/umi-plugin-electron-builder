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

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPreloadViteConfig = exports.getMainViteConfig = void 0;

var external_packages_config_1 = __importDefault(require("../../external-packages.config"));

var path = __importStar(require("path"));

var utils_1 = require("../../utils");

function getMainViteConfig(api) {
  var mode = api.env || 'development';
  var _a = api.config.electronBuilder,
      externals = _a.externals,
      viteConfig = _a.viteConfig;

  var external = __spreadArray(__spreadArray([], external_packages_config_1.default, true), externals, true);

  var mainConfig = {
    mode: mode,
    resolve: {
      alias: {
        '@/common': path.join(process.cwd(), 'src/common'),
        '@': (0, utils_1.getMainSrc)(api)
      }
    },
    root: (0, utils_1.getMainSrc)(api),
    build: {
      sourcemap: mode === 'development' ? 'inline' : false,
      outDir: mode === 'development' ? (0, utils_1.getDevBuildDir)(api) : (0, utils_1.getBuildDir)(api),
      assetsDir: '.',
      minify: mode !== 'development',
      lib: {
        entry: 'index.ts',
        formats: ['cjs']
      },
      rollupOptions: {
        external: external,
        output: {
          entryFileNames: 'main.js'
        }
      },
      emptyOutDir: false
    }
  };
  viteConfig(mainConfig, 'main');
  return mainConfig;
}

exports.getMainViteConfig = getMainViteConfig;

function getPreloadViteConfig(api, inputFileName, outputFileName) {
  var mode = api.env || 'development';
  var _a = api.config.electronBuilder,
      externals = _a.externals,
      viteConfig = _a.viteConfig;

  var external = __spreadArray(__spreadArray([], external_packages_config_1.default, true), externals, true);

  var preloadConfig = {
    mode: mode,
    resolve: {
      alias: {
        '@/common': path.join(process.cwd(), 'src/common'),
        '@': (0, utils_1.getPreloadSrc)(api)
      }
    },
    root: (0, utils_1.getPreloadSrc)(api),
    build: {
      sourcemap: mode === 'development' ? 'inline' : false,
      outDir: mode === 'development' ? (0, utils_1.getDevBuildDir)(api) : (0, utils_1.getBuildDir)(api),
      assetsDir: '.',
      minify: mode !== 'development',
      lib: {
        entry: inputFileName,
        formats: ['cjs']
      },
      rollupOptions: {
        external: external,
        output: {
          entryFileNames: outputFileName
        }
      },
      emptyOutDir: false
    }
  };
  viteConfig(preloadConfig, 'preload');
  return preloadConfig;
}

exports.getPreloadViteConfig = getPreloadViteConfig;