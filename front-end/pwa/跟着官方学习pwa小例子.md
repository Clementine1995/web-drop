# 你的第一个渐进式Web应用程序

>官方例子的地址[weather pwa](https://github.com/googlecodelabs/your-first-pwapp.git)

## 添加一个web app的 manifest

创建Web应用程序 manifest

通过使用 manifest web应用可以获得：

+ 告诉浏览器您希望应用程序在独立窗口中打开（display）。
+ 定义首次启动应用时打开的页面（start_url）。
+ 在Dock或app启动器（short_name，icons）上定义应用程序的外观。
+ 创建一个启动画面（name，icons，colors）。
+ 告诉浏览器以横向或纵向模式打开窗口（orientation）。
+ 还有[更多](https://developer.mozilla.org/en-US/docs/Web/Manifest#Members)。

添加指向Web应用程序 manifest 的链接

在 public/index.html 的 head 中添加 link 来引入它

```html
<!-- CODELAB: Add link rel manifest -->
<link rel="manifest" href="/manifest.json">
```

有了它之后可以在chrome控制台 Application 选项卡中的 Manifest 中看到我们的配置。

添加 IOS meta标签以及 图标

iOS上的Safari不支持Web应用程序 manifest（目前是这样），因此我们需要添加 meta 标签到index.html文件的<head>中。

```html
<!-- CODELAB: Add iOS meta tags and icons -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Weather PWA">
<link rel="apple-touch-icon" href="/images/icons/icon-152x152.png">
```

设置元描述

根据SEO审核，lighthouse 注意到我们的文件没有元描述。描述可以显示在Google的搜索结果中。高质量，独特的描述可以使您的搜索结果与搜索用户更相关，并可以增加搜索流量。

```html
<!-- CODELAB: Add description here -->
<meta name="description" content="A sample weather app">
```

设置地址栏主题颜色

根据 PWA 审核，lighthouse 注意到我们的没有设置地址栏主题颜色。将浏览器的地址栏设置为与您品牌的颜色相匹配，可以提供更加身临其境的用户体验。

```html
<!-- CODELAB: Add meta theme-color -->
<meta name="theme-color" content="#2F3BA2" />
```

## 提供一个基础的离线体验

### 求助 Service worker

#### 注册 Service Worker

第一步是注册 Service Worker 。将以下代码添加到 index.html 文件中:

```js
// CODELAB: Register service worker.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => {
          console.log('Service worker registered.', reg);
        });
  });
}
```

此代码检查 Service Worker API 是否可用，如果是，则在页面加载完毕时注册 /service-worker.js 的 Service Worker。

Precache 离线页面

我们需要告诉 Service Worker 缓存什么，可以创建了一个简单的离线页面 （ public/offline.html ），只要没有网络连接，就会显示它。

在 service-worker.js 中，将 '/offline.html', 添加到 FILES_TO_CACHE 数组中，最终结果应如下所示:

```js
// CODELAB: Update cache names any time any of the cached files change.
const FILES_TO_CACHE = [
  '/offline.html',
];
```

接下来，需要修改 install 事件以告知 Service Worker 预先缓存离线页面:

```js
// CODELAB: Precache static resources here.
evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
);
```

清理旧的离线页面

使用 activate 事件来清理缓存中的任何旧数据。此代码可确保你的 Service Worker 在任何应用外壳文件发生更改时更新其缓存。为了使其工作，需要在 Service Worker 文件的顶部增加 CACHE_NAME 变量。

将以下代码添加到 activate 事件中:

```js
// CODELAB: Remove previous cached data from disk.
evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
);
```

install 事件以 self.skipWaiting() 结束， activate 事件以 self.clients.claim() 结束，更新后的 Service Worker 会立即获得控制权。

处理失败的网络请求

最后，我们需要处理 fetch 事件。我们将使用 "网络优先，回退到缓存" 的策略 。 Service Worker 将首先尝试从网络获取资源，如果失败，它将从缓存中返回离线页面。

```js
// CODELAB: Add fetch event handler here.
if (evt.request.mode !== 'navigate') {
  // Not a page navigation, bail.
  return;
}
evt.respondWith(
  fetch(evt.request)
    .catch(() => {
      return caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.match('offline.html');
        });
    })
);
```

fetch 处理程序只需要处理页面导航，其它请求会被该处理程序忽略，交由浏览器进行常规处理。但是，如果该请求的 .mode 是 navigate ，就会尝试用 fetch 从网络获取项目。如果失败，则 catch 处理程序就会用 caches.open(CACHE_NAME) 打开缓存，并使用 cache.match('offline.html') 来获得预缓存的离线页面。然后使用 evt.respondWith() 将结果传回浏览器。

>把 fetch 调用包装在 evt.respondWith() 中会阻止浏览器的默认处理，并告诉浏览器我们要自己处理该响应。如果你没有在 fetch 处理程序中调用 evt.respondWith() ，你只会获得默认的网络行为。

## 提供完整的离线体验

### Service Worker 生命周期

#### install 事件

Service Worker 获得的第一个事件是 install 。它会在 Service Worker 执行时立即触发，并且每个 Service Worker 只会调用一次。如果你更改了 Service Worker 脚本，浏览器就会将其视为另一个 Service Worker，并且它将获得自己的 install 事件。

通常， install 事件用于缓存应用运行时所需的全部内容。

#### activate 事件

Service Worker 每次启动时都会收到 activate 事件。 activate 事件的主要目的是配置 Service Worker 的行为，清除以前运行中遗留的任何资源（例如旧缓存），并让 Service Worker 准备好处理网络请求（例如下面要讲的 fetch 事件）。

#### fetch 事件

fetch 事件允许 Service Worker 拦截并处理任何网络请求。它可以通过网络获取资源、可以从自己的缓存中提取资源、生成自定义响应，以及很多种不同的选择。查看离线宝典了解你可以使用的不同策略。

#### 更新 Service Worker

浏览器会检查每个页面加载时是否有新版本的 Service Worker 。如果找到新版本，则会下载这个新版本并在后台安装，但不会激活它。它会处于等待状态，直到不再打开任何使用旧 Service Worker 的页面

#### 选择正确的缓存策略

选择正确的缓存策略取决于你尝试缓存的资源类型以及以后可能需要的资源。对于这个天气应用，需要缓存的资源可以分为两类: 需要预先缓存的资源以及将在运行时缓存的数据。

缓存静态资源

预先缓存资源与用户安装桌面或移动应用时的情况类似。应用运行所需的关键资源已安装或缓存在设备上，以后无论是否有网络连接都可以加载它们。

对于这个应用，我们将在安装 Service Worker 时预先缓存所有静态资源，以便把我们运行应用所需的一切都存储在用户的设备上。为了确保我们的应用快速加载，我们将使用缓存优先策略：不去网络获取资源，而是从本地缓存中取出；只有当缓存不可用时，我们才会尝试从网络中获取它。

从本地缓存中取可消除任何网络方面的变数。无论用户使用何种网络（WiFi，5G，3G 甚至 2G），我们需要运行的关键资源都几乎可以立即使用。

缓存应用数据

stale-while-revalidate strategy 对某些类型的数据是理想的，比如本应用。它会尽可能快地获取屏幕上要显示的数据，然后在网络返回最新数据后进行更新。 Stale-while-revalidate 意味着我们需要发起两个异步请求，一个到缓存，一个到网络。

在正常情况下，缓存数据几乎会立即返回，为应用提供可以使用的最新数据。然后，当网络请求返回时，将使用来自网络的最新数据更新应用。

对于我们的应用，这提供了比 "网络优先，回退到缓存" 策略更好的体验，因为用户不必等到网络请求超时后才在屏幕上看到某些内容。他们最初可能会看到较旧的数据，但一旦网络请求返回，应用就将使用最新数据进行更新。

更新应用逻辑

如前所述，应用需要启动两个异步请求，一个到缓存，一个到网络。该应用使用 window 上的 caches 对象来访问缓存并获取最新数据。这是渐进增强的一个很好的例子，因为 caches 对象可能并非在所有浏览器中都可用，如果不可用，网络请求仍然可以工作。

更新 getForecastFromCache() 函数，检查 caches 对象是否在全局 window 对象中可用，如果是，请从缓存中请求数据。

public/scripts/app.js

```js
// CODELAB: Add code to get weather forecast from the caches object.
if (!('caches' in window)) {
  return null;
}
const url = `${window.location.origin}/forecast/${coords}`;
return caches.match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch((err) => {
      console.error('Error getting data from cache', err);
      return null;
    });
```

然后，我们需要修改 updateData()以便它进行两次调用，一次调用 getForecastFromNetwork() 以从网络获取天气预报，并发起另一次 getForecastFromCache() 以获取缓存的最新天气预报:

public/scripts/app.js

```js
// CODELAB: Add code to call getForecastFromCache.
getForecastFromCache(location.geo)
    .then((forecast) => {
      renderForecast(card, forecast);
    });
```

我们的天气应用现在发出两个异步数据请求，一个来自缓存，另一个来自 fetch 。如果缓存中有数据，它将被非常快速地返回和渲染（几十毫秒）。然后，当 fetch 响应时，将使用直接来自天气 API 的最新数据更新卡片。

请注意缓存请求和 fetch 请求如何结束于更新天气预报卡片的调用。应用要如何知道它是否显示了最新的数据？这在 renderForecast() 的如下代码中处理:

```js
// If the data on the element is newer, skip the update.
if (lastUpdated >= data.currently.time) {
  return;
}
```

每次更新卡片时，应用都会将数据的时间戳存储在卡片上的隐藏属性中。如果卡片上已存在的时间戳比传递给函数的数据新，应用就什么也不做。

#### 预先缓存我们的应用资源

在 Service Worker 中，让我们添加一个 DATA_CACHE_NAME 以便我们可以将应用数据与应用外壳分开。更新应用外壳并清除旧缓存后，我们的数据将保持不变，仍用于超快速加载。请记住，如果你的数据格式将来发生了变化，你就需要一种方法来处理这种情况，并确保应用外壳和内容保持同步。

```js
//public/service-worker.js
// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';
```

别忘了也要同时更新 CACHE_NAME，我们还将更改所有的静态资源。

为了让本应用离线工作，我们需要预先缓存它所需的所有资源。这也有助于提升性能。该应用无需从网络获取所有资源，而是可以从本地缓存加载所有资源，从而消除任何网络不稳定性。

把 FILES_TO_CACHE 数组改为如下文件列表:

```js
public/service-worker.js
// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/install.js',
  '/scripts/luxon-1.11.4.js',
  '/styles/inline.css',
  '/images/add.svg',
  '/images/clear-day.svg',
  '/images/clear-night.svg',
  '/images/cloudy.svg',
  '/images/fog.svg',
  '/images/hail.svg',
  '/images/install.svg',
  '/images/partly-cloudy-day.svg',
  '/images/partly-cloudy-night.svg',
  '/images/rain.svg',
  '/images/refresh.svg',
  '/images/sleet.svg',
  '/images/snow.svg',
  '/images/thunderstorm.svg',
  '/images/tornado.svg',
  '/images/wind.svg',
];
```

由于我们在手动生成要缓存的文件列表，因此每当更新文件时也必须更新 CACHE_NAME。我们可以从缓存文件列表中删除 offline.html，因为本应用现在具有离线工作所需的所有必要资源，不会再显示离线页面。

#### 更新 activate 事件处理程序

为了防止我们 activate 事件不小心删除数据，在 service-worker.js 的 activate 事件，把 if (key !== CACHE_NAME) { 改为:

```js
public / service-worker.js
if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {}
```

#### 更新 fetch 事件处理程序

我们需要修改 Service Worker 以拦截对 weather API 的请求并将其响应存储在缓存中，以便我们以后可以轻松地访问它们。在 stale-while-revalidate 策略中，我们希望把网络响应作为“真相之源”，始终由它向我们提供最新信息。如果不能，也可以失败，因为我们已经在应用中检索到了最新的缓存数据。

更新 fetch 事件处理程序以便和其它对数据 API 的请求分开。

```js
// CODELAB: Add fetch event handler here.
if (evt.request.url.includes('/forecast/')) {
  console.log('[Service Worker] Fetch (data)', evt.request.url);
  evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            }).catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
      }));
  return;
}
evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request)
          .then((response) => {
            return response || fetch(evt.request);
          });
    })
);
```

该代码拦截请求并检查它是否用于天气预报。如果是，请使用 fetch 发出请求。一旦返回了响应，就打开缓存，克隆响应，将其存储在缓存中，然后将响应返回给原始请求者。

我们需要删除 evt.request.mode !== 'navigate' 检查，因为我们希望这个 Service Worker 处理所有请求（包括图像，脚本，CSS 文件等），而不仅仅是导航。如果我们留着这个检查，则只会从 Service Worker 缓存中提供 HTML，其它所有内容都将从网络请求。

## 添加安装体验

安装渐进式 Web 应用后，其外观和行为会与所有其它已安装的应用类似。它与其它应用启动时的位置相同。它在没有地址栏或其它浏览器 UI 的应用中运行。与所有其它已安装的应用一样，它是任务切换器中的顶级应用。

### 将 install.js 添加到 index.html

public/index.html

```html
<!-- CODELAB: Add the install script here -->
<script src="/scripts/install.js"></script>
```

### 监听 beforeinstallprompt 事件

如果符合添加到主屏幕条件 ，Chrome 将触发 beforeinstallprompt 事件，你可以使用该事件指示你的应用可以“安装”，然后提示用户安装它。添加如下代码以监听 beforeinstallprompt 事件:

public/scripts/install.js

```js
// CODELAB: Add event listener for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);
```

### 保存事件并显示安装按钮

在我们的 saveBeforeInstallPromptEvent 函数中，我们将保存对 beforeinstallprompt 事件的引用，以便我们稍后可以调用它的 prompt() ，并修改我们的 UI 以显示安装按钮。

public/scripts/install.js

```js
// CODELAB: Add code to save event & show the install button.
deferredInstallPrompt = evt;
installButton.removeAttribute('hidden');
```

### 显示 "提示/隐藏" 按钮

当用户单击安装按钮时，我们需要调用保存的 beforeinstallprompt 事件的 .prompt() 函数。我们还需要隐藏安装按钮，因为 .prompt() 只能在每个保存的事件上调用一次。

public/scripts/install.js

```js
// CODELAB: Add code show install prompt & hide the install button.
deferredInstallPrompt.prompt();
// Hide the install button, it can't be called twice.
evt.srcElement.setAttribute('hidden', true);
```

调用 .prompt() 将向用户显示模态对话框，请他们将你的应用添加到主屏幕。

### 记录结果

你可以通过监听所保存的 beforeinstallprompt 事件的 userChoice 属性返回的 Promise 来检查用户是如何响应的安装对话框。在显示出提示并且用户已对其作出响应后，Promise 将返回一个具有 outcome 属性的对象。

public/scripts/install.js

```js
// CODELAB: Log user response to prompt.
deferredInstallPrompt.userChoice
    .then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt', choice);
      } else {
        console.log('User dismissed the A2HS prompt', choice);
      }
      deferredInstallPrompt = null;
    });
```

对 userChoice 的一个说明， 规范中把它定义成了属性 ，而不是你所期望的函数。

### 记录所有安装事件

除了你所添加的用于安装应用的任何 UI 之外，用户还可以通过其它方法安装 PWA，例如 Chrome 的 "三点菜单"。要跟踪这些事件，请监听 appinstalled 事件。

public/scripts/install.js

```js
// CODELAB: Add event listener for appinstalled event
window.addEventListener('appinstalled', logAppInstalled);
```

然后，我们需要修改 logAppInstalled 函数，对于这个 codelab，我们只用了 console.log ，但在生产应用中，你可能希望将其作为事件记录在你的分析软件中。

public/scripts/install.js

```js
// CODELAB: Add code to log the event
console.log('Weather App was installed.', evt);
```

额外工作: 检测你的应用是否从主屏幕启动了

媒体查询 display-mode 可以根据应用的启动方式来应用样式，或者使用 JavaScript 来判定它是如何启动的。

```css
@media all and (display-mode: standalone) {
  body {
    background-color: yellow;
  }
}
```

你还可以在 JavaScript 中检测它是否运行在独立模式下来检查这个 display-mode 媒体查询 。
