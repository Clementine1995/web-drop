# Koa

## 一、基本用法

### 1.1 架设 HTTP 服务

主要方法listen()

```javascript
const Koa = require('koa');
const app = new Koa();
app.listen(3000);
```

### 1.2 Context 对象

Koa 提供一个 Context 对象，表示一次对话的上下文（包括 HTTP 请求和 HTTP 回复）。每个请求都将创建一个 Context，并在中间件中作为接收器引用，或者 ctx 标识符，通过加工这个对象，就可以控制返回给用户的内容。
Context.response.body属性就是发送给用户的内容。请看下面的例子

```javascript
const Koa = require('koa');
const app = new Koa();

const main = ctx => {
  ctx.response.body = 'Hello World';
};

app.use(main);
app.listen(3000);
```

上面代码中，main函数用来设置ctx.response.body。然后，使用app.use方法加载main函数。
你可能已经猜到了，ctx.response代表 HTTP Response。同样地，ctx.request代表 HTTP Request。

#### 1.2.1 ctx.req

Node 的 request 对象。

#### 1.2.2 ctx.res

Node 的 response 对象.
绕过 Koa 的 response 处理是 不被支持的. 应避免使用以下 node 属性：

+ res.statusCode
+ res.writeHead()
+ res.write()
+ res.end()

#### 1.2.3 ctx.request

koa 的 Request 对象.

#### 1.2.4 ctx.response

koa 的 Response 对象.

#### 1.2.5 ctx.state

推荐的命名空间，用于通过中间件传递信息和你的前端视图。

```javascript
ctx.state.user = await User.find(id);
```

#### 1.2.6 ctx.app

应用程序实例引用

#### 1.2.7 ctx.cookies.get(name, [options])

通过 options 获取 cookie name:

+ signed 所请求的cookie应该被签名

koa 使用 [cookies](https://github.com/pillarjs/cookies) 模块，其中只需传递参数。

#### 1.2.8 ctx.cookies.set(name, value, [options])

通过 options 设置 cookie name 的 value :

+ maxAge 一个数字表示从 Date.now() 得到的毫秒数
+ signed cookie 签名值
+ expires cookie 过期的 Date
+ path cookie 路径, 默认是'/'
+ domain cookie 域名
+ secure 安全 cookie
+ httpOnly 服务器可访问 cookie, 默认是 true
+ overwrite 一个布尔值，表示是否覆盖以前设置的同名的 cookie (默认是 false). 如果是 true, 在同一个请求中设置相同名称的所有 Cookie（不管路径或域）是否在设置此Cookie 时从 Set-Cookie 标头中过滤掉。
+ koa 使用传递简单参数的 cookies 模块。

#### 1.2.9 ctx.throw([status], [msg], [properties])

Helper 方法抛出一个 .status 属性默认为 500 的错误，这将允许 Koa 做出适当地响应。

允许以下组合：

```javascript
ctx.throw(400);
ctx.throw(400, 'name required');
ctx.throw(400, 'name required', { user: user });
```

例如 ctx.throw(400, 'name required') 等效于:

```javascript
const err = new Error('name required');
err.status = 400;
err.expose = true;
throw err;
```

请注意，这些是用户级错误，并用 err.expose 标记，这意味着消息适用于客户端响应，这通常不是错误消息的内容，因为您不想泄漏故障详细信息。

你可以根据需要将 properties 对象传递到错误中，对于装载上传给请求者的机器友好的错误是有用的。这用于修饰其人机友好型错误并向上游的请求者报告非常有用。

```javascript
ctx.throw(401, 'access_denied', { user: user });
```

koa 使用 [http-errors](https://github.com/jshttp/http-errors) 来创建错误。

#### 1.2.10 ctx.assert(value, [status], [msg], [properties])

当 !value 时，Helper 方法抛出类似于 .throw() 的错误。这与 node 的 assert() 方法类似.

```javascript
ctx.assert(ctx.state.user, 401, 'User not found. Please login!');
```

koa 使用 [http-assert](https://github.com/jshttp/http-assert) 作为断言。

#### 1.2.11 ctx.respond

为了绕过 Koa 的内置 response 处理，你可以显式设置 ctx.respond = false;。 如果您想要写入原始的 res 对象而不是让 Koa 处理你的 response，请使用此参数。

请注意，Koa不支持使用此功能。这可能会破坏 Koa 中间件和 Koa 本身的预期功能。使用这个属性被认为是一个 hack，只是便于那些希望在 Koa 中使用传统的 fn(req, res) 功能和中间件的人。

### 1.3 响应(Response)

Koa Response 对象是在 node 的 vanilla 响应对象之上的抽象，提供了诸多对 HTTP 服务器开发有用的功能。

#### 1.3.1 response.header

响应标头对象。

#### 1.3.2 response.headers

响应标头对象。别名是 response.header。

#### 1.3.3 response.socket

请求套接字。

#### 1.3.4 response.status

获取响应状态。默认情况下，response.status 设置为 404 而不是像 node 的 res.statusCode 那样默认为 200。

#### 1.3.5 response.message

获取响应的状态消息. 默认情况下, response.message 与 response.status 关联.

#### 1.3.6 response.message=

将响应的状态消息设置为给定值。

#### 1.3.7 response.length=

将响应的 Content-Length 设置为给定值。

#### 1.3.8 response.length

以数字返回响应的 Content-Length，或者从ctx.body推导出来，或者undefined。

#### 1.3.9 response.body

获取响应主体。

#### 1.3.10 response.body=

将响应体设置为以下之一：

+ string 写入
+ Buffer 写入
+ Stream 管道
+ Object || Array JSON-字符串化
+ null 无内容响应

如果 response.status 未被设置, Koa 将会自动设置状态为 200 或 204。

String
Content-Type 默认为 text/html 或 text/plain, 同时默认字符集是 utf-8。Content-Length 字段也是如此。

Buffer
Content-Type 默认为 application/octet-stream, 并且 Content-Length 字段也是如此。

Stream
Content-Type 默认为 application/octet-stream。

每当流被设置为响应主体时，.onerror 作为侦听器自动添加到 error 事件中以捕获任何错误。此外，每当请求关闭（甚至过早）时，流都将被销毁。如果你不想要这两个功能，请勿直接将流设为主体。例如，当将主体设置为代理中的 HTTP 流时，你可能不想要这样做，因为它会破坏底层连接。

参阅: [这里](https://github.com/koajs/koa/pull/612) 获取更多信息。

以下是流错误处理的示例，而不会自动破坏流：

```javascript
const PassThrough = require('stream').PassThrough;

app.use(async ctx => {
  ctx.body = someHTTPStream.on('error', ctx.onerror).pipe(PassThrough());
});
```

Object
Content-Type 默认为 application/json. 这包括普通的对象 { foo: 'bar' } 和数组 ['foo', 'bar']。

#### 1.3.11 response.get(field)

不区分大小写获取响应标头字段值 field。

```javascript
const etag = ctx.response.get('ETag');
```

#### 1.3.12 response.set(field, value)

设置响应标头 field 到 value:

```javascript
ctx.set('Cache-Control', 'no-cache');
```

#### 1.3.13 response.append(field, value)

用值 val 附加额外的标头 field。

```javascript
ctx.append('Link', '<http://127.0.0.1/>');
```

#### 1.3.14 response.set(fields)

用一个对象设置多个响应标头fields:

```javascript
ctx.set({
  'Etag': '1234',
  'Last-Modified': date
});
```

#### 1.3.15 response.remove(field)

删除标头 field。

#### 1.3.16 response.type

获取响应 Content-Type 不含参数 "charset"。

```javascript
const ct = ctx.type;
// => "image/png"
```

#### 1.3.17 response.type=

设置响应 Content-Type 通过 mime 字符串或文件扩展名。

```javascript
ctx.type = 'text/plain; charset=utf-8';
ctx.type = 'image/png';
ctx.type = '.png';
ctx.type = 'png';
```

注意: 在适当的情况下为你选择 charset, 比如 response.type = 'html' 将默认是 "utf-8". 如果你想覆盖 charset, 使用 ctx.set('Content-Type', 'text/html') 将响应头字段设置为直接值。

#### 1.3.18 response.is(types...)

非常类似 ctx.request.is(). 检查响应类型是否是所提供的类型之一。这对于创建操纵响应的中间件特别有用。

例如, 这是一个中间件，可以削减除流之外的所有HTML响应。

```javascript
const minify = require('html-minifier');

app.use(async (ctx, next) => {
  await next();

  if (!ctx.response.is('html')) return;

  let body = ctx.body;
  if (!body || body.pipe) return;

  if (Buffer.isBuffer(body)) body = body.toString();
  ctx.body = minify(body);
});
```

#### 1.3.19 response.redirect(url, [alt])

执行 [302] 重定向到 url.
字符串 “back” 是特别提供Referrer支持的，当Referrer不存在时，使用 alt 或“/”。

```javascript
ctx.redirect('back');
ctx.redirect('back', '/index.html');
ctx.redirect('/login');
ctx.redirect('http://google.com');
```

要更改 “302” 的默认状态，只需在该调用之前或之后分配状态。要变更主体请在此调用之后:

```javascript
ctx.status = 301;
ctx.redirect('/cart');
ctx.body = 'Redirecting to shopping cart';
response.attachment([filename])
```

将 Content-Disposition 设置为 “附件” 以指示客户端提示下载。(可选)指定下载的 filename。

#### 1.3.20 response.headerSent

检查是否已经发送了一个响应头。 用于查看客户端是否可能会收到错误通知。

#### 1.3.21 response.lastModified

将 Last-Modified 标头返回为 Date, 如果存在。

#### 1.3.21 response.lastModified=

将 Last-Modified 标头设置为适当的 UTC 字符串。您可以将其设置为 Date 或日期字符串。

```javascript
ctx.response.lastModified = new Date();
```

#### 1.3.22 response.etag=

设置包含 " 包裹的 ETag 响应， 请注意，没有相应的 response.etag getter。

```javascript
ctx.response.etag = crypto.createHash('md5').update(ctx.body).digest('hex');
```

#### 1.3.23 response.vary(field)

在 field 上变化。

#### 1.3.24 response.flushHeaders()

刷新任何设置的标头，并开始主体。

### 1.4 HTTP Response 的类型

Koa 默认的返回类型是text/plain，如果想返回其他类型的内容，可以先用ctx.request.accepts判断一下，
客户端希望接受什么数据（根据 HTTP Request 的Accept字段），然后使用ctx.response.type指定返回类型。

```javascript
const main = ctx => {
  if (ctx.request.accepts('xml')) {
    ctx.response.type = 'xml';
    ctx.response.body = '<data>Hello World</data>';
  } else if (ctx.request.accepts('json')) {
    ctx.response.type = 'json';
    ctx.response.body = { data: 'Hello World' };
  } else if (ctx.request.accepts('html')) {
    ctx.response.type = 'html';
    ctx.response.body = '<p>Hello World</p>';
  } else {
    ctx.response.type = 'text';
    ctx.response.body = 'Hello World';
  }
};
```

### 1.5 网页模板

实际开发中，返回给用户的网页往往都写成模板文件。我们可以让 Koa 先读取模板文件，然后将这个模板返回给用户。

```javascript
const fs = require('fs');
const main = ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream('./demos/template.html');
};
```

## 二、路由

### 2.1 原生路由

网站一般都有多个页面。通过ctx.request.path可以获取用户请求的路径，由此实现简单的路由。

```javascript
const main = ctx => {
  if (ctx.request.path !== '/') {
    ctx.response.type = 'html';
    ctx.response.body = '<a href="/">Index Page</a>';
  } else {
    ctx.response.body = 'Hello World';
  }
};
```

### 2.2 koa-route 模块

原生路由用起来不太方便，我们可以使用封装好的koa-route模块。

```javascript
const route = require('koa-route');

const about = ctx => {
  ctx.response.type = 'html';
  ctx.response.body = '<a href="/">Index Page</a>';
};

const main = ctx => {
  ctx.response.body = 'Hello World';
};

app.use(route.get('/', main));
app.use(route.get('/about', about));
```

上面代码中，根路径/的处理函数是main，/about路径的处理函数是about。

### 2.3 静态资源

如果网站提供静态资源（图片、字体、样式表、脚本......），为它们一个个写路由就很麻烦，也没必要。koa-static模块封装了这部分的请求。

```javascript
const path = require('path');
const serve = require('koa-static');

const main = serve(path.join(__dirname));
app.use(main);
```

### 2.4 重定向

有些场合，服务器需要重定向（redirect）访问请求。比如，用户登陆以后，将他重定向到登陆前的页面。
ctx.response.redirect()方法可以发出一个302跳转，将用户导向另一个路由。

```javascirpt
const redirect = ctx => {
  ctx.response.redirect('/');
  ctx.response.body = '<a href="/">Index Page</a>';
};

app.use(route.get('/redirect', redirect));
```

## 三、中间件

### 3.1 Logger 功能

Koa 的最大特色，也是最重要的一个设计，就是中间件（middleware）。为了理解中间件，我们先看一下 Logger （打印日志）功能的实现。
最简单的写法就是在main函数里面增加一行。

```javascript
const main = ctx => {
  console.log(`${Date.now()} ${ctx.request.method} ${ctx.request.url}`);
  ctx.response.body = 'Hello World';
};
```

### 3.2 中间件的概念

上一个例子里面的 Logger 功能，可以拆分成一个独立函数

```javascript
const logger = (ctx, next) => {
  console.log(`${Date.now()} ${ctx.request.method} ${ctx.request.url}`);
  next();
}
app.use(logger);
```

像上面代码中的logger函数就叫做"中间件"（middleware），因为它处在 HTTP Request 和 HTTP Response 中间，用来实现某种中间功能。app.use()用来加载中间件。
基本上，Koa 所有的功能都是通过中间件实现的，前面例子里面的main也是中间件。每个中间件默认接受两个参数，第一个参数是 Context 对象，第二个参数是next函数。
只要调用next函数，就可以把执行权转交给下一个中间件。

### 3.3 中间件栈

多个中间件会形成一个栈结构（middle stack），以"先进后出"（first-in-last-out）的顺序执行。

1. 最外层的中间件首先执行。
2. 调用next函数，把执行权交给下一个中间件。
3. ...
4. 最内层的中间件最后执行。
5. 执行结束后，把执行权交回上一层的中间件。
6. ...
7. 最外层的中间件收回执行权之后，执行next函数后面的代码。

请看下面的例子

```javascript
const one = (ctx, next) => {
  console.log('>> one');
  next();
  console.log('<< one');
}

const two = (ctx, next) => {
  console.log('>> two');
  next();
  console.log('<< two');
}

const three = (ctx, next) => {
  console.log('>> three');
  next();
  console.log('<< three');
}

app.use(one);
app.use(two);
app.use(three);
```

运行这个 demo，命令行窗口会有如下输出。

```javascript
>> one
>> two
>> three
<< three
<< two
<< one
```

如果中间件内部没有调用next函数，那么执行权就不会传递下去。

### 3.4 异步中间件

迄今为止，所有例子的中间件都是同步的，不包含异步操作。如果有异步操作（比如读取数据库），中间件就必须写成 async 函数。

```javascript
const fs = require('fs.promised');
const Koa = require('koa');
const app = new Koa();

const main = async function (ctx, next) {
  ctx.response.type = 'html';
  ctx.response.body = await fs.readFile('./demos/template.html', 'utf8');
};

app.use(main);
app.listen(3000);
```

上面代码中，fs.readFile是一个异步操作，必须写成await fs.readFile()，然后中间件必须写成 async 函数。

### 3.5 中间件的合成

koa-compose模块可以将多个中间件合成为一个。

```javascript
const compose = require('koa-compose');

const logger = (ctx, next) => {
  console.log(`${Date.now()} ${ctx.request.method} ${ctx.request.url}`);
  next();
}

const main = ctx => {
  ctx.response.body = 'Hello World';
};

const middlewares = compose([logger, main]);
app.use(middlewares);
```

## 四、错误处理

默认情况下，将所有错误输出到 stderr，除非 app.silent 为 true。 当 err.status 是 404 或 err.expose 是 true 时默认错误处理程序也不会输出错误。

### 4.1 500 错误

如果代码运行过程中发生错误，我们需要把错误信息返回给用户。HTTP 协定约定这时要返回500状态码。
Koa 提供了ctx.throw()方法，用来抛出错误，ctx.throw(500)就是抛出500错误。

```javascript
const main = ctx => {
  ctx.throw(500);
};
```

### 4.2 404错误

如果将ctx.response.status设置成404，就相当于ctx.throw(404)，返回404错误。

```javascript
const main = ctx => {
  ctx.response.status = 404;
  ctx.response.body = 'Page Not Found';
};
```

### 4.3 处理错误的中间件

为了方便处理错误，最好使用try...catch将其捕获。但是，为每个中间件都写try...catch太麻烦，我们可以让最外层的中间件，负责所有中间件的错误处理。

```javascirpt
const handler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message
    };
  }
};

const main = ctx => {
  ctx.throw(500);
};

app.use(handler);
app.use(main);
```

### 4.4 error 事件的监听

 要执行自定义错误处理逻辑，如集中式日志记录，您可以添加一个 “error” 事件侦听器，运行过程中一旦出错，Koa 会触发一个error事件。监听这个事件，也可以处理错误。

```javascript
const main = ctx => {
  ctx.throw(500);
};

app.on('error', (err, ctx) =>
  console.error('server error', err);
);
```

### 4.5 释放 error 事件

需要注意的是，如果错误被try...catch捕获，就不会触发error事件。这时，必须调用ctx.app.emit()，手动释放error事件，才能让监听函数生效。

```javascript
const handler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.type = 'html';
    ctx.response.body = '<p>Something wrong, please contact administrator.</p>';
    ctx.app.emit('error', err, ctx);
  }
};

const main = ctx => {
  ctx.throw(500);
};

app.on('error', function(err) {
  console.log('logging error ', err.message);
  console.log(err);
});
```

上面代码中，main函数抛出错误，被handler函数捕获。catch代码块里面使用ctx.app.emit()手动释放error事件，才能让监听函数监听到。

## 五、Web App 的功能

### 5.1 Cookies

ctx.cookies用来读写 Cookie。请看下面的例子

```javascript
const main = function(ctx) {
  const n = Number(ctx.cookies.get('view') || 0) + 1;
  ctx.cookies.set('view', n);
  ctx.response.body = n + ' views';
}
```

### 5.2 表单

Web 应用离不开处理表单。本质上，表单就是 POST 方法发送到服务器的键值对。koa-body模块可以用来从 POST 请求的数据体里面提取键值对。

```javascript
const koaBody = require('koa-body');

const main = async function(ctx) {
  const body = ctx.request.body;
  if (!body.name) ctx.throw(400, '.name required');
  ctx.body = { name: body.name };
};

app.use(koaBody());
```

上面代码使用 POST 方法向服务器发送一个键值对，会被正确解析。如果发送的数据不正确，就会收到错误提示。

### 5.3 文件上传

koa-body模块还可以用来处理文件上传。请看下面的例子。

```javascript
const os = require('os');
const path = require('path');
const koaBody = require('koa-body');

const main = async function(ctx) {
  const tmpdir = os.tmpdir();
  const filePaths = [];
  const files = ctx.request.body.files || {};

  for (let key in files) {
    const file = files[key];
    const filePath = path.join(tmpdir, file.name);
    const reader = fs.createReadStream(file.path);
    const writer = fs.createWriteStream(filePath);
    reader.pipe(writer);
    filePaths.push(filePath);
  }

  ctx.body = filePaths;
};

app.use(koaBody({ multipart: true }));
```

## 六、app上的方法和设置

### 设置

应用程序设置是 app 实例上的属性，目前支持如下：

+ app.env 默认是 NODE_ENV 或 "development"
+ app.proxy 当真正的代理头字段将被信任时
+ app.subdomainOffset 对于要忽略的 .subdomains 偏移

### app.listen(...)

Koa 应用程序不是 HTTP 服务器的1对1展现。 可以将一个或多个 Koa 应用程序安装在一起以形成具有单个HTTP服务器的更大应用程序。
创建并返回 HTTP 服务器，将给定的参数传递给 Server#listen()。
以下是一个无作用的 Koa 应用程序被绑定到 3000 端口：

```javascirpt
const Koa = require('koa');
const app = new Koa();
app.listen(3000);
```

这里的 app.listen(...) 方法只是以下方法的语法糖:

```javascript
const http = require('http');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
```

这意味着您可以将同一个应用程序同时作为 HTTP 和 HTTPS 或多个地址：

```javascript
const http = require('http');
const https = require('https');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
```

### app.callback()

返回适用于 http.createServer() 方法的回调函数来处理请求。你也可以使用此回调函数将 koa 应用程序挂载到 Connect/Express 应用程序中。

### app.use(function)

将给定的中间件方法添加到此应用程序。参阅 [Middleware](https://github.com/koajs/koa/wiki#middleware) 获取更多信息。

### app.keys=

设置签名的 Cookie 密钥。

这些被传递给 [KeyGrip](https://github.com/crypto-utils/keygrip)，但是你也可以传递你自己的 KeyGrip 实例。

例如，以下是可以接受的：

```javascript
app.keys = ['im a newer secret', 'i like turtle'];
app.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256');
```

这些密钥可以倒换，并在使用 { signed: true } 参数签名 Cookie 时使用。

```javascript
ctx.cookies.set('name', 'tobi', { signed: true });
```

### app.context

app.context 是从其创建 ctx 的原型。可以通过编辑 app.context 为 ctx 添加其他属性。这对于将 ctx 添加到整个应用程序中使用的属性或方法非常有用，这可能会更加有效（不需要中间件）和/或 更简单（更少的 require()），而更多地依赖于ctx，这可以被认为是一种反模式。

例如，要从 ctx 添加对数据库的引用：

```javascript
app.context.db = db();

app.use(async ctx => {
  console.log(ctx.db);
});
```

注意:

+ ctx 上的许多属性都是使用 getter ，setter 和 Object.defineProperty() 定义的。你只能通过在 app.context 上使用 Object.defineProperty() 来编辑这些属性（不推荐）。查阅 [这里](https://github.com/koajs/koa/issues/652)。
+ 安装的应用程序目前使用其父级的 ctx 和设置。 因此，安装的应用程序只是一组中间件。
