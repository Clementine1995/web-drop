# 冴羽 JS 深入系列学习

主要记录冴羽博客中 JS 深入系列阅读后的关键点记录与总结

> [冴羽的博客](https://github.com/mqyqingfeng/Blog)
>
> 扩展阅读[深入理解 JavaScript 系列](https://www.cnblogs.com/TomXu/tag/JavaScript/default.html?page=1)
>
> ES 规范[ECMAScript® 2021 Language Specification](https://tc39.es/ecma262/)

## 从原型到原型链

### prototype

每个函数都有一个 prototype 属性，不只是构造函数，而这个 prototype 指向了一个对象，这个对象正是调用该构造函数而创建的实例的原型。

而原型就是每一个 JS 对象在创建时都会关联的一个对象，每个对象都会从原型上”继承“一些属性。

获得一个对象的原型可以通过这个方法：`Object.getPrototypeOf(obj)`

```js
function Person() {}
// 虽然写在注释里，但是你要注意：
// prototype是函数才会有的属性
Person.prototype.name = "Kevin";
var person1 = new Person();
var person2 = new Person();
console.log(person1.name); // Kevin
console.log(person2.name); // Kevin
```

### `__proto__`

这个是每个对象（实例）都会具有的一个属性（null 除外）,而它会指向该对象的原型

```js
function Person() {}
var person = new Person();
console.log(person.__proto__ === Person.prototype); // true
```

绝大部分浏览器都支持这个非标准的方法访问原型，然而它并不存在于 Person.prototype 中，实际上，它是来自于 Object.prototype ，与其说是一个属性，不如说是一个 getter/setter，当使用 `obj.__proto__` 时，可以理解成返回了 Object.getPrototypeOf(obj)。

### constructor

实例跟构造函数都可以指向原型，而 constructor 可以指向构造函数，它存在于原型上。

```js
function Person() {}
console.log(Person === Person.prototype.constructor); // true
```

实例上是没有 constructor 这个属性的，但是通过实例对象却能访问到，是因为下面的原型链。

### 原型链

原型链其实就是访问对象某个属性时，这个属性的查找顺序。

当读取实例的属性时，如果找不到，就会查找与对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层为止。

一般对象的原型尽头是 Object.prototype ，Object 没有原型，null 在 js 是没有对象的意思，所以`Object.prototype.__proto__ === null`，也可能是在底层设置好的，不然打印可能是 undefined 或者报错。

注意：`Function.__proto__ === Function.prototype`

这个问题 Function 作为构造函数

如果 new Function()必然会生成一个函数对象，而所有的生成的函数对象都继承自一个匿名函数对象，所以 Function.prototype 指向了 function anonymous()。

而它作为对象 Function 就是一个名字叫 Function 的函数对象，对象继承字一个匿名的函数对象，所以 `Function.__proto__` 指向了 function anonymous()

### 从原型到原型链补充

instanceof 运算符用来检测 constructor.prototype 是否存在于参数 object 的原型链上。

> [浅谈 instanceof 和 typeof 的实现原理](https://juejin.im/post/5b0b9b9051882515773ae714)
>
> [一文带你深入剖析 instanceof 运算符](https://juejin.im/post/5d6e5c3d6fb9a06ae0721f5f)

## 词法作用域和动态作用域

作用域是指程序源代码中定义变量的区域。

作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。

JavaScript 采用词法作用域(lexical scoping)，也就是静态作用域。也就是函数的作用域在函数定义的时候就决定了，动态作用域和静态作用域，决定了是作用域链的顺序。

## 执行上下文栈

下面还是 ES3 中的实现

### 可执行代码

可执行代码有：全局代码、函数代码、eval 代码。

当执行到一个函数的时候，就会进行准备"执行上下文(execution context)"。

### 执行上下文栈相关

执行上下文栈来管理众多函数的执行上下文，当 JavaScript 开始要解释执行代码的时候，最先遇到的就是全局代码，所以初始化的时候首先就会向执行上下文栈压入一个全局执行上下文，用 globalContext 表示它，并且只有当整个应用程序结束的时候，ECStack 才会被清空，程序结束之前，ECStack 最底部永远有个 globalContext。

举例来说：

```js
var scope = "global scope";
function checkscope() {
  var scope = "local scope";
  function f() {
    return scope;
  }
  return f();
}
checkscope();
```

```js
var scope = "global scope";
function checkscope() {
  var scope = "local scope";
  function f() {
    return scope;
  }
  return f;
}
checkscope()();
```

这两个的区别就是，第一个例子中 checkscope 还未从执行上下文栈中出来的时候，f 又被压入了执行上下文栈，而第二个例子，checkscope 出栈后，f 在被压入。

## 变量对象

每个执行上下文，都有三个重要属性

- 变量对象(Variable object，VO)
- 作用域链(Scope chain)
- this

```js
executionContextObj = {
  scopeChain: {
    /* 变量对象 + 所有父级上下文变量对象 */
  },
  variableObject: {
    /* 函数的参数, 内部变量和函数声明 */
  },
  this: {},
};
```

### 全局上下文

- 可以通过 this 引用，在客户端 JavaScript 中，全局对象就是 Window 对象。
- 全局对象是由 Object 构造函数实例化的一个对象。
- 预定义了一大堆函数和属性。
- 作为全局变量的宿主。
- 客户端 JavaScript 中，全局对象有 window 属性指向自身。

### 函数上下文

每次调用一个执行上下文(Execution context)都会分为两个阶段.

1. 创建阶段.[当一个函数被调用,但是在执行任何内部代码之前]
   1. 创建一个作用域链(Scope chain)
   2. 创建变量,函数和函数的调用参数.
   3. 确定 this 的值
2. 激活/代码执行阶段:
   1. 变量赋值, 函数引用以及代码块的执行.

#### 激活 / 变量对象[AO/VO]

> 额外参考[JS 的执行上下文和堆栈详解](https://pjf.name/blogs/what-is-execution-context-and-stack-in-javascript.html)

当一个函数在被调用但是真正执行之前, 会创建上面说的 executionContextObj. 这是第一步, 创建阶段. 此时, 解释器通过扫描函数的参数或者传入的参数, 内部函数的定义和变量的声明来创建这个对象(executionContextObj)。

1. 找到调用这个函数的所有代码
2. 在执行函数之前, 创建执行上下文(execution context)
3. 进入创建阶段:
   1. 初始化作用域链(scope chain)
   2. 创建变量对象
      1. 创建参数对象,检查参数的上下文,初始化其名称和值并创建一个副本.
         1. 调用函数时，会为其创建一个 Arguments 对象，并自动初始化局部变量 arguments，指代该 Arguments 对象。所有作为参数传入的值都会成为 Arguments 对象的数组元素。
      2. 扫描上下文中所有的函数声明
         1. 每个函数被找到的时候, 在 variable object 中创建一个对应函数名称的属性, 其值是一内存中指向该函数的指针引用.
         2. 如果这个函数已经存在,该指针引用会被覆盖.
      3. 扫描上下文中所有变量的声明
         1. 当一个变量被找到的时候, 在 variable object 中创建其对应变量名的属性, 并将其值初始化为 undefined
         2. 如果这个变量名的 key 已经存在于 variable object 中时, 跳过本次扫描.
      4. 确定 this 在上下文中的值
4. 激活/代码执行阶段
   1. 解释器逐行执行函数内的代码, 变量也在此时被赋值

注意：

- 函数声明出现在代码块中，javascript 引擎不会将其作为函数声明处理，而是处理成函数表达式。
  - 允许在块级作用域内声明函数。
  - 函数声明类似于 var，即会提升到全局作用域或函数作用域的头部。
  - 同时，函数声明还会提升到所在的块级作用域的头部。
- 函数中的变量如果没有通过 var 关键字或者其他 let, const 声明，不会被存放在 AO 中。

```js
var a;
if (true) {
  a = 5;
  function a() {}
  a = 0;
}
console.log(a); // 5
```

发生了下面的事情：

1. 因为代码块中有函数声明，所以块外块内有两个变量 a，即使块外不写 var a，依然会存在一个
2. 块内函数声明提升，并赋值给块内的 a
3. 块内 a = 5 时，覆盖了块内的函数声明
4. 到函数声明的位置时，会给块外的变量 a 赋值，但此时块内的 a 已经是 5，所以块外的 5 赋值为 5
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

ES5 以及 ES6 中对执行上下文做了更改：

> 最新的 JS 执行上下文[JavaScript 的运行机制](https://www.cxymsg.com/guide/mechanism.html#javascript%E7%9A%84%E6%89%A7%E8%A1%8C%E7%8E%AF%E5%A2%83)
>
> 或者这一篇[理解 JavaScript 中的执行上下文和执行栈](https://juejin.im/post/5ba32171f265da0ab719a6d7)
>
> 在 ES5 规范中，环境记录项被简单地分为声明式环境记录项和对象式环境记录项；在 ES6 中，新增加了一个全局环境记录项

## 作用域链

当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做作用域链。

当然 ES6 以后应该是通过外部词法环境的引用来进行查找。

### 作用域链创建流程

- 函数被创建(声明)，保存作用域链(保存父级变量对象)到内部属性 `[[scopes]]`
- 执行函数，创建函数执行上下文，函数执行上下文被压入执行上下文栈
- 函数并不立刻执行，开始做准备工作，第一步：复制函数 `[[scopes]]`属性创建作用域链
- 第二步：用 arguments 创建活动对象，随后初始化活动对象，加入形参、函数声明、变量声明
- 第三步：将活动对象压入函数作用域链顶端
- 准备工作做完，开始执行函数，随着函数的执行，修改 AO 的属性值
- 函数执行完毕

注意：

1. 函数的内部属性 `[[scopes]]` 是在函数声明之后就有的，而作用域链中加入它是在函数准备执行上下文时。
2. 引擎不同，在嵌套函数内部函数的作用域链如果没有引用外部函数的任何变量，可能不会加入外部函数的环境引用

## 从 ECMAScript 规范解读 this

> [换个角度看 JavaScript 中的 (this)](https://juejin.im/post/5c1c5bfcf265da614c4cc40e)
>
> [根治 JavaScript 中的 this-ECMAScript 规范解读](http://liyangready.github.io/2016/07/31/%E6%A0%B9%E6%B2%BBJavaScript%E4%B8%AD%E7%9A%84this-ECMAScript%E8%A7%84%E8%8C%83%E8%A7%A3%E8%AF%BB/)

一个函数上下文中确定 this 值的通用规则如下：在一个函数上下文中，this 由调用者提供，由调用函数的方式来决定。如果调用括号()的左边是引用类型的值，this 将设为引用类型值的 base 对象（base object），在其他情况下（与引用类型不同的任何其它属性），这个值为 null。不过，实际不存在 this 的值为 null 的情况，因为当 this 的值为 null 的时候，其值会被隐式转换为全局对象。注：第 5 版的 ECMAScript 中，已经不强迫转换成全局变量了，而是赋值为 undefined。

基本上，在调用一个函数的时候最主要还是看()左边的到底是什么，然后再查看调用时的 EnvironmentRecord ，根据上一节它里面记录了调用环境的所有信息。

> 补充[运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)

一个问题

```js
var b = 10;
(function b() {
  b = 20;
  console.log(b); // 打印函数
})();
```

- 立即执行表达式里如果被执行的语句是一个具名的函数表达式，会被作为 Function Object 的 [[Environment]] 内部属性的字段之一。在执行时，函数若是访问该函数名，访问的就是这个函数本身，而不会再向上查找。
- 或者第二种说法：立即执行表达式如果一个函数定义表达式包含名称，函数的局部作用域将会包含一个绑定到函数对象的名称。实际上，函数的名称将成为函数内部的一个局部变量。
- 一般情况下，如果出现 temp=10；这样的给未声明变量赋值的操作，temp 会声明为全局变量。~~但是如果这样的情况出现在立即表达式中，temp 会被声明为局部变量而不是全局变量~~。
- 非匿名自执行函数，函数名只读

## 闭包

ECMAScript 中，闭包指的是：

- 从理论角度：所有的函数。因为它们都在创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。
- 从实践角度：以下函数才算是闭包：
  - 即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
  - 在代码中引用了自由变量

主要还是因为函数的执行上下文中维护了外部环境的引用，而这个引用是在函数声明的时候就加入的。

## 参数按值传递

ECMAScript 中所有函数的参数都是按值传递的。参数传递分为值传递、引用传递，这里为啥说都是值传递呢，因为就算传递对象数组这种引用类型，也只是把对应的**地址**拷贝一份传递给形参。

## call,apply 模拟实现

看实现 yyy.md

## new 的模拟实现

看实现 yyy.md

注意：Object.create(null) 是创建一个没有任何属性的空对象，所以不能用在这里

## 类数组对象与 arguments

- 拥有一个 length 属性和若干索引属性的对象
- 拥有与数组类似的行为，可以通过数字下标读取属性，可以遍历，但是没有数组的方法
- 可以通过 slice, splice, Array.from, contat 等方式将类数组转换为数组，一些 length 只读的类数组，splice 不能转换
- Arguments 对象也是一个类数组，它只存在于函数体中，包括了函数的参数（实参）以及其他属性
  - length 可以访问实参的个数（不是形参个数）
  - callee 表示函数本身，可以通过它递归调用
  - 以及 Symbol(Symbol.iterator)表示可迭代
  - 传入的实参(非严格模式)和 arguments 的值会共享
  - 最好不要去操作 arguments，比如把它 return 出去
  - 箭头函数没有 arguments

## 创建对象的多种方式以及优缺点

1. 工厂模式，通过 new Object 出的实例来扩展属性，调用时不使用 new,创建的对象无法识别，都是 Object 的实例。
2. 构造函数模式，如果实例中有函数，那么每次创建实例都会新创建一次其中函数
3. 原型模式，所有的属性都存放于原型之上，属性共享且无法传递初始化参数
4. 组合模式，共享属性放至原型，私有属性通过构造函数设置
   4.1 动态组合模式，将设置原型共有属性逻辑，放至构造函数内，如果有没有该属性，向原型设置，否则不处理，注意这时不能用对象字面量去覆盖原型
5. 寄生构造模式，其实就是工厂模式通过 new 来调用。
   5.1 稳妥构造函数模式，其中不引用 this，不过创建的对象也不能识别

## 继承的多种方式和优缺点

1. 原型链继承，将子级的原型设置为父级的实例对象。缺点就是父级中的引用类型会被子级共享，并且无法像父级构造函数传参。这种情况其实子级构造函数已经没有了自己的原型
2. 经典继承（借用构造函数），在子级中通过 apply 调用父级构造函数，Parent.call(this)，因为是传递的子级实例 this,来解决原型链继承存在共享等问题，缺点就是方法都定义在构造函数中，每创建一次实例都会创建一次方法，而且无法访问到父级原型上的属性
3. 组合继承，在经典继承的基础上，将共享方法移至原型上，同时要将子级原型对象设置为父级实例，原型对象的构造属性再指回子级构造函数，缺点是会调用两次父级构造函数，一次设置原型对象，一次新建实例
4. 原型式继承，与原型链继承类似，只不过它是直接将一个对象作为子级的原型对象，也存在共享问题
5. 寄生式继承，创建一个封装继承过程的函数，然后再函数内来增强对象
6. 寄生组合式继承，为了解决组合继承父级构造方法调用两次的问题，引入一个中间构造函数，将其原型设置为父级原型对象，再将子级原型对象设置为中间构造函数的实例。

几个问题：

- Child.prototype = Object.create(Parent.prototype);和 Child.prototype = new Parent(); 都可以用来继承，但是后者会继承 Parent 构造函数中的属性，同时也会导致父级构造函数调用两次，产生额外属性
- 有关 JS 执行文章[从浏览器多进程到 JS 单线程，JS 运行机制最全面的一次梳理](https://juejin.im/post/5a6547d0f265da3e283a1df7)，[这一次，彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89)
- 关于数组的继承，上面几种方法都不能完美实现。可以参考文章[为什么 es5 不能完美继承数组](https://github.com/wengjq/Blog/issues/22)

## 浮点数精度

关于 0.1 + 0.2 != 0.3

ECMAScript 中的 Number 类型使用 IEEE754 标准来表示整数和浮点数值，浮点数值采用的就是**双精确度**。

浮点数转二进制，小数部分不断乘以 2，每乘一次取整数位作为小数二进制的对应位，十分位，百分位往后推。

而浮点数的存储采用： `Value = sign * exponent * fraction` 这种方式，sign 标志位，exponent 指数位，fraction 分数位

举个例子，就拿 0.1 来看，对应二进制是 `1 * 1.1001100110011…… * 2^-4`， Sign 是 0，E + bias 是 -4 + 1023 = 1019，1019 用二进制表示是 1111111011，Fraction 是 1001100110011……，所以它在存储的时候已经发生了精度丢失，在运算经过 对阶、尾数运算、规格化、舍入处理、溢出判断 之后肯定也是丢失精度的

- 以指定的精度返回该数值对象的字符串表示可以使用 toPrecision 方法
- 二进制转十进制 parseInt(1100100,2)
- 十进制转二进制 parseFloat(0.1).toString(2)

## 类型转换

配合这两篇文章[从 206 个 console.log()完全弄懂数据类型转换的前世今生(上)](https://juejin.im/post/5e7f8314e51d4546fa4511c9)，[从 206 个 console.log()完全弄懂数据类型转换的前世今生(下)](https://juejin.im/post/5e86e73e518825739e0704b4)
