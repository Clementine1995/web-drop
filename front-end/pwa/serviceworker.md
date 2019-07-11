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

### Service Worker 生命周期简介

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

### 更新 Service Worker 简介

在某个时间点，Service Worker 需要更新的话，要遵循以下步骤：

+ 更新服务工作线程 JavaScript 文件。用户导航至站点时，浏览器会尝试在后台重新下载定义 Service Worker 的脚本文件。如果 Service Worker 文件与其当前所用文件存在字节差异，则将其视为新 Service Worker。
+ 新 Service Worker 将会启动，且将会触发 install 事件。
+ 此时，旧 Service Worker 仍控制着当前页面，因此新 Service Worker 将进入 waiting 状态。
+ 当网站上当前打开的页面关闭时，旧 Service Worker 将会被终止，新 Service Worker 将会取得控制权。
+ 新 Service Worker 取得控制权后，将会触发其 activate 事件。

在 activate 回调中常见的操作是进行缓存管理，如果在安装步骤中管理缓存的话，可能会导致控制当前页面旧 Service Worker 无法从缓存中获取数据。

比如说我们有一个名为 'my-site-cache-v1' 的缓存，我们想要将该缓存拆分为一个页面缓存和一个博文缓存。 这就意味着在安装步骤中我们创建了两个缓存：'pages-cache-v1' 和 'blog-posts-cache-v1'，且在激活步骤中我们要删除旧的 'my-site-cache-v1'。

以下代码将执行此操作，具体做法为：遍历 Service Worker 中的所有缓存，并删除未在缓存白名单中定义的任何缓存。

```js
self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 可能存在的问题

fetch() 默认值
默认情况下没有凭据
使用 fetch 时，默认情况下请求中不包含 Cookie 等凭据。如需凭据，改为调用：

```js
fetch(url, {
  credentials: 'include'
})
```

非 CORS 默认失败

默认情况下，从不支持 CORS 的第三方网址中提取资源将会失败。 您可以向请求中添加 no-CORS 选项来克服此问题，不过这可能会导致“不透明”的响应，这意味着您无法辨别响应是否成功。

```js
cache.addAll(urlsToPrefetch.map(function(urlToPrefetch) {
  return new Request(urlToPrefetch, { mode: 'no-cors' });
})).then(function() {
  console.log('All resources have been fetched and cached.');
});
```

处理响应式图像

对于 Service Worker，如果想要在安装过程中缓存图像，有下列几种选择：

+ 安装 `<picture>` 元素和 srcset 属性将请求的所有图像。
+ 安装一个低分辨率版本的图像。
+ 安装一个高分辨率版本的图像。

应该选择 2 或 3，因为下载所有图像会浪费存储空间。

假定在安装期间选择安装低分辨率版本的图像，在页面加载时想要尝试从网络中检索高分辨率的图像，但是如果检索高分辨率版本失败，则回退到低分辨率版本。

在 srcset 图像中，我们有一些像这样的标记：

```html
<img src="image-src.png" srcset="image-src.png 1x, image-2x.png 2x" />
```

如果我们使用的是 2x 显示屏，浏览器将会选择下载 image-2x.png。如果我们处于离线状态，您可以对请求执行 .catch() 并返回 image-src.png（如已缓存）。但是，浏览器会期望 2x 屏幕上的图像有额外的像素，这样图像将显示为 200x200 CSS 像素而不是 400x400 CSS 像素。 解决该问题的唯一办法是设定固定的图像高度和宽度。

## Service Worker 生命周期

Service Worker 生命周期的目的：

+ 实现离线优先。
+ 允许新 Service Worker 自行做好运行准备，无需中断当前的 Service Worker。
+ 确保整个过程中作用域页面由同一个 Service Worker（或者没有 Service Worker）控制。
+ 确保每次只运行网站的一个版本。

### 第一个 Service Worker

简介：

+ install 事件是 Service Worker 获取的第一个事件，并且只发生一次。
+ 传递到 installEvent.waitUntil() 的一个 promise 可表明安装的持续时间以及安装是否成功。
+ 在成功完成安装并处于“活动状态”之前，Service Worker 不会收到 fetch 和 push 等事件。
+ 默认情况下，不会通过 Service Worker 提取页面，除非页面请求本身需要执行 Service Worker。因此，需要刷新页面以查看 Service Worker 的影响。
+ clients.claim() 可替换此默认值，并控制未控制的页面。

选取以下 HTML：

```js
<!DOCTYPE html>
An image will appear here in 3 seconds:
<script>
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered!', reg))
    .catch(err => console.log('Boo!', err));

  setTimeout(() => {
    const img = new Image();
    img.src = '/dog.svg';
    document.body.appendChild(img);
  }, 3000);
</script>
```

下面是它的 Service Worker：sw.js:

```js
self.addEventListener('install', event => {
  console.log('V1 installing…');

  // cache a cat SVG
  event.waitUntil(
    caches.open('static-v1').then(cache => cache.add('/cat.svg'))
  );
});

self.addEventListener('activate', event => {
  console.log('V1 now ready to handle fetches!');
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // serve the cat SVG from the cache if the request is
  // same-origin and the path is '/dog.svg'
  if (url.origin == location.origin && url.pathname == '/dog.svg') {
    event.respondWith(caches.match('/cat.svg'));
  }
});
```

它缓存一个小猫的图像，并在请求 /dog.svg 时提供该图像。不过，如果您运行上述示例，首次加载页面时您看到的是一条小狗。按 refresh，您将看到小猫。

作用域和控制

Service Worker 注册的默认作用域是与脚本网址相对的 ./。这意味着如果您在 //example.com/foo/bar.js 注册一个 Service Worker，则它的默认作用域为 //example.com/foo/。

在客户端“受控制”后，它在提取数据时将执行作用域内的 Service Worker。可以通过 navigator.serviceWorker.controller（其将为 null 或一个 Service Worker 实例）检测客户端是否受控制。

下载、解析和执行

在调用 .register() 时，将下载第一个 Service Worker。如果脚本在初始执行中未能进行下载、解析，或引发错误，则注册器 promise 将拒绝，并舍弃此 Service Worker。Chrome 的 DevTools 在控制台和应用标签的 Service Worker 部分中显示此错误。

Install Service Worker

获取的第一个事件为 install。该事件在 Worker 执行时立即触发，并且它只能被每个 Service Worker调用一次。如果更改 Service Worker 脚本，则浏览器将其视为一个不同的 Service Worker，并且它将获得自己的 install 事件。

在能够控制客户端之前，install 事件可以用来缓存需要的所有内容。传递到 event.waitUntil() 的 promise 让浏览器了解安装在何时完成，以及安装是否成功。

如果 promise 拒绝，则表明安装失败，浏览器将丢弃 Service Worker。它将无法控制客户端。

Activate

在 Service Worker 准备控制客户端并处理 push 和 sync 等功能事件时，将获得一个 activate 事件。但这不意味着调用 .register() 的页面将受控制。

clients.claim

激活 Service Worker 后，您可以通过在其中调用 clients.claim() 控制未受控制的客户端。

如果在 activate 事件中调用 clients.claim()。首先应该看到一只猫。

### 更新 Service Worker

简介：

+ 以下情况下会触发更新：
  + 导航到一个作用域内的页面。
  + 更新 push 和 sync 等功能事件，除非在前 24 小时内已进行更新检查。
  + 调用 .register()，仅在 Service Worker 网址已发生变化时。
+ 大部分浏览器（包括 Chrome 68 和更高版本）在检查已注册的 Service Worker 脚本的更新时，默认情况下都会忽略缓存标头。在通过 importScripts() 提取 Service Worker 内加载的资源时，它们仍会遵循缓存标头。您可以在注册 Service Worker 时，通过设置 updateViaCache 选项来替换此默认行为。
+ 如果 Service Worker 的字节与浏览器已有的字节不同，则考虑更新 Service Worker。（我们正在扩展此内容，以便将导入的脚本/模块也包含在内。）
+ 更新的 Service Worker 与现有 Service Worker 一起启动，并获取自己的 install 事件。
+ 如果新 Worker 出现不正常状态代码（例如，404）、解析失败，在执行中引发错误或在安装期间被拒，则系统将舍弃新 Worker，但当前 Worker 仍处于活动状态。
安装成功后，更新的 Worker 将 wait，直到现有 Worker 控制零个客户端。（注意，在刷新期间客户端会重叠。）
+ self.skipWaiting() 可防止出现等待情况，这意味着 Service Worker 在安装完后立即激活。

假设我们已更改Service Worker脚本，在响应时使用马的图片而不是猫的图片：

```js
const expectedCaches = ['static-v2'];

self.addEventListener('install', event => {
  console.log('V2 installing…');

  // cache a horse SVG into a new cache, static-v2
  event.waitUntil(
    caches.open('static-v2').then(cache => cache.add('/horse.svg'))
  );
});

self.addEventListener('activate', event => {
  // delete any caches that aren't in expectedCaches
  // which will get rid of static-v1
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!expectedCaches.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('V2 now ready to handle fetches!');
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // serve the horse SVG from the cache if the request is
  // same-origin and the path is '/dog.svg'
  if (url.origin == location.origin && url.pathname == '/dog.svg') {
    event.respondWith(caches.match('/horse.svg'));
  }
});
```

运行后应还会看到一个猫的图像。原因是…

Install

请注意，缓存名称从 static-v1 更改为 static-v2。这意味着我可以设置新的缓存，而无需覆盖旧 Service Worker 仍在使用的当前缓存中的内容。

Waiting

成功安装 Service Worker 后，更新的 Service Worker 将延迟激活，直到现有 Service Worker 不再控制任何客户端。此状态称为“waiting”，这是浏览器确保每次只运行一个 Service Worker 版本的方式。

即使在实例中仅打开一个标签，刷新页面时也不会显示新版本。原因在于浏览器导航的工作原理。

要获取更新，需要关闭或退出使用当前 Service Worker 的所有标签。

Activate

旧 Service Worker 退出时将触发 Activate，新 Service Worker 将能够控制客户端。此时，您可以执行在仍使用旧 Worker 时无法执行的操作，如迁移数据库和清除缓存。

activate 事件中，可以删除所有其他缓存，例如上面的例子，从而也移除了旧的 static-v1 缓存。

如果将一个 promise 传递到 event.waitUntil()，它将缓冲功能事件（fetch、push、sync 等），直到 promise 进行解析。因此，当 fetch 事件触发时，激活已全部完成。

跳过等待阶段

等待阶段表示您每次只能运行一个网站版本，但如果您不需要该功能，您可以通过调用 self.skipWaiting() 尽快将新 Service Worker 激活。这不能让您的 Worker 跳过安装，只是跳过等待阶段。

skipWaiting() 在等待期间调用还是在之前调用并没有什么不同。一般情况下是在 install 事件中调用它：

```js
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    // caching etc
  );
});
```

手动更新

如前所述，在执行导航和功能事件后，浏览器将自动检查更新，但是您也可以手动触发更新：

```js
navigator.serviceWorker.register('/sw.js').then(reg => {
  // sometime later…
  reg.update();
});
```

如果您期望用户可以长时间使用您的网站而不必重新加载，您需要按一定间隔（如每小时）调用 update()。

避免更改 Service Worker 脚本的网址

### 让开发更简单

Update on reload

这可使生命周期变得对开发者友好。每次浏览时都将：

+ 重新提取 Service Worker。
+ 即使字节完全相同，也将其作为新版本安装，这表示运行 install 事件并更新缓存。
+ 跳过等待阶段，以激活新 Service Worker。
+ 浏览页面。这意味着每次浏览时（包括刷新）都将进行更新，无需重新加载两次或关闭标签。

Skip waiting

## Service Worker 注册

一般情况下，延迟 Service Worker 注册直至初始页面完成加载可为用户（特别是网络连接较慢的移动设备用户）提供最佳体验。

### 用户的首次访问

我们考虑一下用户首次访问网页应用。 此时还没有服务工作线程，浏览器无法提前知道最终是否会安装一个服务工作线程。作为开发者，首要任务应该是确保浏览器快速获取显示交互页面所需的最低限度的关键资源集。 拖慢检索这些响应速度的任何资源都不利于实现快速的交互体验。

在后台启动一个新的 Service Worker 下载和缓存资源，违背了为用户首次访问网站提供最快交互体验的目标。

### 改进样板文件

解决方案是通过选择调用 navigator.serviceWorker.register() 的时间来控制 Service Worker 的启动，直到 load event 在 window 上触发。

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

但是启动服务工作线程注册的适当时间还取决于网络应用在加载后将做什么。比如在过渡到主屏幕前先显示一个简短的动画，在显示动画期间启动服务工作线程注册可能会导致低端移动设备出现卡顿。

### 后续访问

延迟 Service Worker 注册对重复访问网站应该不会有任何影响。

### 尽早注册的原因

是否存在最好尽快注册 Service Worker 的任何场景？ 我想到一个这样的场景，当 Service Worker 在首次访问期间使用 clients.claim() 控制页面时，Service Worker积极执行其 fetch 处理程序内部的运行时缓存。 在此情况下，最好是尽快激活 Service Worker，以设法使用稍后可能会用到的资源填充其运行时缓存。

## 高性能 Service Worker 加载

### 首先了解什么是导航请求

在 Fetch 规范中，将导航请求简洁地定义为：导航请求是目的地为“document”的请求。通俗地说，每当在浏览器的地址栏中输入网址、与 window.location 交互，或者从一个网页访问指向另一网页的链接时，就会执行导航请求。在页面上放置 `<iframe>` 也会产生针对 `<iframe>` 的 src 的导航请求。在浏览器会话中，针对单页面应用的初始请求仍为导航。

传统的缓存最佳做法依赖于 HTTP Cache-Control 标头而非 Service Worker，并且要求每次导航都访问网络，以确保所有子资源网址均为最新。 提高网页性能的诀窍在于获得积极缓存子资源的所有裨益，而不需要执行依赖于网络的导航请求。 现在利用根据您网站的特定架构定制且配置正确的 Service Worker，可以实现这个目标。

## 缓存策略

[缓存策略](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/)
