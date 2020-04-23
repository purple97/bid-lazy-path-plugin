/*
 * @Author: dezhao.chen
 * @Date: 2020-04-22 21:06:04
 * @LastEditors: dezhao.chen
 * @LastEditTime: 2020-04-23 20:58:39
 * @Description: bid-lazy-path-plugin 懒加载文件添加version
 */
const path = require('path');
class BidLazyPathPlugin {
    constructor(options) {
        this.options = options;
    }

    //打印 compilation.chunks
    printChunks(compilation) {
        compilation.chunks.forEach((chunk) => {
            // chunk包含多个模块，通过chunk.modulesIterable可以遍历模块列表
            for (const module of chunk.modulesIterable) {
                // module包含多个依赖，通过module.dependencies进行遍历
                module.dependencies.forEach((dependency) => {
                    console.log('================================================');
                    console.log(dependency);
                    console.log('================================================');
                });
            }
        });
    }
    // 打印 compilation.assets
    printAssets(compilation) {
        for (const name of Object.keys(compilation.assets)) {
            // compilation.assets[name];
            // console.log(compilation.assets[name]);
            console.log(name);
        }
    }

    //递归所有assets map对象；找到未未添加版本号的js文件；添加版本号;
    recursionReplacePath(assets, version) {
        for (const name of Object.keys(assets)) {
            if (/\.(js|jsx|ts|tsx)$/.test(name) && name.indexOf(version) == -1) {
                const newName = this.createNewPath(name, version);
                assets[newName] = assets[name];
                delete assets[name];
            }
        }
        return assets;
    }

    createNewPath(filepath, version) {
        const dir = path.dirname(filepath);
        const filename = path.basename(filepath);
        return [dir, version, filename].join('/');
    }

    apply(compiler) {
        var self = this;
        compiler.hooks.emit.tap('BidLazyPathPlugin', (compilation) => {
            const entrypoints = compilation.entrypoints;
            const points = entrypoints.get('src/p/react-test/0.1.14/index');
            console.log(this.options);
            // this.printChunks(compilation);
            // this.printAssets(compilation);
            if (this.options.version) {
                this.recursionReplacePath(compilation.assets, this.options.version);
            }
        });
    }
}

module.exports = BidLazyPathPlugin;
