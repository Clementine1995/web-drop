# 有关CSRF

>参考[前端安全系列之二：如何防止CSRF攻击？](https://juejin.im/post/5bc009996fb9a05d0a055192)
>
>[浅说 XSS 和 CSRF](https://github.com/dwqs/blog/issues/68)

## 什么是CSRF

CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

### 典型步骤

1. 受害者登录a.com，并保留了登录凭证（Cookie）。
2. 攻击者引诱受害者访问了b.com。
3. b.com 向 a.com 发送了一个请求：a.com/act=xx。浏览器会默认携带a.com的Cookie。
4. a.com接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求。
5. a.com以受害者的名义执行了act=xx。
6. 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让a.com执行了自己定义的操作。

## CSRF分类

### GET类型的CSRF

GET类型的CSRF利用非常简单，只需要一个HTTP请求，一般会这样利用：

```html
<img src="http://bank.example/withdraw?amount=10000&for=hacker" >
```

一旦访问了含有这个图片的页面后，浏览器就会自动向该地址发起一次 HTTP 请求，而该网站也会收到包含登录者登陆信息的一次跨域请求

### POST类型的CSRF

这种类型的CSRF利用起来通常使用的是一个自动提交的表单，一旦访问该页面后，表单会自动提交，相当于模拟用户完成了一次POST操作。

### 链接类型的CSRF

链接类型的CSRF并不常见，比起其他两种用户打开页面就中招的情况，这种需要用户点击链接才会触发。这种类型通常是在论坛中发布的图片中嵌入恶意链接，或者以广告的形式诱导用户中招，攻击者通常会以比较夸张的词语诱骗用户点击

```html
<a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">重磅消息！！<a/>
```

## CSRF的特点

+ 攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生。
+ 攻击利用受害者在被攻击网站的登录凭证，冒充受害者提交操作；而不是直接窃取数据。
+ 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是“冒用”。
+ 跨站请求可以用各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪。

CSRF通常是跨域的，因为外域通常更容易被攻击者掌控。但是如果本域下有容易被利用的功能，比如可以发图和链接的论坛和评论区，攻击可以直接在本域下进行，而且这种攻击更加危险

## 防护策略

针对CSRF的特点，通常发生在第三方域名，并且不能主动获取Cookie等信息只是使用，可以制定相应的策略

+ 阻止不明外域的访问
  + 同源检测
  + Samesite Cookie
+ 提交时要求附加本域才能获取的信息
  + CSRF Token
  + 双重Cookie验证

### 同源检测

可以通过 Origin Header 或者 Referer Header 来标记来源域名，这两个Header在浏览器发起请求时，大多数情况会自动带上，并且不能由前端自定义内容。

#### 使用Origin Header确定来源域名

在部分与CSRF有关的请求中，请求的Header中会携带Origin字段。字段内包含请求的域名，如果它存在，可以直接利用它来确认来源域名，但是以下两种情况它不存在

+ 302重定向
+ IE11同源策略

#### 使用Referer Header确定来源域名

HTTP头中有一个字段叫Referer，记录了该HTTP请求的来源地址。 对于Ajax请求，图片和script等资源请求，Referer为发起请求的页面地址。对于页面跳转，Referer为打开页面历史记录的前一个页面地址。

Referer的值是由浏览器提供，每个浏览器对于Referer的具体实现可能有差别，并且在部分情况下，攻击者可以隐藏，甚至修改自己请求的Referer。

新版的Referrer Policy规定了五种Referer策略：No Referrer、No Referrer When Downgrade、Origin Only、Origin When Cross-origin、和 Unsafe URL。

|策略名称|属性值（新）|属性值（旧）|
|-|-|-|
|No Referrer|no-Referrer|never|
|No Referrer When Downgrade|no-Referrer-when-downgrade|default|
|Origin Only|(same or strict) origin|origin|
|Origin When Cross Origin|(strict) origin-when-crossorigin|-|
|Unsafe URL|unsafe-url|always|

设置Referrer Policy的方法有三种：

1. 在CSP设置
2. 页面头部增加meta标签
3. a标签增加referrerpolicy属性

但是攻击者还是可以在自己的请求中隐藏 Referer ，另外下面的几种情况Referer没有或者不可信：

1. IE6、7下使用window.location.href=url进行界面的跳转，会丢失Referer。
2. IE6、7下使用window.open，也会缺失Referer。
3. HTTPS页面跳转到HTTP页面，所有浏览器Referer都丢失。
4. 点击Flash上到达另外一个网站的时候，Referer的情况就比较杂乱，不太可信。

#### 无法确认来源域名情况

如果Origin和Referer都不存在，建议直接进行阻止

#### 如何阻止外域请求

请求域名是否是来自不可信的域名，直接阻止掉这些的请求，有时也不能达到效果，当一个请求是页面请求（比如网站的主页），而来源是搜索引擎的链接（例如百度的搜索结果），也会被当成疑似CSRF攻击。所以在判断的时候需要过滤掉页面请求情况，类似这样：

```shell
Accept: text/html
Method: GET
```

相应的，页面请求就暴露在了CSRF的攻击范围之中。如果你的网站中，在页面的GET请求中对当前用户做了什么操作的话，防范就失效了。

综上所述：同源验证是一个相对简单的防范方法，能够防范绝大多数的CSRF攻击。但这并不是万无一失的，对于安全性要求较高，或者有较多用户输入内容的网站，我们就要对关键的接口做额外的防护措施。

### CSRF Token

CSRF攻击之所以能够成功，是因为服务器误把攻击者发送的请求当成了用户自己的请求。那么可以要求所有的用户请求都携带一个CSRF攻击者无法获取到的Token。服务器通过校验请求是否携带正确的Token，来把正常的请求和攻击的请求区分开，也可以防范CSRF的攻击。

#### CSRF Token的防护策略步骤

1. 将CSRF Token输出到页面中，在用户打开页面时，服务端生成token并返回，然后由前端保存（不能放在Cookie里了）
2. 页面提交的请求携带这个Token，每次请求时都需要带着这个token，或放在参数里，或放在请求头中
3. 服务器验证Token是否正确

### 分布式校验

### 双重Cookie验证

### Samesite Cookie属性
