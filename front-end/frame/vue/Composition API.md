# Composition API

>官方RFC[Composition API RFC](https://composition-api.vuejs.org/)

## 额外的有关于vite原理

1. vite启动本地服务器，拦截请求的资源文件，并返回经过处理的文件
2. 向html中插入执行环境以及模块热更新相关代码
3. 浏览器请求热更新代码时，会返回client.js，这里面会启动一个socket服务，会接收dev server发送过来的指令，并响应
4. dev server端负责在各个阶段向客户端也就是浏览器发送指令，比如监听到某个文件变化，就解析编译相应文件，并向客户端发送 vue-reload 指令，同时也把编译后的代码发过去
