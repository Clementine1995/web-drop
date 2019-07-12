# WorkBox

>[官网文档](https://developers.google.com/web/tools/workbox/guides/get-started)

## Route Requests

WorkBox中的路由是路由器将请求与路由匹配以及然后处理该请求的路由的过程。

有三种可以通过Workbox-routing来处理请求的方式：

1. string 匹配
2. 正则匹配
3. callback处理

```js
workbox.routing.registerRoute(
  'https://some-other-origin.com/logo.png',
  handler
);

workbox.routing.registerRoute(
  new RegExp('\\.css$'),
  cssHandler
);

workbox.routing.registerRoute(
  new RegExp('.+\\.js$'),
  jsHandler
);

workbox.routing.registerRoute(
  new RegExp('.+\\.css$'),
  cssHandler
);
```

通过这几种方法可以匹配请求，接下来就需要处理请求。有两种方法处理请求：

1. 使用workbox提供的处理策略 workbox.strategies.
2. 提供一个返回 Promise 并且 resolve 请求的回调方法

### 通过 workbox 策略来处理路由

+ Stale While Revalidate：如果缓存可用，优先使用缓存来响应请求，并在后台使用网络响应更新缓存，如果没有缓存，将会等待网络请求返回。这种策略的缺点是它总是从网络请求资源，耗尽用户的带宽。
+ 网络优先：会优先去请求网络，如果网络返回，则传给浏览器并且保存到缓存，如果网络请求失败，使用上一次的缓存。
+ 缓存优先：这个策略先检查缓存，如果可用的话使用它，否则请求网络，并且在把响应传给浏览器之前添加到缓存
+ 只读取网络
+ 只读取缓存

使用时就像下面这样：

```js
workbox.routing.registerRoute(
  match,
  new workbox.strategies.StaleWhileRevalidate()
);
```

同时每一个策略可以自定义行为，通过定义一个自定义的缓存，也可以加插件。

```js
new workbox.strategies.StaleWhileRevalidate({
   // Use a custom cache for this route.
  cacheName: 'my-cache-name',

  // Add an array of custom plugins (like workbox.expiration.Plugin).
  plugins: [
    ...
  ]
});
```

这些选项可以让缓存请求更加安全，例如限制缓存时长，或者确保设备上使用的数据是受限的。

### 通过自定义 callback 来处理路由

在某些情况下，可能希望使用自己的不同策略来响应请求，或者只是使用模板生成 Service worker 中的请求。为此，可以提供一个返回Response对象的异步函数。调用时会给他传入包含url和event（FetchEvent）属性的参数对象。

```js
const handler = async ({url, event}) => {
  return new Response(`Custom handler response.`);
};

workbox.routing.registerRoute(match, handler);
```

需要注意的是如果在match的回调里返回了值，那么它会作为 hanlder 回调的 params 参数

```js
const match = ({url, event}) => {
  return {
    name: 'Workbox',
    type: 'guide',
  };
};

const handler = async ({url, event, params}) => {
   // Response will be "A guide to Workbox"
  return new Response(
    `A ${params.type} to ${params.name}`
  );
};

workbox.routing.registerRoute(match, handler);
```

## 配置 Workbox

### 配置缓存名称

默认会创建一个预取和运行时缓存。

使用 workbox-core 使用下面的方式获取当前的缓存名称

```js
const precacheCacheName = workbox.core.cacheNames.precache;
const runtimeCacheName = workbox.core.cacheNames.runtime;
```
