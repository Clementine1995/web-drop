// eventbus
// on(),emit,off,once

function EventBus() {
  this.msgQueues = {}
}

EventBus.prototype = {
  on: function(msgName, func) {
    // (this.msgQueues[msgName] || (this.msgQueues[msgName] = [])).push(func)
    if (this.msgQueues.hasOwnProperty(msgName)) {
      if (typeof this.msgQueues[msgName] === 'function') {
        this.msgQueues[msgName] = [this.msgQueues[msgName], func]
      } else {
        this.msgQueues[msgName] = [...this.msgQueues[msgName], func]
      }
    } else {
      this.msgQueues[msgName] = func
    }
  },
  once: function(msgName, func) {
    this.msgQueues[msgName] = func
  },
  emit: function(msgName, payload) {
    if (!this.msgQueues[msgName]) {
      return
    }

    if (typeof this.msgQueues[msgName] === 'function') {
      this.msgQueues[msgName](payload)
    } else {
      this.msgQueues[msgName].map(fn => {
        fn(payload)
      })
    }
  },
  off: function(msgName) {
    if (!this.msgQueues[msgName]) {
      return
    }
    delete this.msgQueues[msgName]
  }
}

// setTimeout 实现 setInterval

let timeId
function mySetInterval(cb, time) {
  const fn = () => {
    cb()
    timeId = setTimeout(() => {
      fn()
    }, time)
  }
  timeId = setTimeout(fn, time)
  return timeId
}

// 实现new

function myNew() {
  var obj = {}
  var constructor = [].shift.call(arguments)
  var args = [].slice.call(arguments)
  obj.__proto__ = constructor.prototype
  // var obj = Object.create(constructor.prototype)
  // Object.setPrototypeOf(obj, constrcutor.prototype)
  var res = constructor.call(obj, args)

  return res instanceof Object ? res : obj
}
// 实现call

function myCall(context, ...args) {
  context = context || window
  let fn = Symbol()
  context[fn] = this

  let result = context[fn](...args)
  delete context[fn]

  return result
}

// 实现apply

function myApply(context, arr){
  context = context || window
  let fn = Symbol()
  context[fn] = this

  let result = context[fn](...arr)
  delete context[fn]
  return result
}