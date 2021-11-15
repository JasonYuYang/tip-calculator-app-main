const { resolve } = require('path');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
/*
  PWA: 渐进式网络开发应用程序(离线可访问)
    workbox --> workbox-webpack-plugin
*/
// 定义nodejs环境变量：决定使用browserslist的哪个环境
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');

/*
  tree shaking：去除无用代码
    前提：1. 必须使用ES6模块化  2. 开启production环境
    作用: 减少代码体积

    在package.json中配置 
      "sideEffects": false 所有代码都没有副作用（都可以进行tree shaking）
        问题：可能会把css / @babel/polyfill （副作用）文件干掉
      "sideEffects": ["*.css", "*.less"]
*/

module.exports = merge(common, {
  // 生产环境下会自动压缩js代码//内部会自动加载一些插件
  mode: 'production',
  entry: resolve(__dirname, '../src/script.js'),

  devtool: 'source-map',
  /*
    1. 单入口的这种形式经常使用，实现功能：单入口打包输出多个出口文件，从而使得多个文件并行运行，增加运行速度
    2. 这种方式可以将node_modules中代码单独打包一个chunk最终输出，将入口文件打包输出一个出口文件，如果想要将某个单独的文件也打包输出为一个文件，则需要进行以下配置：
      1. optimization配置
      2.在打包的出口文件中对需要单独打包的文件输入相关js代码
      https://juejin.cn/post/6909731086977368078/#heading-40
      通过js代码，让某个文件被单独打包成一个chunk
      import动态导入语法：能将某个文件单独打包
      webpackChunkName: 'test'的作用是命名输出的打包名称，否则打包名称会根据每次打包输出的id进行命名，每次打包输出的id不一样，名称也不一样
  */

  optimization: {
    /*
      1. 可以将node_modules中代码单独打包一个chunk最终输出
      2. 自动分析多入口chunk中，有没有公共的文件。如果有会打包成单独一个chunk
    */

    splitChunks: {
      // include all types of chunks
      chunks: 'all',
      // 重复打包问题
      cacheGroups: {
        vendors: {
          //node_modules里的代码
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          name: 'vendors', //chunks name
          priority: 10, //优先级
          enforce: true,
        },
      },
    },
    // 将当前模块的记录其他模块的hash单独打包为一个文件 runtime
    // 解决：修改a文件导致b文件的contenthash变化
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`,
    },
    minimizer: [
      // 配置生产环境的压缩方案：js和css
      new TerserWebpackPlugin({
        parallel: 4,
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),

      // 压缩css
      new CssMinimizerPlugin(),
    ],
  },
  // 解析模块的规则
  resolve: {
    // 告诉 webpack 解析模块是去找哪个目录（不写这个的话，他会一层一层的往上面找，直到找到位置），第2個node_modules是為了怕第一個找不到，原本是只有寫第二個的，第一個是為了找快點才加的
    modules: [resolve(__dirname, './node_modules'), 'node_modules'],
  },
});
