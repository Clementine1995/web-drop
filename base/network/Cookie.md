# 有关Cookie

>[把cookie聊清楚](https://juejin.im/post/59d1f59bf265da06700b0934)
>
>[傻傻分不清之 Cookie、Session、Token、JWT](https://juejin.im/post/5e055d9ef265da33997a42cc)
>
>[预测最近面试会考 Cookie 的 SameSite 属性](https://juejin.im/post/5e718ecc6fb9a07cda098c2d)

## 什么是Cookie

cookie 是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。因为 HTTP 是无状态，所以它才出现。

Cookie具有一些很重要的属性，同时它不可跨域携带，但是一级域名和二级域名之间是允许共享使用的（靠的是 domain）。

## Cookie的重要属性

+ name：cookie的名字，一个域名下绑定的cookie，name不能相同，相同的name的值会被覆盖掉
+ value：每个cookie拥有的一个属性，它表示cookie的值，必须是字符串类型，并且应该被编码
+ siez：cookie的大小，一般不超过 4KB
+ domain：代表的是cookie绑定的域名，如果没有设置，就会自动绑定到执行语句的当前域，想要在 a.test.com 域名下设置cookie,并且在 b.test.com 是可以使用的，需要把domain设置为 .test.com
+ path：指定 cookie 在哪个路径（路由）下生效，默认是 '/'。如果设置为 /abc，则只有 /abc 下的路由可以访问到该 cookie，如：/abc/read。
+ Expires/Max-Age：一般浏览器的cookie都是默认储存的，其值也就是Session，关闭浏览器时cookie别删除，Expires用于设置 Cookie 的过期时间，而Max-Age逐渐替代了Expires，Max-Age，是以秒为单位的，如果为整数，则该 cookie 在 maxAge 秒后失效。如果为负数，该 cookie 为临时 cookie ，关闭浏览器即失效，浏览器也不会以任何形式保存该 cookie 。如果为 0，表示删除该 cookie 。默认为 -1。并且Max-age优先级高于Expires
+ secure：当这个属性设置为true时，此cookie只会在https和ssl等安全协议下传输。
+ httpOnly：如果给某个 cookie 设置了 httpOnly 属性，则无法通过 JS 脚本 读取到该 cookie 的信息，但还是能通过 Application 中手动修改 cookie，所以只是在一定程度上可以防止 XSS 攻击，不是绝对的安全
+ sameSite：SameSite 属性可以让 Cookie 在跨站请求时不会被发送，从而可以阻止跨站请求伪造攻击

### SameSite

SameSite 可以有下面三种值：

+ Strict 仅允许一方请求携带 Cookie，即浏览器将只发送相同站点请求的 Cookie，即当前网页 URL 与请求目标 URL 完全一致。
+ Lax 允许部分第三方请求携带 Cookie
+ None 无论是否跨站都会发送 Cookie

之前默认是 None 的，Chrome80 后默认是 Lax。

|请求类型|实例|以前|Strict|Lax|None|
|-|-|-|-|-|-|
|链接|`<a href='...'></a>`|发送cookie|不发送|发送cookie|发送cookie|
|预加载|`<link rel="prerender" href="..." />`|发送cookie|不发送|发送cookie|发送cookie|
|get表单|`<form method="GET" action="...">`|发送cookie|不发送|发送cookie|发送cookie|
|post表单|`<form method="POST" action="...">`|发送cookie|不发送|不发送|不发送|
|iframe|`<iframe src="...">`|发送cookie|不发送|不发送|不发送|
|Ajax|`$.get('...')`|发送cookie|不发送|不发送|不发送|
|Image|`<img src="...">`|发送cookie|不发送|不发送|不发送|

iframe的影响应该是最大的

#### 解决办法

如果想要发送cookie的话，就是设置 SameSite 为 none。不过注意HTTP 接口不支持 SameSite=none，需要 UA 检测，部分浏览器不能加 SameSite=none。

#### 补充跨域和跨站

同站(same-site)/跨站(cross-site)」和第一方(first-party)/第三方(third-party)是等价的。但是与浏览器同源策略（SOP）中的「同源(same-origin)/跨域(cross-origin)」是完全不同的概念。

同源策略的同源是指两个 URL 的协议/主机名/端口一致。

相对而言，Cookie中的「同站」判断就比较宽松：只要两个 URL 的 eTLD+1 相同即可，不需要考虑协议和端口。其中，eTLD 表示有效顶级域名，注册于 Mozilla 维护的公共后缀列表（Public Suffix List）中，例如，.com、.co.uk、.github.io 等。eTLD+1 则表示，有效顶级域名+二级域名，举几个例子（这里只是在同站跨站的角度），www.taobao.com 和 www.baidu.com 是跨站，www.a.taobao.com 和 www.b.taobao.com 是同站，a.github.io 和 b.github.io 是跨站(注意是跨站)。

## 关于操作cookie

前端可以通过JS去操作

```js
//读取浏览器中的cookie
console.log(document.cookie);
//写入cookie
document.cookie='myname=laihuamin;path=/;domain=.baidu.com';
```

而服务端主要通过 setCookie 来设置

注意有关Session的一点：由于关闭浏览器不会导致 session 被删除，迫使服务器为 session 设置了一个失效时间，当距离客户端上一次使用 session 的时间超过这个失效时间时，服务器就认为客户端已经停止了活动，才会把 session 删除以节省存储空间。
