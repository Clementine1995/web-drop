# console与JSON.stringify以及调试技巧

>参考[你不知道的 JSON.stringify() 的威力](https://juejin.im/post/6844904016212672519)
>
>参考[推荐几个不错的console调试技巧](https://juejin.im/post/6844904007102627847)
>
>参考[Chrome DevTools 你还只会console.log吗 ?](https://juejin.im/post/6844903971677536270)

## JSON.stringify

JSON.stringify 特性：

+ undefined、任意的函数以及symbol 作为对象属性值时 JSON.stringify() 对跳过（忽略）它们进行序列化
+ undefined、任意的函数以及symbol 作为数组元素值时，JSON.stringify() 将会将它们序列化为 null
+ undefined、任意的函数以及symbol 被 JSON.stringify() 作为单独的值进行序列化时，都会返回 undefined
+ 非数组对象的属性不能保证以特定的顺序出现在序列化后的字符串中。因为某些类型会被忽略，所以顺序不定，但是数组会填充 null 来保持顺序。
+ 转换值如果有 toJSON() 函数，该函数返回什么值，序列化结果就是什么值，并且忽略其他属性的值。

  ```js
    JSON.stringify({
      say: "hello JSON.stringify",
      toJSON: function() {
        return "today i learn";
      }
    })
    // "today i learn"
  ```

+ JSON.stringify() 将会正常序列化 Date 的值。主要是因为其实现了toJSON()方法
+ NaN 和 Infinity 格式的数值及 null 都会被当做 null。
+ BigInt 直接会抛错，Map、Set 会返回字符串 {}
+ 布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。
+ 其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性。
+ 对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。
+ 所有以 symbol 为属性键的属性都会被完全忽略掉，即便 replacer 参数中强制指定包含了它们。

### JSON.stringify 第二个参数 replacer

replacer 参数有两种形式，可以是一个函数或者一个数组。作为函数时，它有两个参数，键（key）和值（value），函数类似就是数组方法 map、filter 等方法的回调函数，对每一个属性值都会执行一次该函数。如果 replacer 是一个数组，数组的值代表将被序列化成 JSON 字符串的属性名。

#### replacer 作为函数时

```js
const data = {
  a: "aaa",
  b: undefined,
  c: Symbol("dd"),
  fn: function() {
    return true;
  }
};
// 不用 replacer 参数时
JSON.stringify(data);

// "{"a":"aaa"}"
// 使用 replacer 参数作为函数时
JSON.stringify(data, (key, value) => {
  switch (true) {
    case typeof value === "undefined":
      return "undefined";
    case typeof value === "symbol":
      return value.toString();
    case typeof value === "function":
      return value.toString();
    default:
      break;
  }
  return value;
})
// "{"a":"aaa","b":"undefined","c":"Symbol(dd)","fn":"function() {\n    return true;\n  }"}"
```

需要注意的是，replacer 被传入的函数时，第一个传入的参数不是对象的第一个键值对，而是空字符串作为 key 值，value 值是整个对象的键值对（也就是第一个参数）

#### replacer 作为数组时

replacer 作为数组时，结果非常简单，数组的值就代表了将被序列化成 JSON 字符串的属性名。

```js
const jsonObj = {
  name: "JSON.stringify",
  params: "obj,replacer,space"
};

// 只保留 params 属性的值
JSON.stringify(jsonObj, ["params"]);
// "{"params":"obj,replacer,space"}"
```

### JSON.stringify 第三个参数 space

space 参数用来控制结果字符串里面的间距。

+ 如果是一个数字, 则在字符串化时每一级别会比上一级别缩进多这个数字值的空格（最多10个空格）
+ 如果是一个字符串，则每一级别会比上一级别多缩进该字符串（或该字符串的前10个字符）

## console

### console.log()

经常会使用console.log来打印出某个变量的值或者某个实体对象，也可以传入多个变量参数，它会按照传入顺序进行打印，除此之外，它还支持格式化打印的功能，传入特定的占位符来对参数进行格式化处理，常见的占位符有以下几种：

1. %s：字符串占位符
2. %d：整数占位符
3. %f：浮点数占位符
4. %o：对象占位符(注意是字母o，不是数字0)
5. %c: CSS样式占位符

```js
const string = 'Glory of Kings';
const number = 100;
const float = 9.5;
const obj = {name: 'daji'};

// 1、%s 字符串占位符
console.log('I do like %s', string); // -> I do like Golry of Kings.

// 2、%d 整数占位符
console.log('I won %d times', number); // -> I won 100 times.

// 3、%f 浮点数占位符
console.log('My highest score is %f', float); // -> My highest score is 9.5

// 4、%o 对象占位符
console.log('My favorite hero is %o', obj); // -> My favorite hero is {name: 'daji'}.

// 5、%c CSS样式占位符
console.log('I do like %c%s', 'padding: 2px 4px;background: orange;color: white;border-radius: 2px;', string);
```

### console.warn()

可以使用console.warn来代替console.log方法，但前提是该条打印信息是属于警告级别而不是普通信息级别，因此浏览器遇到一条警告级别的信息会区别对待，最明显的是它的左侧会有一个警告图标，并且背景色和文字颜色也会不一样。

### console.dir()

console.dir 方法的作用和 console.log 作用相似，它是通过类似文件树样式的交互列表显示，在打印一些对象时会显示得更清楚，比如 HTML 文档节点，利用 dir 方法可以清楚看到 DOM 节点下的所有属性信息。

### console.table()

这个方法需要一个必须参数 data，data 必须是一个数组或者是一个对象；还可以使用一个可选参数 columns 用于筛选表格需要显示的列，默认为全部列都显示。

它会把数据 data 以表格的形式打印出来。数组中的每一个元素（或对象中可枚举的属性）将会以行的形式显示在表格中。

### console.assert()

assert即断言，该方法接收多个参数，其中第一个参数为输入的表达式，只有在该表达式的值为false时，才会将剩余的参数输出到控制台中。

### console.trace()

该方法用于在控制台中显示当前代码在堆栈中的调用路径，通过这个调用路径我们可以很容易地在发生错误时找到原始错误点

### console.count()

该方法相当于一个计数器，用于记录调用次数，并将记录结果打印到控制台中。其接收一个可选参数console.count(label)，label表示指定标签，该标签会在调用次数之前显示

### console.time() & console.timeEnd()

这两个方法一般配合使用，是JavaScript中用于跟踪程序执行时间的专用函数，console.time方法是作为计算的起始时间，console.timeEnd是作为计算的结束时间，并将执行时长显示在控制台。如果一个页面有多个地方需要使用到计算器，则可以为方法传入一个可选参数label来指定标签，该标签会在执行时间之前显示。

### console.group() & console.groupEnd()

对数据信息进行分组，其中console.group()方法用于设置分组信息的起始位置，该位置之后的所有信息将写入分组，console.groupEnd()方法用于结束当前的分组

### 另外一些调试技巧

下面API只能通过浏览器控制台获取，无法通过网页脚本来进行访问

#### 选择DOM元素

+ $(selector)：返回匹配指定CSS选择器的DOM元素的第一个引用，相当于document.querySelector()函数。
+ ?(selector)：返回匹配指定CSS选择器的DOM元素数组，相当于document.querySelectorAll()函数。
+ $x(path)：返回一个与给定XPath表达式匹配的DOM元素数组。

#### 访问最近选择的元素和对象

控制台会存储最近 5 个被选择的元素和对象。当你在元素面板选择一个元素或在分析器面板选择一个对象,记录都会存储在栈中。 可以使用$x来操作历史栈,x 是从 0 开始计数的,所以$0 表示最近选择的元素,$4 表示最后选择的元素。

#### 检索最后一个结果的值

$_标记可用于返回最近评估的表达式的值

#### 查找与指定DOM元素关联的事件

当需要查找DOM中与某个元素关联的所有事件时，控制台提供了getEventListeners方法来帮助我们找到这些关联的事件。getEventListeners($('selector'))返回在指定DOM元素上注册的事件监听器。返回值是一个对象，对象的key为对应的事件类型(例如click，focus)，对象的value为一个数组，其包含了对应事件类型下的所有事件监听器。

#### 监控事件

如果希望在执行绑定到DOM中特定元素的事件时监视它们，控制台提供了`monitorEvents`方法来帮助你使用不同的命令来监控其中的一些或者所有事件：

+ monitorEvents($('selector'))：将监视与选择器匹配的元素关联的所有事件，当这些事件被触发时会将它们打印到控制台。例如monitorEvents($('#content'))将监视id为content的元素关联的所有事件。
+ monitorEvents($('selector'), 'eventName')：将监视选择器匹配的元素的某个特定的事件。 例如，monitorEvents($('#content'), 'click')将监视id为content的元素关联的click事件。
+ monitorEvents($('selector'), [eventName1, eventName2, ...])：将监视选择器匹配的元素的某些特定的事件。与上述不同的是，第二项可以传入一个字符串数组，包含所有需要监听的事件类型名称，以此达到自定义监听的目的。例如monitorEvents($('#content'), ['click', 'focus'])将监视id为content的元素关联的click和focus事件。
+ unmonitorEvents($('selector'))：将停止监视选择器匹配的元素关联的所有事件。例如unmonitorEvents($('#content'))将停止监视id为content的元素关联的所有事件。

#### 检查DOM元素

控制台提供了inspect()方法可以直接从控制台中检查一个DOM元素。

+ inspect($('selector'))：将检查与选择器匹配的元素，并且会自动跳转到Chrome Developer Tools的Elements选项卡中。例如inspect($('#content'))将检查id为content的元素。

#### 复制 copy

可以通过 copy 方法在控制台里复制你想要的东西。

#### 分析程序性能

在 DevTools 窗口控制台中，调用 console.profile()开启一个 JavaScript CPU 分析器.结束分析器直接调用 console.profileEnd().

#### 截图

Chrome DevTools 提供了 4 种截图方式,基本覆盖了需求场景,快捷键 ctrl+shift+p ,打开 Command Menu,输入 screenshot，会有四个选项

#### 复制 Fetch

在 Network 标签下的所有的请求,都可以复制为一个完整的 Fetch 请求的代码。

#### 重写 Overrides

在 Chrome DevTools 上调试 css 或 JavaScript 时,修改的属性值在重新刷新页面时,所有的修改都会被重置。

如果想把修改的值保存下来,刷新页面的时候不会被重置,可以使用 Overrides 这个特性。Overrides 默认是关闭的,需要手动开启,开启的步骤如下。
开启的操作:

1. 打开 Chrome DevTools 的 Sources 标签页
2. 选择 Overrides 子标签
3. 选择 + Select folder for overrides,来为 Overrides 设置一个保存重写属性的目录

#### 滚动到视图区域 Scroll into view
