# JS 继承

> 原文[JS 继承](https://lxchuan12.gitee.io/js-extend)

用过 React 的都熟悉，经常用 extends 继承 React.Component。

```js
// 部分源码
function Component(props, context, updater) {
  // ...
}
Component.prototype.setState = function (partialState, callback) {
  // ...
}
const React = {
  Component,
  // ...
}
// 使用
class index extends React.Component {
  // ...
}
```

## 构造函数、原型对象和实例之间的关系

要弄懂 extends 继承之前，先来复习一下构造函数、原型对象和实例之间的关系。 代码表示：

```js
function F() {}
var f = new F()
// 构造器
F.prototype.constructor === F // true
F.__proto__ === Function.prototype // true
Function.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true

// 实例
f.__proto__ === F.prototype // true
F.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true
```

一张图表示：

![img1](https://lxchuan12.gitee.io/assets/img/ctor-prototype-instance@lxchuan12.24657345.png)

## ES6 extends 继承做了什么操作

先看看这段包含静态方法的 ES6 继承代码：

```js
// ES6
class Parent {
  constructor(name) {
    this.name = name
  }
  static sayHello() {
    console.log("hello")
  }
  sayName() {
    console.log("my name is " + this.name)
    return this.name
  }
}
class Child extends Parent {
  constructor(name, age) {
    super(name)
    this.age = age
  }
  sayAge() {
    console.log("my age is " + this.age)
    return this.age
  }
}
let parent = new Parent("Parent")
let child = new Child("Child", 18)
console.log("parent: ", parent) // parent:  Parent {name: "Parent"}
Parent.sayHello() // hello
parent.sayName() // my name is Parent
console.log("child: ", child) // child:  Child {name: "Child", age: 18}
Child.sayHello() // hello
child.sayName() // my name is Child
child.sayAge() // my age is 18
```

其中这段代码里有两条原型链，看具体代码。

```js
// 1、构造器原型链
Child.__proto__ === Parent // true
Parent.__proto__ === Function.prototype // true
Function.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true
// 2、实例原型链
child.__proto__ === Child.prototype // true
Child.prototype.__proto__ === Parent.prototype // true
Parent.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true
```

一图胜千言，如图所示：

![img2](https://lxchuan12.gitee.io/assets/img/es6-extends@lxchuan12.dded51bd.png)

结合代码和图可以知道。 ES6 extends 继承，主要就是：

1. 把子类构造函数(Child)的原型(`__proto__`)指向了父类构造函数(Parent)，
2. 把子类实例 child 的原型对象(Child.prototype) 的原型(`__proto__`)指向了父类 parent 的原型对象(Parent.prototype)。
3. 子类构造函数 Child 继承了父类构造函数 Parent 的里的属性。使用 super 调用的(ES5 则用 call 或者 apply 调用传参)。 也就是图中用不同颜色标记的两条线。

看过《JavaScript 高级程序设计-第 3 版》 章节 6.3 继承的读者应该知道，这 2 和 3 小点，正是寄生组合式继承，书中例子没有第 1 小点。 1 和 2 小点都是相对于设置了`__proto__`链接。那问题来了，什么可以设置了`__proto__`链接呢。

## new、Object.create 和 Object.setPrototypeOf 可以设置`__proto__`

说明一下，`__proto__`这种写法是浏览器厂商自己的实现。 再结合一下图和代码看一下的 new，new 出来的实例的`__proto__`指向构造函数的 prototype，这就是 new 做的事情。

### new 做了什么

1. 创建了一个全新的对象。
2. 这个对象会被执行[[Prototype]]（也就是`__proto__`）链接。
3. 生成的新对象会绑定到函数调用的 this。
4. 通过 new 创建的每个对象将最终被[[Prototype]]链接到这个函数的 prototype 对象上。
5. 如果函数没有返回对象类型 Object(包含 Functoin, Array, Date, RegExg, Error)，那么 new 表达式中的函数调用会自动返回这个新的对象。

### Object.create ES5 提供的

Object.create(proto, [propertiesObject]) 方法创建一个新对象，使用现有的对象来提供新创建的对象的`__proto__`。 它接收两个参数，不过第二个可选参数是属性描述符（不常用，默认是 undefined）。对于不支持 ES5 的浏览器，MDN 上提供了 ployfill 方案。

```js
// 简版：也正是应用了new会设置__proto__链接的原理。
if (typeof Object.create !== "function") {
  Object.create = function (proto) {
    function F() {}
    F.prototype = proto
    return new F()
  }
}
```

### Object.setPrototypeOf ES6 提供的

Object.setPrototypeOf() 方法设置一个指定的对象的原型 ( 即, 内部[[Prototype]]属性）到另一个对象或 null。 Object.setPrototypeOf(obj, prototype)

```js
// ployfill
// 仅适用于Chrome和FireFox，在IE中不工作：
Object.setPrototypeOf =
  Object.setPrototypeOf ||
  function (obj, proto) {
    obj.__proto__ = proto
    return obj
  }
```

nodejs 源码就是利用这个实现继承的工具函数的。[nodejs utils inherits](https://github.com/nodejs/node/blob/master/lib/util.js#L295-L313)

```js
function inherits(ctor, superCtor) {
  if (ctor === undefined || ctor === null)
    throw new ERR_INVALID_ARG_TYPE("ctor", "Function", ctor)

  if (superCtor === undefined || superCtor === null)
    throw new ERR_INVALID_ARG_TYPE("superCtor", "Function", superCtor)

  if (superCtor.prototype === undefined) {
    throw new ERR_INVALID_ARG_TYPE(
      "superCtor.prototype",
      "Object",
      superCtor.prototype
    )
  }
  Object.defineProperty(ctor, "super_", {
    value: superCtor,
    writable: true,
    configurable: true,
  })
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype)
}
```

## ES6 的 extends 的 ES5 版本实现

知道了 ES6 extends 继承做了什么操作和设置`__proto__`的知识点后，把上面 ES6 例子的用 ES5 就比较容易实现了，也就是说实现寄生组合式继承，简版代码就是：

```js
// ES5 实现ES6 extends的例子
function Parent(name) {
  this.name = name
}
Parent.sayHello = function () {
  console.log("hello")
}
Parent.prototype.sayName = function () {
  console.log("my name is " + this.name)
  return this.name
}

function Child(name, age) {
  // 相当于super
  Parent.call(this, name)
  this.age = age
}
// new
function object() {
  function F() {}
  F.prototype = proto
  return new F()
}
function _inherits(Child, Parent) {
  // Object.create
  Child.prototype = Object.create(Parent.prototype)
  // __proto__
  // Child.prototype.__proto__ = Parent.prototype;
  Child.prototype.constructor = Child
  // ES6
  // Object.setPrototypeOf(Child, Parent);
  // __proto__
  Child.__proto__ = Parent
}
_inherits(Child, Parent)
Child.prototype.sayAge = function () {
  console.log("my age is " + this.age)
  return this.age
}
var parent = new Parent("Parent")
var child = new Child("Child", 18)
console.log("parent: ", parent) // parent:  Parent {name: "Parent"}
Parent.sayHello() // hello
parent.sayName() // my name is Parent
console.log("child: ", child) // child:  Child {name: "Child", age: 18}
Child.sayHello() // hello
child.sayName() // my name is Child
child.sayAge() // my age is 18
```

我们完全可以把上述 ES6 的例子通过 babeljs 转码成 ES5 来查看，更严谨的实现。

```js
// 对转换后的代码进行了简要的注释
"use strict"
// 主要是对当前环境支持Symbol和不支持Symbol的typeof处理
function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj
    }
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj
    }
  }
  return _typeof(obj)
}
// _possibleConstructorReturn 判断Parent。call(this, name)函数返回值 是否为null或者函数或者对象。
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call
  }
  return _assertThisInitialized(self)
}
// 如何 self 是void 0 （undefined） 则报错
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    )
  }
  return self
}
// 获取__proto__
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o)
      }
  return _getPrototypeOf(o)
}
// 寄生组合式继承的核心
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function")
  }
  // Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。
  // 也就是说执行后 subClass.prototype.__proto__ === superClass.prototype; 这条语句为true
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true,
    },
  })
  if (superClass) _setPrototypeOf(subClass, superClass)
}
// 设置__proto__
function _setPrototypeOf(o, p) {
  _setPrototypeOf =
    Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
      o.__proto__ = p
      return o
    }
  return _setPrototypeOf(o, p)
}
// instanceof操作符包含对Symbol的处理
function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return right[Symbol.hasInstance](left)
  } else {
    return left instanceof right
  }
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError("Cannot call a class as a function")
  }
}
// 按照它们的属性描述符 把方法和静态属性赋值到构造函数的prototype和构造器函数上
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i]
    descriptor.enumerable = descriptor.enumerable || false
    descriptor.configurable = true
    if ("value" in descriptor) descriptor.writable = true
    Object.defineProperty(target, descriptor.key, descriptor)
  }
}
// 把方法和静态属性赋值到构造函数的prototype和构造器函数上
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps)
  if (staticProps) _defineProperties(Constructor, staticProps)
  return Constructor
}

// ES6
var Parent = (function () {
  function Parent(name) {
    _classCallCheck(this, Parent)
    this.name = name
  }
  _createClass(
    Parent,
    [
      {
        key: "sayName",
        value: function sayName() {
          console.log("my name is " + this.name)
          return this.name
        },
      },
    ],
    [
      {
        key: "sayHello",
        value: function sayHello() {
          console.log("hello")
        },
      },
    ]
  )
  return Parent
})()

var Child = (function (_Parent) {
  _inherits(Child, _Parent)
  function Child(name, age) {
    var _this
    _classCallCheck(this, Child)
    // Child.__proto__ => Parent
    // 所以也就是相当于Parent.call(this, name); 是super(name)的一种转换
    // _possibleConstructorReturn 判断Parent.call(this, name)函数返回值 是否为null或者函数或者对象。
    _this = _possibleConstructorReturn(
      this,
      _getPrototypeOf(Child).call(this, name)
    )
    _this.age = age
    return _this
  }
  _createClass(Child, [
    {
      key: "sayAge",
      value: function sayAge() {
        console.log("my age is " + this.age)
        return this.age
      },
    },
  ])
  return Child
})(Parent)

var parent = new Parent("Parent")
var child = new Child("Child", 18)
console.log("parent: ", parent) // parent:  Parent {name: "Parent"}
Parent.sayHello() // hello
parent.sayName() // my name is Parent
console.log("child: ", child) // child:  Child {name: "Child", age: 18}
Child.sayHello() // hello
child.sayName() // my name is Child
child.sayAge() // my age is 18
```

## 总结

继承对于 JS 来说就是父类拥有的方法和属性、静态方法等，子类也要拥有。子类中可以利用原型链查找，也可以在子类调用父类，或者从父类拷贝一份到子类等方案。 继承方法可以有很多，重点在于必须理解并熟 悉这些对象、原型以及构造器的工作方式，剩下的就简单了。寄生组合式继承是开发者使用比较多的。 回顾寄生组合式继承。主要就是三点：

1. 子类构造函数的`__proto__`指向父类构造器，继承父类的静态方法。
2. 子类构造函数的 prototype 的`__proto__`指向父类构造器的 prototype，继承父类的方法。
3. 子类构造器里调用父类构造器，继承父类的属性。
