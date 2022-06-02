function EventBus() {
  this.msgQuene = {}
}

EventBus.prototype = {
  on: function (msgName, fn) {
    if (this.msgQuene.hasOwnProperty(msgName)) {
      if (typeof this.msgQuene[msgName] === "function") {
        this.msgQuene[msgName] = [this.msgQuene[msgName], fn]
      } else {
        this.msgQuene[msgName] = [...this.msgQuene[msgName], fn]
      }
    } else {
      this.msgQuene[msgName] = fn
    }
  },
  once: function (msgName, fn) {
    this.msgQuene[msgName] = fn
  },
  emit: function (msgName, msg) {
    if (!this.msgQuene.hasOwnProperty(msgName)) {
      return
    }

    if (typeof this.msgQuene[msgName] === "function") {
      this.msgQuene[msgName](msg)
    } else {
      this.msgQuene[msgName].map((fn) => {
        fn(msg)
      })
    }
  },
  off: function (msgName) {
    if (!this.msgQueues.hasOwnProperty(msgName)) {
      return
    }
    delete this.msgQuene[msgName]
  },
}

const eventBus = new EventBus()

eventBus.on("test1", () => {
  console.log("haha1")
})

eventBus.on("test1", (value) => {
  console.log(value)
})

eventBus.on("test2", () => {
  console.log(this)
})

eventBus.emit("test1", "payload")
eventBus.emit("test2")

// reduce -> map
function myMap(arr, fn) {
  return arr.reduce((acc, cur, index) => {
    const result = fn(cur, index)
    return acc.concat(result)
  }, [])
}

const arr1 = [1, 2, 3, 4, 5]

const arr2 = myMap(arr1, (item, index) => {
  return item + index
})

console.log(arr2)

// reduce -> flat
function myFlat(arr = []) {
  return arr.reduce((acc, cur) => {
    return acc.concat(Array.isArray(cur) ? myFlat(cur) : cur)
  }, [])
}

const arr3 = [1, 2, [3, [4, 5]]]

const arr4 = myFlat(arr3)
console.log(arr4)

function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  if (typeof obj !== "object") return obj

  if (hash.get(obj)) return hash.get(obj)

  const cloneObj = new obj.constructor()

  hash.set(obj, cloneObj)

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      cloneObj[key] = deepClone(object[key])
    }
  }
  return cloneObj
}

const arr5 = [1, 2, 3, 2, 2]

function unique(arr) {
  var result = []
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < result.length; j++) {
      if (arr[i] === result[j]) {
        break
      }
    }
    if (result.length === j) {
      result.push(arr[i])
    }
  }
  return result
}

console.log(unique(arr5))

function unique2(arr) {
  var result = []

  for (let index = 0; index < arr.length; index++) {
    if (result.indexOf(arr[index]) === -1) {
      result.push(arr[index])
    }
  }
  return result
}

function unique3(arr) {
  return arr.filter((item, index) => {
    return index === arr.indexOf(item)
  })
}

function unique4(arr) {
  var result = []

  var sortArray = arr.concat().sort()
  var seen
  for (let index = 0; index < sortArray.length; index++) {
    if (!index || seen !== sortArray[index]) {
      result.push(sortArray[index])
    }
    seen = sortArray[index]
  }

  return result
}

function unqiue5(arr) {
  // return Array.from(new Set(arr))
  return [...new Set(arr)]
}

function unique6(arr) {
  const obj = {}

  return arr.filter((item) => {
    return obj.hasOwnProperty(item) ? false : (obj[item] = true)
  })
}

function unique7(arr) {
  const map = new Map()

  return arr.filter((item) => {
    return !map.has(item) && map.set(item, 1)
  })
}

console.log(unique3(arr5))

// 创建对象的方法，工厂模式
function createObj(age) {
  var obj = new Object()
  obj.age = age
  obj.name = "12"
  return obj
}

// 构造函数模式
function createObj2(age) {
  this.name = "1"
  this.age = age
}

// 原型模式
function createObj3() {}
createObj.prototype.name = "123"
createObj.prototype.getName = function () {}

// 组合模式
function createObj4() {
  this.name = "12"
}

createObj4.prototype.getName = function () {}

// 原型链继承
function Parent1() {
  this.name = "1"
}
Parent1.prototype.getName = function () {}
function Child1(params) {}
Child1.prototype = new Parent1()

// 经典继承
function Parent2() {
  this.name = "1"
}
function Child2() {
  Parent2.call(this)
}
// 组合继承
function Parent3() {
  this.name = "1"
}
Parent3.prototype.getName = function () {}

function Child3() {
  Parent3.call(this)
}
Child3.prototype = new Parent3()
Child3.prototype.constructor = Child3

// 原型式继承
function createObj4(obj) {
  function F(params) {}
  F.prototype = obj
  return new F()
}

// 寄生式继承

function createObj5(obj) {
  var clone = Object.create(obj)
  clone.getName = function () {}
  return clone
}
// 寄生式组合继承
function Parent4() {
  this.name = "1"
}
Parent4.prototype.getName = function () {}

function Child4() {
  Parent4.call(this)
}
function F() {}

F.prototype = Parent4.prototype

Child4.prototype = new F()
