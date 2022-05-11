# 浏览器与 Nodejs 中的 Event Loop

> 参考资料[hey，你的 Event Loop](https://juejin.im/post/5b63b4cb6fb9a04fb4017f5a)

## 浏览器中的 Event Loop

Javascript 是单线程的，也就是同时只能做一件事情，但是通过 Event Loop 完全可以模拟多线程。
我们都知道 js 中的代码分 同步 和 异步，所谓的 异步 其实就是不会阻塞我们的主线程，等待主线程的代码执行完毕才会执行。callback setTimeout setInterval Promise ... 这些都是都是我们耳熟能详的 `异步` 代码。

![image](https://user-gold-cdn.xitu.io/2018/8/7/165136b9cec6173e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

如图所示，js 中的内存分为 堆内存(heap) 和 栈内存(stack), 堆内存 中存的是我们声明的 object 类型的数据，栈内存 中存的是 基本数据类型 以及 函数执行时的运行空间。我们的 同步 代码就放在 执行栈 中，那异步代码呢？浏览器会将 dom 事件 ajax setTimeout 等异步代码放到队列中，等待执行栈中的代码都执行完毕，才会执行队列中的代码，是不是有点像发布订阅模式。

```js
console.log(1)
setTimeout(() => {
  console.log(2)
}, 0)
console.log(3)
```

复制代码根据之前说的，setTimeout 会被放到队列中，等待执行栈中的代码执行完毕才会执行，所以会输出 1, 3, 2

但是异步代码也是有区别的：

```js
console.log(1)

setTimeout(() => {
  console.log(2)
}, 0)

Promise.resolve().then(() => {
  console.log(3)
})
```

复制代码输出的永远是 1, 3, 2, 也就是说 promise 在 setTimeout 之前执行了。这是因为 异步任务 分为 微任务(microtask) 和 宏任务(task)，执行的顺序是 **执行栈中的代码 => 微任务 => 宏任务**

### 执行栈

- 执行栈中的代码永远最先执行

### 微任务(microtask): promise MutationObserver 等等

- 当执行栈中的代码执行完毕，会在执行宏任务队列之前先看看微任务队列中有没有任务，如果有会先将微任务队列中的任务清空才会去执行宏任务队列

### 宏任务(task): setTimeout setInterval setImmediate(IE 专用) messageChannel 等等

- 等待执行栈和微任务队列都执行完毕才会执行，并且在执行完每一个宏任务之后，会去看看微任务队列有没有新添加的任务，如果有，会先将微任务队列中的任务清空，才会继续执行下一个宏任务

```js
setTimeout(() => {
  console.log("timeout1")
  Promise.resolve().then(() => {
    console.log("promise1")
  })
  Promise.resolve().then(() => {
    console.log("promise2")
  })
}, 100)

setTimeout(() => {
  console.log("timeout2")
  Promise.resolve().then(() => {
    console.log("promise3")
  })
}, 200)
```

1. 先将两个 setTimeout 塞到宏任务队列中
2. 当第一个 setTimeout1 时间到了执行的时候，首先打印 timeout1，然后在微任务队列中塞入 promise1 和 promise2
3. 当第一个 setTimeout1 执行完毕后，会去微任务队列检查是不是空的，他发现了有两个 promise，会把两个 promise 按顺序执行完再去执行下一个宏任务
4. 两个 promise 执行完毕后会微任务队列中没有任务了，会去宏任务中执行下一个任务 setTimeout2
5. 当 setTimeout2 执行的时候，先打印一个 timeout2，然后又在微任务队列中塞了一个 promise2
6. 当 setTimeout2 执行完毕后会去微任务队列检查，发现有一个 promise3，会将 promise3 执行
7. 会依次打印 timeout1 promise1 promise2 timeout2 promise3

## Node 中的 Event Loop

> 参考资料：[libuv Node 文档](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

我们都知道 Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境，也就是能够让 js 在服务端运行。但是 Node 中的 Event Loop 是用 libuv 模拟的，它将不同的任务分配给不同的线程，形成一个 Event Loop，以异步的方式将任务的执行结果返回给 V8 引擎。

- Node 中的微任务：process.nextTric promise setImmediate...
- Node 中的宏任务：setTimeout setInterval...

![image](https://user-gold-cdn.xitu.io/2018/8/7/16513a7098f2101b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

- timers：执行 setTimeout() 和 setInterval()中到期的 callback。
- I/O callbacks：上一轮循环中有少数的 I/Ocallback 会被延迟到这一轮的这一阶段执行
- idle, prepare：仅内部使用
- poll：最为重要的阶段，执行 I/O callback，检查有没有 timers 到期 timer 在适当的条件下会阻塞在这个阶段
- check：执行 setImmediate 的 callback
- close callbacks：执行 close 事件的 callback，例如 socket.on("close",func)

Node 中的 Event Loop 会在每次切换队列的时候 清空微任务队列，也就会会将当前队列都执行完，在进入下一阶段的时候检查一下微任务中有没有任务

```js
setTimeout(() => {
  console.log("timeout1")
  Promise.resolve().then(() => {
    console.log("promise1")
  })
  Promise.resolve().then(() => {
    console.log("promise2")
  })
}, 0)

setTimeout(() => {
  console.log("timeout2")
  Promise.resolve().then(() => {
    console.log("promise3")
  })
}, 0)
```

- 先将两个 setTimeout 塞到宏任务队列中
- 当第一个 setTimeout1 时间到了执行的时候，首先打印 timeout1，然后在微任务队列中塞入 promise1 和 promise2
- 当第一个 setTimeout1 执行完毕后，继续执行下一个 setTimeout2
- 当 setTimeout2 执行的时候，先打印一个 timeout2，然后又在微任务队列中塞了一个 promise2
- 当前宏任务队列清空，进入下一阶段，去检查微任务队列中有没有任务
- 清空微任务队列
- 在 node 环境中执行 会依次打印 timeout1 timeout2 promise1 promise2 promise3

注意：nodejs 例子中，setTimeout 执行延迟时间是 0，是立即将两个宏任务推到队列中，所以先输出 timeout1 与 timeout2，如果换成延迟换成 100 与 200，执行结果与浏览器的一致。
