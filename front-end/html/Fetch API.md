# Fetch API

> [MDN Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)

Fetch API 提供了一个获取资源的接口（包括跨域请求）。任何使用过 XMLHttpRequest 的人都能轻松上手，而且新的 API 提供了更强大和灵活的功能集。

Fetch 提供了对 Request 和 Response （以及其他与网络请求有关的）对象的通用定义。它同时还为有关联性的概念，例如 CORS 和 HTTP 原生头信息，提供一种新的定义，取代它们原来那种分离的定义。

发送请求或者获取资源，需要使用 fetch() 方法。

fetch() 必须接受一个参数——资源的路径。无论请求成功与否，它都返回一个 Promise 对象，resolve 对应请求的 Response。

一旦 Response 被返回，就可以使用一些方法来定义内容的形式，以及应当如何处理内容。

## 使用 Fetch API

Fetch API 提供了一个 JavaScript 接口，用于访问和操纵 HTTP 管道的一些具体部分，例如请求和响应。它还提供了一个全局 fetch() 方法，该方法提供了一种简单，合理的方式来跨网络异步获取资源。

这种功能以前是使用 XMLHttpRequest 实现的。Fetch 提供了一个更理想的替代方案，可以很容易地被其他技术使用，例如 [Service Workers](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)。Fetch 还提供了专门的逻辑空间来定义其他与 HTTP 相关的概念，例如 CORS 和 HTTP 的扩展。

请注意，fetch 规范与 jQuery.ajax() 主要有以下的不同：

- 当接收到一个代表错误的 HTTP 状态码时，从 fetch() 返回的 Promise 不会被标记为 reject，即使响应的 HTTP 状态码是 404 或 500。相反，它会将 Promise 状态标记为 resolve（如果响应的 HTTP 状态码不在 200 - 299 的范围内，则设置 resolve 返回值的 ok 属性为 false），仅当网络故障时或请求被阻止时，才会标记为 reject。
- fetch 不会发送跨域 cookie，除非你使用了 credentials 的 [初始化选项](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch#%E5%8F%82%E6%95%B0)。（自 2018 年 8 月以后，默认的 credentials 政策变更为 same-origin。Firefox 也在 61.0b13 版本中进行了修改）

一个基本的 fetch 请求设置起来很简单。看看下面的代码：

```js
fetch("http://example.com/movies.json")
  .then((response) => response.json())
  .then((data) => console.log(data))
```

这里通过网络获取一个 JSON 文件并将其打印到控制台。最简单的用法是只提供一个参数用来指明想 fetch() 到的资源路径，然后返回一个包含响应结果的 promise（一个 Response 对象）。

当然它只是一个 HTTP 响应，而不是真的 JSON。为了获取 JSON 的内容，需要使用 json() 方法（该方法返回一个将响应 body 解析成 JSON 的 promise）。

## 接口
