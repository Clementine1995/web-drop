// 第二个 Promise

const PENDING = Symbol('PENDING')
const RESOLVED = Symbol('RESOLVED')
const REJECTED = Symbol('REJECTED')

function custPromise(executor) {

  this.status = PENDING

  this.onResolvedCallbacks = []
  this.onRejectedCallbacks = []

  this.value = undefined
  
  this.reason = undefined

  const resolve = (value) => {
    if (this.status === PENDING) {
      this.status = RESOLVED

      this.value = value

      this.onResolvedCallbacks.forEach(fn => fn())
    }
  }

  const reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED

      this.reason = reason

      this.onRejectedCallbacks.forEach(fn => fn())
    }
  }

  try {
    executor(resolve, reject)
  } catch (error) {
    reject(error)
  }
}

const resolvePromise = (promise, x, resolve, reject) => {
  if (promise === x) { // 如果得到新的新值为执行 then 的那个 promise，抛错
    return reject(new TypeError('Chaining cycle detected for promise #<promise>'))
  }

  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    // 防止多次调用成功或者失败
    let called;
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) {
            return
          }
          called = true
          resolvePromise(promise, y, resolve, reject)
        }, r => {
          if (called) {
            return
          }
          called = true

          reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) {
				return
			}
			called = true
      reject(error)
    }
    
  } else {
    resolve(x)
  }
}

custPromise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
  onRejected = typeof onRejected === 'function' ? onRejected : reason => {
    throw reason
  }

  let promise = new custPromise((resolve, reject) => {
    if (this.status === RESOLVED) {
      // 使用 setTimeout (宏任务)，确保 onFulfilled 和 onRejected 方法异步执行，也确保 promise 已经定义，
      // 如果不使用 setTimeout，会导致执行 resolvePromise(promise, x, resolve, reject) 时 promise 未定义而报错。
      setTimeout(() => {
        try {
          const result = onFulfilled(this.value)
          resolvePromise(promise, result, resolve, reject)
        } catch (error) {
          reject(error)
        }
      })
    } else if (this.status === REJECTED) {
      setTimeout(() => {
        try {
          const result = onRejected(this.reason)
          resolvePromise(promise, result, resolve, reject)
        } catch (error) {
          reject(error)
        }
      })
    } else {
      this.onResolvedCallbacks.push(() => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
      this.onRejectedCallbacks.push(() => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  })

  return promise
}

custPromise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected)
}


custPromise.prototype.finally = function (callback) {
  return this.then((value) => {
    return custPromise.resolve(callback()).then(() => {
      return value;
    });
  }, (err) => {
    return custPromise.resolve(callback()).then(() => {
      throw err;
    });
  });
}

custPromise.defer = custPromise.deferred = function () {
  let dfd = {}
  dfd.promise = new custPromise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

// Promise.resolve() 有时需要将现有对象转为 Promise 对象，Promise.resolve()方法就起到这个作用。

// Promise.resolve('foo')
// // 等价于
// new Promise(resolve => resolve('foo'))

// Promise.resolve方法的参数分成四种情况。

// 参数是一个promise，Promise.resolve 不做任何修改，原封不动返回
// 参数是一个 thenable 对象，Promise.resolve方法会将这个对象转为 Promise 对象，然后就立即执行thenable对象的then方法。
// 参数不是具有 then 方法的对象，或根本就不是对象，Promise.resolve方法返回一个新的 Promise 对象，状态为resolved
// 不带有任何参数，直接返回一个resolved状态的 Promise 对象。

custPromise.resolve = function (value) {
  if (value instanceof custPromise) {
    return value
  }

  return new custPromise((resolve, reject) => {
    if (value && value.then && typeof value.then === 'function') {
      setTimeout(() => {
        value.then(resolve, reject)
      })
    } else {
      resolve(value)
    }
  })
}

custPromise.reject = function(reason) {
  return new custPromise((resolve, reject) => {
    reject(reason)
  })
}

custPromise.all = function(promises) {
  return new custPromise((resolve, reject) => {
    let result = []

    let index = 0

    if (promises.length === 0) {
      return resolve(result)
    } else {
      function processValue(i, data) {
        result[i] = data
        if (++index === promises.length) {
          resolve(result)
        }
      }
      promises.forEach((current, i) => {
        if (current instanceof custPromise) {
          current.then(data => {
            processValue(i, data)
          }, reject)
        } else {
          processValue(i, current)
        }
      })
    }
  })
}

custPromise.race = function(promises) {
  if (!promises.length) {
    return
  }
  return new custPromise((resolve, reject) => {
    promises.forEach(current => {
      custPromise.resolve(current).then(
        value => {
          resolve(value)
        },
        error => {
          reject(error)
        }
      )
    })
  })
}

const p1 = new custPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(11)
  }, 1000)
})


const p2 = p1.then(res => {
  console.log(res)
  return 222222
}).then(res => {
  console.log(res)
}).finally(res => {
  console.log('finally:', res)
  return 111
}).then(res => {
  console.log('before finally', res)
})



// 去重

var array = [1, 1, '1', '1']

function unique(array) {
  var res = []
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < res.length; j++) {
      if (array[i] === res[j]) {
        break
      }
    }
    if (res.length === j) {
      res.push(array[i])
    }
    
  }
  return res
}

console.log(unique(array))

function unique2(array) {

  var res = []

  for (let i = 0; i < array.length; i++) {
    if (res.indexOf(array[i]) === -1) {
      res.push(array[i])
    }
    
  }
  return res
}

function unique3(array) {
  var res = []

  var sortArray = array.concat().sort()

  var seen
  for (let index = 0; index < array.length; index++) {
    if (!index || seen !== array[index]) {
      res.push(array[index])
    }
    seen = array[index]
  }
  
  return res
}

console.log(unique(array3))
