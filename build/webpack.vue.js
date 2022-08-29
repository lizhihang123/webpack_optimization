// 专门给vue文件 生成动态链接库 使用
const path = require('path')
const webpack = require('webpack')
const dllPath = '../public/vendor'
module.exports = {
    mode: 'development',
    entry: {
        vue: [
            'vue/dist/vue',
            'vue-router'
        ]
    },
    output: {
        filename: '[name]_dll.js',
        path: path.resolve(__dirname, dllPath),
        library: '[name]_dll'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '[name]_dll',
            path: path.resolve(__dirname, dllPath, 'manifest.json')
        })
    ]
}