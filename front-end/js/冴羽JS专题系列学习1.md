# 冴羽JS专题系列学习1

主要记录冴羽博客中JS深入系列阅读后的关键点记录与总结

>[冴羽的博客](https://github.com/mqyqingfeng/Blog)

## 跟着underscore学防抖

防抖就是，不管事件如何触发，只会在停止触发n秒之后执行回调方法。基本的实现在js防抖与节流中有，补充一下系列学习中的。

```js
// 第六版
function debounce(func, wait, immediate) {

  var timeout, result;

  var debounced = function () {
    var context = this;
    var args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 如果已经执行过，不再执行。不过在立即执行后，一直触发事件后停下来，回调函数是不会再执行的，想要执行的话，可以timeout重置前，调用一次
      var callNow = !timeout;
      timeout = setTimeout(function(){
          timeout = null;
      }, wait)
      if (callNow) result = func.apply(context, args)
    }
    else {
      timeout = setTimeout(function(){
        func.apply(context, args)
      }, wait);
    }
    // 只有立即执行的情况下才有返回值
    return result;
  };
  // 支持取消防抖效果
  debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
  };

  return debounced;
}
```

动画渲染中也可以使用类似的逻辑

```js
function debounce(func) {
  var t;
  return function () {
    cancelAnimationFrame(t)
    t = requestAnimationFrame(func);
  }
}
```

## 跟着underscore学节流

节流就是持续触发事件，每隔一段时间内只执行一次。

```js
// 第四版 leading 代表首次是否执行，trailing 代表结束后是否再执行一次。
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var now = new Date().getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  };
  return throttled;
}
```

## 数组去重

1. 双层循环，内层循环找到第一个与外层循环相等的值的索引，如果索引值等于内层数组长度，表示不重复，push进内层数组
2. indexOf，如果数组indexOf方法查找当前项为-1，则push进数组
3. 排序后去重，排序后去重只需要比较当前元素与上一元素是否相同，注意：sort 排序的结果并不总是正确的
4. filter，可以使用filter来代替命令式的for循环
5. Object键值对，通过对象某个键是否已经有值来判断重复
6. Set，使用ES6新增的Set来去重

Object键值对在去重时，考虑到对象、NaN、1、'1'等等作为键值可能导致去重失败的情况，采用了typeof + JSON.stringify的方式。stringify对于null跟Null都是null，对于1和'1'又是不同的。

## 类型判断

类型判断经常用的是 typeof ，它是一个一元运算符，返回操作数的类型字符串，但是对于数组，正则对象，日期对象，null等却不能作出区分（可以区分function）。

要想更详细的区分，就可以使用 Object.prototype.toString 方法，会返回一个由 "[object " 和 class 和 "]" 组成的字符串，而 class 是要判断的对象的内部属性。通过这个方法可以判断出现在es规范中存在的类型，下面是jq中的一种封装实现。

```js
// 第二版
var class2type = {};

// 生成class2type映射，最新规范中类型可不止这几种
"Boolean Number String Function Array Date RegExp Object Error".split(" ").map(function(item, index) {
  class2type["[object " + item + "]"] = item.toLowerCase();
})

function type(obj) {
  // 一箭双雕，解决IE6 中，null 和 undefined 会被 Object.prototype.toString 识别成 [object Object]
  if (obj == null) {
    return obj + "";
  }
  return typeof obj === "object" || typeof obj === "function" ?
    class2type[Object.prototype.toString.call(obj)] || "object" :
    typeof obj;
}
```

注意：像window、document、location之类的对象也是可以通过这个方法区分出来

```js
Object.prototype.toString.call(window) // "[object Window]"
```

### plainObject

该对象是通过 "{}" 或 "new Object" 创建的，该对象含有零个或者多个键值对。

```js
// 上节中写 type 函数时，用来存放 toString 映射结果的对象
var class2type = {};

// 相当于 Object.prototype.toString
var toString = class2type.toString;

// 相当于 Object.prototype.hasOwnProperty
var hasOwn = class2type.hasOwnProperty;

function isPlainObject(obj) {
  var proto, Ctor;

  // 排除掉明显不是obj的以及一些宿主对象如Window
  if (!obj || toString.call(obj) !== "[object Object]") {
    return false;
  }

  /**
    * getPrototypeOf es5 方法，获取 obj 的原型
    * 以 new Object 创建的对象为例的话
    * obj.__proto__ === Object.prototype
    */
  proto = Object.getPrototypeOf(obj);

  // 没有原型的对象是纯粹的，Object.create(null) 就在这里返回 true
  if (!proto) {
      return true;
  }

  /**
    * 以下判断通过 new Object 方式创建的对象
    * 判断 proto 是否有 constructor 属性，如果有就让 Ctor 的值为 proto.constructor
    * 如果是 Object 函数创建的对象，Ctor 在这里就等于 Object 构造函数
    */
  Ctor = hasOwn.call(proto, "constructor") && proto.constructor;

  // 在这里判断 Ctor 构造函数是不是 Object 构造函数，用于区分自定义构造函数和 Object 构造函数
  return typeof Ctor === "function" && hasOwn.toString.call(Ctor) === hasOwn.toString.call(Object);
}
```

### EmptyObject

空对象就是{}，jq中的实现是这样的：

```js
function isEmptyObject( obj ) {
  var name;
  for ( name in obj ) { // 判断是否有属性，for 循环一旦执行，就说明有属性
    return false;
  }
  return true;
}
```

### Window对象

Window 对象作为客户端 JavaScript 的全局对象，它有一个 window 属性指向自身，所以 `obj != null && obj === obj.window;` 为真就表示是window。

### 类数组

```js
function isArrayLike(obj) {
  // obj 必须有 length属性，至于这里的!!，是为了把结果转换成布尔值，否则有可能会返回obj的原值
  var length = !!obj && "length" in obj && obj.length;
  var typeRes = type(obj);
  // 排除掉函数和 Window 对象
  if (typeRes === "function" || isWindow(obj)) {
    return false;
  }
  // 长度为 0可以通过是考虑到arguments对象，不过也放过了一些有争议的对象。而最后一个条件length 是数字，并且 length > 0 且最后一个元素存在。
  return typeRes === "array" || length === 0 ||
    typeof length === "number" && length > 0 && (length - 1) in obj;
}
```

## 浅拷贝与深拷贝

数组的浅拷贝可以使用 slice、concat 返回一个新数组的特性来实现。但是这两个方法都无法深拷贝。ES6之后还可以使用 `Array.from(array)` 与展开运算符来实现 `let [...spread]= [12, 5, 8, 130, 44];`，除此之外此外还有 Object.assign()

数组的深拷贝可以使用 `JSON.parse(JSON.stringify(arr));` 这种方法，深拷贝中的函数问题比较难解决。

### 浅拷贝的实现

```js
var shallowCopy = function(obj) {
  // 只拷贝对象
  if (typeof obj !== 'object') return;
  // 根据obj的类型判断是新建一个数组还是对象
  var newObj = obj instanceof Array ? [] : {};
  // 遍历obj，并且判断是obj的属性才拷贝
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}
```

### 深拷贝的实现

原理：遍历对象、数组直到里边都是基本数据类型，然后再去复制，就是深度拷贝。

```js
var deepCopy = function(obj) {
  if (typeof obj !== 'object') return;
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  return newObj;
}
```

还有 JSON.parse(JSON.stringify(obj)) 方法，当然一些库比如 lodash，jq 也提供了实现好的深拷贝方法

注意：JSON.stringify(..) 在对象中遇到 undefined 、 function 、 symbol 和正则时会自动将其忽略， 在 数组中则会返回 null （以保证单元位置不变），如果用这个方法的时候要注意，还有如果要考虑完善的深拷贝Date,Set,RegExp等类型也是需要考虑的。

#### 比较完善的手写深拷贝

>[如何写出一个惊艳面试官的深拷贝?](https://segmentfault.com/a/1190000020255831)

## jQuery的extend

具体链接[JavaScript专题之从零实现jQuery的extend](https://github.com/mqyqingfeng/Blog/issues/33)

其中存在的问题 target 是函数（在判断target时，要同时判断是否为对象或函数），类型不一致（如果待复制对象属性值类型为数组或对象，目标属性值类型不为数组或对象的话，目标属性值就设为 []或者{}），循环引用（判断要复制的对象属性是否等于 target，如果等于，跳过）。

## 求数组的最大值和最小值

主要用的是 Math.max 这个方法，有几点需要注意

+ 如果有任一参数不能被**转换**为数值，则结果为 NaN，转换也就意味着参数可以是true,字符串,null等。
+ max 是 Math 的静态方法，所以应该像这样使用：Math.max()，而不是作为 Math 实例的方法 (简单的来说，就是不使用 new )
+ 如果没有参数，则结果为 -Infinity (注意是负无穷大)

方法有：

1. for循环遍历的方法
2. reduce
3. 排序后取最后一个
4. eval `var max = eval("Math.max(" + arr + ")");`
5. apply `Math.max.apply(null, arr)`
6. ES6展开运算符 `Math.max(...arr)`

## 数组扁平化

数组的扁平化，就是将一个嵌套多层的数组 array (嵌套可以是任何层数)转换为只有一层的数组。

1. 递归
2. toString()，利用这个一个特点`[1, [2, [3, 4]]].toString() // "1,2,3,4"`
3. reduce
4. 利用展开运算符

比较难理解的展开方式 `flatten = Function.apply.bind([].concat, [])` 相当于

```js
function(arg) {
  return [].concat(...arg)
}
```

## 在数组中查找指定元素

js提供的方法有很多indexOf 和 lastIndexOf 以及ES6推出的 findIndex , findLastIndex , find方法。

findIndex返回数组中满足提供的函数的第一个元素的索引，当然也可以自己手动实现一个，同样的还有 findLastIndex，它与 findIndex 整合可以写成一个函数

```js
function createIndexFinder(dir) {
  return function(array, predicate, context) {
    var length = array.length;
    var index = dir > 0 ? 0 : length - 1;
    // index += dir 通过dir来表示是正序还是倒序，很巧妙，不仅用于了区分，还用于循环变量的控制
    for (; index >= 0 && index < length; index += dir) {
      if (predicate.call(context, array[index], index, array)) return index;
    }
    return -1;
  }
}

var findIndex = createIndexFinder(1);
var findLastIndex = createIndexFinder(-1);
```

indexOf的实现

```js
// 第一版
function createIndexOfFinder(dir) {
  return function(array, item){
    var length = array.length;
    var index = dir > 0 ? 0 : length - 1;

    // 加入fromIndex的考虑
    if (typeof idx == "number") {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(length + idx, 0);
      }
      else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    }
    // 判断元素是否是 NaN
    if (item !== item) {
        // 在截取好的数组中查找第一个满足isNaN函数的元素的下标
        idx = predicate(array.slice(i, length), isNaN)
        return idx >= 0 ? idx + i: -1;
    }
    for (; index >= 0 && index < length; index += dir) {
      if (array[index] === item) return index;
    }
    return -1;
  }
}
var indexOf = createIndexOfFinder(1);
var lastIndexOf = createIndexOfFinder(-1);
```

## 通用遍历方法each的实现

根据参数的类型进行判断，如果是数组，就调用 for 循环，如果是对象，就使用 for in 循环，有一个例外是类数组对象，对于类数组对象，依然可以使用 for 循环。

```js
function each(obj, callback) {
  var length, i = 0;

  if (isArrayLike(obj)) {
    length = obj.length;
    for (; i < length; i++) {
      if (callback.call(obj[i], i, obj[i]) === false) {
        break;
      }
    }
  } else {
    for (i in obj) {
      if (callback.call(obj[i], i, obj[i]) === false) {
        break;
      }
    }
  }

  return obj;
}
```
