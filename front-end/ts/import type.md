# Import type

> 原文[你不知道的 「 import type 」](https://segmentfault.com/a/1190000039800522)

TypeScript 3.8 带来了一个新特性：仅仅导入 / 导出声明。

## 什么是导入省略

通常 babel 在编译的时候，是一个个处理文件的，针对 ts 他一般是先删除类型，然后再进行编译。

举一个例子来说明这情况：

```ts
// types.ts
export type User = {... };
export type UserList = User[];

// index.ts
export { User, UserList } from './types'; // ts types
export { getUser, CreateUser } from './user'; // js function
```

如果光看 index.ts ，实际都并不知道 User 和 CreateUser 谁是一个 ts type 的定义而谁是 js 运行时需要的东西。于是 babel 只能被迫的将所有东西都保留，于是转译后的文件为

```ts
// types.js
-- empty file --

// index.js
export { User, UserList } from './types'; // ts types
export { getUser, CreateUser } from './user'; // js function
```

而在 typescript 3.8 之后，解决方法可以变成下述写法。针对 type 的导入或者导出，babel 会在删除类型的环节，直接将 import type ... 或者 export type xxx 这类的语句直接去掉。

```ts
// index.ts
export type { User, UserList } from "./types"; // ts types
export { getUser, CreateUser } from "./user"; // js function

// => babel 转换后
export { getUser, CreateUser } from "./user"; // only js function
```

在 4.5 的版本中，支持了对于某个变量局部使用 type 的写法，就不用说类型和 js 的函数要拆成两条语句了

```ts
// ts 3.8
import type { BaseType } from "./some-module.js";
import { someFunc } from "./some-module.js";

// => ts 4.5
import { someFunc, type BaseType } from "./some-module.js";
```

## 什么是「 仅仅导入 / 导出声明 」

为了能导入类型，TypeScript 重用了 JavaScript 导入语法。例如在下面的这个例子中，确保 JavaScript 的值 doThing 以及 TypeScript 类型 Options 一同被导入:

```ts
// ./foo.ts
interface Options {
  // ...
}

export function doThing(options: Options) {
  // ...
}

// ./bar.ts
import { doThing, Options } from "./foo.js";

function doThingBetter(options: Options) {
  // do something twice as good
  doThing(options);
  doThing(options);
}
```

这很方便的，因为在大多数的情况下，不必担心导入了什么 —— 仅仅是想导入的内容。遗憾的是，这仅是因为一个被称之为「导入省略」的功能而起作用。

当 TypeScript 输出一个 JavaScript 文件时，TypeScript 会识别出 Options 仅仅是当作了一个类型来使用，它将会删除 Options。

```ts
// ./foo.js
export function doThing(options: Options) {
  // ...
}

// ./bar.js
import { doThing } from "./foo.js";

function doThingBetter(options: Options) {
  // do something twice as good
  doThing(options);
  doThing(options);
}
```

在通常情况下，这种行为都是比较好的。但是它会导致一些其他问题。首先，在一些场景下，TypeScript 会混淆导出的究竟是一个类型还是一个值。比如在下面的例子中， MyThing 究竟是一个值还是一个类型？

```ts
import { MyThing } from "./some-module.js";

export { MyThing };
```

如果单从这个文件来看，我们无从得知答案。

如果 Mything 仅仅是一个类型，Babel 和 TypeScript 使用的 transpileModule API 编译出的代码将无法正确工作，并且 TypeScript 的 isolatedModules 编译选项将会提示我们，这种写法将会抛出错误。

问题的关键在于，没有一种方式能识别它仅仅是个类型，以及是否应该删除它，因此「导入省略」并不够好。

同时，这也存在另外一个问题，TypeScript 导入省略将会去除只包含用于类型声明的导入语句。

对于含有副作用的模块，这造成了明显的不同行为。于是，使用者将会不得不添加一条额外的声明语句，来确保有副作用。

```ts
// This statement will get erased because of import elision.
import { SomeTypeFoo, SomeOtherTypeBar } from "./module-with-side-effects";

// This statement always sticks around.
import "./module-with-side-effects";
```

一个我们看到的具体例子是出现在 Angularjs（1.x）中， services 需要在全局在注册（它是一个副作用），但是导入的 services 仅仅用于类型声明中。

```ts
// ./service.ts
export class Service {
  // ...
}
register("globalServiceId", Service);

// ./consumer.ts
import { Service } from "./service.js";

inject("globalServiceId", function (service: Service) {
  // do stuff with Service
});
```

结果 ./service.js 中的代码不会被执行，导致在运行时会被中断。

在 TypeScript 3.8 版本中，添加了一个仅仅导入/导出 声明语法来作为解决方式。

```ts
import type { SomeThing } from "./some-module.js";

export type { SomeThing };
```

import type 仅仅导入被用于类型注解或声明的声明语句，它总是会被完全删除，因此在运行时将不会留下任何代码。

与此相似，export type 仅仅提供一个用于类型的导出，在 TypeScript 输出文件中，它也将会被删除。
