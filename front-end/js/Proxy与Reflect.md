# Proxy 与 Reflect

## Proxy

Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

语法：`const p = new Proxy(target, handler)`

- target：要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- handler：一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。

### handler 对象的方法

handler 对象是一个容纳一批特定属性的占位符对象。它包含有 Proxy 的各个捕获器（trap）。所有的捕捉器是可选的。如果没有定义某个捕捉器，那么就会保留源对象的默认行为。最常用的是 get/set 陷阱。

#### handler.get()

handler.get() 方法用于拦截对象的读取属性操作。

```js
var p = new Proxy(target, {
  get: function (target, property, receiver) {},
});
```

参数：

- target：目标对象。
- property：被获取的属性名。
- receiver：Proxy 或者继承 Proxy 的对象。因此 receiver 不一定等于 proxy 对象

返回值：

- get 方法可以返回任何值。

该方法会拦截目标对象的以下操作:

- 访问属性: proxy[foo]和 proxy.bar
- 访问原型链上的属性: `Object.create(proxy)[foo]`
- Reflect.get()

#### handler.set()

handler.set() 方法是设置属性值操作的捕获器。

```js
const p = new Proxy(target, {
  set: function (target, property, value, receiver) {},
});
```

参数：

- target：目标对象。
- property：将被设置的属性名或 Symbol。
- value：新属性值。
- receiver：最初被调用的对象。通常是 proxy 本身，但 handler 的 set 方法也有可能在原型链上，或以其他方式被间接地调用（因此不一定是 proxy 本身）。

返回值：

- set() 方法应当返回一个布尔值。返回 true 代表属性设置成功。在严格模式下，如果 set() 方法返回 false，那么会抛出一个 TypeError 异常。

该方法会拦截目标对象的以下操作:

- 指定属性值：proxy[foo] = bar 和 proxy.foo = bar
- 指定继承者的属性值：`Object.create(proxy)[foo] = bar`
- Reflect.set()

## Reflect

主要特征：

- 不可构造，不能使用 new 进行调用
- 所有方法和 Proxy handlers 相同
- 所有的方法都是静态方法，类似于 Math
- 很多方法和 Ojbect 相同，但行为略微有所区别。譬如 Object.defineProperty(obj, name, desc) 在无法定义属性时，会抛出一个错误，而 Reflect.defineProperty(obj, name, desc) 则会返回 false。

### 静态方法

- `Reflect.apply(target, thisArgument, argumentsList)`:对一个函数进行调用操作，同时可以传入一个数组作为调用参数。
- `Reflect.construct(target, argumentsList[, newTarget])`:对构造函数进行 new 操作，相当于执行 new target(...args)。
- `Reflect.defineProperty(target, propertyKey, attributes)`:和 Object.defineProperty() 类似。如果设置成功就会返回 true。
- `Reflect.deleteProperty(target, propertyKey)`:作为函数的 delete 操作符，相当于执行 delete target[name]。
- `Reflect.get(target, propertyKey[, receiver])`:获取对象身上某个属性的值，类似于 target[name]。
- `Reflect.getOwnPropertyDescriptor(target, propertyKey)`:类似于 Object.getOwnPropertyDescriptor()。如果对象中存在该属性，则返回对应的属性描述符, 否则返回 undefined.
- `Reflect.getPrototypeOf(target)`:类似于 Object.getPrototypeOf()。
- `Reflect.has(target, propertyKey)`:判断一个对象是否存在某个属性，和 in 运算符 的功能完全相同。
- `Reflect.isExtensible(target)`:类似于 Object.isExtensible().
- `Reflect.ownKeys(target)`:返回一个包含所有自身属性（不包含继承属性）的数组。(类似于 Object.keys(), 但不会受 enumerable 影响).
- `Reflect.preventExtensions(target)`:类似于 Object.preventExtensions()。返回一个 Boolean。
- `Reflect.set(target, propertyKey, value[, receiver])`:将值分配给属性的函数。返回一个 Boolean，如果更新成功，则返回 true。
- `Reflect.setPrototypeOf(target, prototype)`:设置对象原型的函数. 返回一个 Boolean， 如果更新成功，则返回 true。

#### Reflect.get()

Reflect.get()方法与从 对象 (target[propertyKey]) 中读取属性类似，但它是通过一个函数执行来操作的。

语法：`Reflect.get(target, propertyKey[, receiver])`

参数:

- target：需要取值的目标对象
- propertyKey：需要获取的值的键值
- receiver：如果 target 对象中指定了 getter，receiver 则为 getter 调用时的 this 值。

#### Reflect.set()

静态方法 Reflect.set() 工作方式就像在一个对象上设置一个属性。

语法：`Reflect.set(target, propertyKey, value[, receiver])`

### 为什么需要 Reflect

- 将 Object 对象的一些明显属于语言内部的方法（比如 Object.defineProperty），放到 Reflect 对象上。也就是说，从 Reflect 对象上可以拿到语言内部的方法。
- 修改某些 Object 方法的返回结果，让其变得更合理。
- 在复杂的使用场景保持正确的上下文，这是 Reflect 一系列 API 的一个重要意义所在。
