/*
  index.js: webpack入口起点文件

  1. 运行指令：
    开发环境：webpack ./src/index.js -o ./build/built.js --mode=development
      webpack会以 ./src/index.js 为入口文件开始打包，打包后输出到 ./build/built.js
      整体打包环境，是开发环境
    生产环境：webpack ./src/index.js -o ./build/built.js --mode=production
      webpack会以 ./src/index.js 为入口文件开始打包，打包后输出到 ./build/built.js
      整体打包环境，是生产环境

   2. 结论：
    1. webpack能处理js/json资源，不能处理css/img等其他资源
    2. 生产环境和开发环境将ES6模块化编译成浏览器能识别的模块化~
    3. 生产环境比开发环境多一个压缩js代码。
*/
/*
  开发环境配置：能让代码运行
    运行项目指令：
      webpack 会将打包结果输出出去
      npx webpack-dev-server 只会在内存中编译打包，没有输出

  所有的代码打包输出到js/built.js文件中
  随着我们的资源越来越多，我们还需要将代码分类打包，便是在每一个loader中使用outputPath: build文件夹下面的需要放置打包文件的文件夹名
  css、less等文件不需要设置专门的outputPath，因为它们是直接打包成字符串放进js文件中的
*/

const { join, resolve } = require('path'); // node 内置核心模块，用来处理路径问题。
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');

module.exports = merge(common, {
  mode: 'development',
  entry: join(__dirname, '../src/script.js'),

  // 要安装 webpack-dev-server（因为是本地安装，所以需要使用npx webpack-dev-server启动，webpack我们使用的全局安装，所以启动的时候不需要使用npx）
  // 开发服务器 devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器~~）
  // 特点：只会在内存中编译打包，不会有任何输出
  // 启动devServer指令为：npx webpack-dev-server
  devServer: {
    // 项目构建后路径
    // contentBase: resolve(__dirname, '../build'),
    static: resolve(__dirname, '../src/images'),
    // 监视 contentBase 目录下的所有文件，一旦文件变化就会 reload
    // watchContentBase: true,
    // watchFiles: {
    //   // 忽略文件
    //   ignored: /node_modules/,
    // },
    // 当使用 [HTML5 History API] 时，任意的 `404` 响应被替代为 `index.html`
    // static允许我们在DevServer下访问该目录的静态资源
    // 简单理解来说 当我们启动DevServer时相当于启动了一个本地服务器
    // 这个服务器会同时以static-directory目录作为跟路径启动
    // 这样的话就可以访问到static/directory下的资源了
    // static: {
    //   directory: path.join(__dirname, "../public"),
    // },
    historyApiFallback: true,
    // 启动gzip压缩(使得打包后的代码体积更小)
    compress: true,
    // 端口号
    port: 3000,
    // 自动打开浏览器
    open: true,

    /*
      1.为什么要启用热更新？
      当我们改变页面中的css文件的时候会触发整个文件包括js文件都会重新打包进行更新，这样会造成慢的打包速度，这是我们不想要的结果，所以要进行热更新，只对修改的那个文件进行重新打包，进行更新。

      2.HMR: hot module replacement 热模块替换 / 模块热替换（在devServer中将hot设置为true即为开启）
        作用：一个模块发生变化，只会重新打包这一个模块（而不是打包所有模块） 
          极大提升构建速度
          
          样式文件：可以使用HMR功能：因为style-loader内部实现了~

          js文件：默认不能使用HMR功能 --> 需要修改js代码，添加支持HMR功能的代码
            注意：HMR功能对js的处理，只能处理非入口js文件的其他文件。

          html文件: 默认不能使用HMR功能.同时会导致问题：html文件不能热更新了~ （不用做HMR功能，因为只有一个html文件，只要里面的内容发生变化，文件是一定要更新的）
            解决：修改entry入口，将html文件引入,这样才可以生效*/
    hot: true,
    /*
      source-map: 一种 提供源代码到构建后代码映射 技术 （如果构建后代码出错了，通过映射可以追踪源代码错误）

        [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map

        source-map：外部
          错误代码准确信息 和 源代码的错误位置
        inline-source-map：内联
          只生成一个内联source-map
          错误代码准确信息 和 源代码的错误位置
        hidden-source-map：外部
          错误代码错误原因，但是没有错误位置
          不能追踪源代码错误，只能提示到构建后代码的错误位置
        eval-source-map：内联
          每一个文件都生成对应的source-map，都在eval
          错误代码准确信息 和 源代码的错误位置
        nosources-source-map：外部
          错误代码准确信息, 但是没有任何源代码信息
        cheap-source-map：外部
          错误代码准确信息 和 源代码的错误位置 
          只能精确的行
        cheap-module-source-map：外部
          错误代码准确信息 和 源代码的错误位置 
          module会将loader的source map加入

        内联 和 外部的区别：1. 外部生成了文件，内联没有 2. 内联构建速度更快

        开发环境：速度快，调试更友好
          速度快(eval>inline>cheap>...)
            eval-cheap-souce-map（速度最快）
            eval-source-map
          调试更友好  
            souce-map（调试最好）
            cheap-module-souce-map
            cheap-souce-map

          --> eval-source-map  > ：eval-cheap-module-souce-map

        生产环境：源代码要不要隐藏? 调试要不要更友好
          内联会让代码体积变大，所以在生产环境不用内联
          nosources-source-map 全部隐藏
          hidden-source-map 只隐藏源代码，会提示构建后代码错误信息

          --> source-map（） / cheap-module-souce-map
          最终总结：
            开发环境使用：eval-source-map
            生产环境使用：source-map（）
    */
  },
  devtool: 'eval-source-map',
  cache: {
    type: 'filesystem', // 使用文件缓存
    allowCollectingMemory: true,
  },
});
