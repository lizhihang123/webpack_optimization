
const {merge} = require('webpack-merge')
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
module.exports = merge(baseConfig, {
    mode: 'production',
    plugins:[
        // 7. 判断当前是开发还是生产环境
        new webpack.DefinePlugin({
          IS_DEV: 'false'
        })
    ],
})