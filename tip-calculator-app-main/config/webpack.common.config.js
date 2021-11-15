const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 使用这个插件的作用：style样式不是放在style标签中的，而是通过link的方式使用
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css抽离
const chalk = require('chalk');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

/*
  缓存：
    babel缓存
      cacheDirectory: true
      --> 让第二次打包构建速度更快
    文件资源缓存
      hash: 每次wepack构建时会生成一个唯一的hash值。
        问题: 因为js和css同时使用一个hash值。
          如果重新打包，会导致所有缓存失效。（可能我却只改动一个文件）
      chunkhash：根据chunk生成的hash值。如果打包来源于同一个chunk，那么hash值就一样
        问题: js和css的hash值还是一样的
          因为css是在js中被引入的，所以同属于一个chunk
      contenthash: 根据文件的内容生成hash值。不同文件hash值一定不一样    
      --> 让代码上线运行缓存更好使用
*/

module.exports = {
  output: {
    // [name]：取文件名（比如上面的entry中名称为index,那么输出的文件名首部会有index名称）
    filename: 'js/[name].[contenthash:10].js',
    path: resolve(__dirname, '../build'),
    chunkFilename: 'js/[name].[contenthash:10]_chunk.js', // 非入口chunk的名称
  },
  module: {
    rules: [
      /*
        语法检查： eslint-loader  eslint
          注意：只检查自己写的源代码，第三方的库是不用检查的
          设置检查规则：
            package.json中eslintConfig中设置~
              "eslintConfig": {
                "extends": "airbnb-base"
              }
            airbnb --> eslint-config-airbnb-base  eslint-plugin-import eslint
      */
      {
        test: /\.jsx?$/,
        exclude: /node_modules/, //排除第三方的代码，只检查自己的代码

        include: resolve(__dirname, '../src'),
        // 单个loader用loader
        loader: 'eslint-loader',
        /*
                        正常来讲，一个文件只能被一个loader处理。
                        当一个文件要被多个loader处理，那么一定要指定loader执行的先后顺序：
                          先执行eslint 在执行babel
                      */
        // 优先执行
        enforce: 'pre',
        // enforce: 'post',

        options: {
          // 自动修复eslint的错误
          fix: true,
        },
      },
      {
        oneOf: [
          {
            /*
              js兼容性处理：babel-loader @babel/core 
                1. 基本js兼容性处理 --> @babel/preset-env
                  问题：只能转换基本语法，如promise高级语法不能转换
                2. 全部js兼容性处理 --> @babel/polyfill  
                  问题：我只要解决部分兼容性问题，但是将所有兼容性代码全部引入，体积太大了~
                3. 需要做兼容性处理的就做：按需加载  --> core-js
            */
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
              // 预设：指示babel做怎么样的兼容性处理
              presets: [
                [
                  '@babel/preset-env',
                  {
                    // 按需加载
                    useBuiltIns: 'usage',
                    // 指定core-js版本
                    corejs: '3.19.0',
                    targets: {
                      chrome: '60',
                      firefox: '60',
                      ie: '9',
                      safari: '10',
                      edge: '17',
                    },
                  },
                ],
              ],
              // // 开启babel缓存
              // // 第二次构建时，会读取之前的缓存
              cacheDirectory: true,
            },
          },
          {
            test: /\.(sa|sc|c)ss$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },

              'css-loader',
              'postcss-loader',
              {
                loader: 'resolve-url-loader',
                options: {
                  keepQuery: true,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
          {
            // 问题：默认处理不了html中img图片
            // 处理图片资源
            test: /\.(jpe?g|png|gif|svg)$/,
            type: 'asset/inline',
          },
          {
            test: /\.html$/,
            // 处理html文件的img图片（负责引入img，从而能被url-loader进行处理）
            loader: 'html-loader',
          },
          {
            // 打包其他资源(除了html/js/css资源以外的资源)
            // 排除css/js/html资源
            exclude: /\.(css|js|html|jpe?g|png|gif|svg)$/,
            type: 'asset/resource',
            generator: {
              filename: 'media/[hash][ext][query]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve(__dirname, '../src/index.html'),
      // 压缩html代码
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true,
      },
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      // 对输出的css文件进行重命名
      filename: 'css/[name].[contenthash:10].css',
    }),
    // 进度条
    new ProgressBarPlugin({
      format: `  :msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`,
    }),
  ],
};
