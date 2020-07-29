"use strict";

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var pluginName = 'BidLazyPathPlugin';

var BidLazyPathPlugin = /*#__PURE__*/function () {
  function BidLazyPathPlugin(options) {
    _classCallCheck(this, BidLazyPathPlugin);

    this.options = options;
    this.options.isLocal = process.env.NODE_ENV == 'dev' || process.env.NODE_ENV == 'local';
  }

  _createClass(BidLazyPathPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      var self = this;
      this.options.mode = compiler.options.mode;
      this.options.output = compiler.options.output;
      this.options.outputDir = this.options.output.path.replace(compiler.context, '');
      this.options.outputDir = this.options.outputDir.substring(1, this.options.outputDir.length); // console.log(compiler);
      // compiler.hooks.beforeRun.tap(pluginName, (compilation) => {
      //     console.log('compiler.hooks.beforeRun.tapAsync:\n');
      //     console.log(compilation);
      // });

      /*  */
      // compiler.hooks.compile.tap(pluginName, (compilation) => {});

      /*  */
      // compiler.hooks.compilation.tap('RuntimePlugin', (compilation) => {
      //     // console.log(compilation.hooks);
      //     // compilation.hooks.succeedModule.tap('RuntimePlugin', (chunks) => {
      //     //     if (chunks.resource.match(/home\.jsx$/)) {
      //     //         // console.log(chunks);
      //     //     }
      //     //     return true;
      //     // });
      // });

      /*  */

      compiler.hooks.emit.tap(pluginName, function (compilation) {
        // this.printChunks(compilation);
        // this.printAssets(compilation);
        if (_this.options.version) {
          _this.recursionReplacePath(compilation, _this.options.version);
        }
      });
      /*  */
      // compiler.hooks.afterEmit.tap(pluginName, (compilation) => {
      //     // console.log(compilation.assetsInfo);
      // });
    } //打印 compilation.chunks

  }, {
    key: "printChunks",
    value: function printChunks(compilation) {
      compilation.chunks.forEach(function (chunk) {
        // chunk包含多个模块，通过chunk.modulesIterable可以遍历模块列表
        var _iterator = _createForOfIteratorHelper(chunk.modulesIterable),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _module = _step.value;

            // module包含多个依赖，通过module.dependencies进行遍历
            _module.dependencies.forEach(function (dependency) {// console.log(dependency);
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      });
    } // 打印 compilation.assets

  }, {
    key: "printAssets",
    value: function printAssets(compilation) {
      for (var _i = 0, _Object$keys = Object.keys(compilation.assets); _i < _Object$keys.length; _i++) {
        var name = _Object$keys[_i];
        // compilation.assets[name];
        console.log(name, '\n', compilation.assets[name]);
      }
    } //递归所有assets map对象；找到未未添加版本号的js文件；添加版本号;

  }, {
    key: "recursionReplacePath",
    value: function recursionReplacePath(compilation, version) {
      var newAssets = compilation.assets;
      var newAssetsInfo = compilation.assetsInfo;
      var mainDir = ''; // console.log(this.options.isLocal, this.options.jsHost, this.options.outputDir);

      for (var _i2 = 0, _Object$keys2 = Object.keys(newAssets); _i2 < _Object$keys2.length; _i2++) {
        var name = _Object$keys2[_i2];

        if (/\.(js|jsx|ts|tsx)$/.test(name)) {
          if (name.indexOf(version) != -1) {
            mainDir = _path["default"].dirname(_path["default"].dirname(name));
            newAssets[name] = this.filterHostPaht(newAssets[name], mainDir);
          }

          if (name.indexOf(version) == -1) {
            var dirpath = mainDir ? mainDir + '/' : '';
            var newName = this.createNewPath(dirpath + name, version);
            newAssets[newName] = newAssets[name];
            delete newAssets[name];
            this.setAssetsInfoByDependency(newAssetsInfo, name, newName);
          }
        }
      }

      compilation.assets = newAssets;
      compilation.assetsInfo = newAssetsInfo;
      return compilation;
    }
  }, {
    key: "createNewPath",
    value: function createNewPath(filepath, version) {
      var dir = _path["default"].dirname(filepath);

      var filename = _path["default"].basename(filepath);

      return [dir, version, filename].join('/');
    }
  }, {
    key: "setAssetsInfoByDependency",
    value: function setAssetsInfoByDependency(assetsInfo, key, newKey) {
      assetsInfo.set(newKey, assetsInfo.get(key));
      assetsInfo["delete"](key);
      return assetsInfo;
    }
    /*
     * 注意，主要修改以下代码解决版本和host问题；
     * ```a.src=function(e){return l.p+""+e+".js"}(e);```
     * 这段代码只有 webpack.config.output.chunkFilename = '[id].js', 才行;
     */

  }, {
    key: "filterHostPaht",
    value: function filterHostPaht(RawSource, mainDir) {
      var outputDir = this.options.outputDir;
      var jsHost = this.options.jsHost;
      var version = this.options.version; // const resouString = 'a.src=function(e){return l.p+""+e+".js"}(e);';

      var resouString = 'document.createElement("script");a.charset="utf-8",a.timeout=120,o.nc&&a.setAttribute("nonce",o.nc),a.src=function(e){return o.p+""+e+".js"}(e);';
      var rx = new RegExp(/charset="utf-8"[\w\.\d\s="\-,;&\(\)\{\}\+]*\);/);
      var newCode = this.options.isLocal ? "{var _p=window.location.pathname.split('/');_p.length=_p.length-1;return _p.join('/')+\"/".concat(version, "/\"+e+\".js\"}") : "{return l.p+\"".concat(version, "/\"+e+\".js\"}");
      var newString = "a.src=function(e){".concat(newCode, "}(e);");
      RawSource._value = RawSource._value.replace(rx, function (str) {
        return str.replace(/\{[\s\w\d\+"'.]*\}/, function (code) {
          return newCode.replace(/"\.js"/, code.match(/"\.[\w\d\s._\-]*\.js"/)[0]);
        });
      });
      return RawSource;
    }
  }]);

  return BidLazyPathPlugin;
}();

module.exports = BidLazyPathPlugin;