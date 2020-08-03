# 手写 Promise 原理实现

>参考[手写Promise核心原理，再也不怕面试官问我Promise原理](https://juejin.im/post/6856213486633304078)

## 第一种实现

1. 定义整体结构
  1.1 先写出构造函数
  1.2 添加Promise原型对象上的方法
  1.3 添加Promise函数对象上的方法
2. 实现Promise构造函数
  2.1 构造函数里有resolve和reject
  2.2 定义Promise的 状态以及 data
  2.3 保存 then 方法调用时的回调函数 callbacks
  2.4 then函数在 promise 为 pending 时收集回调
  2.5 resolve 函数执行callbacks里的函数，并保存data，并将当前promise状态改为resolved，并且当执行resolve的时候要判断状态
  2.6 reject 同理
  2.7 执行executor的时候，需要 try/catch 如果执行异常的话，promise的会直接执行reject方法
3. 实现then方法
  3.1 首先 then 方法回返回一个 Promise
  3.2 第二步已经实现了状态为 pending 的逻辑，当状态为 resolved 时有两种情况，当 onResolved 返回值为普通类型时，直接 resolve，如果为 Promise 则继续调用 then 方法，并传入对应回调
  3.3 执行 onResolved 可能抛错，需要 try/catch
  3.4 当状态为 resolved 时同理，并且在 pending 时也需要处理其返回值以及 try/catch
  3.5 处理值穿透，当传入then的不是函数，那就忽略那个传入值，再写一个函数。这个函数的执行结果将返回上一个promise的data
3.实现catch方法，catch 方法与 then 原理类似，可以重用then，第一个参数不传即可
4. 实现Promise.resolve，其会返回一个 Promise，同样需要处理传入的值是否为 Promise，如果是对其调用 then 方法，否则直接 resolve
5.实现Promise.reject，返回一个状态为 rejected 的 Promise
6.实现Promise.all，它会返回一个Promise，遍历传入的 Promise 用then处理，如果其中一个为 rejected 直接 reject，否则存储下每个 promise 的执行结果，全部执行完之后 resolve 全部执行结果
7.实现Promise.race，它返回一个 Promise，只要一个 promise 状态为 resolved，就结束，只要一个为 rejected 也会结束
