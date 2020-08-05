// 浅拷贝，数组可以使用 slice,concat
var array = ['null', null, undefined, 1, '2', true]
var copy = array.slice()
var copy1 = array.concat()
console.log(copy)


function shallowCopy(obj) {
  if (typeof obj !== 'object') return
  var newObj = obj instanceof Array ? [] : {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

// 深拷贝，JSON.parse(JSON.stringify(array)) 这个方法适用于数组对象，不过其中如果有函数就不行
var array = ['null', null, undefined, 1, '2', true]
var copy = JSON.parse(JSON.stringify(array))

function deepCopy (obj) {
  if (typeof obj !== 'object') return
  var newObj = obj instanceof Array ? [] : {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key]
    }
  }
  return newObj
}

// jq的extend 合并两个或者多个对象到一个对象中，ES6中有 Object.assign()
function extend() {
  var name, options, copy
  var length = arguments.length
  var i = 1
  var target = arguments[0]

  for (i; i < length; i++) {
    options = arguments[i]
    if (options) {
      for (name in options) {
        if (options.hasOwnProperty(name)) {
          copy = options[name]
          if (copy !== undefined) {
            target[name] = copy
          }
        }
      }
    }
  }
}
// extend 加入深拷贝
function extend() {
  var deep = false
  var name, options, src, copy, clone, copyIsArray

  var length = arguments.length
  var i = 1
  var target = arguments[0] || {}

  if (typeof target === 'boolean') {
    deep = target
    target = arguments[1] || {}
    i++
  }

  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {}
  }
  for (; i < length; i++) {
    options = arguments[i]
    if (options) {
      for (name in options) {
        if (options.hasOwnProperty(name)) {
          
          src = target[name]
          copy = options[name]

          if (target === copy) { // 处理循环引用
            continue;
          }
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }
            target[name] = extend(deep, clone, copy);
          } else if(copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
  }
  return target
}

function isPlainObject(obj) {
  var proto, Ctor;
  var toString = Object.toString
  var hasOwn = Object.hasOwnProperty
  if (!obj || toString.call(obj) !== "[object Object]") {
    return false;
  }
  proto = Object.getPrototypeOf(obj);
  if (!proto) {
    return true;
  }
  Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && hasOwn.toString.call(Ctor) === hasOwn.toString.call(Object);
}

// 数组扁平

// 递归
function flat(array) {
  var result = []
  for (let index = 0; index < array.length; index++) {
    if (Array.isArray(array[index])) {
      result = result.concat(flat(array[index]))
    } else {
      result.push(array[index])
    }
  }
  return result
}
// 如果数组的元素都是数字，可以使用toString，如果是字符串或者数字混合，那扁平后就只有一种类型了
function flat1(array) {
  return array.toString().split(',').map(item => {
    return +item
  })
}

var arr = [1, [2, [3, 4]]];

// reduce
function flat2(array) {
  var res = []

  array.reduce((cur, next) => {
    if (Array.isArray(next)) {
      cur.push(...flat2(next))
    } else {
      cur.push(next)
    }
    return cur
  }, res)
  return res
}

function flat3(array) {
  return array.reduce((cur, next) => {
    return cur.concat(Array.isArray(next) ? flat3(next) : next)
  }, [])
}
console.log(flat2(arr))

// 利用展开运算符

function flat4(array) {
  while(array.some(item => Array.isArray(item))) {
    array = [].concat(...array)
  }
  return array
}

flatten = Function.apply.bind([].concat, [])

// 求最大值

