# 冴羽JS系列学习

主要记录冴羽博客中JS系列阅读后的关键点记录与总结

>[冴羽的博客](https://github.com/mqyqingfeng/Blog)

## 从原型到原型链

### prototype

每个函数都有一个 prototype 属性，不只是构造函数，而这个 prototype 指向了一个对象，这个对象正是调用该构造函数而创建的实例的原型。

而原型就是每一个JS对象在创建时都会关联的一个对象，每个对象都会从原型上”继承“一些属性。

获得一个对象的原型可以通过这个方法：`Object.getPrototypeOf(obj)`

```js
function Person() {

}
// 虽然写在注释里，但是你要注意：
// prototype是函数才会有的属性
Person.prototype.name = 'Kevin';
var person1 = new Person();
var person2 = new Person();
console.log(person1.name) // Kevin
console.log(person2.name) // Kevin
```

### __proto__

这个是每个对象（实例）都会具有的一个属性（null除外）,而它会指向该对象的原型

```js
function Person() {

}
var person = new Person();
console.log(person.__proto__ === Person.prototype); // true
```

绝大部分浏览器都支持这个非标准的方法访问原型，然而它并不存在于 Person.prototype 中，实际上，它是来自于 Object.prototype ，与其说是一个属性，不如说是一个 getter/setter，当使用 obj.__proto__ 时，可以理解成返回了 Object.getPrototypeOf(obj)。

### constructor

实例跟构造函数都可以指向原型，而 constructor 可以指向构造函数，它存在于原型上。

```js
function Person() {

}
console.log(Person === Person.prototype.constructor); // true
```

实例上是没有 constructor 这个属性的，但是通过实例对象却能访问到，是因为下面的原型链。

### 原型链

原型链其实就是访问对象某个属性时，这个属性的查找顺序。

当读取实例的属性时，如果找不到，就会查找与对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层为止。

一般对象的原型尽头是 Object.prototype ，Object没有原型，null在js是没有对象的意思，所以`Object.prototype.__proto__ === null`，也可能是在底层设置好的，不然打印可能是undefined或者报错。

注意：**Function__proto__===Function.prototype**

这个问题 Function 作为构造函数

如果new Function()必然会生成一个函数对象，而所有的生成的函数对象都继承自一个匿名函数对象，所以Function.prototype指向了function anonymous()。

而它作为对象Function就是一个名字叫Function的函数对象，对象继承字一个匿名的函数对象，所以Function.__proto__ 指向了function anonymous()

### 从原型到原型链补充

instanceof 运算符用来检测 constructor.prototype 是否存在于参数 object 的原型链上。

>[浅谈 instanceof 和 typeof 的实现原理](https://juejin.im/post/5b0b9b9051882515773ae714)
>
>[一文带你深入剖析 instanceof 运算符](https://juejin.im/post/5d6e5c3d6fb9a06ae0721f5f)

## 词法作用域和动态作用域

作用域是指程序源代码中定义变量的区域。

作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。

JavaScript 采用词法作用域(lexical scoping)，也就是静态作用域。也就是函数的作用域在函数定义的时候就决定了，动态作用域和静态作用域，决定了是作用域链的顺序。

## 执行上下文栈

下面还是ES3中的实现

### 可执行代码

可执行代码有：全局代码、函数代码、eval代码。

当执行到一个函数的时候，就会进行准备"执行上下文(execution context)"。

### 执行上下文栈相关

执行上下文栈来管理众多函数的执行上下文，当 JavaScript 开始要解释执行代码的时候，最先遇到的就是全局代码，所以初始化的时候首先就会向执行上下文栈压入一个全局执行上下文，用 globalContext 表示它，并且只有当整个应用程序结束的时候，ECStack 才会被清空，程序结束之前，ECStack 最底部永远有个 globalContext。

举例来说：

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
```

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

这两个的区别就是，第一个例子中 checkscope 还未从执行上下文栈中出来的时候，f又被压入了执行上下文栈，而第二个例子，checkscope出栈后，f在被压入。

## 变量对象

每个执行上下文，都有三个重要属性

+ 变量对象(Variable object，VO)
+ 作用域链(Scope chain)
+ this

```js
executionContextObj = {
    'scopeChain' : {/* 变量对象 + 所有父级上下文变量对象 */},
    'variableObject': { /* 函数的参数, 内部变量和函数声明 */ },
    'this': {}
}
```

### 全局上下文

+ 可以通过 this 引用，在客户端 JavaScript 中，全局对象就是 Window 对象。
+ 全局对象是由 Object 构造函数实例化的一个对象。
+ 预定义了一大堆函数和属性。
+ 作为全局变量的宿主。
+ 客户端 JavaScript 中，全局对象有 window 属性指向自身。

### 函数上下文

每次调用一个执行上下文(Execution context)都会分为两个阶段.

1. 创建阶段.[当一个函数被调用,但是在执行任何内部代码之前]
    1. 创建一个作用域链(Scope chain)
    2. 创建变量,函数和函数的调用参数.
    3. 确定this的值
2. 激活/代码执行阶段:
    1. 变量赋值, 函数引用以及代码块的执行.

#### 激活 / 变量对象[AO/VO]

>额外参考[JS的执行上下文和堆栈详解](https://pjf.name/blogs/what-is-execution-context-and-stack-in-javascript.html)

当一个函数在被调用但是真正执行之前, 会创建上面说的executionContextObj. 这是第一步, 创建阶段. 此时, 解释器通过扫描函数的参数或者传入的参数, 内部函数的定义和变量的声明来创建这个对象(executionContextObj)。

1. 找到调用这个函数的所有代码
2. 在执行函数之前, 创建执行上下文(execution context)
3. 进入创建阶段:
    1. 初始化作用域链(scope chain)
    2. 创建变量对象
        1. 创建参数对象,检查参数的上下文,初始化其名称和值并创建一个副本.
            1. 调用函数时，会为其创建一个Arguments对象，并自动初始化局部变量arguments，指代该Arguments对象。所有作为参数传入的值都会成为Arguments对象的数组元素。
        2. 扫描上下文中所有的函数声明
            1. 每个函数被找到的时候, 在variable object中创建一个对应函数名称的属性, 其值是一内存中指向该函数的指针引用.
            2. 如果这个函数已经存在,该指针引用会被覆盖.
        3. 扫描上下文中所有变量的声明
            1. 当一个变量被找到的时候, 在variable object中创建其对应变量名的属性, 并将其值初始化为undefined
            2. 如果这个变量名的key已经存在于variable object中时, 跳过本次扫描.
        4. 确定this在上下文中的值
4. 激活/代码执行阶段
    1. 解释器逐行执行函数内的代码, 变量也在此时被赋值

注意：

+ 函数声明出现在代码块中，javascript 引擎不会将其作为函数声明处理，而是处理成函数表达式。
  + 允许在块级作用域内声明函数。
  + 函数声明类似于var，即会提升到全局作用域或函数作用域的头部。
  + 同时，函数声明还会提升到所在的块级作用域的头部。
+ 函数中的变量如果没有通过 var 关键字或者其他 let, const 声明，不会被存放在 AO 中。

```js
var a;
if(true) {
  a = 5;
  function a() {};
  a = 0;
}
console.log(a) // 5
```

发生了下面的事情：

1. 因为代码块中有函数声明，所以块外块内有两个变量 a，即使块外不写var a，依然会存在一个
2. 块内函数声明提升，并赋值给块内的a
3. 块内 a = 5 时，覆盖了块内的函数声明
4. 到函数声明的位置时，会给块外的变量a赋值，但此时块内的 a 已经是5，所以块外的5赋值为5
5. a = 0，给块内的 a 重新赋值

```js
var a¹;
if (true) {
  function a²() {} // 声明提升
  a² = 5;
  a¹ = a²; // 在原来a函数声明的位置，存在给外部a赋值的操作
  a² = 0;
  console.log(a²)
}
console.log(a¹);
```

ES5以及ES6中对执行上下文做了更改：

>最新的JS执行上下文[JavaScript的运行机制](https://www.cxymsg.com/guide/mechanism.html#javascript%E7%9A%84%E6%89%A7%E8%A1%8C%E7%8E%AF%E5%A2%83)
>
>或者这一篇[理解 JavaScript 中的执行上下文和执行栈](https://juejin.im/post/5ba32171f265da0ab719a6d7)
>
>在ES5规范中，环境记录项被简单地分为声明式环境记录项和对象式环境记录项；在ES6中，新增加了一个全局环境记录项

## 作用域链

当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做作用域链。

当然ES6以后应该是通过外部词法环境的引用来进行查找。

### 作用域链创建流程

+ 函数被创建(声明)，保存作用域链(保存父级变量对象)到内部属性 `[[scopes]]`
+ 执行函数，创建函数执行上下文，函数执行上下文被压入执行上下文栈
+ 函数并不立刻执行，开始做准备工作，第一步：复制函数 `[[scopes]]`属性创建作用域链
+ 第二步：用 arguments 创建活动对象，随后初始化活动对象，加入形参、函数声明、变量声明
+ 第三步：将活动对象压入函数作用域链顶端
+ 准备工作做完，开始执行函数，随着函数的执行，修改 AO 的属性值
+ 函数执行完毕

注意：

1. 函数的内部属性 `[[scopes]]` 是在函数声明之后就有的，而作用域链中加入它是在函数准备执行上下文时。
2. 引擎不同，在嵌套函数内部函数的作用域链如果没有引用外部函数的任何变量，可能不会加入外部函数的环境引用

## 从ECMAScript规范解读this

>[换个角度看 JavaScript 中的 (this)](https://juejin.im/post/5c1c5bfcf265da614c4cc40e)
>
>[根治JavaScript中的this-ECMAScript规范解读](http://liyangready.github.io/2016/07/31/%E6%A0%B9%E6%B2%BBJavaScript%E4%B8%AD%E7%9A%84this-ECMAScript%E8%A7%84%E8%8C%83%E8%A7%A3%E8%AF%BB/)

一个函数上下文中确定this值的通用规则如下：在一个函数上下文中，this由调用者提供，由调用函数的方式来决定。如果调用括号()的左边是引用类型的值，this将设为引用类型值的base对象（base object），在其他情况下（与引用类型不同的任何其它属性），这个值为null。不过，实际不存在this的值为null的情况，因为当this的值为null的时候，其值会被隐式转换为全局对象。注：第5版的ECMAScript中，已经不强迫转换成全局变量了，而是赋值为undefined。

基本上，在调用一个函数的时候最主要还是看()左边的到底是什么，然后再查看调用时的 EnvironmentRecord ，根据上一节它里面记录了调用环境的所有信息。

>补充[运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
>