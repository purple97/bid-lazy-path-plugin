# bid-lazy-path-plugin

## 懒加载文件输出路径修改

## v1.0.12

-   懒加载的模块集中存放会 导致输出路径为 ./version/1.has.js ;
    -   期望为 ./src/p/pageName/version/1.has.js
    -   原因：懒加载的文件路径 src/pages/lazy.js, 导致无法匹配到入口文件 src/p/index/index.js 导致路径出错
    ```javascript
    mainDirArray.forEach((dir) => {
        if (name.indexOf(dir) > -1) mainDirName = dir; // 无法命中该条件
    });
    ```
    -   解决:
    ```javascript
    mainDirName = mainDirArray[0]; // 默认值为第一个文件
    ```
    -   解决办法不完善，主要因为无法定位主入口文件
