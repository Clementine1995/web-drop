# Service Worker

## Service Worker：简介

### 什么是 Service Worker

Service Worker 是浏览器在后台独立于网页运行的脚本，它打开了通向不需要网页或用户交互的功能的大门。 现在，它们已包括如推送通知和后台同步等功能。

这个 API 之所以令人兴奋，是因为它可以支持离线体验，让开发者能够全面控制这一体验。

Service Worker 相关注意事项：

+ 它是一种 JavaScript Worker，无法直接访问 DOM。 Service Worker 通过响应 postMessage 接口发送的消息来与其控制的页面通信，页面可在必要时对 DOM 执行操作。
+ Service Worker 是一种可编程网络代理，让您能够控制页面所发送网络请求的处理方式。
+ Service Worker 在不用时会被中止，并在下次有需要时重启，因此，不能依赖 Service Worker onfetch 和 onmessage 处理程序中的全局状态。 如果存在需要持续保存并在重启后加以重用的信息，Service Worker 可以访问 IndexedDB API。
+ Service Worker 广泛地利用了 promise

### Service Worker 生命周期

Service Worker 的生命周期完全独立于网页。

如果要在网站中使用 Service Worker，首先需要通过 js 进行注册，注册后浏览器会在后台进行 Service Worker 的安装。

在安装过程中，通常需要缓存某些静态资源。如果所有文件均已成功缓存，那么 Service Worker 就安装完毕。 如果任何文件下载失败或缓存失败，那么安装步骤将会失败，Service Worker 就无法激活（也就是说，不会安装）。如果发生这种情况，不必担心，它下次会再试一次。 但这意味着，如果安装完成，就可以知道缓存中可以获得那些静态资源。

安装之后，接下来就是激活步骤，可以在这里管理旧缓存，将会在 Service Worker 的更新部分对此详加介绍。

激活之后，Service Worker 将会对其作用域内的所有页面实施控制，首次注册该 Service Worker 的页面需要再次加载才会受其控制。Service Worker 实施控制后，它将处于以下两种状态之一：终止以节省内存，或处理获取和消息事件，从页面发出网络请求或消息后将会出现后一种状态。

### 先决条件

首先浏览器必须支持，主流浏览器都是支持的，不过safari好像不行。

在开发过程中，可以通过 localhost 使用 Service Worker，但如果要在网站上部署 Service Worker，则需要在服务器上设置 HTTPS。[Github Pages](https://pages.github.com/)提供了https 服务，可以用来托管和演示。

### 注册 Service Worker

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
```

此代码用于检查 Service Worker API 是否可用，如果可用，则在页面加载后注册位于 /sw.js 的 Service Worker。

每次页面加载无误时，即可调用 register()；浏览器将会判断服务工作线程是否已注册并做出相应的处理。

register() 方法的精妙之处在于服务工作线程文件的位置。上面的代码中 Service Worker 文件位于根目录下。这意味着服务工作线程的作用域将是整个来源。 换句话说，Service Worker 将接收此网域上所有事项的 fetch 事件。 如果我们在 /example/sw.js 处注册 Service Worker 文件，则 Service Worker 将只能看到网址以 /example/ 开头（即 /example/page1/、/example/page2/）的页面的 fetch 事件。

可以通过转至 chrome://inspect/#service-workers 并寻找您的网站来检查 Service Worker 是否已启用。

### 安装 Service Worker

在受控页面启动注册流程后，我们需要处理install事件

最基本的例子是，您需要为安装事件定义回调，并决定想要缓存的文件。在 install 回调的内部，我们需要执行以下步骤：

+ 打开缓存。
+ 缓存文件。
+ 确认所有需要的资产是否已缓存。

```js
var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});
```

此处，我们以所需的缓存名称调用 caches.open()，之后再调用 cache.addAll() 并传入文件数组。 这是一个 promise 链（caches.open() 和 cache.addAll()）。 event.waitUntil() 方法带有 promise 参数并使用它来判断安装所花费的时间，以及安装是否成功。如果所有文件都成功缓存，则将安装 Service Worker，否则就会失败。同时也意味这必须对这些缓存文件列表格外注意，文件越多，缓存失败的概率也就越高。

这仅是一个示例，实际可以在 install 事件中执行其他任务，或完全避免设置 install 事件侦听器。

### 缓存和返回请求

```js
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

这里我们定义了 fetch 事件，并且在 event.respondWith() 中，我们传入来自 caches.match() 的一个 promise。 此方法检视该请求，并从服务工作线程所创建的任何缓存中查找缓存的结果。

如果发现匹配的响应，则返回缓存的值，否则，将调用 fetch 以发出网络请求，并将从网络检索到的任何数据作为结果返回。 这是一个简单的例子，它使用了在安装步骤中缓存的所有资产。

### 更新 Service Worker

在某个时间点，Service Worker 需要更新的话，要遵循以下步骤：

