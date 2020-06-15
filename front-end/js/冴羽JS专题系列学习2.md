# 冴羽JS专题系列学习2

主要记录冴羽博客中JS深入系列阅读后的关键点记录与总结

>[冴羽的博客](https://github.com/mqyqingfeng/Blog)

## 如何判断两个对象相等

具体链接[JavaScript专题之如何判断两个对象相等](https://github.com/mqyqingfeng/Blog/issues/41)

## 函数柯里化

将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。它的作用就是参数复用。本质上是降低通用性，提高适用性。

简单理解就是用闭包把参数保存起来，当参数的数量足够执行函数了，就开始执行函数。

```js
function sub_curry(fn) {
  var args = [].slice.call(arguments, 1);
  // 实际上最后相当于n个底下这个函数调用，最里层是最开始传入的函数，然后一层一层把接收到的参数拼接这传进去
  return function() {
    return fn.apply(this, args.concat([].slice.call(arguments)));
  };
}

function curry(fn, length) {
  length = length || fn.length;
  var slice = Array.prototype.slice;

  return function() {
    if (arguments.length < length) {
      var combined = [fn].concat(slice.call(arguments));
      return curry(sub_curry.apply(this, combined), length - arguments.length);
    } else {
      return fn.apply(this, arguments);
    }
  };
}

var curry = fn =>
    (judge = (...args) =>
      args.length === fn.length
      ? fn(...args)
      : (...arg) => judge(...args, ...arg));
```

注意，上面的方法是通过function.length来判断函数的形参个数，但是形参的数量不包括剩余参数个数，仅包括第一个具有默认值之前的参数个数。

```js
((a, b, c = 3) => {}).length; // 2
((a, b = 2, c) => {}).length; // 1
((a = 1, b, c) => {}).length; // 0
((...args) => {}).length; // 0
```

当然了像 `add(1)(2)(3); // 5` 这种的调用方式也不一定是柯里化，也有可能是链式调用

## 偏函数

偏函数也叫局部应用，跟柯里化很相似，只不过它是固定一个函数的一个或者多个参数，也就是将一个 n 元函数转换成一个 n - x 元函数。

```js
支持占位符
var _ = {};

function partial(fn) {
    var args = [].slice.call(arguments, 1);
    return function() {
        var position = 0, len = args.length;
        for(var i = 0; i < len; i++) {
            args[i] = args[i] === _ ? arguments[position++] : args[i]
        }
        while(position < arguments.length) args.push(arguments[position++]);
        return fn.apply(this, args);
    };
};
var subtract = function(a, b) { return b - a; };
subFrom20 = partial(subtract, _, 20);
subFrom20(5);
```

## 惰性函数

利用闭包首次执行时进行赋值，后续再执行该函数时直接返回之前的赋值结果。

```js
// 需要写一个 foo 函数，这个函数返回 首次 调用时的 Date 对象
// 除了下面这种方法，也可以判断t是否存在来返回，不过这样会多一层判断
var foo = function() {
  var t = new Date();
  foo = function() {
    return t;
  };
  return foo();
};
```

## 函数组合

类似于 fn3(fn2(fn1(fn0(x)))) 这种的函数调用转换为 compose(fn3, fn2, fn1, fn0)，然后在调用时传入x。

```js
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
};

function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }
  // 利用reduce的合并功能
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

### pointfree

pointfree 指的是函数无须提及将要操作的数据是什么样的。先定义基本运算函数，这些可以封装起来复用。这也是函数式编程中一个重要的概念

```js
// 需求：输入 'kevin daisy kelly'，返回 'K.D.K'

// 非 pointfree，因为提到了数据：name
var initials = function (name) {
    return name.split(' ').map(compose(toUpperCase, head)).join('. ');
};

// pointfree
// 先定义基本运算
var split = curry(function(separator, str) { return str.split(separator) })
var head = function(str) { return str.slice(0, 1) }
var toUpperCase = function(str) { return str.toUpperCase() }
var join = curry(function(separator, arr) { return arr.join(separator) })
var map = curry(function(fn, arr) { return arr.map(fn) })

var initials = compose(join('.'), map(compose(toUpperCase, head)), split(' '));

initials("kevin daisy kelly");
```

pointfree 模式能够帮助我们减少不必要的命名，让代码保持简洁和通用，更符合语义，更容易复用，测试也变得轻而易举。

## 函数记忆

函数记忆是指将上次的计算结果缓存起来，当下次调用时，如果遇到相同的参数，就直接返回缓存中的数据。

原理上是比较简单的，只需要把参数以及对应的结果存到一个对象中，调用时判断该参数是否存在。

```js
// 第二版 (来自 underscore 的实现)
// 这个方法默认取第一个参数作为key，这样在多参数时，是不行的，所以要传入hasher函数，来自定义key值，可以考虑用JSON.stringify来序列化参数
var memoize = function(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!cache[address]) {
      cache[address] = func.apply(this, arguments);
    }
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
};
```

## 递归

程序调用自身的编程技巧称为递归，比较经典的例子就是阶乘，以及斐波那契数列的计算。

递归中比较关键的点就是递归条件（边界条件），如果递归条件出问题，有可能导致死循环。递归的特点：

+ 子问题须与原始问题为同样的事，且更为简单；
+ 不能无限制地调用本身，须有个出口，化简为非递归状况处理。

而与递归相关的一个优化就是尾调用，即函数内部最后一个动作是函数调用，而在递归中尾调用也叫做尾递归。

## 乱序

主要说数组的乱序，容易想到的是通过random函数来乱序。

```js
var values = [1, 2, 3, 4, 5];

values.sort(function(){
  return Math.random() - 0.5;
});

console.log(values)
```

不同的浏览器对sort的实现是不同的，有的是用插入排序或者快速排序等等方法。在插入排序的算法中，当待排序元素跟有序元素进行比较时，一旦确定了位置，就不会再跟位置前面的有序元素进行比较，所以就乱序的不彻底。所以有下面的 `Fisher–Yates`

```js
function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}
// ES6版本
function shuffle(a) {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
  return a;
}
```
