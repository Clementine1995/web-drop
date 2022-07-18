# Vue3 源码中实用的基础工具函数

> 原文[初学者也能看懂的 Vue3 源码中那些实用的基础工具函数](https://lxchuan12.gitee.io/vue-next-utils)

## 工具函数

### babelParserDefaultPlugins babel 解析默认插件

```js
/**
 * List of @babel/parser plugins that are used for template expression
 * transforms and SFC script transforms. By default we enable proposals slated
 * for ES2020. This will need to be updated as the spec moves forward.
 * Full list at https://babeljs.io/docs/en/next/babel-parser#plugins
 */
const babelParserDefaultPlugins = [
  "bigInt",
  "optionalChaining",
  "nullishCoalescingOperator",
]
```

这里就是几个默认插件

### EMPTY_OBJ 空对象

```js
const EMPTY_OBJ = process.env.NODE_ENV !== "production" ? Object.freeze({}) : {}

// 例子：
// Object.freeze 是 冻结对象
// 冻结的对象最外层无法修改，里层对象还是可以更改的。
const EMPTY_OBJ_1 = Object.freeze({})
EMPTY_OBJ_1.name = "zhangsan"
console.log(EMPTY_OBJ_1.name) // undefined

const EMPTY_OBJ_2 = Object.freeze({ props: { mp: "123" } })
EMPTY_OBJ_2.props.name = "lisi"
EMPTY_OBJ_2.props2 = "props2"
console.log(EMPTY_OBJ_2.props.name) // 'lisi'
console.log(EMPTY_OBJ_2.props2) // undefined
console.log(EMPTY_OBJ_2)
/**
 * 
 * { 
 *  props: {
     mp: "123",
     name: "zhangsan"
    }
 * }
 * */
```

### EMPTY_ARR 空数组

```js
const EMPTY_ARR = process.env.NODE_ENV !== "production" ? Object.freeze([]) : []

// 例子：
EMPTY_ARR.push(1) // 报错，也就是为啥生产环境还是用 []
EMPTY_ARR.length = 3
console.log(EMPTY_ARR.length) // 0
```

### NOOP 空函数

```js
const NOOP = () => {}
// 很多库的源码中都有这样的定义函数，比如 jQuery、underscore、lodash 等
// 使用场景：1. 方便判断， 2. 方便压缩
// 1. 比如：
const instance = {
  render: NOOP,
}

// 条件
const dev = true
if (dev) {
  instance.render = function () {
    console.log("render")
  }
}

// 可以用作判断。
if (instance.render === NOOP) {
  console.log("i")
}
// 2. 再比如：
// 方便压缩代码
// 如果是 function(){} ，不方便压缩代码
```

### NO 永远返回 false 的函数

```js
/**
 * Always return false.
 */
const NO = () => false

// 除了压缩代码的好处外。
// 一直返回 false
```

### isOn 判断字符串是不是 on 开头，并且 on 后首字母不是小写字母

```js
const onRE = /^on[^a-z]/
const isOn = (key) => onRE.test(key)

// 例子：
isOn("onChange") // true
isOn("onchange") // false
isOn("on3change") // true
```

### isModelListener 监听器

判断字符串是不是以 onUpdate:开头

```js
const isModelListener = (key) => key.startsWith("onUpdate:")

// 例子：
isModelListener("onUpdate:change") // true
isModelListener("1onUpdate:change") // false
// startsWith 是 ES6 提供的方法
```

### extend 继承 合并

```js
const extend = Object.assign

// 例子：
const data = { name: "zhangsan" }
const data2 = extend(data, { mp: "123", name: "lisi" })
console.log(data) // { name: "lisi", mp: "123" }
console.log(data2) // { name: "lisi", mp: "123" }
console.log(data === data2) // true
```

### remove 移除数组的一项

```js
const remove = (arr, el) => {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}

// 例子：
const arr = [1, 2, 3]
remove(arr, 3)
console.log(arr) // [1, 2]
```

splice 其实是一个很耗性能的方法。删除数组中的一项，其他元素都要移动位置。

引申：axios InterceptorManager 拦截器源码中，拦截器用数组存储的。但实际移除拦截器时，只是把拦截器置为 null 。而不是用 splice 移除。最后执行时为 null 的不执行，同样效果。axios 拦截器这个场景下，不得不说为性能做到了很好的考虑。看如下 axios 拦截器代码示例：

```js
// 代码有删减
// 声明
this.handlers = []

// 移除
if (this.handlers[id]) {
  this.handlers[id] = null
}

// 执行
if (h !== null) {
  fn(h)
}
```

### hasOwn 是不是自己本身所拥有的属性

```js
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (val, key) => hasOwnProperty.call(val, key)

// 例子：
// 特别提醒：__proto__ 是浏览器实现的原型写法，后面还会用到
// 现在已经有提供好几个原型相关的API
// Object.getPrototypeOf
// Object.setPrototypeOf
// Object.isPrototypeOf

// .call 则是函数里 this 显示指定以为第一个参数，并执行函数。

hasOwn({ __proto__: { a: 1 } }, "a") // false
hasOwn({ a: undefined }, "a") // true
hasOwn({}, "a") // false
hasOwn({}, "hasOwnProperty") // false
hasOwn({}, "toString") // false
// 是自己的本身拥有的属性，不是通过原型链向上查找的。
```

### isArray 判断数组

```js
const isArray = Array.isArray

isArray([]) // true
const fakeArr = { __proto__: Array.prototype, length: 0 }
isArray(fakeArr) // false
fakeArr instanceof Array // true
// 所以 instanceof 这种情况 不准确
```

### isMap 判断是不是 Map 对象

```js
const isMap = (val) => toTypeString(val) === "[object Map]"

// 例子：
const map = new Map()
const o = { p: "Hello World" }

map.set(o, "content")
map.get(o) // 'content'
isMap(map) // true
```

### isSet 判断是不是 Set 对象

```js
const isSet = (val) => toTypeString(val) === "[object Set]"

// 例子：
const set = new Set()
isSet(set) // true
```

### isDate 判断是不是 Date 对象

```js
const isDate = (val) => val instanceof Date

// 例子：
isDate(new Date()) // true

// `instanceof` 操作符左边是右边的实例。但不是很准，但一般够用了。原理是根据原型链向上查找的。

isDate({ __proto__: new Date() }) // true
// 实际上是应该是 Object 才对。
// 所以用 instanceof 判断数组也不准确。
// 再比如
;({ __proto__: [] } instanceof Array) // true
// 实际上是对象。
// 所以用 数组本身提供的方法 Array.isArray 是比较准确的。
```

### isFunction 判断是不是函数

```js
const isFunction = (val) => typeof val === "function"
// 判断函数有多种方法，但这个是比较常用也相对兼容性好的。
```

### isString 判断是不是字符串

```js
const isString = (val) => typeof val === "string"
// 例子：
isString("") // true
```

### isSymbol 判断是不是 Symbol

```js
const isSymbol = (val) => typeof val === "symbol"

// 例子：
let s = Symbol()

typeof s
// "symbol"
// Symbol 是函数，不需要用 new 调用。
```

### isObject 判断是不是对象

```js
const isObject = (val) => val !== null && typeof val === "object"

// 例子：
isObject(null) // false
isObject({ name: "123" }) // true
// 判断不为 null 的原因是 typeof null 其实 是 object
```

### isPromise 判断是不是 Promise

```js
const isPromise = (val) => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

// 判断是不是Promise对象
const p1 = new Promise(function (resolve, reject) {
  resolve("123")
})
isPromise(p1) // true
```

### objectToString 对象转字符串

```js
// 对象转字符串
const objectToString = Object.prototype.toString
```

### toTypeString 对象转字符串

```js
const toTypeString = (value) => objectToString.call(value)
```

### toRawType 对象转字符串 截取后几位

```js
const toRawType = (value) => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

// 截取到
toRawType("") // 'String'
```

可以 截取到 String Array 等这些类型，是 JS 判断数据类型非常重要的知识点。

### isPlainObject 判断是不是纯粹的对象

```js
const objectToString = Object.prototype.toString
const toTypeString = (value) => objectToString.call(value)
//
const isPlainObject = (val) => toTypeString(val) === "[object Object]"

// 前文中 有 isObject 判断是不是对象了。
// isPlainObject 这个函数在很多源码里都有，比如 jQuery 源码和 lodash 源码等，具体实现不一样
// 上文的 isObject([]) 也是 true ，因为 type [] 为 'object'
// 而 isPlainObject([]) 则是false
const Ctor = function () {
  this.name = "我是构造函数"
}
isPlainObject({}) // true
isPlainObject(new Ctor()) // true
```

### isIntegerKey 判断是不是数字型的字符串 key 值

```js
const isIntegerKey = (key) =>
  isString(key) &&
  key !== "NaN" &&
  key[0] !== "-" &&
  "" + parseInt(key, 10) === key

// 例子:
isIntegerKey("a") // false
isIntegerKey("0") // true
isIntegerKey("011") // false
isIntegerKey("11") // true
// 其中 parseInt 第二个参数是进制。
// 字符串能用数组取值的形式取值。
//  还有一个 charAt 函数，但不常用
"abc".charAt(0) // 'a'
// charAt 与数组形式不同的是 取不到值会返回空字符串''，数组形式取值取不到则是 undefined
```

### makeMap && isReservedProp

传入一个以逗号分隔的字符串，生成一个 map(键值对)，并且返回一个函数检测 key 值在不在这个 map 中。第二个参数是小写选项。

```js
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(",")
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? (val) => !!map[val.toLowerCase()]
    : (val) => !!map[val]
}
const isReservedProp = /*#__PURE__*/ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref," +
    "onVnodeBeforeMount,onVnodeMounted," +
    "onVnodeBeforeUpdate,onVnodeUpdated," +
    "onVnodeBeforeUnmount,onVnodeUnmounted"
)

// 保留的属性
isReservedProp("key") // true
isReservedProp("ref") // true
isReservedProp("onVnodeBeforeMount") // true
isReservedProp("onVnodeMounted") // true
isReservedProp("onVnodeBeforeUpdate") // true
isReservedProp("onVnodeUpdated") // true
isReservedProp("onVnodeBeforeUnmount") // true
isReservedProp("onVnodeUnmounted") // true
```

### cacheStringFunction 缓存

```js
const cacheStringFunction = (fn) => {
  const cache = Object.create(null)
  return (str) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}
```

这个函数也是和上面 MakeMap 函数类似。只不过接收参数的是函数。 《JavaScript 设计模式与开发实践》书中的第四章 JS 单例模式也是类似的实现。

```js
var getSingle = function (fn) {
  // 获取单例
  var result
  return function () {
    return result || (result = fn.apply(this, arguments))
  }
}
```

以下是一些正则：

```js
// \w 是 0-9a-zA-Z_ 数字 大小写字母和下划线组成
// () 小括号是 分组捕获
const camelizeRE = /-(\w)/g
/**
 * @private
 */
// 连字符 - 转驼峰  on-click => onClick
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""))
})
// \B 是指 非 \b 单词边界。
const hyphenateRE = /\B([A-Z])/g
/**
 * @private
 */

const hyphenate = cacheStringFunction((str) =>
  str.replace(hyphenateRE, "-$1").toLowerCase()
)

// 举例：onClick => on-click
const hyphenateResult = hyphenate("onClick")
console.log("hyphenateResult", hyphenateResult) // 'on-click'

/**
 * @private
 */
// 首字母转大写
const capitalize = cacheStringFunction(
  (str) => str.charAt(0).toUpperCase() + str.slice(1)
)
/**
 * @private
 */
// click => onClick
const toHandlerKey = cacheStringFunction((str) =>
  str ? `on${capitalize(str)}` : ``
)

const result = toHandlerKey("click")
console.log(result, "result") // 'onClick'
```

### hasChanged 判断是不是有变化

```js
const hasChanged = (value, oldValue) => !Object.is(value, oldValue)
```

以下是原先的源码。

```js
// compare whether a value has changed, accounting for NaN.
const hasChanged = (value, oldValue) =>
  value !== oldValue && (value === value || oldValue === oldValue)
// 例子：
// 认为 NaN 是不变的
hasChanged(NaN, NaN) // false
hasChanged(1, 1) // false
hasChanged(1, 2) // true
hasChanged(+0, -0) // false
// Obect.is 认为 +0 和 -0 不是同一个值
Object.is(+0, -0) // false
// Object.is 认为  NaN 和 本身 相比 是同一个值
Object.is(NaN, NaN) // true
// 场景
// watch 监测值是不是变化了

// (value === value || oldValue === oldValue)
// 为什么会有这句 因为要判断 NaN 。认为 NaN 是不变的。因为 NaN === NaN 为 false
```

### invokeArrayFns 执行数组里的函数

```js
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}

// 例子：
const arr = [
  function (val) {
    console.log(val + "123")
  },
  function (val) {
    console.log("456" + val)
  },
  function (val) {
    console.log("789" + val)
  },
]
invokeArrayFns(arr, "0")
```

为什么这样写，一般都是一个函数执行就行。数组中存放函数，函数其实也算是数据。这种写法方便统一执行多个函数。

### def 定义对象属性

```js
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value,
  })
}
```

### toNumber 转数字

```js
const toNumber = (val) => {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

toNumber("111") // 111
toNumber("a111") // 'a111'
parseFloat("a111") // NaN
isNaN(NaN) // true
```

> 其实 isNaN 本意是判断是不是 NaN 值，但是不准确的。 比如：isNaN('a') 为 true。 所以 ES6 有了 Number.isNaN 这个判断方法，为了弥补这一个 API。

### getGlobalThis 全局对象

```js
let _globalThis
const getGlobalThis = () => {
  return (
    _globalThis ||
    (_globalThis =
      typeof globalThis !== "undefined"
        ? globalThis
        : typeof self !== "undefined"
        ? self
        : typeof window !== "undefined"
        ? window
        : typeof global !== "undefined"
        ? global
        : {})
  )
}
```

获取全局 this 指向。

初次执行肯定是 `_globalThis` 是 undefined。所以会执行后面的赋值语句。

如果存在 globalThis 就用 globalThis

如果存在 self，就用 self。在 Web Worker 中不能访问到 window 对象，但是我们却能通过 self 访问到 Worker 环境中的全局对象。

如果存在 window，就用 window。

如果存在 global，就用 global。Node 环境下，使用 global。

如果都不存在，使用空对象。可能是微信小程序环境下。

下次执行就直接返回 `_globalThis`，不需要第二次继续判断了。这种写法值得我们学习。
