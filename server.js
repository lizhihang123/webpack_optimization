const express = require('express')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpack = require('webpack')
const config = require('./build/webpack.prod')

const app = express()
const compiler = webpack(config)
app.use(
  // publicPath 表示最终的文件生成好 放在哪里 ？ 放在根目录
  // 1 compiler 走config里面的配置 编译 2 放在 / 根目录下面
  webpackDevMiddleware(compiler, {
    publicPath: '/',
  })
)
// 注意app.use里面的webpackDevMiddleware 这个方法 返回的是一个中间件

app.listen(3000, () => {
  console.log('this server is running at http://localhost:3000')
})