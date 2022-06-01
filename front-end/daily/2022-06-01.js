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
