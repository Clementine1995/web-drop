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

// 这些方法都会返回一个 Promise
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
