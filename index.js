/*
 * bid-lazy-path-plugin
 */
class BidLazyPathPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        var self = this;
        // for (var hook of Object.keys(compiler.hooks)) {
        //     console.log(hook);
        // }
        // compiler.plugin('compilation', (compilation) => {
        //     compilation.plugin('html-webpack-plugin-alter-asset-tags', (data) => {
        //         data.head = self._handleChunksConfig(data.head, data.plugin.options.version);
        //         data.body = self._handleChunksConfig(data.body, data.plugin.options.version);
        //     });
        // });
        // compiler.plugin('compilation', (compilation) => {
        //     const entrypoints = compilation.entrypoints;
        //     // console.log(compilation);
        // });

        compiler.plugin('emit', (compilation) => {
            const entrypoints = compilation.entrypoints;
            const points = entrypoints.get('src/p/react-test/0.1.14/index');
            console.log(compilation.options.output.path);
            // console.log(points.options);
            console.log(Object.keys(compilation.assets));
            // console.log(compilation.assetsInfo);
            // console.log(Object.keys(compilation.options));
            // const _assets = compilation.assets.map(key=>{
            //     if(key.test())
            // })
        });

        // compiler.hooks.compilation.tap('HtmlWebpackReplaceHost', (compilation) => {
        //     console.log('compiler.hooks.compilation:', compilation);
        // });
        // compiler.hooks.entryOption.tap('html-webpack-replace-host', (compilation) => {
        //     console.log(compilation);
        // });
    }
}

module.exports = BidLazyPathPlugin;
