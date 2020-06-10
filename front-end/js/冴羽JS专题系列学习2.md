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
