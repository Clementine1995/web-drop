# 学习 axios 源码整体架构，打造属于自己的请求库

> 原文[学习 axios 源码整体架构，打造属于自己的请求库](https://lxchuan12.gitee.io/axios)

## axios 结构是怎样的

![img1](https://lxchuan12.gitee.io/assets/img/axios-instance.e915a96a.png)

看完结构图，如果看过 jQuery、underscore 和 lodash 源码，会发现其实跟 axios 源码设计类似。

jQuery 别名 $，underscore loadsh 别名 _ 也既是函数，也是对象。比如jQuery使用方式。$('#id'), $.ajax。

## axios 源码 初始化

看源码第一步，先看 package.json。一般都会申明 main 主入口文件。

```json
// package.json
{
  "name": "axios",
  "version": "0.19.0",
  "description": "Promise based HTTP client for the browser and node.js",
  "main": "index.js"
  // ...
}
```

主入口文件

```js
// index.js
module.exports = require("./lib/axios")
```

### lib/axios.js 主文件

axios.js 文件 代码相对比较多。分为三部分展开叙述。

- 第一部分：引入一些工具函数 utils、Axios 构造函数、默认配置 defaults 等。
- 第二部分：是生成实例对象 axios、axios.Axios、axios.create 等。
- 第三部分取消相关 API 实现，还有 all、spread、导出等实现。

#### 第一部分

引入一些工具函数 utils、Axios 构造函数、默认配置 defaults 等。

```js
// 第一部分：
// lib/axios
// 严格模式
"use strict"
// 引入 utils 对象，有很多工具方法。
var utils = require("./utils")
// 引入 bind 方法
var bind = require("./helpers/bind")
// 核心构造函数 Axios
var Axios = require("./core/Axios")
// 合并配置方法
var mergeConfig = require("./core/mergeConfig")
// 引入默认配置
var defaults = require("./defaults")
```

#### 第二部分

是生成实例对象 axios、axios.Axios、axios.create 等。

```js
/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  // new 一个 Axios 生成实例对象
  var context = new Axios(defaultConfig)
  // bind 返回一个新的 wrap 函数，
  // 也就是为什么调用 axios 是调用 Axios.prototype.request 函数的原因
  var instance = bind(Axios.prototype.request, context)
  // Copy axios.prototype to instance
  // 复制 Axios.prototype 到实例上。
  // 也就是为什么 有 axios.get 等别名方法，
  // 且调用的是 Axios.prototype.get 等别名方法。
  utils.extend(instance, Axios.prototype, context)
  // Copy context to instance
  // 复制 context 到 intance 实例
  // 也就是为什么默认配置 axios.defaults 和拦截器  axios.interceptors 可以使用的原因
  // 其实是new Axios().defaults 和 new Axios().interceptors
  utils.extend(instance, context)
  // 最后返回实例对象，以上代码，在上文的图中都有体现。这时可以仔细看下上图。
  return instance
}

// Create the default instance to be exported
// 导出 创建默认实例
var axios = createInstance(defaults)
// Expose Axios class to allow class inheritance
// 暴露 Axios class 允许 class 继承 也就是可以 new axios.Axios()
// 但  axios 文档中 并没有提到这个，我们平时也用得少。
axios.Axios = Axios

// Factory for creating new instances
// 工厂模式 创建新的实例 用户可以自定义一些参数
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig))
}
```

这里简述下工厂模式。axios.create，也就是用户不需要知道内部是怎么实现的。

举个生活的例子，我们买手机，不需要知道手机是怎么做的，就是工厂模式。

看完第二部分，里面涉及几个工具函数，如 bind、extend。接下来讲述这几个工具方法。

#### 工具方法之 bind

axios/lib/helpers/bind.js

```js
"use strict"
// 返回一个新的函数 wrap
module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    // 把 argument 对象放在数组 args 里
    return fn.apply(thisArg, args)
  }
}
```

传递两个参数函数和 thisArg 指向。

把参数 arguments 生成数组，最后调用返回参数结构。

其实现在 apply 支持 arguments 这样的类数组对象了，不需要手动转数组。

#### 工具方法之 utils.extend

axios/lib/utils.js

```js
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === "function") {
      a[key] = bind(val, thisArg)
    } else {
      a[key] = val
    }
  })
  return a
}
```

其实就是遍历参数 b 对象，复制到 a 对象上，如果是函数就是则用 bind 调用。

#### 工具方法之 utils.forEach

axios/lib/utils.js

遍历数组和对象。设计模式称之为迭代器模式。很多源码都有类似这样的遍历函数。比如大家熟知的 jQuery $.each。

```js
/**
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  // 判断 null 和 undefined 直接返回
  if (obj === null || typeof obj === "undefined") {
    return
  }

  // Force an array if not already something iterable
  // 如果不是对象，放在数组里。
  if (typeof obj !== "object") {
    /*eslint no-param-reassign:0*/
    obj = [obj]
  }

  // 是数组 则用for 循环，调用 fn 函数。参数类似 Array.prototype.forEach 的前三个参数。
  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj)
    }
  } else {
    // Iterate over object keys
    // 用 for in 遍历对象，但 for in 会遍历原型链上可遍历的属性。
    // 所以用 hasOwnProperty 来过滤自身属性了。
    // 其实也可以用Object.keys来遍历，它不遍历原型链上可遍历的属性。
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj)
      }
    }
  }
}
```

#### 第三部分

取消相关 API 实现，还有 all、spread、导出等实现。

```js
// Expose Cancel & CancelToken
// 导出 Cancel 和 CancelToken
axios.Cancel = require("./cancel/Cancel")
axios.CancelToken = require("./cancel/CancelToken")
axios.isCancel = require("./cancel/isCancel")

// Expose all/spread
// 导出 all 和 spread API
axios.all = function all(promises) {
  return Promise.all(promises)
}
axios.spread = require("./helpers/spread")

module.exports = axios

// Allow use of default import syntax in TypeScript
// 也就是可以以下方式引入
// import axios from 'axios';
module.exports.default = axios
```

这里介绍下 spread，假设你有这样的需求。

```js
function f(x, y, z) {}
var args = [1, 2, 3]
f.apply(null, args)
```

那么可以用 spread 方法。用法：

```js
axios.spread(function (x, y, z) {})([1, 2, 3])
```

实现也比较简单。源码实现：

```js
/**
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}
```

上文 var context = new Axios(defaultConfig);，接下来介绍核心构造函数 Axios。

### 核心构造函数 Axios

axios/lib/core/Axios.js

构造函数 Axios。

```js
function Axios(instanceConfig) {
  // 默认参数
  this.defaults = instanceConfig
  // 拦截器 请求和响应拦截器
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  }
}
```

```js
Axios.prototype.request = function (config) {
  // 省略，这个是核心方法，后文结合例子详细描述
  // code ...
  var promise = Promise.resolve(config)
  // code ...
  return promise
}
// 这是获取 Uri 的函数，这里省略
Axios.prototype.getUri = function () {}
// 提供一些请求方法的别名
// Provide aliases for supported request methods
// 遍历执行
// 也就是为啥我们可以 axios.get 等别名的方式调用，而且调用的是 Axios.prototype.request 方法
// 这个也在上面的 axios 结构图上有所体现。
utils.forEach(
  ["delete", "get", "head", "options"],
  function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function (url, config) {
      return this.request(
        utils.merge(config || {}, {
          method: method,
          url: url,
        })
      )
    }
  }
)

utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, data, config) {
    return this.request(
      utils.merge(config || {}, {
        method: method,
        url: url,
        data: data,
      })
    )
  }
})

module.exports = Axios
```

### 拦截器管理构造函数 InterceptorManager

请求前拦截，和请求后拦截。在 Axios.prototype.request 函数里使用，如何使用：

```js
// Add a request interceptor
// 添加请求前拦截器
axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
// 添加请求后拦截器
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  }
)
```

如果想把拦截器移除，可以用 eject 方法。

```js
const myInterceptor = axios.interceptors.request.use(function () {
  /*...*/
})
axios.interceptors.request.eject(myInterceptor)
```

拦截器也可以添加自定义的实例上。

```js
const instance = axios.create()
instance.interceptors.request.use(function () {
  /*...*/
})
```

源码实现：

构造函数，handles 用于存储拦截器函数。

```js
function InterceptorManager() {
  this.handlers = []
}
```

接下来声明了三个方法：使用、移除、遍历。

#### InterceptorManager.prototype.use 使用

传递两个函数作为参数，数组中的一项存储的是{fulfilled: function(){}, rejected: function(){}}。返回数字 ID，用于移除拦截器。

```js
/**
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} 返回ID 是为了用 eject 移除
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
  })
  return this.handlers.length - 1
}
```

#### InterceptorManager.prototype.eject 移除

根据 use 返回的 ID 移除 拦截器。

```js
/**
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null
  }
}
```

有点类似定时器 setTimeout 和 setInterval，返回值是 id。用 clearTimeout 和 clearInterval 来清除定时器。

```js
// 提一下 定时器回调函数是可以传参的，返回值 timer 是数字
var timer = setInterval(
  (name) => {
    console.log(name)
  },
  1000,
  "123"
)
console.log(timer) // 数字 ID
// 在控制台等会再输入执行这句，定时器就被清除了
clearInterval(timer)
```

#### InterceptorManager.prototype.forEach 遍历

遍历执行所有拦截器，传递一个回调函数（每一个拦截器函数作为参数）调用，被移除的一项是 null，所以不会执行，也就达到了移除的效果。

```js
/**
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h)
    }
  })
}
```

## 实例结合

上文叙述的调试时运行 npm start 是用 axios/sandbox/client.html 路径的文件作为示例的，以下是一段这个文件中的代码。

```js
axios(options)
  .then(function (res) {
    response.innerHTML = JSON.stringify(res.data, null, 2)
  })
  .catch(function (res) {
    response.innerHTML = JSON.stringify(res.data, null, 2)
  })
```

### 先看调用栈流程

如果不想一步步调试，有个偷巧的方法。

知道 axios 使用了 XMLHttpRequest。

可以在项目中搜索：new XMLHttpRequest。

定位到文件 axios/lib/adapters/xhr.js

在这条语句 var request = new XMLHttpRequest();

chrome 浏览器中 打个断点调试下，再根据调用栈来细看具体函数等实现。

Call Stack

```sh
dispatchXhrRequest (xhr.js:19)
xhrAdapter (xhr.js:12)
dispatchRequest (dispatchRequest.js:60)
Promise.then (async)
request (Axios.js:54)
wrap (bind.js:10)
submit.onclick ((index):138)
```

简述下流程：

1. Send Request 按钮点击 submit.onclick
2. 调用 axios 函数实际上是调用 Axios.prototype.request 函数，而这个函数使用 bind 返回的一个名为 wrap 的函数。
3. 调用 Axios.prototype.request
4. 有请求拦截器的情况下执行请求拦截器，中间会执行 dispatchRequest 方法
5. dispatchRequest 之后调用 adapter (xhrAdapter)
6. 最后调用 Promise 中的函数 dispatchXhrRequest，（有响应拦截器的情况下最后会再调用响应拦截器）

接下来看 Axios.prototype.request 具体实现。

### Axios.prototype.request 请求核心方法

这个函数是核心函数。 主要做了这几件事：

1. 判断第一个参数是字符串，则设置 url,也就是支持 axios('example/url', [, config])，也支持 axios({})。
2. 合并默认参数和用户传递的参数
3. 设置请求的方法，默认是是 get 方法
4. 将用户设置的请求和响应拦截器、发送请求的 dispatchRequest 组成 Promise 链，最后返回还是 Promise 实例。

也就是保证了请求前拦截器先执行，然后发送请求，再响应拦截器执行这样的顺序。也就是为啥最后还是可以 then，catch 方法的缘故。

```js
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  // 这一段代码 其实就是 使 axios('example/url', [, config])
  // config 参数可以省略
  if (typeof config === "string") {
    config = arguments[1] || {}
    config.url = arguments[0]
  } else {
    config = config || {}
  }

  // 合并默认参数和用户传递的参数
  config = mergeConfig(this.defaults, config)

  // Set config.method
  // 设置 请求方法，默认 get 。
  if (config.method) {
    config.method = config.method.toLowerCase()
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase()
  } else {
    config.method = "get"
  }
  // Hook up interceptors middleware
  // 组成`Promise`链 这段拆开到后文再讲述
}
```

#### 组成 Promise 链，返回 Promise 实例

这部分：用户设置的请求和响应拦截器、发送请求的 dispatchRequest 组成 Promise 链。也就是保证了请求前拦截器先执行，然后发送请求，再响应拦截器执行这样的顺序

也就是保证了请求前拦截器先执行，然后发送请求，再响应拦截器执行这样的顺序，也就是为啥最后还是可以 then，catch 方法的缘故。

```js
// 组成`Promise`链
// Hook up interceptors middleware
// 把 xhr 请求 的 dispatchRequest 和 undefined 放在一个数组里
var chain = [dispatchRequest, undefined]
// 创建 Promise 实例
var promise = Promise.resolve(config)

// 遍历用户设置的请求拦截器 放到数组的 chain 前面
this.interceptors.request.forEach(function unshiftRequestInterceptors(
  interceptor
) {
  chain.unshift(interceptor.fulfilled, interceptor.rejected)
})

// 遍历用户设置的响应拦截器 放到数组的 chain 后面
this.interceptors.response.forEach(function pushResponseInterceptors(
  interceptor
) {
  chain.push(interceptor.fulfilled, interceptor.rejected)
})

// 遍历 chain 数组，直到遍历 chain.length 为 0
while (chain.length) {
  // 两两对应移出来 放到 then 的两个参数里。
  promise = promise.then(chain.shift(), chain.shift())
}

return promise
```

### dispatchRequest 最终派发请求

这个函数主要做了如下几件事情：

1. 如果已经取消，则 throw 原因报错，使 Promise 走向 rejected。
2. 确保 config.header 存在。
3. 利用用户设置的和默认的请求转换器转换数据。
4. 拍平 config.header。
5. 删除一些 config.header。
6. 返回适配器 adapter（Promise 实例）执行后 then 执行后的 Promise 实例。返回结果传递给响应拦截器处理。

```js
"use strict"
// utils 工具函数
var utils = require("./../utils")
// 转换数据
var transformData = require("./transformData")
// 取消状态
var isCancel = require("../cancel/isCancel")
// 默认参数
var defaults = require("../defaults")

/**
 * 抛出 错误原因，使`Promise`走向`rejected`
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  // 取消相关
  throwIfCancellationRequested(config)

  // Ensure headers exist
  // 确保 headers 存在
  config.headers = config.headers || {}

  // Transform request data
  // 转换请求的数据
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  )

  // Flatten headers
  // 拍平 headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  )

  // 以下这些方法 删除 headers
  utils.forEach(
    ["delete", "get", "head", "post", "put", "patch", "common"],
    function cleanHeaderConfig(method) {
      delete config.headers[method]
    }
  )
  // adapter 适配器部分 拆开 放在下文讲
}
```

#### dispatchRequest 之 transformData 转换数据

上文的代码里有个函数 transformData ，这里解释下。其实就是遍历传递的函数数组 对数据操作，最后返回数据。

axios.defaults.transformResponse 数组中默认就有一个函数，所以使用 concat 链接自定义的函数。

使用：文件路径 axios/examples/transform-response/index.html

这段代码其实就是对时间格式的字符串转换成时间对象，可以直接调用 getMonth 等方法。

```js
var ISO_8601 = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})Z/
function formatDate(d) {
  return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear()
}

axios
  .get("https://api.github.com/users/mzabriskie", {
    transformResponse: axios.defaults.transformResponse.concat(function (
      data,
      headers
    ) {
      Object.keys(data).forEach(function (k) {
        if (ISO_8601.test(data[k])) {
          data[k] = new Date(Date.parse(data[k]))
        }
      })
      return data
    }),
  })
  .then(function (res) {
    document.getElementById("created").innerHTML = formatDate(
      res.data.created_at
    )
  })
```

源码：就是遍历数组，调用数组里的传递 data 和 headers 参数调用函数。

```js
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers)
  })

  return data
}
```

#### dispatchRequest 之 adapter 适配器执行部分

适配器，在设计模式中称之为适配器模式。讲个生活中简单的例子，大家就容易理解。

我们常用以前手机耳机孔都是圆孔，而现在基本是耳机孔和充电接口合二为一。统一为 typec。

这时我们需要需要一个 typec 转圆孔的转接口，这就是适配器。

```js
// adapter 适配器部分
var adapter = config.adapter || defaults.adapter

return adapter(config).then(
  function onAdapterResolution(response) {
    throwIfCancellationRequested(config)

    // Transform response data
    // 转换响应的数据
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    )

    return response
  },
  function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      // 取消相关
      throwIfCancellationRequested(config)

      // Transform response data
      // 转换响应的数据
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        )
      }
    }

    return Promise.reject(reason)
  }
)
```

接下来看具体的 adapter。

### adapter 适配器 真正发送请求

```js
var adapter = config.adapter || defaults.adapter
```

看了上文的 adapter，可以知道支持用户自定义。比如可以通过微信小程序 wx.request 按照要求也写一个 adapter。

接着来看下 defaults.ddapter。

文件路径：axios/lib/defaults.js

根据当前环境引入，如果是浏览器环境引入 xhr，是 node 环境则引入 http。类似判断 node 环境，也在 [sentry-javascript](https://github.com/getsentry/sentry-javascript/blob/a876d46c61e2618e3c3a3e1710f77419331a9248/packages/utils/src/misc.ts#L37-L40) 源码中有看到。

```js
function getDefaultAdapter() {
  var adapter
  // 根据 XMLHttpRequest 判断
  if (typeof XMLHttpRequest !== "undefined") {
    // For browsers use XHR adapter
    adapter = require("./adapters/xhr")
    // 根据 process 判断
  } else if (
    typeof process !== "undefined" &&
    Object.prototype.toString.call(process) === "[object process]"
  ) {
    // For node use HTTP adapter
    adapter = require("./adapters/http")
  }
  return adapter
}
var defaults = {
  adapter: getDefaultAdapter(),
  // ...
}
```

#### xhr

接下来就是我们熟悉的 XMLHttpRequest 对象。主要提醒下：onabort 是请求取消事件，withCredentials 是一个布尔值，用来指定跨域 Access-Control 请求是否应带有授权信息，如 cookie 或授权 header 头。

```js
module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    // 这块代码有删减
    var request = new XMLHttpRequest()
    request.open()
    request.timeout = config.timeout
    // 监听 state 改变
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return
      }
      // ...
    }
    // 取消
    request.onabort = function () {}
    // 错误
    request.onerror = function () {}
    // 超时
    request.ontimeout = function () {}
    // cookies 跨域携带 cookies 面试官常喜欢考这个
    // 一个布尔值，用来指定跨域 Access-Control 请求是否应带有授权信息，如 cookie 或授权 header 头。
    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials
    }

    // 上传下载进度相关
    // Handle progress if needed
    if (typeof config.onDownloadProgress === "function") {
      request.addEventListener("progress", config.onDownloadProgress)
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === "function" && request.upload) {
      request.upload.addEventListener("progress", config.onUploadProgress)
    }

    // Send the request
    // 发送请求
    request.send(requestData)
  })
}
```

而实际上现在 fetch 支持的很好了，阿里开源的 umi-request 请求库，就是用 fetch 封装的，而不是用 XMLHttpRequest。

#### http

http 是 node 提供的一个原生模块

```js
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(
    resolvePromise,
    rejectPromise
  ) {})
}
```

上文 dispatchRequest 有取消模块，我觉得是重点，所以放在最后来细讲：

### dispatchRequest 之 取消模块

可以使用 cancel token 取消请求。

axios cancel token API 是基于撤销的 promise 取消提议。

[axios 文档 cancellation](https://github.com/axios/axios#cancellation)

不过 CancelToken 的这种方式已经被废弃，0.22 版本之后开始使用 Fetch API 的方式来取消请求。

request 中的拦截器和 dispatch 中的取消这两个模块相对复杂

```js
const CancelToken = axios.CancelToken
const source = CancelToken.source()

axios
  .get("/get/server", {
    cancelToken: source.token,
  })
  .catch(function (err) {
    if (axios.isCancel(err)) {
      console.log("Request canceled", err.message)
    } else {
      // handle error
    }
  })

// cancel the request (the message parameter is optional)
// 取消函数。
source.cancel("哎呀，我被取消了")
```

#### 取消请求模块代码示例

结合源码取消流程大概是这样的。这段放在代码在 axios/examples/cancel-token/index.html。

参数的 config.cancelToken 是触发了 `source.cancel('哎呀，我取消了');` 才生成的。

```js
// source.cancel('哎呀，我被取消了');
// 点击取消时才会 生成 cancelToken 实例对象。
// 点击取消后，会生成原因，看懂了这段在看之后的源码，可能就好理解了。
var config = {
  name: "zhangsan",
  // 这里简化了
  cancelToken: {
    promise: new Promise(function (resolve) {
      resolve({ message: "哎呀，我被取消了" })
    }),
    reason: { message: "哎呀，我被取消了" },
  },
}
// 取消 抛出异常方法
function throwIfCancellationRequested(config) {
  // 取消的情况下执行这句
  if (config.cancelToken) {
    //   这里源代码 便于执行，我改成具体代码
    // config.cancelToken.throwIfRequested();
    // if (this.reason) {
    //     throw this.reason;
    //   }
    if (config.cancelToken.reason) {
      throw config.cancelToken.reason
    }
  }
}

function dispatchRequest(config) {
  // 有可能是执行到这里就取消了，所以抛出错误会被err2 捕获到
  throwIfCancellationRequested(config)
  //  adapter xhr适配器
  return new Promise((resovle, reject) => {
    var request = new XMLHttpRequest()
    console.log("request", request)
    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return
        }

        request.abort()
        reject(cancel)
        // Clean up request
        request = null
      })
    }
  })
    .then(function (res) {
      // 有可能是执行到这里就才取消 取消的情况下执行这句
      throwIfCancellationRequested(config)
      console.log("res", res)
      return res
    })
    .catch(function (reason) {
      // 有可能是执行到这里就才取消 取消的情况下执行这句
      throwIfCancellationRequested(config)
      console.log("reason", reason)
      return Promise.reject(reason)
    })
}

var promise = Promise.resolve(config)

// 没设置拦截器的情况下是这样的
promise
  .then(dispatchRequest, undefined)
  // 用户定义的then 和 catch
  .then(function (res) {
    console.log("res1", res)
    return res
  })
  .catch(function (err) {
    console.log("err2", err)
    return Promise.reject(err)
  })
// err2 {message: "哎呀，我被取消了"}
```

#### 接下来看取消模块的源码

看如何通过生成 config.cancelToken。

文件路径：`axios/lib/cancel/CancelToken.js`

```js
const CancelToken = axios.CancelToken
const source = CancelToken.source()
source.cancel("哎呀，我被取消了")
```

由示例看 CancelToken.source 的实现

```js
CancelToken.source = function source() {
  var cancel
  var token = new CancelToken(function executor(c) {
    cancel = c
  })
  // token
  return {
    token: token,
    cancel: cancel,
  }
}
```

执行后 source 的大概结构是这样的。

```js
{
  token: {
    promise: new Promise(function(resolve){
      resolve({ message: '哎呀，我被取消了'})
    }),
    reason: { message: '哎呀，我被取消了' }
  },
  cancel: function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      // 已经取消
      return;
    }
    token.reason = {message: '哎呀，我被取消了'};
  }
}
```

接着看 new CancelToken

```js
// CancelToken
// 通过 CancelToken 来取消请求操作
function CancelToken(executor) {
  if (typeof executor !== "function") {
    throw new TypeError("executor must be a function.")
  }

  var resolvePromise
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve
  })

  var token = this
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      // 已经取消
      return
    }

    token.reason = new Cancel(message)
    resolvePromise(token.reason)
  })
}

module.exports = CancelToken
```

发送请求的适配器里是这样使用的。

```js
// xhr
if (config.cancelToken) {
  // Handle cancellation
  config.cancelToken.promise.then(function onCanceled(cancel) {
    if (!request) {
      return
    }

    request.abort()
    reject(cancel)
    // Clean up request
    request = null
  })
}
```

dispatchRequest 中的 throwIfCancellationRequested 具体实现：throw 抛出异常。

```js
// 抛出异常函数
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
// 抛出异常 用户 { message: '哎呀，我被取消了' }
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason
  }
}
```

取消流程调用栈

1. source.cancel()
2. resolvePromise(token.reason);
3. config.cancelToken.promise.then(function onCanceled(cancel) {})

最后进入 request.abort();``reject(cancel);

到这里取消的流程就介绍完毕了。主要就是通过传递配置参数 cancelToken，取消时才会生成 cancelToken，判断有，则抛出错误，使 Promise 走向 rejected，让用户捕获到消息{message: '用户设置的取消信息'}。

## 总结

最后画个图总结一下 axios 的总体大致流程。

![img2](https://lxchuan12.gitee.io/assets/img/axios-all.41d4c89c.png)

解答下文章开头提的问题：

如果你是求职者，项目写了运用了 axios，面试官可能会问你：

1. 为什么 axios 既可以当函数调用，也可以当对象使用，比如 axios({})、axios.get。
   答：axios 本质是函数，赋值了一些别名方法，比如 get、post 方法，可被调用，最终调用的还是 Axios.prototype.request 函数。
2. 简述 axios 调用流程。
   答：实际是调用的 Axios.prototype.request 方法，最终返回的是 promise 链式调用，实际请求是在 dispatchRequest 中派发的。
3. 有用过拦截器吗？原理是怎样的？
   答：用过，用 axios.interceptors.request.use 添加请求成功和失败拦截器函数，用 axios.interceptors.response.use 添加响应成功和失败拦截器函数。在 Axios.prototype.request 函数组成 promise 链式调用时，Interceptors.protype.forEach 遍历请求和响应拦截器添加到真正发送请求 dispatchRequest 的两端，从而做到请求前拦截和响应后拦截。拦截器也支持用 Interceptors.protype.eject 方法移除。
4. 有使用 axios 的取消功能吗？是怎么实现的？
   答：用过，通过传递 config 配置 cancelToken 的形式，来取消的。判断有传 cancelToken，在 promise 链式调用的 dispatchRequest 抛出错误，在 adapter 中 request.abort()取消请求，使 promise 走向 rejected，被用户捕获取消信息。
5. 为什么支持浏览器中发送请求也支持 node 发送请求？
   答：axios.defaults.adapter 默认配置中根据环境判断是浏览器还是 node 环境，使用对应的适配器。适配器支持自定义。
