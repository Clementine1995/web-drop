# vue2 method 原理

1. methods 是怎么使用 实例 访问的？
2. methods 是如何固定作用域的

## methods 怎么使用实例访问？

遍历 methods 这个对象，然后逐个复制到 vue 实例上，简化源码：

```js
function initMethods(vm, methods) {
  for (var key in methods) {
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}
```

## methods 如何固定作用域的

其实 methods 的固定作用域的唯一重点就是 bind 了，Vue 使用了 bind 去绑定 methods 方法，考虑到 bind 有的浏览器不支持于是写了一个兼容方法，意思大概是这样

1. bind 函数需要传入作用域 context 和 函数 A
2. 然后 闭包保存 这个 context，返回一个新函数 B
3. B 执行的时候，使用 call 方法 直接绑定 函数 A 的作用域为 闭包保存的 context

下面是 Vue bind 兼容的源码

```js
function polyfillBind(fn, ctx) {
  function boundFn(a) {
    var l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  boundFn._length = fn.length
  return boundFn
}

function nativeBind(fn, ctx) {
  return fn.bind(ctx)
}

var bind = Function.prototype.bind ? nativeBind : polyfillBind
```
