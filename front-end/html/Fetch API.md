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

### 支持的请求参数

fetch() 接受第二个可选参数，一个可以控制不同配置的 init 对象：

参考下文的 fetch()，查看所有可选的配置和更多描述。

```js
// Example POST method implementation:
async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
  return response.json() // parses JSON response into native JavaScript objects
}

postData("https://example.com/answer", { answer: 42 }).then((data) => {
  console.log(data) // JSON data parsed by `data.json()` call
})
```

注意：mode: "no-cors" 仅允许使用一组有限的 HTTP 请求头：

- Accept
- Accept-Language
- Content-Language
- Content-Type 允许使用的值为：application/x-www-form-urlencoded、multipart/form-data 或 text/plain

### 发送带凭据的请求

为了让浏览器发送包含凭据的请求（即使是跨域源），要将 credentials: 'include' 添加到传递给 fetch() 方法的 init 对象。

```js
fetch("https://example.com", {
  credentials: "include",
})
```

> 备注： 当请求使用 credentials: 'include' 时，响应的 Access-Control-Allow-Origin 不能使用通配符 "`*`"。在这种情况下，Access-Control-Allow-Origin 必须是当前请求的源，在使用 CORS Unblock 插件的情况下请求仍会失败。
>
> 备注： 无论怎么设置，浏览器都不应在 预检请求 中发送凭据。

如果只想在请求 URL 与调用脚本位于同一起源处时发送凭据，请添加 credentials: 'same-origin'。

```js
// The calling script is on the origin 'https://example.com'
fetch("https://example.com", {
  credentials: "same-origin",
})
```

要改为确保浏览器不在请求中包含凭据，请使用 credentials: 'omit'。

```js
fetch("https://example.com", {
  credentials: "omit",
})
```

### 上传 JSON 数据

使用 fetch() POST JSON 数据

```js
const data = { username: "example" }

fetch("https://example.com/profile", {
  method: "POST", // or 'PUT'
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Success:", data)
  })
  .catch((error) => {
    console.error("Error:", error)
  })
```

### 上传文件

可以通过 HTML `<input type="file" />` 元素，FormData() 和 fetch() 上传文件。

```js
const formData = new FormData()
const fileField = document.querySelector('input[type="file"]')

formData.append("username", "abc123")
formData.append("avatar", fileField.files[0])

fetch("https://example.com/profile/avatar", {
  method: "PUT",
  body: formData,
})
  .then((response) => response.json())
  .then((result) => {
    console.log("Success:", result)
  })
  .catch((error) => {
    console.error("Error:", error)
  })
```

### 逐行处理文本文件

从响应中读取的分块不是按行分割的，并且是 Uint8Array 数组类型（不是字符串类型）。如果你想通过 fetch() 获取一个文本文件并逐行处理它，那需要自行处理这些复杂情况。以下示例展示了一种创建行迭代器来处理的方法（简单起见，假设文本是 UTF-8 编码的，且不处理 fetch() 的错误）。

```js
async function* makeTextFileLineIterator(fileURL) {
  const utf8Decoder = new TextDecoder("utf-8")
  const response = await fetch(fileURL)
  const reader = response.body.getReader()
  let { value: chunk, done: readerDone } = await reader.read()
  chunk = chunk ? utf8Decoder.decode(chunk) : ""

  const re = /\n|\r|\r\n/gm
  let startIndex = 0
  let result

  for (;;) {
    let result = re.exec(chunk)
    if (!result) {
      if (readerDone) {
        break
      }
      let remainder = chunk.substr(startIndex)
      ;({ value: chunk, done: readerDone } = await reader.read())
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : "")
      startIndex = re.lastIndex = 0
      continue
    }
    yield chunk.substring(startIndex, result.index)
    startIndex = re.lastIndex
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex)
  }
}

async function run() {
  for await (let line of makeTextFileLineIterator(urlOfFile)) {
    processLine(line)
  }
}

run()
```

### 检测请求是否成功

如果遇到网络故障或服务端的 CORS 配置错误时，fetch() promise 将会 reject，带上一个 TypeError 对象。虽然这个情况经常是遇到了权限问题或类似问题——比如 404 不是一个网络故障。想要精确的判断 fetch() 是否成功，需要包含 promise resolved 的情况，此时再判断 Response.ok 是否为 true。类似以下代码：

```js
fetch("flowers.jpg")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not OK")
    }
    return response.blob()
  })
  .then((myBlob) => {
    myImage.src = URL.createObjectURL(myBlob)
  })
  .catch((error) => {
    console.error("There has been a problem with your fetch operation:", error)
  })
```

### 自定义请求对象

除了传给 fetch() 一个资源的地址，还可以通过使用 Request() 构造函数来创建一个 request 对象，然后再作为参数传给 fetch()：

```js
const myHeaders = new Headers()

const myRequest = new Request("flowers.jpg", {
  method: "GET",
  headers: myHeaders,
  mode: "cors",
  cache: "default",
})

fetch(myRequest)
  .then((response) => response.blob())
  .then((myBlob) => {
    myImage.src = URL.createObjectURL(myBlob)
  })
```

Request() 和 fetch() 接受同样的参数。甚至可以传入一个已存在的 request 对象来创造一个拷贝：

```js
const anotherRequest = new Request(myRequest, myInit)
```

这个很有用，因为 request 和 response bodies 只能被使用一次（译者注：这里的意思是因为设计成了 stream 的方式，所以它们只能被读取一次）。创建一个拷贝就可以再次使用 request/response 了，当然也可以使用不同的 init 参数。创建拷贝必须在读取 body 之前进行，而且读取拷贝的 body 也会将原始请求的 body 标记为已读。

> 备注： clone() 方法也可以用于创建一个拷贝。它和上述方法一样，如果 request 或 response 的 body 已经被读取过，那么将执行失败。区别在于，clone() 出的 body 被读取不会导致原 body 被标记为已读取。

### Headers

使用 Headers 的接口，可以通过 Headers() 构造函数来创建一个自己的 headers 对象。一个 headers 对象是一个简单的多键值对：

```js
const content = "Hello World"
const myHeaders = new Headers()
myHeaders.append("Content-Type", "text/plain")
myHeaders.append("Content-Length", content.length.toString())
myHeaders.append("X-Custom-Header", "ProcessThisImmediately")
```

也可以传入一个多维数组或者对象字面量：

```js
const myHeaders = new Headers({
  "Content-Type": "text/plain",
  "Content-Length": content.length.toString(),
  "X-Custom-Header": "ProcessThisImmediately",
})
```

它的内容可以被获取：

```js
console.log(myHeaders.has("Content-Type")) // true
console.log(myHeaders.has("Set-Cookie")) // false
myHeaders.set("Content-Type", "text/html")
myHeaders.append("X-Custom-Header", "AnotherValue")

console.log(myHeaders.get("Content-Length")) // 11
console.log(myHeaders.get("X-Custom-Header")) // ['ProcessThisImmediately', 'AnotherValue']

myHeaders.delete("X-Custom-Header")
console.log(myHeaders.get("X-Custom-Header")) // null
```

虽然一些操作只能在 ServiceWorkers 中使用，但是它提供了更方便的操作 Headers 的 API。

如果使用了一个不合法的 HTTP Header 属性名，那么 Headers 的方法通常都抛出 TypeError 异常。如果不小心写入了一个不可写的属性，也会抛出一个 TypeError 异常。除此以外的情况，失败了并不抛出异常。例如：

```js
const myResponse = Response.error()
try {
  myResponse.headers.set("Origin", "http://mybank.com")
} catch (e) {
  console.log("Cannot pretend to be a bank!")
}
```

最好在在使用之前检查内容类型 content-type 是否正确，比如：

```js
fetch(myRequest)
  .then((response) => {
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!")
    }
    return response.json()
  })
  .then((data) => {
    /* process your data further */
  })
  .catch((error) => console.error(error))
```

#### Guard

由于 Headers 可以在 request 中被发送或者在 response 中被接收，并且规定了哪些参数是可写的，Headers 对象有一个特殊的 guard 属性。这个属性没有暴露给 Web，但是它影响到哪些内容可以在 Headers 对象中被操作。

可能的值如下：

- none：默认的。
- request：从 request 中获得的 headers（Request.headers）只读。
- request-no-cors：从不同域（Request.mode no-cors）的 request 中获得的 headers 只读。
- response：从 response 中获得的 headers（Response.headers）只读。
- immutable：在 ServiceWorkers 中最常用的，所有的 headers 都只读。

### Response 对象

如上所述，Response 实例是在 fetch() 处理完 promise 之后返回的。

会用到的最常见的 response 属性有：

- Response.status — 整数（默认值为 200）为 response 的状态码。
- Response.statusText — 字符串（默认值为 ""），该值与 HTTP 状态码消息对应。注意：HTTP/2 不支持状态消息
- Response.ok — 如上所示，该属性是来检查 response 的状态是否在 200 - 299（包括 200 和 299）这个范围内。该属性返回一个布尔值。

它的实例也可用通过 JavaScript 来创建，但只有在 ServiceWorkers 中使用 respondWith() 方法并提供了一个自定义的 response 来接受 request 时才真正有用：

```js
const myBody = new Blob()

addEventListener("fetch", (event) => {
  // ServiceWorker intercepting a fetch
  event.respondWith(
    new Response(myBody, {
      headers: { "Content-Type": "text/plain" },
    })
  )
})
```

Response() 构造方法接受两个可选参数—— response 的 body 和一个初始化对象（与 Request() 所接受的 init 参数类似）。

> 备注： 静态方法 error() 只是返回了错误的 response。与此类似地，redirect() 只是返回了一个可以重定向至某 URL 的 response。这些也只与 Service Worker 有关。

### Body

不管是请求还是响应都能够包含 body 对象。body 也可以是以下任意类型的实例。

- ArrayBuffer
- ArrayBufferView (Uint8Array 等)
- Blob/File
- string
- URLSearchParams
- FormData

Body 类定义了以下方法（这些方法都被 Request 和 Response 所实现）以获取 body 内容。这些方法都会返回一个被解析后的 Promise 对象和数据。

- Request.arrayBuffer() / Response.arrayBuffer()
- Request.blob() / Response.blob()
- Request.formData() / Response.formData()
- Request.json() / Response.json()
- Request.text() / Response.text()

相比于 XHR，这些方法让非文本化数据的使用更加简单。

请求体可以由传入 body 参数来进行设置：

```js
const form = new FormData(document.getElementById("login-form"))
fetch("/login", {
  method: "POST",
  body: form,
})
```

request 和 response（包括 fetch() 方法）都会试着自动设置 Content-Type。如果没有设置 Content-Type 值，发送的请求也会自动设值。

## Fetch 基本概念

Fetch 的核心在于对 HTTP 接口的抽象，包括 Request，Response，Headers，Body，以及用于初始化异步请求的 global fetch。得益于 JavaScript 实现的这些抽象好的 HTTP 模块，其他接口能够很方便的使用这些功能。Service Workers 是大量使用 Fetch 的 API 的一个示例。

除此之外，Fetch 还利用到了请求的异步特性——它是基于 Promise 的。

### Guard 概念

Guard 是 Headers 对象的特性，基于不同的情况，它可以有以下取值：immutable、request、request-no-cors、response 或 none。

当使用 Headers() constructor 创建一个新的 Headers 对象的时候，它的 guard 被设置成 none（默认值）。当创建 Request 或 Response 对象的时候，它将拥有一个按照以下规则实现的与之关联的 Headers 对象：

| 新对象的类型 | 创建时的构造函数               | 关联的 Headers 对象的 guard 值 |
| ------------ | ------------------------------ | ------------------------------ |
| Request      | Request()                      | request                        |
| Request      | Request()，mode 设置成 no-cors | request-no-cors                |
| Response     | Response()                     | response                       |
| Response     | error() 或 redirect() 方法     | immutable                      |

头信息的 guard 会影响 set()、delete() 和 append() 方法。如果你试图修改 guard 是 immutable 的 Headers 对象，那么会抛出一个 TypeError。以下情况则不会抛出错误：

- guard 是 request 并且头信息中的 name 不是 forbidden header name
- guard 是 request-no-cors 并且头信息中的 name/value 是 simple header
- guard 是 response 并且头信息中的 name 不是 forbidden response header name

## 接口

### Headers 接口

Fetch API 的 Headers 接口允许对 HTTP 请求和响应头执行各种操作。 这些操作包括检索，设置，添加和删除。 一个 Headers 对象具有关联的头列表，它最初为空，由零个或多个键值对组成。可以使用 append() 方法添加 之类的方法添加到此。在该接口的所有方法中，标题名称由不区分大小写的字节序列匹配。

出于安全考虑，某些头只能由用户代理控制。这些头信息包括 [forbidden header names](https://developer.mozilla.org/zh-CN/docs/Glossary/Forbidden_header_name) 和 [forbidden response header names](https://developer.mozilla.org/zh-CN/docs/Glossary/Forbidden_response_header_name)。

一个 Headers 对象也有一个关联的 guard，它具有不可变的值，request，request-no-cors，response 或 none。 这会影响 set(), delete(), 和 append() 方法 改变 header。

可以通过 Request.headers 和 Response.headers 属性检索一个 Headers 对象，并使用 Headers.Headers() 构造函数创建一个新的 Headers 对象。

一个实现了 Headers 的对象可以直接用于 for...of 结构中，而不是 entries()

#### Headers.Headers()

创建一个新的 Headers 对象。语法：

```js
var myHeaders = new Headers(init)
```

参数：

init(可选)：通过一个包含任意 HTTP headers 的对象来预设 Headers. 可以是一个 ByteString 对象; 或者是一个已存在的 Headers 对象.

创建一个空的 Headers 对象：

```js
var myHeaders = new Headers() // Currently empty
```

可以使用 Headers.append 方法添加一个 header 并赋值：

```js
myHeaders.append("Content-Type", "image/jpeg")
myHeaders.get("Content-Type") // Returns 'image/jpeg'
```

或者可以在 Headers 对象创建时添加多个 header.

```js
var httpHeaders = {
  "Content-Type": "image/jpeg",
  "Accept-Charset": "utf-8",
  "X-My-Custom-Header": "Zeke are cool",
}
var myHeaders = new Headers(httpHeaders)
```

#### Headers 上的方法

- Headers.append()：给现有的 header 添加一个值，或者添加一个未存在的 header 并赋值。
  - 语法：`myHeaders.append(name,value);`
    - name：要追加给 Headers 对象的 HTTP header 名称。
    - value：要追加给 Headers 对象的 HTTP header 值。
  - 如果指定 header 不存在，append()将会添加这个 header 并赋值. 如果指定 header 已存在并允许有多个值，append()将会把指定值添加到值队列的末尾。
- Headers.delete()：从 Headers 对象中删除指定 header.
  - 语法：`myHeaders.delete(name);`
    - name：需删除的 HTTP header 名称。
  - 下列原因将会导致该方法抛出一个 TypeError：header 名在 HTTP header 中是不存在的。header 被锁定了.​
- Headers.entries()：以 迭代器 的形式返回 Headers 对象中所有的键值对。
  - 语法：`headers.entries();`
- Headers.get()：以 ByteString 的形式从 Headers 对象中返回指定 header 的全部值。
  - 语法：`myHeaders.get(name);`
  - 如果 Header 对象中不存在请求的 header，则返回 null。
- Headers.has()：以布尔值的形式从 Headers 对象中返回是否存在指定的 header.
  - 语法：`myHeaders.has(name);`
- Headers.keys()：以迭代器的形式返回 Headers 对象中所有存在的 header 名。
  - 语法：`headers.keys();`
- Headers.set()：替换现有的 header 的值，或者添加一个未存在的 header 并赋值。
  - 语法：`myHeaders.set(name, value);`
    - name：name 就是需要对 HTTP header 设置新值的 key，一般为字符串。
    - value：value 就是 name 对应的值。
  - 如果这个键值对不存在，那么 set()方法首先创建一个键值对，然后给它赋值。如果这个键值对存在，那么 set()方法将会覆盖之前的 value 值
- Headers.values()：以迭代器的形式返回 Headers 对象中所有存在的 header 的值。
  - 语法：`headers.values();`

### Request

Fetch API 的 Request 接口用来表示资源请求。

可以使用 Request.Request() 构造函数创建一个 Request 对象，但是可能会遇到一个 Request 对象作为其它 API 的操作被返回，比如一个 service worker 的 FetchEvent.request 。

#### Request.Request() 构造函数

Request() 构造器创建一个新的 Request 对象。

语法：

```js
var myRequest = new Request(input[, init]);
```

参数:

- input：定义你想要 fetch 的资源。可以是下面两者之一：
  - 一个直接包含你希望 fetch 的资源的 URL 的 USVString。
  - 一个 Request 对象。请注意以下行为更新，以在保留安全性的同时使构造函数不太可能引发异常：
    - 如果此对象存在于构造函数调用的另一个起源上，则将除去 Request.referrer 。
    - 如果此对象的导航为 Request.mode，则 mode 将转换为 same-origin。
- init(可选)：一个配置项对象，包括所有对请求的设置。可选的参数有：
  - method: 请求使用的方法，如 GET、POST。
  - headers: 请求的头信息，形式为 Headers 的对象或包含 ByteString 值的对象字面量。
  - body: 请求的 body 信息：可能是一个 Blob、BufferSource、FormData、URLSearchParams 或者 USVString 对象。注意 GET 或 HEAD 方法的请求不能包含 body 信息。
  - mode: 请求的模式，如 cors、no-cors 或者 same-origin。
  - credentials: 请求的 credentials，如 omit、same-origin 或者 include。为了在当前域名内自动发送 cookie，必须提供这个选项，从 Chrome 50 开始，这个属性也可以接受 FederatedCredential 实例或是一个 PasswordCredential 实例。
  - cache: 请求的 cache 模式：default、 no-store、 reload 、 no-cache、 force-cache 或者 only-if-cached。
  - redirect: 可用的 redirect 模式：follow (自动重定向), error (如果产生重定向将自动终止并且抛出一个错误），或者 manual (手动处理重定向)。在 Chrome 中默认使用 follow（Chrome 47 之前的默认值是 manual）。
  - referrer: 一个 USVString 可以是 no-referrer、client 或一个 URL。默认是 client。
  - referrerPolicy: 指定了 HTTP 头部 referer 字段的值。可能为以下值之一：no-referrer、 no-referrer-when-downgrade、origin、origin-when-cross-origin、 unsafe-url。
  - integrity: 包括请求的 subresource integrity 值（例如： sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=）。

例子：

使用构造函数创建一个新的 Request 对象，然后使用 GlobalFetch.fetch 发送请求。由于正在获取图像，在响应上运行 Body.blob 以为其提供正确的 MIME 类型，以便对其进行正确处理，然后为其创建一个 Object URL，并将其显示在 `<img>` 元素中。

```js
var myImage = document.querySelector("img")

var myRequest = new Request("flowers.jpg")

fetch(myRequest)
  .then(function (response) {
    return response.blob()
  })
  .then(function (response) {
    var objectURL = URL.createObjectURL(response)
    myImage.src = objectURL
  })
```

在调用 fetch() 时，传递进一个 init 对象：

```js
var myImage = document.querySelector("img")

var myHeaders = new Headers()
myHeaders.append("Content-Type", "image/jpeg")

var myInit = {
  method: "GET",
  headers: myHeaders,
  mode: "cors",
  cache: "default",
}

var myRequest = new Request("flowers.jpg", myInit)

fetch(myRequest).then(function (response) {
  // ...
})
```

也可以把 Request 对象再作参数传递进 Request() 构造器来创建一个请求的副本（就像调用 clone()一样）。

```js
var copy = new Request(myRequest)
```

#### Request 属性

- Request.method 只读：包含请求的方法 (GET, POST, 等.)
- Request.url 只读：包含这个请求的 URL。
- Request.headers 只读：包含请求相关的 Headers 对象。
- Request.context 只读 Deprecated：包含请求的上下文 (例如：audio, image, iframe, 等)
- Request.referrer 只读：包含请求的来源 (例如：client)。
- Request.referrerPolicy 只读：包含请求来源的策略 (例如：no-referrer)。
- Request.mode 只读：包含请求的模式 (例如： cors, no-cors, same-origin, navigate).这用于确定跨域请求是否能得到有效的响应，以及响应的哪些属性是可读的
  - same-origin — 如果使用此模式向另外一个源发送请求，显而易见，结果会是一个错误。你可以设置该模式以确保请求总是向当前的源发起的。
  - no-cors — 保证请求对应的 method 只有 HEAD，GET 或 POST 方法，并且请求的 headers 只能有简单请求头 (simple headers)。如果 ServiceWorker 劫持了此类请求，除了 simple header 之外，不能添加或修改其他 header。另外 JavaScript 不会读取 Response 的任何属性。这样将会确保 ServiceWorker 不会影响 Web 语义 (semantics of the Web)，同时保证了在跨域时不会发生安全和隐私泄露的问题。
  - cors — 允许跨域请求，例如访问第三方供应商提供的各种 API。预期将会遵守 CORS protocol 。仅有有限部分的头部暴露在 Response ，但是 body 部分是可读的。
  - navigate — 表示这是一个浏览器的页面切换请求 (request)。 navigate 请求仅在浏览器切换页面时创建，该请求应该返回 HTML。
- Request.credentials 只读：包含请求的证书 (例如： omit, same-origin).
- Request.redirect 只读：包含如何处理重定向模式，它可能是一个 follow ，error 或者 manual。
- Request.integrity 只读：包含请求的子资源的完整性值 (例如： sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=).
- Request.cache 只读：包含请求的缓存模式 (例如： default, reload, no-cache).
  - default — 浏览器从 HTTP 缓存中寻找匹配的请求。
    - 如果缓存匹配上并且有效（ fresh）, 它将直接从缓存中返回资源。
    - 如果缓存匹配上但已经过期 ，浏览器将会使用传统（ conditional request ）的请求方式去访问远程服务器 。如果服务器端显示资源没有改动，它将从缓存中返回资源。否则，如果服务器显示资源变动，那么重新从服务器下载资源更新缓存。
    - 如果缓存没有匹配，浏览器将会以普通方式请求，并且更新已经下载的资源缓存。
  - no-store — 浏览器直接从远程服务器获取资源，不查看缓存，并且不会使用下载的资源更新缓存。
  - reload — 浏览器直接从远程服务器获取资源，不查看缓存，然后使用下载的资源更新缓存。
  - no-cache — 浏览器在其 HTTP 缓存中寻找匹配的请求。
    - 如果有匹配，无论是新的还是陈旧的，浏览器都会向远程服务器发出条件请求。如果服务器指示资源没有更改，则将从缓存中返回该资源。否则，将从服务器下载资源并更新缓存。
    - 如果没有匹配，浏览器将发出正常请求，并使用下载的资源更新缓存。
  - force-cache — 浏览器在其 HTTP 缓存中寻找匹配的请求。
    - 如果有匹配项，不管是新匹配项还是旧匹配项，都将从缓存中返回。
    - 如果没有匹配，浏览器将发出正常请求，并使用下载的资源更新缓存。
  - only-if-cached — 浏览器在其 HTTP 缓存中寻找匹配的请求。
    - 如果有匹配项 (新的或旧的)，则从缓存中返回。
    - 如果没有匹配，浏览器将返回一个错误。

Request 实现了 Body, 所以它还具有以下属性可用：

- Body.body 只读：一个简单 getter 用于曝光一个 ReadableStream 的主体内容。
- Body.bodyUsed 只读：存储一个 Boolean 判断主体是否已经被用于一个响应中。

#### Request 方法

- Request.clone()：创建当前 request 的副本。

Request 实现 Body, 因此它也有以下方法可用：

- Body.arrayBuffer()：返回解决一个 ArrayBuffer 表示的请求主体的 promise.
- Body.blob()：返回解决一个 Blob 表示的请求主体的 promise.
- Body.formData()：返回解决一个 FormData 表示的请求主体的 promise.
- Body.json()：返回解决一个 JSON 表示的请求主体的 promise.
- Body.text()：返回解决一个 USVString(文本) 表示的请求主体的 promise.

注意：这些 Body 功能只能运行一次; 随后的调用将通过空 strings/ ArrayBuffers 解析。

### Response

Fetch API 的 Response 接口呈现了对一次请求的响应数据。

以使用 Response.Response() 构造函数来创建一个 Response 对象，但通常更可能遇到的情况是，其他的 API 操作返回了一个 Response 对象。例如一个 service worker 的 Fetchevent.respondWith，或者一个简单的 GlobalFetch.fetch()。

#### Response 构造函数

Response() 构造函数创建了一个新的 Response 对象。

语法：

```js
let myResponse = new Response(body, init)
```

参数：

- body 可选：一个定义 response 中 body 的对象。可以为 null ，或是以下其中一个：
  - Blob
  - BufferSource
  - FormData
  - ReadableStream
  - URLSearchParams
  - USVString
- init 可选：一个参数 (options) 对象，包含要应用到 response 上的任何自定义设置。可能参数 (options) 是：
  - status: response 的状态码，例如：200.
  - statusText: 和状态码关联的状态消息，例如: OK.
  - headers: 想加到 response 上的任何 headers，包含了一个 Headers 对象或满足对象语法的 ByteString key/value 对

例子：

## 方法

### fetch()

全局的 fetch() 方法用于发起获取资源的请求。它返回一个 promise，这个 promise 会在请求响应后被 resolve，并传回 Response 对象。

Window 和 WorkerGlobalScope 都实现了 WorkerOrGlobalScope。 ——这意味着基本在任何场景下只要想获取资源，都可以使用 位于 WorkerOrGlobalScope 中的 fetch() 方法。

当遇到网络错误时，fetch() 返回的 promise 会被 reject，并传回 TypeError，虽然这也可能因为权限或其它问题导致。成功的 fetch() 检查不仅要包括 promise 被 resolve，还要包括 Response.ok 属性为 true。HTTP 404 状态并不被认为是网络错误。

> 备注：fetch() 方法的参数与 Request() 构造器是一样的。

语法：

```js
Promise<Response> fetch(input[, init]);
```

参数:

- input：定义要获取的资源。这可能是：
  - 一个 USVString 字符串，包含要获取资源的 URL。一些浏览器会接受 blob: 和 data: 作为 schemes.
  - 一个 Request 对象。
- init(可选)：一个配置项对象，包括所有对请求的设置。可选的参数有：
  - method: 请求使用的方法，如 GET、POST。
  - headers: 请求的头信息，形式为 Headers 的对象或包含 ByteString 值的对象字面量。
  - body: 请求的 body 信息：可能是一个 Blob、BufferSource、FormData、URLSearchParams 或者 USVString 对象。注意 GET 或 HEAD 方法的请求不能包含 body 信息。
  - mode: 请求的模式，如 cors、no-cors 或者 same-origin。
  - credentials: 请求的 credentials，如 omit、same-origin 或者 include。为了在当前域名内自动发送 cookie，必须提供这个选项，从 Chrome 50 开始，这个属性也可以接受 FederatedCredential 实例或是一个 PasswordCredential 实例。
  - cache: 请求的 cache 模式：default、 no-store、 reload 、 no-cache、 force-cache 或者 only-if-cached。
  - redirect: 可用的 redirect 模式：follow (自动重定向), error (如果产生重定向将自动终止并且抛出一个错误），或者 manual (手动处理重定向)。在 Chrome 中默认使用 follow（Chrome 47 之前的默认值是 manual）。
  - referrer: 一个 USVString 可以是 no-referrer、client 或一个 URL。默认是 client。
  - referrerPolicy: 指定了 HTTP 头部 referer 字段的值。可能为以下值之一：no-referrer、 no-referrer-when-downgrade、origin、origin-when-cross-origin、 unsafe-url。
  - integrity: 包括请求的 subresource integrity 值（例如： sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=）。

返回值：

一个 Promise，resolve 时回传 Response 对象。
