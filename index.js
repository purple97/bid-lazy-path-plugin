/*
 * @Author: dezhao.chen
 * @Date: 2020-04-22 21:06:04
 * @LastEditors: dezhao.chen
 * @LastEditTime: 2020-07-28 10:30:55
 * @Description: bid-lazy-path-plugin 懒加载文件输出路径添加version
 */
import path from 'path';
const pluginName = 'BidLazyPathPlugin';
class BidLazyPathPlugin {
    constructor(options) {
        this.options = options;
        this.options.isLocal = process.env.NODE_ENV == 'dev' || process.env.NODE_ENV == 'local';
    }

    apply(compiler) {
        var self = this;
        this.options.mode = compiler.options.mode;
        this.options.output = compiler.options.output;
        this.options.outputDir = this.options.output.path.replace(compiler.context, '');
        this.options.outputDir = this.options.outputDir.substring(1, this.options.outputDir.length);
        // compiler.hooks.beforeRun.tap(pluginName, (compilation) => {
        //     console.log('compiler.hooks.beforeRun.tapAsync:\n');
        //     console.log(compilation);
        // });
        /*  */
        // compiler.hooks.compile.tap(pluginName, (compilation) => {});
        /*  */
        compiler.hooks.compilation.tap('RuntimePlugin', (compilation) => {
            // console.log(compilation.hooks);
            // compilation.hooks.succeedModule.tap('RuntimePlugin', (chunks) => {
            //     if (chunks.resource.match(/home\.jsx$/)) {
            //         // console.log(chunks);
            //     }
            //     return true;
            // });
        });
        /*  */
        compiler.hooks.emit.tap(pluginName, (compilation) => {
            // this.printChunks(compilation);
            // this.printAssets(compilation);
            if (this.options.version) {
                this.recursionReplacePath(compilation, this.options.version);
            }
        });
        /*  */
        compiler.hooks.afterEmit.tap(pluginName, (compilation) => {
            // console.log(compilation.assetsInfo);
        });
    }

    //打印 compilation.chunks
    printChunks(compilation) {
        compilation.chunks.forEach((chunk) => {
            // chunk包含多个模块，通过chunk.modulesIterable可以遍历模块列表
            for (const module of chunk.modulesIterable) {
                // module包含多个依赖，通过module.dependencies进行遍历
                module.dependencies.forEach((dependency) => {
                    // console.log(dependency);
                });
            }
        });
    }
    // 打印 compilation.assets
    printAssets(compilation) {
        for (const name of Object.keys(compilation.assets)) {
            // compilation.assets[name];
            console.log(name, '\n', compilation.assets[name]);
        }
    }

    //递归所有assets map对象；找到未未添加版本号的js文件；添加版本号;
    recursionReplacePath(compilation, version) {
        let newAssets = compilation.assets;
        let newAssetsInfo = compilation.assetsInfo;
        let mainDir = '';
        // console.log(this.options.isLocal, this.options.jsHost, this.options.outputDir);
        for (const name of Object.keys(newAssets)) {
            if (/\.(js|jsx|ts|tsx)$/.test(name)) {
                if (name.indexOf(version) != -1) {
                    mainDir = path.dirname(path.dirname(name));
                    console.log(name);
                    newAssets[name] = this.filterHostPaht(newAssets[name], mainDir);
                }
                // console.log(name);
                if (name.indexOf(version) == -1) {
                    let dirpath = mainDir ? mainDir + '/' : '';
                    const newName = this.createNewPath(dirpath + name, version);
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

    createNewPath(filepath, version) {
        const dir = path.dirname(filepath);
        const filename = path.basename(filepath);
        return [dir, version, filename].join('/');
    }

    setAssetsInfoByDependency(assetsInfo, key, newKey) {
        assetsInfo.set(newKey, assetsInfo.get(key));
        assetsInfo.delete(key);
        return assetsInfo;
    }

    /*
     * 注意，主要修改以下代码解决版本和host问题；
     * ```a.src=function(e){return l.p+""+e+".js"}(e);```
     * 这段代码只有 webpack.config.output.chunkFilename = '[id].js', 才行;
     */
    filterHostPaht(RawSource, mainDir) {
        const outputDir = this.options.outputDir;
        const jsHost = this.options.jsHost;
        const version = this.options.version;
        // const resouString = 'a.src=function(e){return l.p+""+e+".js"}(e);';
        const resouString =
            'document.createElement("script");a.charset="utf-8",a.timeout=120,o.nc&&a.setAttribute("nonce",o.nc),a.src=function(e){return o.p+""+e+".js"}(e);';
        const rx = new RegExp(/charset="utf-8"[\w\.\d\s="\-,;&\(\)\{\}\+]*\);/);
        const newCode = this.options.isLocal
            ? `{var _p=window.location.pathname.split('/');_p.length=_p.length-1;return _p.join('/')+"/${version}/"+e+".js"}`
            : `{return l.p+"${version}/"+e+".js"}`;
        const newString = `a.src=function(e){${newCode}}(e);`;
        RawSource._value = RawSource._value.replace(rx, (str) => str.replace(/\{[\s\w\d\+"'.]*\}/, (code) => newCode));
        return RawSource;
    }
}

module.exports = BidLazyPathPlugin;
