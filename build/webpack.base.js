const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const webpack = require('webpack')
const dllPath = '../public/vendor'
module.exports = {
    entry: {
        index: './src/index.js',
    },
    output: {
        path: path.join(__dirname, '../dist'),
        // 2. 多入口无法对应一个固定的出口，所以修改filename为[name]变量
        // filename: '[name].[contenthash:8].js',
        filename: '[name].js',
        publicPath: '/'
    },
    optimization: {
        // css切割+随之而来的要匹配js切割
        minimizer: [
          new TerserJSPlugin(),
          new CssMinimizerPlugin(),
        ],
        // 代码切割 -> jquery 单独一个文件 / 某个模块 单独一个js文件
        splitChunks: {
            chunks: 'all',
            minSize: 0, // 切割后的模块 至少大于3000
            minChunks: 1,  // 切割后至少有一个模块。如果设置为2，但是切割后只有一个文件，就不切割
            maxAsyncRequests: 30,  // 打包后最多有几个“异步”请求这个页面最多加载几个请求
            maxInitialRequests: 30, // 页面初始最多有30个请求
            enforceSizeThreshold: 50000, // 强制的大小“门槛限制”，切割的大小必须在这个"之上"才会进行分割,minRemainingSize， maxAsyncRequests， maxInitialRequest会失效
            automaticNameDelimiter: '~',  // 分隔符
            name: (module, chunks, cacheGroups) => {
                return  cacheGroups
            }, // 切记，chunks是一个数组，里面的第一项，属性有我们需要的name值 hash值是undefined
            // 下面是设计分组
            cacheGroups: {
                defaultVendors: {
                  test: /[\\/]node_modules[\\/]/,
                  priority: -10, // 权重比下面更高
                  reuseExistingChunk: true, // 如果有重复的模块就不打包了
                },
                default: {
                  minChunks: 1, // 必须改为1，想要引入一个a.js到main.js里面也能够单独打包，必须修改上面的minSize的值足够小
                  priority: -20,
                  reuseExistingChunk: true,
                },
            },
        }
      },
    plugins: [
        // 1. html资源 让他生成到根目录下面
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['index']
        }),
        new AddAssetHtmlPlugin({
            filepath: path.resolve(__dirname, dllPath, 'vue_dll.js')
        }),
        // 10. 自动引入vue_dll.js
        
        // 3. 打包前 清除dist目录里的内容
        new CleanWebpackPlugin(),
        // 4. 拷贝文件 到dist目录下面
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname,'..', 'assets'),
                    // 会自动找到入口
                    to: 'assets'
                }
            ]
        }),
        // 5. banner 增加版权信息的插件
        new webpack.BannerPlugin('李治航的版权'),
          // 2. 将env属性转化为全局变量
        new webpack.DefinePlugin({ // webpack自带该插件，无需单独安装
        'process.env' : {
            NODE_DEBUG: process.env.NODE_DEBUG // 将属性转化为全局变量，让代码中可以正常访问
        }
        }),
        // 6. 变量 给到每个独立的js模块
        // new webpack.ProvidePlugin({
        //     $: 'jquery',
        //     jQuery: 'jquery'
        // }),
        // 7. css文件单独打包
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        // 8. ignore
        new webpack.IgnorePlugin({
            resourceRegExp: /\.\/locale/, 
            contextRegExp: /moment/}),
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, dllPath, 'manifest.json')
        })
    ],
    module: {
        // 使用parse
        noParse: /jquery|bootstrap/,
        // loader包
        rules: [
            // 1. css处理
            // use里面的loader读取顺序：从右 -> 左
            // css-loader - 先成功编译css代码
            // style-loader - 再把css代码放到index.html上去
            {
              test: /\.css$/,
            //   use: ['style-loader', 'css-loader'],
              use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
            },

            // 2. less处理
            {
                test: /\.less$/,
                // use: ['style-loader', 'css-loader', 'less-loader'],
                use: [MiniCssExtractPlugin.loader, 'css-loader','postcss-loader', 'less-loader'],
            },
            // 3. scss处理
            {
                test: /\.scss$/,
                // use: ['style-loader', 'css-loader', 'sass-loader'],
                use: [MiniCssExtractPlugin.loader, 'css-loader','postcss-loader', 'sass-loader'],
            },
           // 4. file-loader图片的处理
            {
                test: /\.(png|jpg|gif|jpeg)$/i,
                use: [
                {
                    loader: 'file-loader',
                    options: {
                    // 限制大小 表示字节
                    limit: 8192,
                    // 名字 表示 【原始的名字】-hash值【防止重复用的】.【原本的扩展至】
                    name: '[name]-[hash:6].[ext]',
                    // 输出文件到指定的文件夹
                    outputPath: 'images',
                    },
                },
                ],
                // 必须加这个新的type属性 限制 webpack5的 [assets loader]
                type: 'javascript/auto',
            },
            // 5. 字体图标的处理
            {
                test: /\.(woff|woff2|svg|eot|ttf)$/i,
                use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: '[name]-[hash:4].[ext]',
                        outputPath: 'fonts',
                        esModule: false
                    },
                },
                ],
                type: 'javascript/auto',
            },
            // 6. 图片的打包 和 copy的区别，copy更加的全面，是所有资源可以拷贝
            // // 以后如果有资源不能打包，但是线上需要，可以使用copy
            // // 但是图片我们还是希望能够压缩
            {
                test: /\.(htm|html)$/i,
                loader: 'html-withimg-loader'
            },
            // 7. 模块加载的loader
            // {
            //     test: require.resolve('jquery'),
            //     use: {
            //         loader: 'expose-loader',
            //         options: {
            //             exposes: ["$", "jQuery"],
            //         }
            //     }
            // }
        ],
    },
    resolve: {
        fallback: {
            "console": require.resolve("console-browserify"),
            "assert": require.resolve("assert/")
        }
    }
}