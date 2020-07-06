# XXS相关

>参考[前端安全系列（一）：如何防止XSS攻击？](https://juejin.im/post/5bad9140e51d450e935c6d64)

XSS是Crossing-Site Scripting（跨站脚本）简写，它是一种代码注入攻击，攻击者可以往 Web 页面里插入恶意代码，当其他用户浏览该网页的时候，嵌入web里面的代码会被执行，从而达到攻击者特殊目的。目的可以有多种，比如：破坏网站，导致页面不可用，攻击服务端，导致服务拒绝，窃取用户cookie，发送恶意请求，安装键盘记录器，窃取用户数据，跳转钓鱼页面，窃取账号密码等等。

XSS触发的条件包括：

1. 攻击者可以提交恶意数据
2. 数据没有被处理，直接展示到页面上（标签、标签属性、标签事件）
3. 其他用户可以访问该页面

## XXS的分类

反射型、存储型、Dom Based型

|类型|存储区|插入点|
|-|-|-|
|存储型 XSS|后端数据库|HTML|
|反射型 XSS|URL|HTML|
|DOM 型 XSS|后端数据库/前端存储/URL|前端 JavaScript|

+ 存储区：恶意代码存放的位置。
+ 插入点：由谁取得恶意代码，并插入到网页上

### 反射型

典型步骤

1. 攻击者构造出包含恶意代码的特殊的URL
2. 用户登陆后，访问带有恶意代码的URL
3. 服务端取出URL上的恶意代码，拼接在HTML中返回浏览器
4. 用户浏览器收到响应后解析执行混入其中的恶意代码
5.窃取敏感信息/冒充用户行为，完成XSS攻击

常见场景

通过 URL 传递参数的功能，如网站搜索、跳转等

区别/特点

1. 非持久型xss攻击，依赖于服务器对恶意请求的反射，仅对当次的页面访问产生影响
2. 恶意代码存在URL上
3. 经过后端，不经过数据库

### 存储型

典型步骤

1. 攻击者将恶意代码提交到目标网站的数据库中
2. 用户登陆后，访问相关页面URL
3. 服务端从数据库中取出恶意代码，拼接在HTML中返回浏览器
4. 用户浏览器收到响应后解析执行混入其中的恶意代码
5. 窃取敏感信息/冒充用户行为，完成XSS攻击

常见场景

带有用户保存数据的网站功能，比如论坛发帖、商品评价、用户私信等等。

区别/特点

1. 持久型xss，攻击者的数据会存储在服务端，攻击行为将伴随着攻击数据一直存在。
2. 恶意代码存在数据库
3. 经过后端，经过数据库

### DOM型

典型步骤

1. 前端 JavaScript 取出 URL中的恶意代码并执行
2. 窃取敏感信息/冒充用户行为，完成XSS攻击

常见场景

页面JS获取数据后不做甄别，直接操作DOM。一般见于从URL、cookie、LocalStorage中取内容的场景

区别/特点

1. 取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞

## 如何防御

### 针对反射和存储型XSS

存储型和反射型 XSS 都是在后端取出恶意代码后，插入到响应 HTML 里的，预防这种漏洞主要是关注后端的处理。

#### 后端设置白名单，净化数据

后端对于保存/输出的数据要进行过滤和转义，过滤的内容：比如location、onclick、onerror、onload、onmouseover 、  script 、href 、 eval、setTimeout、setInterval等，常见框架：bluemonday，jsoup等

```js
String unsafe =
  "<p><a href='http://example.com/' onclick='stealCookies()'>Link</a></p>";
String safe = Jsoup.clean(unsafe, Whitelist.basic());
// now: <p><a href="http://example.com/" >Link</a></p>
```

#### 避免拼接 HTML，采用纯前端渲染

浏览器先加载一个静态 HTML，后续通过 Ajax 加载业务数据，调用 DOM API 更新到页面上。纯前端渲染还需注意避免 DOM 型 XSS 漏洞

### 针对DOM型XSS

DOM 型 XSS 攻击，实际上就是网站前端 JavaScript 代码本身不够严谨，把不可信的数据当作代码执行了。

#### 谨慎对待展示数据

谨慎使用.innerHTML、.outerHTML、document.write() ，不要把不可信的数据作为 HTML 插到页面上。
DOM 中的内联事件监听器，如 location、onclick、onerror、onload、onmouseover 等，`<a>` 标签的 href 属性，JavaScript 的 eval()、setTimeout()、setInterval() 等，都能把字符串作为代码运行，很容易产生安全隐患，谨慎处理传递给这些 API的字符串。

#### 数据充分转义，过滤恶意代码

可以使用一些插件 xss.js，DOMPurify

|放置位置|例子|采取的编码|编码格式|
|-------|----|---------|-------|
|HTML标签之间|`<div> 不可信数据 </div>`|HTML Entity编码|& –> &amp; < –> &lt; > –> &gt; ” –> &quot; ‘ –> &#x27; / –> &#x2f;|
|HTML标签的属性|`<input type=”text”value=” 不可信数据 ” />`|HTML Attribute编码|&#xHH|
|JavaScript|`<script> var msg = ” 不可信数据 ” </script>`|JavaScript编码|\xHH|
|CSS|`<div style=” width: 不可信数据 ” > … </div>`|CSS编码|\HH|
|URL参数中|`<a href=”/page?p= 不可信数据 ” >…</a>`|URL编码|%HH|

编码规则：除了阿拉伯数字和字母，对其他所有的字符进行编码，只要该字符的ASCII码小于256。编码后输出的格式为以上编码格式 （以&#x、\x 、\、%开头，HH则是指该字符对应的十六进制数字）

#### 使用插值表达式

采用vue/react/angular等技术栈时，使用插值表达式，避免使用v-html。因为template转成render function的过程中，会把插值表达式作为Text文本内容进行渲染。在前端 render 阶段避免 innerHTML、outerHTML 的 XSS 隐患。

比如：

```html
<div class="a"><span>{{item}}</span></div>
```

最终生成的代码如下

```js
"with(this){return _c('div',{staticClass:"a"},[_c('span',[_v(_s(item))])])}"
```

_c 是 createElement 简写，即 render 函数，_v 是 createTextVNode 的简写，创建文本节点，_s 是 toString 简写

### 其他措施

+ 设置Cookie httpOnly

禁止 JavaScript 读取某些敏感 Cookie，攻击者完成 XSS 注入后也无法窃取此 Cookie

+ 设置CSP（Content Security Policy）

CSP 的实质就是设置浏览器白名单，告诉浏览器哪些外部资源可以加载和执行，自动禁止外部注入恶意脚本。

CSP可以通过两种方式来开启 ：

1.设置html的 meta 标签的方式

```html
  <meta http-equiv="Content-Security-Policy" content="script-src 'self' *.baidu.com ; style-src 'self' ;">
```

2.设置 HTTP Header 中的 Content-Security-Policy

```html
  Content-Security-Policy: script-src 'self' *.baidu.com ; style-src 'self' ;
```

上述代码描述的CSP规则是js脚本只能来自当前域名和baidu.com二级域名下，css只能来自当前域名

CSP可以限制加载资源的类型：

|key|含义|
|-|-|
|script-src|外部脚本|
|style-src|样式表|
|img-src|图像|
|media-src|媒体文件（音频和视频）|
|font-src|字体文件|
|object-src|插件（比如 Flash）|
|child-src|框架|
|frame-ancestors|嵌入的外部资源（比如`<frame>、<iframe>、<embed>和<applet>`）|
|connect-src|HTTP 连接（通过 XHR、WebSockets、EventSource等）worker-srcworker脚本|
|manifest-src|manifest 文件|
|default-src|用来设置上面各个选项的默认值|

同时也可设置资源的限制规则

|可选值|例子|
|-|-|
|主机名|example.org，`https://example.com:443`|
|路径名|example.org/resources/js/|
|通配符|*.example.org，*://*.example.com:*（表示任意协议、任意子域名、任意端口）|
|协议名|https:、data:|
|'self'|当前域名，需要加引号|
|'none'|禁止加载任何外部资源，需要加引号|
|'unsafe-inline'|允许执行页面内嵌的`<script>`标签和事件监听函数|
|'unsafe-eval'|允许将字符串当作代码执行，比如使用eval、setTimeout、setInterval和Function等函数|

严格的 CSP 在 XSS 的防范中可以起到以下的作用：

+ 禁止加载外域代码，防止复杂的攻击逻辑
+ 禁止外域提交，网站被攻击后，用户的数据不会泄露到外域
+ 禁止内联脚本执行
+ 禁止未授权的脚本执行

+ 输入内容长度、类型的控制

对于不受信任的输入，都应该限定一个合理的长度，并且对输入内容的合法性进行校验（例如输入email的文本框只允许输入格式正确的email，输入手机号码的文本框只允许填入数字且格式需要正确）。虽然无法完全防止 XSS 发生，但可以增加 XSS 攻击的难度。

+ 验证码，防止脚本冒充用户提交危险操作

## 如何检测

+ 使用通用 XSS 攻击字符串手动检测 XSS 漏洞

引用自[Unleashing an Ultimate XSS Polyglot](https://github.com/0xsobky/HackVault/wiki/Unleashing-an-Ultimate-XSS-Polyglot)，只要在网站的各输入框中提交这个字符串，或者把它拼接到 URL 参数上，就可以进行检测了。

```js
jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
```

+ 使用扫描工具自动检测 XSS 漏洞（BeEF、w3af 、 noXss等）
