
const { merge } = require('webpack-merge')
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        open: true,
        hot: true,
        port: 3000,
    },
    devtool: 'eval-cheap-module-source-map',
    plugins:[
           // 7. 判断当前是开发还是生产环境
           new webpack.DefinePlugin({
                IS_DEV: 'true'
           })
    ],
})