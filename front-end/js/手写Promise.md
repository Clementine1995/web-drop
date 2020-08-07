# 手写 Promise 原理实现

>参考[手写Promise核心原理，再也不怕面试官问我Promise原理](https://juejin.im/post/6856213486633304078)
>
>参考[JS 高级之手写一个Promise,Generator,async和 await](https://juejin.im/post/6844904022223110151)

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
  3.4 当状态为 rejected 时同理，并且在 pending 时也需要处理其返回值以及 try/catch
  3.5 处理值穿透，当传入then的不是函数，那就忽略那个传入值，再写一个函数。这个函数的执行结果将返回上一个promise的data
3.实现catch方法，catch 方法与 then 原理类似，可以重用then，第一个参数不传即可
4. 实现Promise.resolve，其会返回一个 Promise，同样需要处理传入的值是否为 Promise，如果是对其调用 then 方法，否则直接 resolve
5.实现Promise.reject，返回一个状态为 rejected 的 Promise
6.实现Promise.all，它会返回一个Promise，遍历传入的 Promise 用then处理，如果其中一个为 rejected 直接 reject，否则存储下每个 promise 的执行结果，全部执行完之后 resolve 全部执行结果
7.实现Promise.race，它返回一个 Promise，只要一个 promise 状态为 resolved，就结束，只要一个为 rejected 也会结束

```js
// 模拟实现Promise

// Promise 构造函数， executor 执行器函数
function custPromise(executor) {
  // 每个 Promise 都有一个状态[[PromiseState]]，可能位 pending 或 resolved，rejected，初始状态都为 pending，并且每个 Promise 都有一个 data 存储自己的 result（源码中为[[PromiseResult]]）

  var self = this
  self.status = 'pending'
  self.data = undefined
  // 用来存储 没有执行resolve或者reject 时，then 方法（或者 catch）传入的回调
  self.callbacks = []  // 每个元素的结构：{onResolved(){}，onRejected(){}}

  // resovle的功能是执行callbacks里的函数，并保存data，并将当前promise状态改为resolved
  function resolve(value) {
    // promise的状态只能改变一次，如果当前状态不是pending，则不执行
    if(self.status !== 'pending'){
      return
    }
    // 将当前promise状态改为resolved
    self.status = 'resolved'

    // 保存data
    self.data = value

    // 如果有待执行的callback函数，立即异步执行回调函数onResolved
    if (self.callbacks.length > 0) {
      self.callbacks.forEach(callBackObj => {
        callBackObj.onResolved()
        // callBackObj.onReject()
      });
    }
  }
  // reject方法与 resolve 逻辑一样
  function reject(value) {

    // 如果当前状态不是pending，则不执行
    if(self.status !== 'pending'){
      return
    }
    // 将状态改为rejected
    self.status = 'rejected'
    // 保存value的值
    self.data = value

    // 如果有待执行的callback函数，立即异步执行回调函数onResolved
    if (self.callbacks.length>0){
      self.callbacks.forEach(callbackObj=>{
        callbackObj.onRejected(value)
      })
    }
  }
  // 传入的 executor 会立即执行，并且还会传入 resovle 与 reject
  try{
    // 立即同步执行executor
    executor(resolve,reject)
  }catch (e) { // 如果执行器抛出异常，promise对象变为rejected状态
    console.log(e)
    reject(e)
  }
}

// 这些方法都会返回一个 Promise，注意这里不要用 箭头函数
// 向Promise 原型对象上添加方法，then，catch
custPromise.prototype.then = function(onResolved, onReject) {
  // .then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透。
  // 值穿透可以理解为，当传入then的不是函数的时候，这个then是无效的。
  // 而实际原理上其实是当then中传入的不算函数，则这个then返回的promise的data，将会保存上一个的promise.data。
  // 这就是发生值穿透的原因。而且每一个无效的then所返回的promise的状态都为resolved。

  onResolved = typeof onResolved === 'function'? onResolved: value => value
  onRejected = typeof onRejected === 'function'? onRejected: reason => {throw reason}


  // 收集回调，因为 then 调用时 Promise 可能还是 pending 状态，所以收集的时候只需要判断 status 是否为pending ，如果是就把它 push 到 callbacks 中
  var self = this

  return new custPromise((resolve, reject) => {
    // 封装相同的 onResolved 或者 onRejected 处理逻辑
    function handle(callback) {
      try{
        const result = callback(self.data)
        if (result instanceof custPromise){
          // 2. 如果回调函数返回的是promise，return的promise的结果就是这个promise的结果
          result.then(
            value => {resolve(value)},
            reason => {reject(reason)}
          )
        } else {
          // 1. 如果回调函数返回的不是promise，return的promise的状态是resolved，value就是返回的值。
          resolve(result)
        }
      }catch (e) {
        //  3.如果执行onResolved的时候抛出错误，则返回的promise的状态为rejected
        reject(e)
      }
    }

    if (self.status === 'pending') {
      self.callbacks.push({
        onResolved() {
          handle(onResolved)
        },
        onReject() {
          handle(onRejected)
        }
      })
    } else if (self.status === 'resolved') {
      // 执行到then时，promise可能会是pending状态，此时就要把then里的回调函数保存起来，
      // 也可能会是resolved或者rejected状态，此时就不用把回调保存起来，直接执行onResolved或onRejected方法。
      // 注意是异步执行。而且是做为微任务的，这里简单的用setTimeout来实现了。

      // 当前执行第二个判断语句的时候会出现三种情况
      setTimeout(()=>{
        handle(onResolved)
      })
    } else {
      setTimeout(()=>{
        handle(onReject)
      })
    }
  })
}

// Promise 原型对象的 catch，用来接收失败的回调
custPromise.prototype.catch = function(onReject) {
  // catch方法的作用跟then里的第二个回调函数一样，因此可以这样来实现
  return this.then(undefined,onRejected)
}

// 添加Promise函数对象上的方法 resolve
// Promise.resolve方法可以传三种值
// 1. 不是promise
// 2. 成功状态的promise
// 3. 失败状态的promise
custPromise.resolve = function(value) {
  return new custPromise((resolve,reject)=>{
    if (value instanceof custPromise){
      // 如果value 是promise
      value.then(
        value => {resolve(value)},
        reason => {reject(reason)}
      )
    } else{
      // 如果value不是promise
      resolve(value)
    }
  })
}

// 添加Promise函数对象上的方法 reject
// 返回一个状态为rejected的promise
custPromise.reject = function(value) {
  return new custPromise((resolve,reject)=>{
    reject(reason)
  })
}

// 添加Promise函数对象上的方法 all
// 返回一个promise对象，只有当所有promise都成功时返回的promise状态才成功

custPromise.all = function(promises) {
  const values = new Array(promises.length)
  var resolvedCount = 0 //计状态为resolved的promise的数量
  return new custPromise((resolve, reject) => {
    promises.forEach((p, index) => {
      // 需要把不是promise的数字包装成promise, 对于这种情况 all([p,2,3,p])
      custPromise.resolve(p).then(
        value => {
          values[index] = value
          resolvedCount++
          if (resolvedCount === promises.length) {
            resolve(values)
          }
        },
        reason => {
          reject(reason)
        }
      )
    })
  })
}

// 添加Promise函数对象上的方法 race
custPromise.race = function(value) {
  return new custPromise((resolve,reject)=>{
    // 遍历promises，获取每个promise的结果
    promises.forEach((p,index)=>{
      custPromise.resolve(p).then(
          value => {
            // 只要有一个成功，返回的promise的状态九尾resolved
            resolve(value)

          },
          reason => { //只要有一个失败，return的promise状态就为reject
            reject(reason)
          }
        )
    })
  })
}

let promise = new custPromise((resolve,reject)=>{
  setTimeout(function () {
    resolve(1)
    //reject(1)
  },1000)
})

promise.then(
  value=>{
    console.log("onResolved:",value);
  },
  reason=>{
    console.log("onRejected:",reason);
  }
)
```
