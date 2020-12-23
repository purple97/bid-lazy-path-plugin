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
    this.options.isLocal = this.options.env == 'dev' || this.options.env == 'local' || this.options.env == 'daily';
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
      // compiler.hooks.entryOption.tap(pluginName, (compilation) => {
      //     const { chunkGroups } = compilation;
      //     console.log('== entryOption ==');
      //     console.log(compiler);
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
            _module.dependencies.forEach(function (dependency) {
              console.log(dependency);
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
      var chunkGroups = compilation.chunkGroups;
      var lazyFileMap = this.createFileMap(chunkGroups, version); // console.log(Object.keys(compilation));
      // console.log(chunkGroups[3].origins);
      // console.log(lazyFileMap);

      var mainDir = '';

      for (var _i2 = 0, _Object$keys2 = Object.keys(newAssets); _i2 < _Object$keys2.length; _i2++) {
        var name = _Object$keys2[_i2];

        if (name.indexOf(version) != -1) {
          mainDir = _path["default"].dirname(_path["default"].dirname(name));
          newAssets[name] = this.filterHostPaht(newAssets[name], mainDir);
        }

        if (/\.(js|jsx|ts|tsx)$/.test(name)) {
          // console.log(name);
          if (name.indexOf(version) == -1 && lazyFileMap[name]) {
            // let dirpath = mainDir ? mainDir + '/' : '';
            // const newName = this.createNewPath(dirpath + name, version);
            var newName = lazyFileMap[name];
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
    /*
     * 创建懒加载文件map
     * 收集所有主入口文件地址，匹配懒加载文件路径中是否包含主入口路径；
     * 符合以上要求的懒加载文件，修改路径为完成路径
     */

  }, {
    key: "createFileMap",
    value: function createFileMap(chunkGroups, version) {
      var _this2 = this;

      var lazyFileMap = {}; // 懒加载文件列表映射

      var mainDirArray = []; // 入口文件目录数组

      chunkGroups.forEach(function (_ref) {
        var chunks = _ref.chunks;
        var _chunks$ = chunks[0],
            id = _chunks$.id,
            name = _chunks$.name;
        if (name.indexOf(version) > -1) mainDirArray.push(_path["default"].dirname(_path["default"].dirname(name)));
      });
      chunkGroups.forEach(function (_ref2) {
        var chunks = _ref2.chunks;
        var _chunks$2 = chunks[0],
            id = _chunks$2.id,
            name = _chunks$2.name,
            files = _chunks$2.files; // console.log(id, name, files);

        var mainDirName = '';
        console.log(name, version, mainDirArray);

        if (name.indexOf(version) == -1) {
          mainDirArray.forEach(function (dir) {
            if (name.indexOf(dir) > -1) mainDirName = dir;
          });
          var filepath = mainDirName + "/".concat(version, "/") + files[0];
          lazyFileMap[files[0]] = _this2.options.isLocal ? filepath : 'javascripts/build/' + filepath;
        }
      });
      return lazyFileMap;
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
      var _this$options = this.options,
          outputDir = _this$options.outputDir,
          jsHost = _this$options.jsHost,
          version = _this$options.version,
          isLocal = _this$options.isLocal;
      var dir = mainDir.replace('javascripts/build/', ''); // const resouString = 'a.src=function(e){return l.p+""+e+".js"}(e);';
      // console.log('--bid-lazy-path-plugin--', mainDir, outputDir);

      var resouString = 'document.createElement("script");a.charset="utf-8",a.timeout=120,o.nc&&a.setAttribute("nonce",o.nc),a.src=function(e){return o.p+""+e+".js"}(e);';
      var rx = new RegExp(/charset="utf-8"[\w\.\d\s="\-,;&\(\)\{\}\+]*\);/); // const newString = `a.src=function(e){${newCode}}(e);`;

      RawSource._value = RawSource._value.replace(rx, function (str) {
        var objName = str.match(/\,\w\.nc\)\,/)[0].slice(1, 2);
        var newCode = isLocal ? "{var _p=window.location.pathname.split('/');_p.length=_p.length-1;return _p.join('/')+\"/".concat(version, "/\"+e+\".js\"}") : "{return ".concat(objName, ".p+\"").concat(dir, "/").concat(version, "/\"+e+\".js\"}");
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
