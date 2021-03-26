# 实现yyy

## 用reduce实现map

```js
const arr1 = [
  {
    name: '111',
    age: 22
  },
  {
    name: '222',
    age: 33
  }
]

console.log(arr1)
// [ { name: '111', age: 22 }, { name: '222', age: 33 } ]

function handle (cur, index, me) {
  cur.age += 1
  return cur
}

const myMap = (cb, arr) => {
  if (typeof cb !== 'function') throw 'error'
  return arr.reduce((acc, cur, index, me) => {
    let temp = cb(cur, index, me)
    return acc.concat(temp)
  }, [])
}

console.log(myMap(handle, arr1))
// [ { name: '111', age: 23 }, { name: '222', age: 34 } ]
```

## 用setTimeout和clearTimeout简单实现setInterval与clearInterval

>原文[用setTimeout和clearTimeout简单实现setInterval与clearInterval](https://juejin.im/post/5cd273d3e51d453ae03507ee)

```js
let timeId // 全局变量
const mySetInterval = (cb, time) => {
  const fn = () => {
    cb() // 执行传入的回调函数
    timeId = setTimeout(() => { // 闭包更新timeId
      fn() // 递归调用自己
    }, time)
  }
  timeId = setTimeout(fn, time) // 第一个setTimeout
  return timeId
}
mySetInterval(() => { // 此处id是Number类型，是值的拷贝而不是引用
  console.log(new Date())
}, 1000)

setTimeout(() => { // 2秒后清除定时器
  clearTimeout(timeId)
}, 2000)
```

## 实现new

>原文[详解 new/bind/apply/call 的模拟实现](https://juejin.im/post/5c90b800f265da60ee12d75f)

### new做了什么

1. 创建了一个全新的对象。
2. 这个对象会被执行[[Prototype]]（也就是__proto__）链接。
3. 生成的新对象会绑定到函数调用的this。
4. 通过new创建的每个对象将最终被[[Prototype]]链接到这个函数的prototype对象上。
5. 如果函数没有返回对象类型Object(包含Functoin, Array, Date, RegExg, Error)，那么new表达式中的函数调用会自动返回这个新的对象。

### 实现

```js
function mynew(){
  // 新建空对象
  var obj = {}
  // 第一个参数是构造函数
  var constructor = [].shift.call(arguments)
  // 其余的参数是构造函数的参数
  var args = [].slice.call(arguments)
  // 修改原型 var obj = Object.create(Constructor.prototype) 这种方式也可以
  obj.__proto__ = constructor.prototype
  // 修改构造函数上下文，为 obj 赋值
  var result = constructor.apply(obj, args)
  // 判断结果的类型, result || obj是考虑到构造函数也有可能return null...
  return (typeof result === 'object' || 'function') ? result || obj : obj
}

// 或者

const _new = (_Contructor, ...args) => {
  // 1.创建一个空的简单JavaScript对象（即{}）；
  const obj = {}
  // 2.链接该对象（即设置该对象的构造函数）到另一个对象 ；
  Object.setPrototypeOf(obj, _Contructor.prototype)
  // 3.将步骤1新创建的对象作为this的上下文 ；
  const ret = _Contructor.apply(obj, args)
  //4.如果该函数没有返回对象，则返回this。
  return ret instanceof Object ? ret : this
}
```

## 实现call

```js
// ES6实现
Function.prototype.call2 = (context, ...args) {
  const glo = typeof window === 'object' ? window : global
  context = context || glo
  let fn = Symbol();
  // 因为是要用目标对象来执行该函数，就把这个函数加到目标对象上，然后删除掉就可
  context[fn] = this;
  let result = context[fn](...args);
  delete context[fn];
  return result;
}

// ES3实现
Function.prototype.call = function (context) {
  // 这里没有考虑到如果传入context是，string,number之类的，原生call方法会把它变成对应的包装对象
  context = context || window;
  context.fn = this;

  var args = [];
  for(var i = 1, len = arguments.length; i < len; i++) {
      args.push('arguments[' + i + ']');
  }
  var result = eval('context.fn(' + args +')');

  delete context.fn
  return result;
}
```

## 实现apply

```js
// ES6
Function.prototype.apply2 = function(context,arr) {
  context = context || window;
  context.fn = this;
  let result = context.fn(...arr);
  delete context.fn
  return result;
}
// ES3
Function.prototype.apply = function (context, arr) {
  var context = Object(context) || window;
  context.fn = this;

  var result;
  if (!arr) {
    result = context.fn();
  }
  else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push('arr[' + i + ']');
    }
    result = eval('context.fn(' + args + ')')
  }
  delete context.fn
  return result;
}
```

## 实现bind

是用 apply 或 call 来实现的。有一点要注意，对象中函数的简写定义方式，与箭头函数是没有prototype的。

```js
Function.prototype.bind2 = function () {
  var self = this
  var context = [].shift.call(arguments)
  var args1 = [].slice.call(arguments)
  var result = function () {
    var args2 = Array.prototype.slice.call(arguments)
    var context = this instanceof result ? this : context
    return self.apply(context, args1.concat(args2))
  }
  // 为什么要要下面这一段？
  // bind 有一些关于继承的特性。bind返回新函数创建的对象与原函数创建的对象的原型相同，但是新函数没有原型
  var Agent = function () {}
  Agent.prototype = self.prototype
  result.prototype = new Agent()
  return result
}


Function.prototype.bind2 = function (context) {

  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);

  var fNOP = function () {};

  var fBound = function () {
    var bindArgs = Array.prototype.slice.call(arguments);

    return self.apply(this instanceof fBound ? this : context, args.concat(bindArgs));

    // 原生 bind 方法所返回的函数并不包含 prototype 属性，而是 undefined ，如果要更进一步更改，用作构造函数时，应该用 new 来实现，也就是下面这个
    if (this instanceof fBound) {
        var args2 = [];
        for(var i = 0, len = args.length; i < len; i++) {
            args2.push('args[' + i + ']');
        }
        for(var j = 0, len = bindArgs.length; j < len; j++) {
            args2.push('bindArgs[' + j + ']');
        }
        return eval('new self('+ args2 +')');
    } else {
        return self.apply(context, args.concat(bindArgs));
    }
  }

  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
}
```

```js
// 简单版
Function.prototype.bind1 = function(context, ...arr1) {
  let func = this;
  return function(...arr2) {
    func.apply(context, [...arr1, ...arr2]);
    //   func.call(context, ...arr1, ...arr2);
  }
}
```
