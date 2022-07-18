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
