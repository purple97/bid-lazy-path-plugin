"use strict";

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BidLazyPathPlugin = /*#__PURE__*/function () {
  function BidLazyPathPlugin(options) {
    _classCallCheck(this, BidLazyPathPlugin);

    this.options = options;
  } //打印 compilation.chunks


  _createClass(BidLazyPathPlugin, [{
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
      for (var _i = 0, _Object$keys = Object.keys(compilation.assets); _i < _Object$keys.length; _i++) {// compilation.assets[name];
        // console.log(compilation.assets[name]);

        var name = _Object$keys[_i];
      }
    } //递归所有assets map对象；找到未未添加版本号的js文件；添加版本号;

  }, {
    key: "recursionReplacePath",
    value: function recursionReplacePath(assets, version) {
      for (var _i2 = 0, _Object$keys2 = Object.keys(assets); _i2 < _Object$keys2.length; _i2++) {
        var name = _Object$keys2[_i2];

        if (/\.(js|jsx|ts|tsx)$/.test(name) && name.indexOf(version) == -1) {
          var newName = this.createNewPath(name, version);
          assets[newName] = assets[name];
          delete assets[name];
        }
      }

      return assets;
    }
  }, {
    key: "createNewPath",
    value: function createNewPath(filepath, version) {
      var dir = _path["default"].dirname(filepath);

      var filename = _path["default"].basename(filepath);

      return [dir, version, filename].join('/');
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      var self = this;
      compiler.hooks.emit.tap('BidLazyPathPlugin', function (compilation) {
        // this.printChunks(compilation);
        // this.printAssets(compilation);
        if (_this.options.version) {
          _this.recursionReplacePath(compilation.assets, _this.options.version);
        }
      });
    }
  }]);

  return BidLazyPathPlugin;
}();

module.exports = BidLazyPathPlugin;