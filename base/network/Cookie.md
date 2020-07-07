# 有关Cookie

>[把cookie聊清楚](https://juejin.im/post/59d1f59bf265da06700b0934)
>
>[傻傻分不清之 Cookie、Session、Token、JWT](https://juejin.im/post/5e055d9ef265da33997a42cc)

## 什么是Cookie

cookie 是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。因为 HTTP 是无状态，所以它才出现。

Cookie具有一些很重要的属性，同时它不可跨域携带，但是一级域名和二级域名之间是允许共享使用的（靠的是 domain）。

## Cookie的重要属性

+ name：cookie的名字，一个域名下绑定的cookie，name不能相同，相同的name的值会被覆盖掉
+ value：每个cookie拥有的一个属性，它表示cookie的值，必须是字符串类型，并且应该被编码
+ domain：代表的是cookie绑定的域名，如果没有设置，就会自动绑定到执行语句的当前域，想要在 a.test.com 域名下设置cookie,并且在 b.test.com 是可以使用的，需要把domain设置为 test.com
+ path：指定 cookie 在哪个路径（路由）下生效，默认是 '/'。如果设置为 /abc，则只有 /abc 下的路由可以访问到该 cookie，如：/abc/read。
+ Expires/Max-Age：一般浏览器的cookie都是默认储存的，其值也就是Session，关闭浏览器时cookie别删除，而Max-Age逐渐替代了Expires，Max-Age，是以秒为单位的，如果为整数，则该 cookie 在 maxAge 秒后失效。如果为负数，该 cookie 为临时 cookie ，关闭浏览器即失效，浏览器也不会以任何形式保存该 cookie 。如果为 0，表示删除该 cookie 。默认为 -1。
+ secure：当这个属性设置为true时，此cookie只会在https和ssl等安全协议下传输。
+ httpOnly：如果给某个 cookie 设置了 httpOnly 属性，则无法通过 JS 脚本 读取到该 cookie 的信息，但还是能通过 Application 中手动修改 cookie，所以只是在一定程度上可以防止 XSS 攻击，不是绝对的安全

## 关于操作cookie

前端可以通过JS去操作

```js
//读取浏览器中的cookie
console.log(document.cookie);
//写入cookie
document.cookie='myname=laihuamin;path=/;domain=.baidu.com';
```

而服务端主要通过 setCookie 来设置
