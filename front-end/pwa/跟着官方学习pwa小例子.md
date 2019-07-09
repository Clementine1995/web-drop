# 你的第一个渐进式Web应用程序

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
