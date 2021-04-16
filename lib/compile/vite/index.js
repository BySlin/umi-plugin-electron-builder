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
exports.getViteConfig = void 0;

var external_packages_config_1 = __importDefault(require("../../external-packages.config"));

var path = __importStar(require("path"));

var utils_1 = require("../../utils");

function getViteConfig(api, type) {
  var mode = api.env || 'development';
  var _a = api.config.electronBuilder,
      externals = _a.externals,
      viteConfig = _a.viteConfig;

  var external = __spreadArray(__spreadArray([], external_packages_config_1.default), externals);

  if (type === 'main') {
    var mainConfig = {
      mode: mode,
      resolve: {
        alias: {
          '@/common': path.join(process.cwd(), 'src/common'),
          '@': utils_1.getMainSrc(api)
        }
      },
      root: utils_1.getMainSrc(api),
      build: {
        sourcemap: mode === 'development' ? 'inline' : false,
        outDir: mode === 'development' ? utils_1.getDevBuildDir(api) : utils_1.getBuildDir(api),
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
  } else {
    var preloadConfig = {
      mode: mode,
      resolve: {
        alias: {
          '@/common': path.join(process.cwd(), 'src/common'),
          '@': utils_1.getPreloadSrc(api)
        }
      },
      root: utils_1.getPreloadSrc(api),
      build: {
        sourcemap: mode === 'development' ? 'inline' : false,
        outDir: mode === 'development' ? utils_1.getDevBuildDir(api) : utils_1.getBuildDir(api),
        assetsDir: '.',
        minify: mode !== 'development',
        lib: {
          entry: 'index.ts',
          formats: ['cjs']
        },
        rollupOptions: {
          external: external,
          output: {
            entryFileNames: 'preload.js'
          }
        },
        emptyOutDir: false
      }
    };
    viteConfig(preloadConfig, 'preload');
    return preloadConfig;
  }
}

exports.getViteConfig = getViteConfig;