# 1.Webpack高级

## 1.1 插件 clean-webpack-plugin

作用：每次npm run build时，能够清除dist目录下面的内容，再重新打包。防止缓存的存在，造成一些bug

第一步：下包

```bash
yarn add clean-webpack-plugin -D
```



第二步：webpack.config.js 配置好 注意是按需引入 然后重启

```js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
```



第三步：删除dist目录里面的内容

重新npm run serve

看看他有没有帮我们删除dist文件夹里面的内容







## 1.2 copy-webpack-plugin

前置测试

第一步，在index.html文件里面通过img标签引用一张图片

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818101818605.png" alt="image-20220818101818605" style="zoom:50%;" />

第二步，yarn serve查看浏览器，发现图片没有显示，

我们检查元素，发现报错，原因就是因为，yarn serve 启动时，访问的是根目录下面的文件，此时是没有imgs文件的。

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818101856459.png" alt="image-20220818101856459" style="zoom: 33%;" />

第三步，我们去根目录下面新建assets文件，然后index.html里面引入了里面的图片，yarn serve启动，发现是能够访问的到图片



第四步，我们yarn serve打包文件，紧接着去dist文件夹查看，assets文件里面的图片，是否被打包，发现没有，因此有了这个插件







使用插件后的测试：

作用：能够在打包时，让`不会参与打包的内容`，拷贝到最终的文件夹下面。比如index.html文件里面的png图片，是不会被打包的，dist里面的images文件夹是不会有的。可以通过这个插件来实现



第一步：测试

如果在src/index.html里面增加一张img标签， 注意不是通过css的方式引入图片，这里的图片的地址我们用了相对路径`../`，来自index.html上一级的图片

```html
    <ul>
        <li>123</li>
        <li>123</li>
        <li>123</li>
        <li>
            <img src="../头像.jpg" alt="">
        </li>
    </ul>
```

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816162542303.png" alt="image-20220816162542303" style="zoom:33%;" />

第二步，此时我们通过 yarn dev, 启动

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816162601671.png" alt="image-20220816162601671" style="zoom: 33%;" />

发现图片能够正常显示，但是路径是错的。因为localhost:8080/../头像 本身就是错的，只是服务器已经是根目录，不能再次往上走了，干脆，把当前目录作为图片查询的地址，因此，图片能够正常显示【`dev启动 默认把整个项目作为根目录，而不是src`】







<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816162702042.png" alt="image-20220816162702042" style="zoom:33%;" />



第四步，src下面的index.html里面改成，才是对的

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816162816498.png" alt="image-20220816162816498" style="zoom:50%;" />



dev: 发现 ../a.jpg也是错的



第五步，我们创建一个assets目录，和src平级，把图片放进去，并且把src/index.html的里面引用的文件改成

![image-20220816163000006](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816163000006.png)



yarn build是不会打包assets里面的文件，甚至移动到dist里面也不会，



第六步，下包

```js
yarn add copy-webpack-plugin -D
```



第七步：配置, webpack.config.js 里面的plugins属性 注意查看官网，写法又有新的变化

```js
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, 'assets'),
                    // 会自动找到入口
                    to: 'assets'
                }
            ]
        })
```







第八步：

修改src/index.html里面的路径，直接改为绝对路径，assets/a.jpg

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816172856880.png" alt="image-20220816172856880" style="zoom:50%;" />





第九步：

最终发现，根目录下面的assets里面的图片能够在打包时，copy到dist文件夹下面

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816172817849.png" alt="image-20220816172817849" style="zoom:50%;" />

如果报错

>CopyWebpackPlugin is not a constructor

表示引入包搞错了

```js
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
```

上面两个包要这样引入







如果报错

>Failed to load 'D:\heima\front\8. webpack学习\demo2\webpack.config.js' config  
>[webpack-cli] Invalid options object. Copy Plugin has been initialized using an options object that does not match the API schema.
>
> - options[0] has an unknown property 'to'. These properties are valid:
>   object { patterns, options? }



遗憾：

1. url-loader的新的方法和旧的方法 多测试
2. babel
3. 路径的问题，dev的情况再测试一下，怎么样图片才会显示
4. source-map复习



## 1.3 banner-webpack-plugin

作用：给bundle.js的顶部，增加版权信息



第一步，不用下包，知道 这个是webpack的内置包，



第二步，webpack.config.js里面引入webpack

```js
const webpack = require('webpack')
```





第三步：配置

```js
// 5. banner 增加版权信息的插件
new webpack.BannerPlugin('李治航的版权')
```



第四步：查看bundle.js顶部的信息





## 1.4 图片资源，真的要能够打包

之前要么是通过url，打包css的图片

要么是图片的`copy-webpack-plugin插件`复制，



这里是真的要在html资源里面处理打包。



第一步，下包

```js
yarn add html-withimg-loader -D
```



第二步，webpack.config.js 的`module`的`rules`属性配置

```js
// 6. 图片的打包 和 copy的区别，copy更加的全面，是所有资源可以拷贝
// 以后如果有资源不能打包，但是线上需要，可以使用copy
// 但是图片我们还是希望能够压缩
{
    test: /\.(htm|html)$/i,
    loader: 'html-withimg-loader'
}
```



第三步，

如果你有地方报错，说这个，那是因为页面中还有地方使用assets文件夹里面图片。这个时候就不要用`绝对路径`了，也不要用assets里面的东西，src/index.html里面要`删掉`assets的引用，**要删掉绝对路径。用相对路径**，这个包帮我们去构建

![image-20220816174218518](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816174218518.png)





第四步，查看

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220816174351533.png" alt="image-20220816174351533" style="zoom:50%;" />

我们发现而来,dist包的 images里代码里的图片，就是我们在src/index.html里面使用的，且已经给我们进行了hash编译，这个要多亏了,`url-loader`的功劳







## 1.5 8/18开头测试

第一步，注销插件 `html-withimg-loader`



第二步，yarn build

发现仍旧能够打包图片,我们期待，如果没有使用插件，就不好打包index.html里面的图片信息，



第三步，删除插件，发现还是能够

我知道了，一定是css里面的代码引用了图片，css的图片是能够被url-loader正确使用的，但是index.html里面的图片是不行的，因此，需要注销代码



第四步，注销css less scss里面对应图片的引用，

yarn build再次测试试试，发现打包后的dist文件夹里面没有images图片了





## 1.6 多页应用打包

多页面能够打包成功，表现就是dist里面有新的文件了，但是问题是，yarn serve启动的是谁呢？



第一步，修改入口entry为一个对象

```js
entry: {
    main: './src/main.js',
    // 多入口
    // 1. 修改entry入口，为对象，增加新的配置
    other: './src/other.js'
},
```



紧接着，执行

```js
yarn build
```



发现报错,解释为入口文件有多个模块，指向了同一个出口文件，

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818124734807.png" alt="image-20220818124734807" style="zoom:50%;" />





第二步，修改出口文件

```js
    output: {
        path: path.join(__dirname, './dist/'),
        // filename: 'bundle.js',
        // 2. 多入口无法对应一个固定的出口，所以修改filename为[name]变量,你的入口里的文件名是什么，这里就会匹配成什么
        filename: '[name].js', // 原本写的是bundle.js文件
        publicPath: '/'
    },
```



<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818125302380.png" alt="image-20220818125302380" style="zoom:50%;" />

紧接着，执行yarn build



我们发现 dist目录下面有两个文件，但是index.html文件只有一个，且一个index.html文件指向了两个js文件，这样还是单页面应用，而不是多页面应用

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818125130943.png" alt="image-20220818125130943" style="zoom:50%;" />

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818125151766.png" alt="image-20220818125151766" style="zoom:50%;" />





第三步，html-webpack-plugin插件，知道错误修改。这样改是错的，尽管能够生成两个html文件，但是，每个html文件里面还是都引入了两个js文件。我们希望“other.html”只引入“other.js”，main也是同理

```js
    plugins: [
        // 1. html资源 让他生成到根目录下面
        new HtmlWebpackPlugin({
            filename: '[name].html', // 原来是index.html
            template: './src/index.html',
        }),
    ]
```



第四步，下面这样修改是正确的，复制一份`HtmlWebpackPlugin`，这里的chunks又是跟entry的对象的入口键名对应。

同时，别忘记了，在和src平级的目录下面，创建一个other.html文件，里面写一些内容

```js
// 1. html资源 让他生成到根目录下面
new HtmlWebpackPlugin({
    filename: 'main.html',
    template: './src/index.html',
    chunks: ['main']
}),
// 2. 给HtmlWebpackPlugin复制一段配置，根据同一个模板，生成不同的index.html文件
new HtmlWebpackPlugin({
    filename: 'other.html',
    template: './src/other.html',
    chunks: ['other']
}),
```



再yarn build看看，发现，每个html只会引入对应的js文件，这样就是好的



>下面的代码，后来把上面的main入口的名字改成了index哈



## 1.7 第三方库的两种引入方式

### expose-loader



第一步，在main.js里面引入jquery,使用如下语法，然后 yarn dev, 看看能否生效

```js
import $ from 'jquery'
$('body').css('backgroundColor', 'pink')
```



发现未能够生效 其实控制台没有报错，但是打开的页面如下。我期待的是页面的颜色是能够修改的

![image-20220818134108542](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818134108542.png)



这里出现了bug，可能是 htmlwebpackplugin代码出现而来问题，得开始调试



第一步，我把刚刚的代码注释掉,【jquery的使用注释掉】

发现还是报错，说明不是刚刚的代码的问题



第二步，我们去检查一下，多路口配置时，new HtmlWebpackPlugin文件，去看看

试着注释，如下代码，然后第一个html插件的chunks属性改为一个，发现还是报错

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818134608203.png" alt="image-20220818134608203" style="zoom:50%;" />



第三步，把那些main.html文件改名为index.html，就成功了。

原因是，yarn serve 服务器启动，会去根目录下找 index.html文件。所以上面的filename配置的最终生成的文件名应该是 index.html





我们紧接着最开始的第一步以后



第二步，刷新页面，发现页面的body修改背景颜色的样式成功了，

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818135547714.png" alt="image-20220818135547714" style="zoom:50%;" />

第三步，我们修改另一个，src/other.js里面的文字大小，使用$

发现报错，

```js
$('body').css('fontSize', '30px')
```



![image-20220818135618659](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818135618659.png)



原因就是other.js里面没有引入jquery，问题就来了，我应该不应该再次引入jquery呢？如果很多个文件都要使用，那我岂不是每次都要引用，因此，使用expose-loader，就能够直接全局注册到



第四步，我们在webpack.config.js里的module进行如下配置

```js
module: {
        rules: [
            ……省略之前 前面的代码

            // 7. 模块加载的loader
            {
            	// 这句代码的意思是，我去解析 jquery 这个包的绝对路径，赋值给$符号，挂载到全局
                // 以往这里是正则 现在写法变了 注意
                test: require.resolve('jquery'),
                use: {
                    loader: 'expose-loader',
                    options: '$'
                }
            }
        ],
```





yarn dev之后，发现如下报错

![image-20220818140233971](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818140233971.png)

说明，我们的配置有误，去官网查看一下，应该是更新了！

要这样去进行配置

![image-20220818140258363](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818140258363.png)





再次yarn dev 我们发现,字体成功改变，说明$已经挂载到了全局

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818140343309.png" alt="image-20220818140343309" style="zoom:50%;" />





### ProvidePlugin插件

我们有时候不希望，直接把jquery挂载到全局，我们希望每个模块里面注入即可，每个模块都是一个闭包空间。【其实我有点不是很理解这个概念，就是说webpack打包时，每个js都是一个模块，都是一个独立的闭包空间。**这个插件，并不是给全局，而是给每个模块注入这个变量**】

使用webpack内置的包：



第一步，`webpack.config.js`注释掉，expose-loader的使用

![image-20220818143225146](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818143225146.png)



第二步，`webpack.config.js`使用webpack的内置插件`ProvidePlugin`。如果你还没有引入webpack，就要引入

plugins里面进行配置。这个插件配置了以后，每个模块里面不需要额外的引入或者是导出

```js
new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery'
})
```





第三步，怎么判断是否是挂载到全局，还是说只是在每个js模块里面有呢？

我们去src/index.html里面打印一下$

```js
console.log($);
```

发现会报错

$ is not defined



因此jquery只是挂载到了每个js模块，









## 1.8 dev/prod不同的打包配置



第一步，拷贝`webpack.config.js`两份

webpack.config.js -》改名 webpack.base.js

其余两份分别改名为 -》 webpack.prod.js 和 webpack.dev.js



<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818153825423.png" alt="image-20220818153825423" style="zoom:50%;" />



第二步，我们去修改webpack.base.js文件

我们留下哪些东西？应该说，我们删掉了什么东西，我们删掉了 `mode` `devtool`配置项，其他都保留了





第三步，我们去下载 webpack-merge包

```js
yarn add webpack-merge -D
```



第四步，我们去修改webpack.dev.js文件

我们要留下哪些东西？只留下了,mode和devtool，其余的所有都是从 base文件里面引入

```js

const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')
module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
})
```



第五步，我们去修改webpack.prod.js文件 类似

```js
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')
module.exports = merge(baseConfig, {
    mode: 'production',
    devtool: 'cheap-module-source-map',
})
```





第六步，新建 build文件夹，三个配置文件统一放在根目录下面的 build文件夹

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818154222819.png" alt="image-20220818154222819" style="zoom:50%;" />



第七步，去修改 package.json文件，在启动，yarn dev 和 yarn serve时，启动不同的配置文件

```diff
  "scripts": {
    "build2": "webpack-cli",
    "dev2": "webpack-dev-server --hot --port 8080 --open",
    "serve": "node server.js",
+    "dev": "webpack-dev-server --config ./build/webpack.dev.js",
+    "build": "webpack-cli"
  },
```



第八步，我们yarn build 先测试看看，

发现报错了,我们上面没有给build指定具体的哪个文件，是零配置，他告诉我们说mode没有设置，会自动给我们设置为production, 同时下面报了很多错误说，css less scss这些loader都没有

![image-20220818154534287](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818154534287.png)



第九步，修改配置文件

```diff
  "scripts": {
    "build2": "webpack-cli",
    "dev2": "webpack-dev-server --hot --port 8080 --open",
    "serve": "node server.js",
    "dev": "webpack-dev-server --config ./build/webpack.dev.js",
+    "build": "webpack-cli --config ./build/webpack.prod.js"
  },
```

执行yarn build



![image-20220818154928244](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220818154928244.png)



查看官网，发现又是语法错误

应该这样写 按需引入

```js
const { merge } = require('webpack-merge')
```



使用yarn dev能够成功开启,但是报错，如下错误

![image-20220820110505408](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820110505408.png)



我们期待的是，能够yarn build 文件能够正常打包到dist目录

下面这样写，都是报错

```diff
    output: {
+       path: path.join(__dirname,'../', './dist/'), 
+		path: path.join(__dirname,'..', './dist/'), 
        // filename: 'bundle.js',
        // 2. 多入口无法对应一个固定的出口，所以修改filename为[name]变量
        filename: '[name].js',
        publicPath: '/'
    },
```



```diff
    output: {
       path: path.join(__dirname,'../dist/'), 
        // filename: 'bundle.js',
        // 2. 多入口无法对应一个固定的出口，所以修改filename为[name]变量
        filename: '[name].js',
        publicPath: '/'
    },
```



<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820111937433.png" alt="image-20220820111937433" style="zoom:50%;" />





发现，other和third的html文件是ok，只有index的html出问题，我们去这些文件夹里面看看，图片是否能够打包成功



下一步，注释掉，多入口打包的代码，试试看。仍旧是文件报红色

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820132107616.png" alt="image-20220820132107616" style="zoom:50%;" />





生产环境，不需要source-map，就不要写一个多余的"none"值，不然会报错



但是图片依旧有报错：

![image-20220820133605762](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820133605762.png)



注释掉src/other.html里面对于图片使用的代码，再次yarn build,发现dist目录下面成功输出了

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820133623729.png" alt="image-20220820133623729" style="zoom:50%;" />

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820133537211.png" alt="image-20220820133537211" style="zoom:50%;" />

来解决，为什么other.html里面有图片就会报错，这个问题？



图片引入改写：

```html
    <img src="<%require('./imgs/1.jpg')%>" alt="">
```



webpack.base.js里面改写：

原因，不太明确

```diff
{
                test: /\.(woff|woff2|svg|eot|ttf)$/i,
                use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: '[name]-[hash:4].[ext]',
                        outputPath: 'fonts',
+                       esModule: false
                    },
                },
                ],
                type: 'javascript/auto',
            },
```





yarn build 解析后是这样的

```diff
<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Document</title><script defer="defer" src="/other.js"></script></head>++
+ <body><div>我是other</div><img src="<%require('./imgs/1.jpg')%>" alt=""></body></html>
```





## 1.9 配置文件，单独放到一个文件夹



第一步，创建一个文件夹build,三个webpack的配置文件都放进去

![image-20220820140810499](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820140810499.png)



第二步，yarn build打包试试,发现如下报错

他去的是项目的根目录下面找到了，webpack.prod.js现在换到了build目录下面哦

![image-20220820140835796](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820140835796.png)



修改package.json里面的路径

```diff
  "scripts": {
    "build2": "webpack-cli",
    "dev2": "webpack-dev-server --hot --port 8080 --open",
    "serve": "node server.js",
+    "dev": "webpack-dev-server --config ./build/webpack.dev.js",
+    "build": "webpack-cli --config ./build/webpack.prod.js"
  },
```





第三步，再次yarn build， 发现报错

![image-20220820141011643](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820141011643.png)

这个错误来源于，copy-webpack-plugin,他找assets文件，结果去到build文件夹下面去找了。但是这个文件夹，在项目的根目录下面，我们去修改一下



assets文件夹

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820141118949.png" alt="image-20220820141118949" style="zoom:50%;" />



下一步，找到webpack.base.js

```diff
        new CopyWebpackPlugin({
            patterns: [
                {
+                    from: path.join(__dirname, '..', 'assets'),
                    // 会自动找到入口
                    to: 'assets'
                }
            ]
        }),
```



同样的，出口文件里面的绝对路径也要修改
```diff
    output: {
+        path: path.join(__dirname,'..', ''./dist'),
        // filename: 'bundle.js',
        // 2. 多入口无法对应一个固定的出口，所以修改filename为[name]变量
        filename: '[name].js',
        publicPath: '/'
    },
```



此时项目已经重新打包好了。



并且，之前的碰到的一个问题，就是yarn build之后的,文件显示"已经删除"的字样，现在已经没有了





## 1.10 环境不同，使用不同的变量



第一步，下包 axios

yarn add axios -S 



第二步，index.js里面写

一个接口，开发环境用本地的地址

生产环境用另一个地址，我们希望配置一次以后，后面就不用手动切换了

```js
import axios from 'axios'
let host = 'http://localhost:4000/api'
if (IS_DEV) {
    host = 'http://www.baidu.com'
}
axios.get(host)

```



我们先yarn dev看看，发现接口是报错的，报错是很正常的，因为就是这个地址是没有数据甚至没有启动的。

![image-20220820144923137](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820144923137.png)



第三步，build/webpack.dev.js

```js
const webpack = require('webpack')  

……
………
plugins:[
   // 7. 判断当前是开发还是生产环境
    new webpack.DefinePlugin({
    	IS_DEV: 'true'
    })
    ]
```

注意，这个插件里面变量的写法

>IS_DEV: 'false' // false他会被解析为布尔值false
>
>IS_DEV: 'a' // a会被解析为一个a变量
>
>IS_dev: '1 + 2' // 会被解析为 3 数字型
>
>IS_DEV: '"a"' // 这样才会被解析为是字符串型





下一步，build/webpack.prod.js里面写上

```diff

const {merge} = require('webpack-merge')
+const webpack = require('webpack')
const baseConfig = require('./webpack.base')
module.exports = merge(baseConfig, {
    mode: 'production',
    plugins:[
        // 7. 判断当前是开发还是生产环境
        new webpack.DefinePlugin({
+         IS_DEV: 'false'
     })
 ]
})
```





下包

注意，下包，如果包名写错了，他就会一直找，找很久，别苦苦傻等啦

```diff
yarn add global live-server 
```



`package.json`

```diff
  "scripts": {
    "build2": "webpack-cli",
    "dev2": "webpack-dev-server --hot --port 8080 --open",
    "serve": "node server.js",
    "dev": "webpack-dev-server --config ./build/webpack.dev.js",
    "build": "webpack-cli --config ./build/webpack.prod.js",
+    "start": "live-server ./build/dist"
  },
```



启动项目，发现接口还是这个

![image-20220820150503795](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820150503795.png)



```diff
import axios from 'axios'
let host = 'http://localhost:4000/api'
+if (!IS_DEV) { // 这里是加逻辑非，哈哈
    host = 'http://www.baidu.com'
}
axios.get(host)
```



修改后必须，重新 yarn build,再启动index.html文件

发现接口改变了，就OK了

![image-20220820151044692](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820151044692.png)





## 1.11 跨域问题





使用cors解决跨域问题：

下包cors

通过app.use(cors()) 就ok了，就是这么简单

响应头，有哪些响应头呢？





使用http-proxy解决跨域问题：(跨域代理)

创建 服务器

新建server文件夹



npm init -y



yarn express



如下代码

```js
const express = require('express')

const app = express()
app.get('/api/getUserInfo', function(req, res) {
    res.send({
        name: '123',
        age: '19'
    })
})

app.listen(9999, () => {
    console.log('this server is running at http://localhost:9999');
})
```





webpack的项目里面webpack.dev.js文件

```diff

const {merge} = require('webpack-merge')
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        open: true,
        // hot: true,
        port: 3000,
        // 跨域代理
+        proxy: {
+            '/api': 'http://localhost:9999'
        }
    },
    devtool: 'eval-cheap-module-source-map',
    plugins:[
           // 7. 判断当前是开发还是生产环境
           new webpack.DefinePlugin({
                IS_DEV: 'true'
           })
    ],
    
})
```



src/的一个js文件夹，写下

注意，记得有axios包

```diff
import axios from 'axios'
axios.get('/api/getUserInfo').then(res => console.log(res))
console.log('我是第三个文件')
```



上面的代码就是，本地有一个服务器，端口是9999



现在我们本地的webpack里面的代码，访问的是3000端口的服务器，我们通过3000端口的服务器，代理服务方位9999端口的服务器，因为服务器不存在跨域的限制，所以能够访问的到数据





我们yarn dev启动本地的3000服务器 发现能够访问，尽管请求的`Request URL`是3000端口，但是内部，他已经帮我们代理到了

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820161925170.png" alt="image-20220820161925170" style="zoom:50%;" />



理解这个写法，如果server服务器进行修改呢？ 去掉了api前缀

```diff
+app.get('getUserInfo', function(req, res) {
    res.send({
        name: '123',
        age: '19'
    })
})
```



难不成我们为了不要api前缀，dev里面要不断的添加新的接口。要这样嘛？

```diff
        proxy: {
            // 会自动去匹配有api前缀的接口，比如访问的是'/api/getUserInfo'，就匹配到了，然后代理到 			   http://localhost:9999/api/getUserInfo地址
            // 
            '/api': 'http://localhost:9999',
+            '/getUserInfo': 'http://localhost:9999'，
+			 'updateUserInfo': 'http://localhost:999'
        }
```



应该下面这样写，能够匹配到前端有 `'/api'`前缀的接口的，比如前端写了`'/api/getUserInfo'`,但是后端不要api前缀，就可以通过`pathRewrite`进行忽略



```diff
+app.get('/getUserInfo', function(req, res) {
    res.send({
        name: '123',
        age: '19'
    })
})
```



```diff
proxy: {
    // 会自动去匹配有api前缀的接口，比如访问的是'/api/getUserInfo'，就匹配到了，然后代理到 http://localhost:9999/api/getUserInfo地址
    // 
    // '/api': 'http://localhost:9999',
    // '/getUserInfo': 'http://localhost:9999'
    '/api': {
+        target: 'http://localhost:9999',
+        pathRewrite: {
            '^/api': ''
        }
    }
}
```

<img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820162921222.png" alt="image-20220820162921222" style="zoom:50%;" />

我们可以yarn serve一下， 发现尽管控制台还是有api前缀的，但是代理到后端时，会进行忽略的.



也可以试试，把pathRewrite进行 注释，就会发现接口请求是错误的。







## 1.12 HRM 热更新



有一个疑惑：webpack-dev-serve和HRM的区别是什么？

1. webpack-dev-serve：我们修改了js文件，整个浏览器会刷新，webpack也会帮我们重新编译，内容会修改。注意，默认修改html文件，页面不会刷新，但是控制台会帮我们进行编译。我们要手动，点一下，浏览器的刷新按钮，才会刷新。=》如果总是刷新整个浏览器，效率会比较低

```diff
    devServer: {
        open: true,
        hot: true,
+        port: 3000,
    },
```



2. 而HRM，就是我们修改某个js文件，webpack重新打包编译，会把这个新的模块推送到浏览器替换掉老的模块，浏览器不会刷新页面，这样性能就会好

这样写是错误的哦，import 必须在页面顶部写，所以这里用require就好啦

![image-20220820153458949](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4575/image-20220820153458949.png)



3. 如何让html文件变了，也能够热更新呢？

修改入口文件

```diff
entry:['./src/js/index.js','./src/index.html'],
```



4. 如何css文件也能够热更新呢？



5. 为何好像hot关闭，页面也都会热更新呢？

