# ES5.1-10中新增的数组方法

## Array.of()

在ES6之前创建数组主要有两种方式，一是调用Array的构造函数，另一种则是使用数组字面量，这两种方法都需要列举数组中的元素，功能非常受限，为了简化数组创建过程，ES6中新增了Array.of()和Array.from()两个方法。

语法：`Array.of(element0[, element1[, ...[, elementN]]])`

Array.of() 方法创建一个具有可变数量参数的新数组实例，而不考虑参数的数量或类型。它与Array构造函数不同之处在于无论传入参数的类型与个数，它总是会返回一个包含所有参数的数组。而Array构造函数如果传入一个数值型的值，那么该值将会作为数组的length属性。

```js
let items = new Array(2)
console.log(items.length)   // 2
console.log(items[0])       // undefined
console.log(items[1])       // undefined

let items2 = Array.of(2)
console.log(items.length)   // 1
console.log(items[0])       // 2
```

## Array.from()

Array.from() 方法从一个**类似数组**或**可迭代对象**中创建一个**新**的数组实例。

>什么是类数组？拥有length属性，其它属性为非负整数
>
>什么是可迭代对象？实现了Symbol.iterator属性的对象

语法：`Array.from(arrayLike[, mapFn[, thisArg]])`

1. arrayLike：想要转换成数组的伪数组对象或可迭代对象。
2. mapFn (可选参数)：如果指定了该参数，新数组中的每个元素会执行该回调函数。
3. thisArg (可选参数)：可选参数，执行回调函数 mapFn 时 this 对象。

在ES6之前，如果想要将一个类数组转换成数组，通常使用数组的slice方法

```js
function makeArray (arrayLike) {
  return Array.prototype.slice.call(arrayLike)
}

function doSomething () {
  var args = makeArray(arguments); // arguments就是一个类数组
}
```

而使用了Array.from方法就容易很多

```js
function doSomething () {
  var args = Array.from(arguments); // arguments就是一个类数组
}

// 如果想要进一步转化数组，可以使用它的第二个参数，这个函数用来将类数组对象中每一个值
// 转换成其他形式，最后将转换后的结果放在结果数组中的相应位置
function translate () {
  return Array.from(arguments, (value) => value + 1);
}
let numbers = translate(1, 2, 3)
console.log(numbers) // 2, 3, 4

// 同时还可以传入第三个参数来表示映射函数的this值
let helper = {
  diff: 1,
  add (value) {
    return value + this.diff
  }
};
function translate () {
  return Array.from(arguments, helper.add, helper);
}
let numbers = translate(1, 2, 3)
console.log(numbers) // 2, 3, 4

// 用Array.from()转换可迭代对象，例如Map、Set以及实现了Symbol.iterator属性的对象
let numbers = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  }
};
let numbers2 = Array.from(numbers, (value) => value + 1);
console.log(numbers2) // 2, 3, 4

let m = new Map([[1, 2], [2, 4], [4, 8]]);
Array.from(m);
// [[1, 2], [2, 4], [4, 8]]
```

## Array​.prototype​.find()和Array​.prototype​.findIndex()

### find()

find() 方法返回数组中满足提供的测试函数的第一个元素的值。

语法：`arr.find(callback[, thisArg])`

callback在数组每一项上执行的函数，接收 3 个参数：

1. element：当前遍历到的元素。
2. index可选：当前遍历到的索引。
3. array可选：数组本身。

thisArg可选：执行回调时用作this 的对象。

find方法对数组中的每一项元素执行一次 callback 函数，直至有一个 callback 返回 true。当找到了这样一个元素后，该方法会立即返回这个元素的值，否则返回 **undefined**。

```js
// 用对象的属性查找数组里的对象
var inventory = [
    {name: 'apples', quantity: 2},
    {name: 'bananas', quantity: 0},
    {name: 'cherries', quantity: 5}
];
function findCherries(fruit) {
    return fruit.name === 'cherries';
}
console.log(inventory.find(findCherries)); // { name: 'cherries', quantity: 5 }
```

### findIndex()

findIndex()方法返回数组中满足提供的测试函数的第一个元素的索引。

语法：`arr.findIndex(callback[, thisArg])`

callback针对数组中的每个元素, 都会执行该回调函数, 执行时会自动传入下面三个参数:

1. element：当前元素。
2. index：当前元素的索引。
3. array：调用findIndex的数组。

thisArg可选。执行callback时作为this对象的值。

findIndex方法对数组中的每个数组索引0..length-1（包括）执行一次callback函数，直到找到一个callback函数返回真实值（强制为true）的值。如果找到立即返回该元素的索引。如果回调从不返回真值，或者数组的length为0，findIndex返回-1。

```js
var array1 = [5, 12, 8, 130, 44];

function isLargeNumber(element) {
  return element > 13;
}

console.log(array1.findIndex(isLargeNumber));
// expected output: 3
```

## Array​.prototype​.some()

some() 方法测试是否至少有一个元素通过由提供的函数实现的测试。

语法：`arr.some(callback(element[, index[, array]])[, thisArg])`

callback用来测试每个元素的函数，接受三个参数：

1. element：数组中正在处理的元素。
2. index 可选：数组中正在处理的元素的索引值。
3. array可选：some()被调用的数组。

thisArg可选：执行 callback 时使用的 this 值。

some() 为数组中的每一个元素执行一次 callback 函数，直到找到一个使得 callback 返回一个truthy值（即可转换为布尔值 true 的值）。如果找到立即返回 true。否则返回 false。callback 只会在那些”有值“的索引上被调用，不会在那些被删除或从来未被赋值的索引上调用。

```js
var array = [1, 2, 3, 4, 5];

var even = function(element) {
  // checks whether an element is even
  return element % 2 === 0;
};

console.log(array.some(even));
// expected output: true
```

## Array​.prototype​.every()

与some方法相对，every() 方法测试一个数组内的所有元素是否都能通过某个指定函数的测试。

语法：`arr.every(callback[, thisArg])`

callback用来测试每个元素的函数，接受三个参数：

1. element：数组中正在处理的元素。
2. index 可选：数组中正在处理的元素的索引值。
3. array可选：some()被调用的数组。

thisArg可选：执行 callback 时使用的 this 值。

every 方法为数组中的每个元素执行一次 callback 函数，直到它找到一个会使 callback 返回 falsy 的元素。如果发现了一个这样的元素，every 方法将会立即返回 false。否则，callback 为每一个元素返回 true，every 就会返回 true。every 不会改变原数组。若传入一个空数组，无论如何都会返回 true。

```js
//下例检测数组中的所有元素是否都大于 10。

function isBigEnough(element, index, array) {
  return element >= 10;
}
[12, 5, 8, 130, 44].every(isBigEnough);   // false
[12, 54, 18, 130, 44].every(isBigEnough); // true
```

## Array​.prototype​.fill()

fill() 方法用一个固定值填充一个数组中从起始索引到终止索引内的全部元素，不包括终止索引，返回修改后的数组。该方法不要求 this 是数组对象。

语法：`arr.fill(value[, start[, end]])`

value：用来填充数组元素的值。
start 可选：起始索引，默认值为0。
end 可选：终止索引，默认值为 this.length。

```js
[1, 2, 3].fill(4);               // [4, 4, 4]
[1, 2, 3].fill(4, 1);            // [1, 4, 4]
[1, 2, 3].fill(4, 1, 2);         // [1, 4, 3]

// 当一个对象被传递给 fill方法的时候, 填充数组的是这个对象的引用。
var arr = Array(3).fill({}) // [{}, {}, {}];
arr[0].hi = "hi"; // [{ hi: "hi" }, { hi: "hi" }, { hi: "hi" }]
```

## Array​.prototype​.copy​Within()

copyWithin() 方法浅复制数组的一部分到同一数组中的另一个位置，并返回它，不会改变原数组的长度。

语法：`arr.copyWithin(target[, start[, end]])`

+ target：0 为基底的索引，复制序列到该位置。如果是负数，target 将从末尾开始计算。如果 target 大于等于 arr.length，将会不发生拷贝。如果 target 在 start 之后，复制的序列将被修改以符合 arr.length。
+ start：0 为基底的索引，开始复制元素的起始位置。如果是负数，start 将从末尾开始计算。如果 start 被忽略，copyWithin 将会从0开始复制。
+ end：0 为基底的索引，开始复制元素的结束位置。copyWithin 将会拷贝到该位置，但不包括 end 这个位置的元素。如果是负数， end 将从末尾开始计算。如果 end 被忽略，copyWithin 方法将会一直复制至数组结尾（默认为 arr.length）。

注意：copyWithin不要求其 this 值必须是一个数组对象，其会改变 this 本身的内容，且需要时会创建新的属性。

```js
let numbers = [1, 2, 3, 4, 5];
numbers.copyWithin(-2);
// [1, 2, 3, 1, 2]
numbers.copyWithin(0, 3);
// [4, 5, 3, 4, 5]
numbers.copyWithin(0, 3, 4);
// [4, 2, 3, 4, 5]
numbers.copyWithin(-2, -3, -1);
// [1, 2, 3, 3, 4]
[].copyWithin.call({length: 5, 3: 1}, 0, 3);
// {0: 1, 3: 1, length: 5}
```

## Array​.prototype​.keys()

keys() 方法返回一个包含数组中每个索引键的Array Iterator对象。

语法：`arr.keys()`

```js
// 索引迭代器会包含那些没有对应元素的索引
var arr = ["a", , "c"];
var sparseKeys = Object.keys(arr);
var denseKeys = [...arr.keys()];
console.log(sparseKeys); // ['0', '2']
console.log(denseKeys);  // [0, 1, 2]
```

## Array​.prototype​.values()

values() 方法返回一个新的 Array Iterator 对象，该对象包含数组每个索引的值。

语法：`arr.values()`

```js
// 使用 for...of 循环进行迭代
let arr = ['w', 'y', 'k', 'o', 'p'];
let eArr = arr.values();
// 您的浏览器必须支持 for..of 循环
// 以及 let —— 将变量作用域限定在 for 循环中
for (let letter of eArr) {
  console.log(letter);
}
```

## Array​.prototype​.entries()

entries() 方法返回一个新的Array Iterator对象，该对象包含数组中每个索引的键/值对。

语法：`arr.entries()`

```js
// 使用for…of 循环
var arr = ["a", "b", "c"];
var iterator = arr.entries();
// undefined

for (let e of iterator) {
    console.log(e);
}
```

## Array​.prototype​.includes()

includes() 方法用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回false。

语法：`arr.includes(valueToFind[, fromIndex])`

+ valueToFind：需要查找的元素值。
+ fromIndex 可选：从fromIndex 索引处开始查找 valueToFind。如果为负值，则按升序从 array.length + fromIndex 的索引开始搜。默认为 0。

includes() 方法不要求this值是数组对象，所以它可以被用于其他类型的对象 (比如类数组对象)。

```js
[1, 2, 3].includes(2);     // true
[1, 2, 3].includes(4);     // false

// 如果 fromIndex 大于等于数组的长度，则会返回 false，并且不会搜索数组
var arr = ['a', 'b', 'c'];
arr.includes('c', 3);   // false
```

## Array​.prototype​.flat()

flat() 方法会按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返回。

语法：`var newArray = arr.flat(depth)`

+ depth 可选：指定要提取嵌套数组的结构深度，默认值为 1。
+ 返回值：一个包含将数组与子数组中所有元素的新数组。

```js
var arr2 = [1, 2, [3, 4, [5, 6]]];
arr2.flat();
// [1, 2, 3, 4, [5, 6]]

var arr3 = [1, 2, [3, 4, [5, 6]]];
arr3.flat(2);
// [1, 2, 3, 4, 5, 6]

//使用 Infinity 作为深度，展开任意深度的嵌套数组
arr3.flat(Infinity);
// [1, 2, 3, 4, 5, 6]

//flat() 方法会移除数组中的空项
var arr4 = [1, 2, , 4, 5];
arr4.flat();
// [1, 2, 4, 5]
```