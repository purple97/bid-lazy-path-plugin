/*
 * @Author: dezhao.chen
 * @Date: 2020-04-22 21:06:04
 * @LastEditors: dezhao.chen
 * @LastEditTime: 2020-08-19 15:56:24
 * @Description: bid-lazy-path-plugin 懒加载文件输出路径添加version
 * 构建出来的js文件路径都在这处理
 */
import path from 'path';
const pluginName = 'BidLazyPathPlugin';
class BidLazyPathPlugin {
    constructor(options) {
        this.options = options;
        this.options.isLocal = this.options.env == 'dev' || this.options.env == 'local' || this.options.env == 'daily';
    }

    apply(compiler) {
        var self = this;
        this.options.mode = compiler.options.mode;
        this.options.output = compiler.options.output;
        this.options.outputDir = this.options.output.path.replace(compiler.context, '');
        this.options.outputDir = this.options.outputDir.substring(1, this.options.outputDir.length);
        // console.log(compiler);
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
        compiler.hooks.emit.tap(pluginName, (compilation) => {
            // this.printChunks(compilation);
            // this.printAssets(compilation);
            if (this.options.version) {
                this.recursionReplacePath(compilation, this.options.version);
            }
        });
        /*  */
        // compiler.hooks.afterEmit.tap(pluginName, (compilation) => {
        //     // console.log(compilation.assetsInfo);
        // });
    }

    //打印 compilation.chunks
    printChunks(compilation) {
        compilation.chunks.forEach((chunk) => {
            // chunk包含多个模块，通过chunk.modulesIterable可以遍历模块列表
            for (const module of chunk.modulesIterable) {
                // module包含多个依赖，通过module.dependencies进行遍历
                module.dependencies.forEach((dependency) => {
                    console.log(dependency);
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
        const { chunkGroups } = compilation;
        const lazyFileMap = this.createFileMap(chunkGroups, version);
        // console.log(Object.keys(compilation));
        // console.log(chunkGroups[3].origins);
        // console.log(lazyFileMap);
        let mainDir = '';
        for (const name of Object.keys(newAssets)) {
            if (name.indexOf(version) != -1) {
                mainDir = path.dirname(path.dirname(name));
                newAssets[name] = this.filterHostPaht(newAssets[name], mainDir);
            }
            if (/\.(js|jsx|ts|tsx)$/.test(name)) {
                // console.log(name);
                if (name.indexOf(version) == -1 && lazyFileMap[name]) {
                    // let dirpath = mainDir ? mainDir + '/' : '';
                    // const newName = this.createNewPath(dirpath + name, version);
                    const newName = lazyFileMap[name];
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
    createFileMap(chunkGroups, version) {
        const lazyFileMap = {}; // 懒加载文件列表映射
        const mainDirArray = []; // 入口文件目录数组
        chunkGroups.forEach(({ chunks }) => {
            const { id, name } = chunks[0];
            if (name.indexOf(version) > -1) mainDirArray.push(path.dirname(path.dirname(name)));
        });
        chunkGroups.forEach(({ chunks }) => {
            const { id, name, files, _groups } = chunks[0];
            // console.log(id, name, files);
            // console.log(Object.keys(chunks[0]));
            let mainDirName = '';
            let originDirName = null;
            // console.log(name, version, mainDirArray);
            if (name.indexOf(version) == -1) {
                let filepath = `/${version}/` + files[0];
                mainDirArray.forEach((dir) => {
                    if (name.indexOf(dir) > -1) {
                        originDirName = mainDirName = dir;
                    }
                });
                // 懒加载文件是否找到宿主目录
                if (originDirName) {
                    filepath = mainDirName + filepath;
                } else {
                    filepath = mainDirArray[0] + filepath;
                }
                lazyFileMap[files[0]] = this.options.isLocal ? filepath : 'javascripts/build/' + filepath;
            }
        });
        return lazyFileMap;
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
        const { outputDir, jsHost, version, isLocal } = this.options;
        const dir = mainDir.replace('javascripts/build/', '');
        // const resouString = 'a.src=function(e){return l.p+""+e+".js"}(e);';
        // console.log('--bid-lazy-path-plugin--', mainDir, outputDir);
        const resouString =
            'document.createElement("script");a.charset="utf-8",a.timeout=120,o.nc&&a.setAttribute("nonce",o.nc),a.src=function(e){return o.p+""+e+".js"}(e);';
        const rx = new RegExp(/charset="utf-8"[\w\.\d\s="\-,;&\(\)\{\}\+]*\);/);
        // const newString = `a.src=function(e){${newCode}}(e);`;
        RawSource._value = RawSource._value.replace(rx, (str) => {
            const objName = str.match(/\,\w\.nc\)\,/)[0].slice(1, 2);
            const newCode = isLocal
                ? `{var _p=window.location.pathname.split('/');_p.length=_p.length-1;return _p.join('/')+"/${version}/"+e+".js"}`
                : `{return ${objName}.p+"${dir}/${version}/"+e+".js"}`;
            return str.replace(/\{[\s\w\d\+"'.]*\}/, (code) => newCode.replace(/"\.js"/, code.match(/"\.[\w\d\s._\-]*\.js"/)[0]));
        });
        return RawSource;
    }
}

module.exports = BidLazyPathPlugin;
