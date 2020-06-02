# 冴羽JS专题系列学习

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
3. 排序后去重，排序后去重只需要比较当前元素与上一元素是否相同
4. filter，可以使用filter来代替命令式的for循环
5. Object键值对，通过对象某个键是否已经有值来判断重复
6. Set，使用ES6新增的Set来去重

Object键值对在去重时，考虑到对象、NaN、1、'1'等等作为键值可能导致去重失败的情况，采用了typeof + JSON.stringify的方式。stringify对于null跟Null都是null，对于1和'1'又是不同的。
