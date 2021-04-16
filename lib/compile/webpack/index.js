"use strict";

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
exports.build = exports.getWebpackConfig = void 0;

var webpack_1 = __importDefault(require("webpack"));

var webpack_chain_1 = __importDefault(require("webpack-chain"));

var external_packages_config_1 = __importDefault(require("../../external-packages.config"));

var path_1 = __importDefault(require("path"));

var utils_1 = require("../../utils");

function getWebpackConfig(api, type) {
  var mode = api.env === 'development' ? 'development' : 'production';
  var _a = api.config.electronBuilder,
      externals = _a.externals,
      mainWebpackChain = _a.mainWebpackChain;

  var external = __spreadArray(__spreadArray([], external_packages_config_1.default), externals);

  var config = new webpack_chain_1.default();
  config.mode(mode);
  config.node.set('__filename', false).set('__dirname', false);
  config.devtool(mode === 'development' ? 'inline-source-map' : false);
  config.resolve.extensions.add('.ts').add('.js').add('.node');
  config.module.rule('ts').exclude.add(/node_modules/);
  config.module.rule('ts').test(/\.ts?$/).use('ts').loader('ts-loader').options({
    transpileOnly: true
  });
  config.resolve.alias.set('@/common', path_1.default.join(process.cwd(), 'src/common'));
  config.externals(external);
  config.output.path(mode === 'development' ? utils_1.getDevBuildDir(api) : utils_1.getBuildDir(api));

  if (type === 'main') {
    config.resolve.alias.set('@', utils_1.getMainSrc(api));
    config.context(utils_1.getMainSrc(api));
    config.entry('main').add('./index.ts');
    config.output.filename('main.js');
    config.target('electron-main');
    config.output.library('main').libraryTarget('commonjs2');
    mainWebpackChain(config, 'main');
  } else {
    config.resolve.alias.set('@', utils_1.getPreloadSrc(api));
    config.context(utils_1.getPreloadSrc(api));
    config.entry('preload').add('./index.ts');
    config.output.filename('preload.js');
    config.target('electron-renderer');
    config.output.library('preload').libraryTarget('commonjs2');
    mainWebpackChain(config, 'preload');
  }

  return config.toConfig();
}

exports.getWebpackConfig = getWebpackConfig;

var build = function build(config) {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4, new Promise(function (resolve, reject) {
            var compiler = webpack_1.default(config);
            compiler.run(function (err) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })];

        case 1:
          return [2, _a.sent()];
      }
    });
  });
};

exports.build = build;