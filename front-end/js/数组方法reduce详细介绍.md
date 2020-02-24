# 数组方法Reduce介绍

>[Array.prototype.reduce 实用指南](https://juejin.im/post/5bab8a9c6fb9a05d0e2e6bf0)
>
>[精读《用 Reduce 实现 Promise 串行执行》](https://juejin.im/post/5bd65b98f265da0a91458ee6)
>
>[JS进阶篇--JS数组reduce()方法详解及高级技巧](https://segmentfault.com/a/1190000010731933)
>
>[25个你不得不知道的数组reduce高级用法](https://juejin.im/post/5e44002c6fb9a07c9f3fd135)

## 简单介绍

>reduce() 方法对数组中的每个元素执行一个由您提供的reducer函数(升序执行)，将其结果汇总为单个返回值。[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)

上述是 MDN对该方法的描述，具体的语法是：`arr.reduce(callback[, initialValue])`
参数:

+ callback 执行数组中每个值的函数，包含四个参数：
  + accumulator 累计器累计回调的返回值; 它是上一次调用回调时返回的累积值，或initialValue（见于下方）。
  + currentValue 数组中正在处理的元素。
  + currentIndex 可选，数组中正在处理的当前元素的索引。 如果提供了initialValue，则起始索引号为0，否则为1。
  + array 可选，调用reduce()的数组
+ initialValue 可选，作为第一次调用 callback函数时的第一个参数的值。 如果没有提供初始值，则将使用数组中的第一个元素。 在没有初始值的空数组上调用 reduce 将报错。

具体描述：回调函数第一次执行时，accumulator 和currentValue的取值有两种情况：如果调用reduce()时提供了initialValue，accumulator取值为initialValue，currentValue取数组中的第一个值；如果没有提供 initialValue，那么accumulator取数组中的第一个值，currentValue取数组中的第二个值。

注意：**如果没有提供initialValue，reduce 会从索引1的地方开始执行 callback 方法，跳过第一个索引。如果提供initialValue，从索引0开始**。

其实这个方法并不难理解的，正如它名字所示，抓住它的核心：聚合。一般而言，如果需要把数组转换成其他元素，如字符串、数字、对象甚至是一个新数组的时候，若其他数组方法不太适用时，就可以考虑 reduce 方法，不熟悉这个方法的同学，尽管抛开上面的语法， 记住方法的核心是聚合即可。

## 例子

下面例子用到如下数组：

```()
[{
  id: 1,
  type: 'A',
  total: 3
}, {
  id: 2,
  type: 'B',
  total: 5
}, {
  id: 3,
  type: 'E',
  total: 7
},...]
```

### 聚合为数字

根据上述数据体，我们一起来做第一个小需求，统计 total 的总和。如果不用 reduce，其实也不难：

```js
function sum(arr) {
  let sum = 0;
  for (let i = 0, len = arr.length; i < len; i++) {
    const { total } = arr[i];
    sum += total;
  }
  return sum;
}
```

这个函数可以完成上述需求，但我们精确地维护了数组索引，再精确地处理整个运算过程，是典型的命令式编程。同样的使用forof，forEach等循环也能完成这个需求，上文提及，只要涉及将数组转换为另外的数据体，就可以使用 reduce，它也可以这样写：

```js
arr.reduce((sum, { total }) => {
  return sum + total;
}, 0)
```

这样就完成了，sum 是此前累加的结果，它的初始值为 0。注意：此时的initialValue也就是初始值是必要的，如果没有reduce函数会将第一个元素直接作为sum的值，然后从第二个值开始取出total，虽然运行不会报错，但是最终结果不是我们想要的，这也与上面见到介绍中相吻合。

### 聚合为字符串

将数组的每项转换为固定格式的字符串（如第一项转换为 id:1,type:A;），每项直接以分号作为分隔。一般来说，数组转为字符串，join 方法是不错的选择，但并不适用于需要精确控制或数组的项比较复杂的情况。在本例中，join 方法是达不到我们想要的效果的。

使用 for 循环当然可以解决问题，但 reduce 也许是更好的选择，代码如下：

```js
arr.reduce((str, { id, type }) => {
  return str + `id:${id},type:${type};`;
}, '')

```

注意给它提供初始值。

### 聚合为对象

上面的数据体是比较典型的后端接口返回结果，但对于前端来说，转换成 key value 的对象形式，更利于进行之后的操作。那我们就以转换为 key 是 id，value 是其他属性的对象作为目标吧！

```js
function changeToObj(arr) {
  const res = {};
  arr.forEach(({ id, type, total }) => {
    res[id] = {
      type,
      total
    };
  })
  return res;
}
```

如上所示，这个函数可以很好地完成我们的目标。但略显啰嗦，记住：只要目标是将数组聚合为唯一的元素时，都可以考虑使用 reduce。这个例子恰好符合：

```js
arr.reduce((res, { id, type, total }) => {
  res[id] = {
    type,
    total
  };
  return res;
}, {})
```

res 是最后返回的对象，通过遍历数组，不断往里面添加新的属性与值，最后达到聚合成对象的目的，代码还是相当简洁有力的。

## MDN上的例子

### 将二维数组转化为一维

```js
var flattened = [[0, 1], [2, 3], [4, 5]].reduce(
 ( acc, cur ) => acc.concat(cur),
 []
);
```

### 计算数组中每个元素出现的次数

```js
var names = ['Alice', 'Bob', 'Tiff', 'Bruce', 'Alice'];

var countedNames = names.reduce(function (allNames, name) {
  if (name in allNames) {
    allNames[name]++;
  }
  else {
    allNames[name] = 1;
  }
  return allNames;
}, {});
// countedNames is:
// { 'Alice': 2, 'Bob': 1, 'Tiff': 1, 'Bruce': 1 }
```

### 使用reduce实现数组方法map

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

### 按属性对object分类

```js
var people = [
  { name: 'Alice', age: 21 },
  { name: 'Max', age: 20 },
  { name: 'Jane', age: 20 }
];

function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

var groupedPeople = groupBy(people, 'age');
// groupedPeople is:
// {
//   20: [
//     { name: 'Max', age: 20 },
//     { name: 'Jane', age: 20 }
//   ],
//   21: [{ name: 'Alice', age: 21 }]
// }
```

### 数组去重

```js
let arr = [1,2,1,2,3,5,4,5,3,4,4,4,4];
let result = arr.sort().reduce((init, current)=>{
    if(init.length===0 || init[init.length-1]!==current){
        init.push(current);
    }
    return init;
}, []);
console.log(result); //[1,2,3,4,5]
```

### 字符串中每个字母出现的次数

```js
var arrString = 'abcdaabc';

arrString.split('').reduce(function(res, cur) {
    res[cur] ? res[cur] ++ : res[cur] = 1
    return res;
}, {})
```

### 使用扩展运算符和initialValue绑定包含在对象数组中的数组

```js
// friends - 对象数组
// where object field "books" - list of favorite books
var friends = [{
  name: 'Anna',
  books: ['Bible', 'Harry Potter'],
  age: 21
}, {
  name: 'Bob',
  books: ['War and peace', 'Romeo and Juliet'],
  age: 26
}, {
  name: 'Alice',
  books: ['The Lord of the Rings', 'The Shining'],
  age: 18
}];

// allbooks - list which will contain all friends' books +  
// additional list contained in initialValue
var allbooks = friends.reduce(function(prev, curr) {
  return [...prev, ...curr.books];
}, ['Alphabet']);

// allbooks = [
//   'Alphabet', 'Bible', 'Harry Potter', 'War and peace',
//   'Romeo and Juliet', 'The Lord of the Rings',
//   'The Shining'
// ]
```

### 按顺序运行Promise

```js
/**
 * Runs promises from array of functions that can return promises
 * in chained manner
 *
 * @param {array} arr - promise arr
 * @return {Object} promise object
 */
function runPromiseInSequence(arr, input) {
  return arr.reduce(
    (promiseChain, currentFunction) => promiseChain.then(currentFunction),
    Promise.resolve(input)
  );
}

// promise function 1
function p1(a) {
  return new Promise((resolve, reject) => {
    resolve(a * 5);
  });
}

// promise function 2
function p2(a) {
  return new Promise((resolve, reject) => {
    resolve(a * 2);
  });
}

// function 3  - will be wrapped in a resolved promise by .then()
function f3(a) {
 return a * 3;
}

// promise function 4
function p4(a) {
  return new Promise((resolve, reject) => {
    resolve(a * 4);
  });
}

const promiseArr = [p1, p2, f3, p4];
runPromiseInSequence(promiseArr, 10)
  .then(console.log);   // 1200
```

### 新建并返回一个obj对象中存在的keys的object对象

```js
var only = function(obj, keys){
  obj = obj || {};
  if ('string' == typeof keys) keys = keys.split(/ +/);
  return keys.reduce(function(ret, key){
    if (null == obj[key]) return ret;
    ret[key] = obj[key];
    return ret;
  }, {});
};

var a = {
    env : 'development',
    proxy : false,
    subdomainOffset : 2
}
only(a,['env','proxy'])   // {env:'development',proxy : false}
```

### 完成目标对象多个属性的同时叠加

将reduce函数第一个参数callback封装为一个数组，由数组中的每一个函数单独进行叠加并完成reduce操作。

```js
var reducers = {  
  totalInEuros : function(state, item) {
    return state.euros += item.price * 0.897424392;
  },
  totalInYen : function(state, item) {
    return state.yens += item.price * 113.852;
  }
};

var manageReducers = function(reducers) {
  return function(state, item) {
    return Object.keys(reducers).reduce(
      function(nextState, key) {
        reducers[key](state, item);
        return state;
      },
      {}
    );
  }
};

var bigTotalPriceReducer = manageReducers(reducers);
var initialState = {euros:0, yens: 0};
var items = [{price: 10}, {price: 120}, {price: 1000}];
var totals = items.reduce(bigTotalPriceReducer, initialState);
console.log(totals);
```
