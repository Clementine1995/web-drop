# js中的call、apply、bind

>参考自[js中call、apply、bind那些事](https://qianlongo.github.io/2016/04/26/js%E4%B8%ADcall%E3%80%81apply%E3%80%81bind%E9%82%A3%E4%BA%9B%E4%BA%8B/#more)，[this、apply、call、bind](https://juejin.im/post/59bfe84351882531b730bac2)，[JS中的call、apply、bind方法](https://juejin.im/post/582bcd36d203090067edb8a0)

## 作用以及异同

作用：改变函数执行时的上下文，再具体一点就是改变函数运行时的this指向。

共同：第一个参数都是this要指向的对象，都可以利用后续参数传参。

不同：bind 是返回改变了上下文后的一个函数。，便于稍后调用；apply 、call 则是立即调用 。

## this

在介绍这三个函数之前需要，先了解this，毕竟这三个函数都是为了改变运行时的this指向。

this 是指当前函数中正在执行的上下文环境，在 ES5 中，其实 this 的指向，始终坚持一个原理：**this 永远指向最后调用它的那个对象**。

先看几个例子：

```js
var str = "global";
function a() {
  var name = "qqwrv";
  console.log(this.name);          // global
  console.log("inner:" + this);    // inner: Window
}
a();
console.log("outer:" + this)  // outer: Window
```

为什么`console.log(this.name);`打印的是global呢？根据刚刚的那句话“this 永远指向最后调用它的那个对象”，最后调用 a 的地方 a();，前面没有调用的对象默认就是全局对象 window，也就相当于是 window.a()。

```js
var name = "global";
var a = {
    name: "qqwrv",
    fn : function () {
        console.log(this.name);
    }
}
window.a.fn();  // qqwrv
```

this 永远指向最后调用它的那个对象，最后调用它的对象仍然是对象 a，所以打印qqwrv。

```js
var name = "global";
var a = {
    name : null,
    fn : function () {
        console.log(this.name);
    }
}

var f = a.fn;
f();  // global
```

这里虽然将 a 对象的 fn 方法赋值给变量 f 了，但是没有调用，由于刚刚的 f 并没有调用，所以 fn() 最后仍然是被 window 调用的。所以 this 指向的也就是 window。

那么怎么改变this的指向呢？这里主要介绍call、apply、bind

+ 使用 ES6 的箭头函数（箭头函数中没有 this 绑定，必须通过查找作用域链来决定其值，如果箭头函数被非箭头函数包含，则 this 绑定的是最近一层非箭头函数的 this，否则，this 为 undefined）
+ 在函数内部使用 _this = this
+ 使用 apply、call、bind
+ new 实例化一个对象

## call

语法：`call([thisObj[,arg1[, arg2[, [,.argN]]]]])`

说明：call 方法可将一个函数的对象上下文从初始的上下文改变为由 thisObj 指定的新对象。

thisObj的取值有以下4种情况：

1. 不传，或者传null,undefined， 函数中的this指向window对象
2. 传递另一个函数的函数名，函数中的this指向这个函数的引用
3. 传递字符串、数值或布尔类型等基础类型，函数中的this指向其对应的包装对象，如 String、Number、Boolean
4. 传递一个对象，函数中的this指向这个对象

```js
function Animal(){
  this.name="animal";
  this.showName=function(){
    console.log(this.name);
  }
}
function Dog(){
  this.name="dog";
}
var animal=new Animal();
var dog=new Dog();

animal.showName.call(dog); // dog
```

没有输出animal是因为animal.showName.call(dog)执行的时候，this绑定的是dog这个对象，而dog.name也就是'dog'了。

## apply

语法：`apply([thisObj[,argArray]])`

说明：如果 argArray 不是一个有效的数组或者不是 arguments 对象，那么将导致一个 TypeError。如果没有提供 argArray 和 thisObj 任何一个参数，那么 Global 对象将被用作 thisObj， 并且无法被传递任何参数。

对于 apply、call 二者而言，作用完全一样，只是接受参数的方式不太一样。

注意：apply可以将一个数组默认的转换为一个参数列表([param1,param2,param3] 转换为 param1,param2,param3) ，这样就可以用与Math.min，push等方法。

## bind

bind()方法会创建一个新函数，称为绑定函数，当调用这个绑定函数时，绑定函数会以创建它时传入 bind()方法的第一个参数作为 this，传入 bind() 方法的**第二个以及以后的参数加上绑定函数运行时本身的参数**按照顺序作为原函数的参数来调用原函数。

bind在使用时与call、apply类似，只不过它会返回一个函数而不是立即执行。

## 应用

### 求数组中的最大和最小值

```js
var arr = [34,5,3,6,54,6,-67,5,7,6,-8,687];
Math.max.apply(Math, arr);
Math.max.call(Math, 34,5,3,6,54,6,-67,5,7,6,-8,687);
Math.min.apply(Math, arr);
Math.min.call(Math, 34,5,3,6,54,6,-67,5,7,6,-8,687);
```

### 将伪数组转化为数组

>js中的伪数组(例如通过document.getElementsByTagName获取的元素)具有length属性，并且可以通过0、1、2…下标来访问其中的元素，但是没有Array中的push、pop等方法。我们可以利用call、apply来将其转化为真正的数组这样便可以方便地使用数组方法了。

```js
var arrayLike = {
  0: 'qianlong',
  1: 'ziqi',
  2: 'qianduan',
  length: 3
}
var arr = Array.prototype.slice.call(arrayLike);
```

>slice() 方法返回一个新的数组对象，这一对象是一个由 begin和 end（不包括end）决定的原数组的**浅拷贝**。原始数组不会被改变。语法：`arr.slice([begin, end]);`

### 数组追加

```js
var arr1 = [1,2,3];
var arr2 = [4,5,6];
[].push.apply(arr1, arr2);
// arr1 [1, 2, 3, 4, 5, 6]
// arr2 [4,5,6]
```

### 判断变量类型

```js
function isArray(obj){
  return Object.prototype.toString.call(obj) == '[object Array]';
}
isArray([]) // true
isArray('qianlong') // false
```

### 利用call和apply做继承

```js
var Person = function (name, age) {
  this.name = name;
  this.age = age;
};
var Girl = function (name) {
  Person.call(this, name);
};
var Boy = function (name, age) {
  Person.apply(this, arguments);
}
var g1 = new Girl ('qing');
var b1 = new Boy('qianlong', 100);
```