# rem处理方案

>在开发移动端项目时，一个很关键的问题就是适配各种机型不同屏幕的大小，让每种机型上的布局看起来都尽量一样。 也就是说用同一套代码在不同分辨率的手机上跑时，页面元素间的间距、留白，以及图片大小会随着变化，在比例上跟设计稿一致。

## 1. 安装postcss-pxtorem

```shell
npm install postcss-pxtorem -D
```

## 2. 设置规则，在vue.config.js中添加

```js
module.exports = {
  css:{
    loaderOptions:{
      postcss:{
        plugins: [
          require('postcss-pxtorem')({
            rootValue: 37.5, // 结果为：设计稿元素尺寸/37.5，比如元素宽375px,最终页面会换算成 10rem
            propList: ['*']
          })
        ]
      }
    }
  }
}
```

## 3. 动态设置html的font-size

在src/lib文件夹下新建flexible.js，[github地址](https://github.com/amfe/lib-flexible)

```js
// flexible rem适配方案
export const flexible = function (window, document) {
  var docEl = document.documentElement
  var dpr = window.devicePixelRatio || 1

  // adjust body font size
  function setBodyFontSize () {
    if (document.body) {
      document.body.style.fontSize = (12 * dpr) + 'px'
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize)
    }
  }
  setBodyFontSize()

  // set 1rem = viewWidth / 10
  function setRemUnit () {
    var rem = docEl.clientWidth / 10
    docEl.style.fontSize = rem + 'px'
  }

  setRemUnit()

  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit()
    }
  })

  // detect 0.5px supports
  if (dpr >= 2) {
    var fakeBody = document.createElement('body')
    var testElement = document.createElement('div')
    testElement.style.border = '.5px solid transparent'
    fakeBody.appendChild(testElement)
    docEl.appendChild(fakeBody)
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines')
    }
    docEl.removeChild(fakeBody)
  }
}
```

在main.js中使用flexible.js

```js
import { flexible } from '@/lib/flexible.js'
flexible(window, document)
```

## vConsole控制台

我们在写webapp或者移动端网页需要嵌入到app时候，尤其是在APP内置的webView上加载我们的页面，想要查看手机浏览器信息是非常困难的事，当出现问题的时候，你又不能查看日志，一般会连接本地测试环境，然后在alert来打印日志，然后一遍一遍的定位bug，修改代码。这个工具就像电脑端的devtools，可以查看日志，网络，页面，Resources等。

>vConsole.js的cdn地址：`https://cdn.bootcss.com/vConsole/3.2.2/vconsole.min.js`

使用的时候可以把源码复制进项目中，然后本地引入

```js
// 注意在npm run build 时候不要开启
<% if(process.env.NODE_ENV === 'development') { %>
    <script src="./vConsole.min.js"></script>
    <script>
        // init vConsole
        var vConsole = new VConsole();
    </script>
<% } %>
```

引入后运行项目发现在右下角有vConsole的绿色图标代表已经引入成功
点击后可以弹出菜单 查看控制台 使用方法与pc端控制台类似
