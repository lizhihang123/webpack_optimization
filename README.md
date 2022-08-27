# webpack 优化部分【重要】

## 1. tree-shaking

第一步，理解概念

帮我们把不必要的代码去除掉。比如一个math.js文件里面导出了两个方法，add和sub,另一个文件里面引入了add，没有用sub，打包时，就不打包sub



第二步，理解使用条件

使用Import和export模块化语法，`才能够`触发tree-shaking

require语法 不行，因为require是动态导入，可以在if else 语法里面写，文件里面各个地方都可以写，所以万一“摇掉了”后面又用到了？

而import必须写在页面的最顶层，只要顶层没有引入，就可以不打包





require：

导出时：

```diff
module.exports = {
    add: function(a, b) {
        console.log(a + b);
    } ,
    sub: function(a, b) {
        console.log(a - b);
    } 
}
```



引入时：

```diff
const { add } = require('./math')
console.log(add);
add(3, 5)
```



yarn build打包时，发现

![image-20220823103154583](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220823103154583.png)





使用ES6：

导出

```diff
export const add = function(a, b) {
    console.log(a + b, '我是add函数');
}

export const sub = function (a, b) {
    console.log(a - b, '我是sub函数');
}
```



引入

```diff

import {add} from './math'
console.log(add);
add(3, 5)
```



查看yarn build打包的结果 dist/index.js



![image-20220823103340253](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220823103340253.png)



你会发现只有add的结果





## 2. scope-hoisting

第一步，理解概念，分析模块之间的依赖，可以让webpack打包出来的代码文件更小，运行的更快

1. 打散的模块合并到一个函数
2. 只有被引用了一次的模块才能被合并

```js
const a = 10
const b = 2
const c = 3
console.log(a + b + c) // 15 
打包后，会发现 打包后的文件，变量根本就没有声明，既然你只用了一次，那就直接返回结果给浏览器 => 都不需要浏览器进行计算
```



3. production 自动开启，import export语法才会支持这个
4. 内部依赖一个插件 `ModuleConcatenationoPlugin`



yarn build 查看 dist/index.js

只有60这个结果 根本没有变量的声明

![image-20220823103600806](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220823103600806.png)

## 3. 代码压缩

依赖插件 UglifyJsPlugin





## 4. css代码抽离

为什么需要css单独的抽离为一个文件？



- 因为原本的style-loader是把style标签，作为dom插入到页面，是内嵌。比如页面某个模块需要这个样式，某个js模块不需要这个样式，但是作为style插入，所有的模块都有这个样式了。这样很不好
- 所以我们要，让每个模块的js需要用到的样式，区分开。有些地方用到了，就引入，没用到，就不引入



第一步，下包

>npm i -D mini-css-extract-plugin

第二步，配置

在webpack.base.js

>const MiniCssExtractPlugin = require('mini-css-extract-plugin')



第三步，更改配置

>new MiniCssExtractPlugin({
>	filename: '[name].css'
>})



我们修改style-loader -> MiniCssExtractPlugin.loader



第四步，打包 yarn build 即可



webpack.base.js整体文件

```diff
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
+const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
module.exports = {
    entry: {
        index: './src/index.js',
        other: './src/other.js'
    },
    output: {
        path: path.join(__dirname, '..' ,'./dist'),
        // filename: 'bundle.js',
        // 2. 多入口无法对应一个固定的出口，所以修改filename为[name]变量
        filename: '[name].js',
        publicPath: '/'
    },
    plugins: [
        // 1. html资源 让他生成到根目录下面
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            filename: 'other.html',
            template: './src/other.html',
            chunks: ['other']
        }),
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
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),

        // 7. css文件单独打包
+        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
     
    ],
    module: {
        rules: [
            // 1. css处理
            // use里面的loader读取顺序：从右 -> 左
            // css-loader - 先成功编译css代码
            // style-loader - 再把css代码放到index.html上去
            {
              test: /\.css$/,
            //   use: ['style-loader', 'css-loader'],
+             use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },

            // 2. less处理
            {
                test: /\.less$/,
                // use: ['style-loader', 'css-loader', 'less-loader'],
+                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
            },
            // 3. scss处理
            {
                test: /\.scss$/,
                // use: ['style-loader', 'css-loader', 'sass-loader'],
+                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
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
```



>一个插件，放在base还是prod还是dev取决于什么？
>
>1. 比如devServer 只有开发的使用，就放到 dev
>2. 比如代码压缩，只有上线采用，如果开发也用，就会很浪费内存，就放到 prod
>3. 这里的css单独抽离，放到base.js



## 5. css代码自动添加前缀

​	为什么要添加前缀，我们希望有些样式，添加属于浏览器的前缀，增加代码的“兼容性”，postcss + 插件 autoprefixer 能够帮我们做这件事情。我们如果自己加的话会很麻烦。

​	

第一步，下包

```diff
yarn add postcss-loader autoprefixer -D
```



第二步，写配置

postcss-loader放在 css-loader的前面

```diff
module: {
        rules: [
            // 1. css处理
            // use里面的loader读取顺序：从右 -> 左
            // css-loader - 先成功编译css代码
            // style-loader - 再把css代码放到index.html上去
            {
              test: /\.css$/,
            //   use: ['style-loader', 'css-loader'],
+              use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
            },

            // 2. less处理
            {
                test: /\.less$/,
                // use: ['style-loader', 'css-loader', 'less-loader'],
+                use: [MiniCssExtractPlugin.loader, 'css-loader','postcss-loader', 'less-loader'],
            },
            // 3. scss处理
            {
                test: /\.scss$/,
                // use: ['style-loader', 'css-loader', 'sass-loader'],
+                use: [MiniCssExtractPlugin.loader, 'css-loader','postcss-loader', 'sass-loader'],
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
```



第三，根目录增加配置文件 postcss.config.js

```diff
module.exports = {
    plugins: [require('autoprefixer')]
}
```





## 6. css代码压缩

1. webpack 即便开启 "mode": "production"，也不会自动压缩css代码。

2. 压缩css代码的标志就是：下面的代码挤到一行了

![image-20220823125825928](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220823125825928.png)





3. 我们可以借助如下插件来压缩css代码，同时必须手动再指定js的压缩代码，为什么呢？

因为我们指定了css-minimizer-webpack-plugin插件时，会覆盖js的默认压缩。所以需要`TerserJSPlugin`来帮忙

```diff
yarn add css-minimizer-webpack-plugin TerserJSPlugin -D
```



4. 在`webpack.prod.js`文件里面进行配置

```diff

const {merge} = require('webpack-merge')
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
+const TerserJSPlugin = require('terser-webpack-plugin')
+const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
module.exports = merge(baseConfig, {
    mode: 'production',
    plugins:[
        // 7. 判断当前是开发还是生产环境
        new webpack.DefinePlugin({
          IS_DEV: 'false'
        })
    ],
+    optimization: {
+      minimizer: [
+        new TerserJSPlugin(),
+        new CssMinimizerPlugin()
+      ]
    }
})
```



## 7. JS代码分割

### 7.1代码分割的概念

- 原本是很多个js文件 -> 一个js文件
- 现在是要把一个js文件 -> 拆分到多个小的bundle.js文件中
- 但是注意，不能随意切割，要根据实际情况而定，



切割的一种问题方法：

- 使用entry配置手动地分离代码



切割的好的方法？：

- 为了解决，A模块引入了一个公共模块1，B模块也引入了一个公共模块1，导致公共模块1加载了两次的情况，我们使用`SplitChunksPlugin`插件进行 去重。
- 动态导入：模块的内联函数调用来分离代码





### 7.2 理解代码分割的重要性



多入口打包时的坑



第一步，

index.js

```diff
import $ from 'jquery'
$(function() {
    $('<div></div>').html('我是index').appendTo('body')
})
```

other.js

```diff
import $ from 'jquery'
$(function() {
    $('<div></div>').html('我是other').appendTo('body')
})
```





第二步，我们修改 build/webpack.base.js里面的文件

注释掉一个`HtmlWebpackPlugin` 插件,chunks里面添加一个'other'，然后index.js和other.js都可以被打包到一个index.html文件中



```diff
        // 1. html资源 让他生成到根目录下面
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
+            chunks: ['index', 'other']
        }),
        // new HtmlWebpackPlugin({
        //     filename: 'other.html',
        //     template: './src/other.html',
        //     chunks: ['other']
        // }),
```





第三步，我们yarn dev 启动服务看看

通过查阅，我们可以看到，index.js和other.js里面的体积特别的大，jquery被引用了两次

![image-20220825102605754](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825102605754.png)



我们选中，右击打开查看。发现，jquery的包全部都来了

![image-20220825102658685](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825102658685.png)

![image-20220825102714620](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825102714620.png)



other也是一样的操作





第四步，我们在package.json里面加入如下命令，启动服务。【这一步的目的是，】

用dev-server启动 压缩配置文件，执行代码压缩，我们看看压缩后的结果

```diff
  "scripts": {
    "build2": "webpack-cli",
    "dev2": "webpack-dev-server --hot --port 8080 --open",
    "serve": "node server.js",
    "dev": "webpack-dev-server --config ./build/webpack.dev.js",
+    "dev-build": "webpack-dev-server --config ./build/webpack.prod.js",
    "build": "webpack-cli --config ./build/webpack.prod.js",
    "start": "live-server ./dist"
  },
```



同样，我们查看压缩后的网页源代码，发现也是jQuery也是被压缩了的

![image-20220825103039301](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825103039301.png)





### 7.3 splitChunks

作用：能够把公共的模块 放到一个公共的文件

index.js和other.js原本都引入了jquery,会打包两次。使用这个插件，能够把jquery放到一个公共的js文件，不好打包两次

```diff

const {merge} = require('webpack-merge')
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
const TerserJSPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
module.exports = merge(baseConfig, {
    mode: 'production',
    plugins:[
        // 7. 判断当前是开发还是生产环境
        new webpack.DefinePlugin({
          IS_DEV: 'false'
        })
    ],
    optimization: {
      minimizer: [
        new TerserJSPlugin(),
        new CssMinimizerPlugin()
      ],
+      splitChunks: {
        chunks: 'all'
      }
    }
})
```



不然，打包后in和ot里面都会有jquery





>英文文档 更新速度 > 中文文档









### 7.4 可以使用 runtimeChunk

但是打包other.js和index.js里面时，出现了一些问题

```diff
https://blog.csdn.net/fy_java1995/article/details/110119934?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166139559816782246420703%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=166139559816782246420703&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-110119934-null-null.142^v42^pc_rank_34,185^v2^control&utm_term=runtimeChunk&spm=1018.2226.3001.4187
```



webpack.prod.js

如果一个在base里面修改，一个在prod里面修改，会很奇怪嘛？不会，因为base是公共的

```diff
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
module.exports = {
    entry: {
+        index: {
            import: './src/index.js',
            dependOn: 'shared'
        },
+        other: {
            import: './src/other.js',
            dependOn: 'shared'
        },
+        shared: 'jquery'
    },
    output: {
        path: path.join(__dirname, '..' ,'./dist'),
        // filename: 'bundle.js',
        // 2. 多入口无法对应一个固定的出口，所以修改filename为[name]变量
        filename: '[name].js',
        publicPath: '/'
    },
    ……
```





webpack.prod.js

```diff
module.exports = merge(baseConfig, {
    mode: 'production',
    plugins:[
        // 7. 判断当前是开发还是生产环境
        new webpack.DefinePlugin({
          IS_DEV: 'false'
        })
    ],
    optimization: {
      minimizer: [
        new TerserJSPlugin(),
        new CssMinimizerPlugin()
      ],
+      runtimeChunk: 'single',
      // splitChunks: {
      //   chunks: 'all'
      // }
    }
})
```





### 7.5 静态导入

`import外层`不能加括号，这样只会报错

```diff
let a = 1
if (a === 1) {
    import $ from 'jquery'
} else {
    import dayjs from 'dayjs'
}
```





如果这样写，页面还没渲染完毕，就会加载jquery文件

```diff
import $ from 'jquery'
$(function() {
    document.getElementById('btn').addEventListener('click', function() {
        $('<div></div>').html('我是index').appendTo('body')
    })
})
```





即便开启 代码分割，也会“还没有点击按钮”，就加载jquery。但是我们不希望进入页面就加载这么大的包

![image-20220825132317008](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825132317008.png)



### 7.6 动态导入：

注意，import()是函数的写法，返回的是promise的对象，default是默认值，我们改为$

点击按钮的时候，把内容插入到body里面去

```diff
function getComponent() {
+    return import('jquery').then(({default: $}) => {
        return $('<div></div>').html('我是index')
    })
}

window.onload = function() {
    document.getElementById('btn').addEventListener('click', function() {
        return getComponent().then(item => {
            item.appendTo('body')
        })
    })
}
```



低版本的webpack，需要进行babel转义，甚至需要进行promise的兼容

@babel/plugin-syntax-dynamic-import



>vue react 的`路由的懒加载`都是使用了动态导入的原理。
>
>只有在“我需要时 比如点击按钮的时候” 才会去加载对应的模块包，渲染dom页面



首次进入页面

![image-20220825134314269](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825134314269.png)



点击按钮时

![image-20220825134331475](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825134331475.png)



### 7.7 splitChunks参数学习



chunks: all | async | initial

​	`all`： 动态 + 静态(直接引入jquery)都会进行代码分割 

​		  -> 比如说a和b的打包后的bundle都各自引入bundle时，如果a的文件改变内容，jquery又会重新渲染加载。b也同理。因此，需要a和b里面的jquery都抽离出来，放到vendor文件里面去，这个文件就不会改变了

​		  -> 动态进行代码分割，动态代码是异步的，更加需要进行代码分割了。只有我点击了按钮，进行了响应的操作，才加载对应的包文件。

​	async: 只有异步的(比如动态导入包)才会进行代码分割

​	initial: 动态和静态也都会进行打包



单独抽离开来，index和other就很小了

![image-20220825135848950](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220825135848950.png)







### 7.8 SplitChunksPlugin的一些默认配置

第一步，我们关掉多入口打包



第二步，我们在index.js里面引入jquery，使用jquery,



然后yarn build 打包，看看jquery有没有被单独的打包到一个文件夹里面去?

没有，为什么没有呢？

>即便配置放到base里面也没有。原因是 chunks: 'all'，才能对同步的代码也进行打包



第三步，修改`minSize`为1000kb，查看是否打包

体积很大，发现jquery文件没有单独打包

![image-20220827115325137](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827115325137.png)

```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async', // 只对异步加载的模块进行拆分，可选值还有all | initial
      minSize: 30000, // 模块最少大于30KB才拆分
    }
  }
};
```







第四步，测试minChunks

```diff
        splitChunks: {
            chunks: 'all',
            minSize: 3000, // 切割后的模块 至少大于3000
            minChunks: 1,  // 切割后至少有一个模块。如果设置为2，但是切割后只有一个文件，就不切割
```







第五步，测试name

name值要么设置为 false;

要么设置为一个函数，函数里面有三个参数，chunks是我们需要的

```diff
splitChunks: {
            chunks: 'all',
            minSize: 3000, // 切割后的模块 至少大于3000
            minChunks: 1,  // 切割后至少有一个模块。如果设置为2，但是切割后只有一个文件，就不切割
            maxAsyncRequests: 30,  // 打包后最多有几个“异步”请求这个页面最多加载几个请求
            maxInitialRequests: 30, // 页面初始最多有30个请求
            enforceSizeThreshold: 50000, // 强制的大小“门槛限制”，切割的大小必须在这个"之上"才会进行分割,minRemainingSize， maxAsyncRequests， maxInitialRequest会失效
+            name: (module, chunks, cacheGroups) => {
                return  'chunks' + chunks[0].name
            }, // 切记，chunks是一个数组，里面的第一项，属性有我们需要的name值 hash值是undefined
```



第六步，name需要和下面的cacheGroup进行配合

1. 修改name里面return的值为 cacheGroups,这样切割后的文件名就是， cacheGroup里面的属性名，比如`deafultGroup` `default`
2. 下面的default里面的minChunks改为1，这样打包后的文件即使只有1个，也能够成功，注意，默认值是2
3. 上面的minSize值修改为0，或者足够小
4. 我们在src/创建a.js，里面导出一个值，在main.js里面使用他。
5. 然后yarn build,我们发现这个文件也被切割了
6. `理解整个的代码逻辑`：先去看上面的chunks:'all'是否匹配，看下面的minSize: 是否匹配，都匹配了，再去看`cacheGroup`

```diff
splitChunks: {
            chunks: 'all',
            minSize: 0, // 切割后的模块 至少大于3000
+            minChunks: 1,  // 切割后至少有一个模块。如果设置为2，但是切割后只有一个文件，就不切割
            maxAsyncRequests: 30,  // 打包后最多有几个“异步”请求这个页面最多加载几个请求
            maxInitialRequests: 30, // 页面初始最多有30个请求
            enforceSizeThreshold: 50000, // 强制的大小“门槛限制”，切割的大小必须在这个"之上"才会进行分割,minRemainingSize， maxAsyncRequests， maxInitialRequest会失效
            automaticNameDelimiter: '~',  // 分隔符
            name: (module, chunks, cacheGroups) => {
+                return  cacheGroups
            }, // 切记，chunks是一个数组，里面的第一项，属性有我们需要的name值 hash值是undefined
            // 下面是设计分组
+            cacheGroups: {
+                defaultVendors: {
                  test: /[\\/]node_modules[\\/]/,
                  priority: -10, // 权重比下面更高
                  reuseExistingChunk: true, // 如果有重复的模块就不打包了
                },
                default: {
+                  minChunks: 1, // 必须改为1，想要引入一个a.js到main.js里面也能够单独打包，必须修改上面的minSize的值足够小
                  priority: -20,
                  reuseExistingChunk: true,
                },
            },
        }
```



![image-20220827124417392](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827124417392.png)



6. 你还要理解的是，第一个里面使用了`test属性`，匹配的是`node_modules`第三方包

7. `default `表示自己的模块，比如导出一个 a对象，我们最后希望这些模块能够整合到一起，不拆散，就不需要分割。默认是最少引用两次，如果引用了1次，我们就不需要被拆分。除非是被引用了很多次，才需要拆分

8. `reuseExistingChunk `：表示，main引入了 a和 b，而a引入了b，那么b就希望不要被打包两次，就开启
9. `priority`:表示的是权重，先进行哪个匹配。





### 7.9 noParse

jquery bootstrap这样的包 没有依赖其他任何的包

而webpack还是内部会去解析 判断 他们是否有依赖其他的包，浪费时间

```diff
配置

modules: {

	noParse: /bootstrap|jquery/

}
```



yarn build  查看时间,是否缩短?可能是项目比较小，我感觉时间没什么变化，甚至变长了，哈哈哈







### 7.10 ignorePlugin

如果插件里面有语言包,如果只有中文，我们就排除所有语言 按需引入中文 极大提升效率。

1. 找到moment依赖的语言包的位置
2. 使用ignorePlugin插件，忽略位置
3. 手动引入需要的包即可





第一步，下包 moment,

出现报错时，页面上没有打包index.js，也就是说，index.js里面没有要显示的内容。

解决：下面的entry没有用对象的形式写，而下面的html-webpack-plugin里面的chunks配置了index，就没有匹配上，把entry -> 改成 `index: './src/index.js'`

![image-20220827154048256](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827154048256.png)



第二步，index.js 使用momnet包

```diff
import moment from 'moment'
console.log(moment("20111031", "YYYYMMDD").fromNow());
console.log(moment().format('dddd'));
```







第三步，打包试试，查看时间，超级长

![image-20220827154340739](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827154340739.png)

超级大

![image-20220827154523605](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827154523605.png)



第四步，我们使用ignore这个webpack内置包，去修改试试

```diff
new webpack.IgnorePlugin(/\.\/locale/, /moment/)
```

报错，写法错误

![image-20220827154955745](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827154955745.png)

修改

```diff
     new webpack.IgnorePlugin({
            resourceRegExp: /\.\/locale/, 
            contextRegExp: /moment/
        })
```

再次yarn build,发现 vendorDefault.js文件已经比刚刚少了一半的体积了

![image-20220827155138716](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827155138716.png)

![image-20220827155204744](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827155204744.png)



发现只有英文，我们引入中文试试

![image-20220827155333500](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827155333500.png)

发现还是英文，因为“语言包”都被我们ignore了，要手动引入

```diff

import moment from 'moment'

+moment.locale('zh-cn')
console.log(moment().format('dddd'));
```

增加这句代码,发现

```diff
import moment from 'moment'
+import 'moment/locale/zh-cn'

moment.locale('zh-cn')
console.log(moment().format('dddd'));
```

![image-20220827155523229](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827155523229.png)



第五步，我们再次对比，注释ignore插件的代码，打包看看

第二幅图是，有ignore的，发现体积整整少了一倍还要多

![image-20220827160041842](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827160041842.png)

![image-20220827160430077](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827160430077.png)





### 7.11 noParse()的问题

所以要在保证项目能够运行的基础上去,优化

noParse() 忽略moment,也就是不去解析moment里面的依赖关系，但是zh-cn这样的包会依赖moment的，所以不能够忽略这个关系

noParse: 不能忽略moment。

尽管时间上会长一些





### 7.12 DllPlugin插件的使用

作用：对于vue/react等这样大型的框架，框架本身不怎么变化，或者框架更新了，但是我们项目没有要求更新vue的版本。每次打包，vue都是会重新打包的，这样对于`打包速度`影响非常大会很慢，但是使用DllPlugin插件，能够把他们放到`一个动态链接库`,这样vue包第一次打包好了以后，后续几乎就不用动了，能够极大提升构建速度

操作如下：





1. 在项目中，引入vue vue-router

当报错，说明vue的版本太低了

![image-20220827175621435](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827175621435.png)

把vue安装到了2.7.10版本，没有了



但是出现下面错误，说明vue-router是最新的，使用方式也变化了。我们先用

![image-20220827175929094](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827175929094.png)

>  "vue": "2.7.10",
>
>  "vue-router": "3.1.3"



2. 我们创建app容器，vue的基本配置

```js
import Vue from 'vue/dist/vue' // 这样是完全版本的vue 如果直接 import vue from 'vue' 引入的是运行时的vue 不支持
import VueRouter from 'vue-router'

const Home = {
    template: '<h2>我是home</h2>'
}
const About = {
    template: '<h2>我是about</h2>'
}

const router = new VueRouter({
    routes: [
        {
            path: '/home',
            component: Home
        },
        {
            path: '/about',
            component: About
        }
    ]
})

Vue.use(VueRouter) // 这个顺序是我疑惑的

new Vue({
    router,
    el: '#app',
    data: {
        msg: '你好呀，小哥哥'
    }
})
```

内容，先都写在div#app容器里面



3. 启动项目，看看显示的内容 + 打包后启动看看

这个是我们打包后的vue

![image-20220827180450687](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827180450687.png)

4. 我们使用第一个插件试试

注意，入口写法不同，是一个vue，里面跟数组，数组的值是要抽离出来的包名，`vue/dist/vue.js`

```diff
module.exports = {
    mode: 'development',
+    entry: {
        vue: [
            'vue/dist/vue.js',
            'vue-router'
        ]
    },
```

添加出口，

path指定出口在dist目录

filename指定文件名，利用placeholder语法

```diff
const path = require('path')
const webpack = require('webpack')
module.exports = {
    mode: 'development',
    entry: {
        vue: [
            'vue/dist/vue.js',
            'vue-router'
        ]
    },
+    output: {
+        filename: '[name]_dll.js',
+        path: path.resolve(__dirname, '../dist')
+        // library: '[name]'
+    },
```



引用path、webpack

使用内置插件，

name -> 我们打包好的vue，最终对外暴露的叫什么，就叫name的值

path -> 指定manifest.json文件放在哪里，这是一个清单文件，拆走了vue后，别的模块怎么找到vue呢？通过这个文件

```diff
+const path = require('path')
+const webpack = require('webpack')
module.exports = {
    mode: 'development',
    entry: {
        vue: [
            'vue/dist/vue.js',
            'vue-router'
        ]
    },
    output: {
        filename: '[name]_dll.js',
        path: path.resolve(__dirname, '../dist')
        // library: '[name]'
    },
+    plugins: [
+        new webpack.DllPlugin({
+            name: '[name]_dll',
+            path: path.resolve(__dirname, '../dist/manifest.json')
        })
    ]
}
```



此时使用 yarn build打包，vue还是会被打包。vue_dll.js文件，根本没人认识他

![image-20220827182413067](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827182413067.png)





5. 我们使用第二个插件试试

在webpack.base.json文件里面使用,

这个插件的意思是，

```diff
new webpack.DllReferencePlugin({
    manifest: path.resolve(__dirname, '../dist/manifest.json')
})
```



如果报这个错，就去yarn build:vue，生成vue_dll.js文件和manifest.json文件

ps:

>"build:vue": "webpack-cli --config ./build/webpack.vue.js",

![image-20220827182527733](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827182527733.png)





如果你发现，还是没有这两个文件，请注释，`CleanWebpackPlugin` 这个插件，因为这个插件，会在打包前清空dist目录的文件



我们再次yarn build

发现打包速度显著提升了

![image-20220827182807977](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827182807977.png)



6. 我们用服务器项目，发现报错

![image-20220827182927136](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827182927136.png)

查看代码，就是说项目里面使用了vue_dll变量，但是没有创建声明这个变量

![image-20220827183008049](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220827183008049.png)



此时，我们修改一个配置

```diff
    output: {
        filename: '[name]_dll.js',
        path: path.resolve(__dirname, '../dist'),
+        library: '[name]_dll'
    },
```



我们启动 yarn build:vue来修改 vue_dll.js和 manifest.json文件



再次启动项目，用live-serve或者是yarn serve都行，发现还是同样的错误



这个问题没能够解决

