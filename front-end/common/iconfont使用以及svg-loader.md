# icon使用介绍以及搭配

>文章参考自[手摸手，带你优雅的使用 icon](https://juejin.im/post/59bb864b5188257e7a427c09)，
>[VUE-cli3使用 svg-sprite-loader](https://juejin.im/post/5bc93881f265da0aea69ae2e)，
>[iconfont官方使用教程](https://www.iconfont.cn/help/detail?spm=a313x.7781069.1998910419.d8d11a391&helptype=code)

## 演变

最一开始的时候大部分图标都是用 `img` 来实现的，也就是将一个个图片统一放在一个位置，然后通过`<img>` 标签来引用他们。随着图片越来越多发现一个页面的请求资源中图片 img 占了大部分，为了优化有了image sprite 就是所谓的雪碧图（图片懒加载应该也算一种优化），就是将多个图片合成一个图片，然后利用 css 的 background-position 定位显示不同的 icon 图标。这个方法也有一个很大的痛点，维护困难。每新增一个图标，都需要改动原始图片，还可能不小心出错影响到前面定位好的图片，而且一修改雪碧图，图片缓存就失效了，久而久之你不知道该怎么维护了。

**font 库**，后来渐渐地一个项目里几乎不会使用任何本地的图片了，而使用一些 font 库来实现页面图标。常见的如 Font Awesome ，使用起来也非常的方便，但它有一个致命的缺点就是找起来真的很不方便，每次找一个图标特别的费眼睛，还有就是它的定制性也非常的不友善，它的图标库一共有675个图标，说少也不少，但还是会常常出现找不到你所需要图标的情况。

**iconfont** 一个阿里做的开源图库，图标数量是很惊人的，不仅有几百个公司的开源图标库，还有各式各样的小图标，还支持自定义创建图标库，同时可以创建自己的项目，将你喜欢的图标加入你的项目中，然后打包一起下载，当然可以单独下载，支持svg、png、ai(没了解过)。

## iconfont 三种使用姿势

搬自官网，[链接](https://www.iconfont.cn/help/detail?spm=a313x.7781069.1998910419.d8d11a391&helptype=code)

### icon单个使用

单个图标用户可以自行选择下载不同的格式使用，包括png,ai,svg。
点击下载按钮，可以选择下载图标。

![single-use](https://img.alicdn.com/tps/TB1PoyDNpXXXXX8aXXXXXXXXXXX-1168-650.png)

此种方式适合用在图标引用特别少，以后也不需要特别维护的场景。

比如设计师用来做demo原型。
前端临时做个活动页。
当然如果你只是为了下载图标做PPT,也是极好的。
不过如果是成体系的应用使用，建议用户把icon加入项目，然后使用下面三种推荐的方式。

### unicode引用

unicode是字体在网页端最原始的应用方式，特点是：

+ 兼容性最好，支持ie6+，及所有现代浏览器。
+ 支持按字体的方式去动态调整图标大小，颜色等等。
+ 但是因为是字体，所以不支持多色。只能使用平台里单色的图标，就算项目里有多色图标也会自动去色。

>*注意：新版iconfont支持多色图标，这些多色图标在unicode模式下将不能使用，如果有需求建议使用symbol的引用方式*

unicode使用步骤如下：

第一步：拷贝项目下面生成的font-face

```css
@font-face {
  font-family: 'iconfont';
  src: url('iconfont.eot');
  src: url('iconfont.eot?#iefix') format('embedded-opentype'),
  url('iconfont.woff') format('woff'),
  url('iconfont.ttf') format('truetype'),
  url('iconfont.svg#iconfont') format('svg');
}
```

第二步：定义使用iconfont的样式

```css
.iconfont{
  font-family:"iconfont" !important;
  font-size:16px;font-style:normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
```

第三步：挑选相应图标并获取字体编码，应用于页面

```html
<i class="iconfont">&#x33;</i>
```

其实它的原理也很简单，就是通过 @font-face 引入自定义字体(其实就是一个字体库)，它里面规定了&#xe604 这个对应的形状就长这企鹅样。

不过它的缺点也显而易见，unicode的书写不直观，语意不明确。光看&#xe604;这个unicode你完全不知道它代表的是什么意思。这时候就有了 font-class。

### font-class引用

font-class是unicode使用方式的一种变种，主要是解决unicode书写不直观，语意不明确的问题。

与unicode使用方式相比，具有如下特点：

+ 兼容性良好，支持ie8+，及所有现代浏览器。
+ 相比于unicode语意明确，书写更直观。可以很容易分辨这个icon是什么。
+ 因为使用class来定义图标，所以当要替换图标时，只需要修改class里面的unicode引用。
+ 不过因为本质上还是使用的字体，所以多色图标还是不支持的。

使用步骤如下：

第一步：拷贝项目下面生成的fontclass代码：

```js
//at.alicdn.com/t/font_8d5l8fzk5b87iudi.css
```

第二步：挑选相应图标并获取类名，应用于页面：

```html
<i class="iconfont icon-xxx"></i>
```

它的主要原理其实是和 unicode 一样的，它只是多做了一步，将原先&#xe604这种写法换成了.icon-QQ，它在每个 class 的 before 属性中写了unicode,省去了人为写的麻烦。如 .icon-QQ:before { content: "\e604"; }
相对于unicode 它的修改更加的方便与直观。但是注意使用font-class一定要注意命名空间的问题。

### symbol引用

这是一种全新的使用方式，应该说这才是未来的主流，也是平台目前推荐的用法。相关介绍可以参考这篇文章 这种用法其实是做了一个svg的集合，与上面两种相比具有如下特点：

+ 支持多色图标了，不再受单色限制。
+ 支持像字体那样，通过font-size,color来调整样式。
+ 兼容性较差，支持 ie9+,及现代浏览器。
+ 浏览器渲染svg的性能一般，还不如png。
+ 可利用CSS实现动画。
+ 减少HTTP请求。
+ 矢量，缩放不失真
+ 可以很精细的控制SVG图标的每一部分

使用步骤如下：

第一步：拷贝项目下面生成的symbol代码：

```js
//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js
```

第二步：加入通用css代码（引入一次就行）：

```html
<style type="text/css">
  .icon {
    width: 1em; height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
```

第三步：挑选相应图标并获取类名，应用于页面：

```html
<svg class="icon" aria-hidden="true">
    <use xlink:href="#icon-xxx"></use>
</svg>
```

使用svg-icon的好处是我再也不用发送woff|eot|ttf| 这些很多个字体库请求了，我所有的svg都可以内联在html内。

## 在项目中使用

接下来主要介绍在Vue中使用，在React中原理是一样的。

### 创建 icon-component 组件

```vue
<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class svgIcon extends Vue {
  @Prop() private iconClass!: string
  @Prop({ default: '' }) private className: string

  public get iconName (): string {
    // 这个地方注意#icon-，这个icon-是你的iconfont项目中设置的前缀
    return `#icon-${this.iconClass}`
  }

  public get svgClass (): string {
    // 如果传入svg的类名就以它为准，否则默认svg-icon
    if (this.className) {
      return 'svg-icon ' + this.className
    } else {
      return 'svg-icon'
    }
  }
}
</script>
<style>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
```

### 引用

```js
// 引入svg组件
// main.ts
import './iconfont.js'
import IconSvg from '@/components/svgIcon'

// 全局注册icon-svg
Vue.component('svg-icon', svgIcon)

// 在具体的代码中使用
<icon-svg iconClass="password" />
```

### 进一步改造

目前还是有一个致命的缺点的，就是现在所有的 svg-sprite 都是通过 iconfont 的 iconfont.js 生成的。

+ 可以打开iconfont.js，发现首先它是一段用js来生成svg的代码，所有图标 icon 都很不直观。如果不参照iconfont提供的资料，你完全不知道哪个图标名对应什么图标，并且每次增删图标只能整体js文件一起替换。
+ 其次它也做不到按需加载，不能根据我们使用了那些 svg 动态的生成 svg-sprite。
+ 自定义性差，通常导出的svg包含大量的无用信息，例如编辑器源信息、注释等。通常包含其它一些不会影响渲染结果或可以移除的内容。
+ 添加不友善，如果我有一些自定义的svg图标，该如何和原有的 iconfont 整合到一起呢？目前只能将其也上传到 iconfont 和原有的图标放在一个项目库中，之后再重新下载，很繁琐。

### 使用svg-sprite-loader

svg-sprite-loader是一个 webpack loader ，可以将多个 svg 打包成 svg-sprite 。

注意：**如果使用了svg-sprite-loader，在css中再使用icons/svg目录下的svg会导致打包报错**
接下来先介绍如何在 vue-cli2 的基础上进行改造，加入 svg-sprite-loader。
我们发现vue-cli默认情况下会使用 url-loader 对svg进行处理，会将它放在/img 目录下，所以这时候我们引入svg-sprite-loader 会引发一些冲突。

```js
//默认`vue-cli` 对svg做的处理，正则匹配后缀名为.svg的文件，匹配成功之后使用 url-loader 进行处理。
{
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  loader: 'url-loader',
  options: {
    limit: 10000,
    name: utils.assetsPath('img/[name].[hash:7].[ext]')
  }
}
```

你可以将 test 的 svg 去掉，然后wepback就不会对svg进行处理了。。

+ 你不能保证你所有的 svg 都是用来当做 icon的，有些真的可能只是用来当做图片资源的。
+ 不能确保你使用的一些第三方类库会使用到 svg。

最安全合理的做法是使用 webpack 的 exclude 和 include ，让svg-sprite-loader只处理你指定文件夹下面的 svg，url-loaer只处理除此文件夹之外的所以 svg，这样就完美解决了之前冲突的问题。

```js
{
  test: /\.svg$/,
  loader: 'svg-sprite-loader',
  include: [resolve('src/icons')],
  options: {
    symbolId: 'icon-[name]'
  }
},
{
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  loader: 'url-loader',
  exclude: [resolve('src/icons')],
  options: {
    limit: 10000,
    name: utils.assetsPath('img/[name].[hash:7].[ext]')
  }
}
```

这样配置好了，只要引入svg之后填写类名就可以了

```js
import '@/src/icons/qq.svg; //引入图标

<svg><use xlink:href="#qq" /></svg>  //使用图标
```

你会发现，这里要想插入某个图标，都得 import，每用一个都要重复一遍这个流程，太麻烦，那么我们就让 src/icons/svg/下的 svg 文件都自动导入吧。

#### vue-cli3 中使用

vue-cli3创建的项目中，不再有webpack.config.js等文件，而是将webpack配置通过vue.config.js暴露出来，主要通过webpack chain来配置，道理是一样的：

```js
chainWebpack: config => {
  ...
  // 原有的svg图像处理loader添加exclude
  config.module
    .rule('svg')
    .exclude.add(resolve('src/icons'))
    .end()
  // 添加针对src/icons的svg-sprite-loader配置
  config.module
    .rule('icons')
    .test(/\.svg$/)
    .include.add(resolve('src/icons'))
    .end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({
      symbolId: 'icon-[name]',
      extract: true,  //提取（默认情况下是false，不加这个不会把svg提取到打包后的index.html中）
      spriteFilename: '/img/[chunkname].svg'
    })
},
```

### 自动导入

首先我们创建一个专门放置图标 icon 的文件夹如：@/src/icons，将所有 icon 放在这个文件夹下。 之后我们就要使用到 webpack 的 require.context。关于 require.context直白的解释就是：

>require.context("./test", false, /.test.js$/);
这行代码就会去 test 文件夹（不包含子目录）下面的找所有文件名以 .test.js 结尾的文件能被 require 的文件。更直白的说就是 我们可以通过正则匹配引入相应的文件模块。

require.context有三个参数：

+ directory：说明需要检索的目录
+ useSubdirectories：是否检索子目录
+ regExp: 匹配文件的正则表达式

了解这些之后，我们就可以这样写来自动引入 @/src/icons 下面所有的图标了，在src/icons下新建一个index.js，自动导入svg，然后在main.ts中引入它。

```js
// src/icons/index.js
import Vue from 'vue'
import svgIcon from '@/components/svgIcon.vue'

Vue.component('svg-icon', svgIcon)
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', false, /\.svg$/)
requireAll(req)

// main.ts
import './icons/index'
```

之后就可以直接使用了`<svg-icon iconClass="lishi" className="svg-lishi"></svg-icon>`

### svg抽离

默认情况下svg会被打包到app.js中，当svg过多过大时，会导致app.js打包后过大，这个时候就需要单独把这些svg从打包中抽离出来。svg-sprite-loader 提供了抽取模式。

```js
// vue.config.js 首先引入该插件
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')

configureWebpack: config => {
    config.plugins.push(new SpriteLoaderPlugin({ plainSprite: true }))
    ...
}
// 然后修改index.html，在body最后加入即可
<% if (htmlWebpackPlugin.files.sprites) { %>
    <% for (var spriteFileName in htmlWebpackPlugin.files.sprites) { %>
      <%= htmlWebpackPlugin.files.sprites[spriteFileName] %>
    <% } %>
<% } %>
```
