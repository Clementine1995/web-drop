# Type Guard 类型守卫

> [断言签名与谓词签名！详解 ts 中神奇的 asserts 与 is](https://blog.csdn.net/yehuozhili/article/details/108970342)
>
> [TypeScript 中类型守卫 Type Guard 的介绍和使用](https://blog.csdn.net/u010730126/article/details/107402749)

## Type Guard

Type Guard 不是一种类型，而是一种能够确认具体类型的一种机制，如针对 union 类型经常设置一个 type 字段来作为当前类型的唯一标识，从而在使用时能够正确识别：

```ts
type Contact =
  | { type: "email"; email: string }
  | { type: "phone"; phone: string };

function saveContact(contact: Contact) {
  if (contact.type === "email") {
    // 这里能够确定类型是 { type: 'email'; email: string; }，能够访问contact.email
  } else {
    // 这里能够确定类型是 { type: 'phone'; phone: string; }，能够访问contact.phone
  }
}
```

在开发过程中，可能都不自觉地使用了下面的一些方式来确定当前访问数据的类型，其实它们也是 Type Guard：

### 空值校验

```ts
function hello(name?: string) {
  if (name) {
    // 这里能确定name是string类型
    console.log(`Hello, ${name.toUpperCase()}`);
  } else {
    console.log("Hello");
  }
}
```

### typeof

使用 typeof 也能确定类型，不过只能用于 js 的基本数据类型（null 除外），而不能用于 interface 和 type 定义的类型，因为在运行时这些类型就不在了：

```ts
function setValue(value: number | string) {
  if (typeof value === "number") {
    return value.toFixed(2);
  } else {
    return parseInt(value).toFixed(2);
  }
}
```

### instanceof

用于校验类，和 interface 和 type 不同的是，类的类型信息会在运行时保留，所以可以用 instanceof 作校验：

```ts
class Person {
  constructor(public name: string, public age: string) {}
}

function logPerson(obj: any) {
  if (obj instanceof Person) {
    console.log(`${obj.name} is ${obj.age} years old`);
  }
}
```

### 自定义 Type Guard

TypeScript 中也可以自定义 Type Guard，所谓自定义 Type Guard 就是一个返回 boolean 值的函数，此函数可以对函数的参数进行断言校验：

```ts
import axios, { AxiosResponse } from "axios";

interface Person {
  name: string;
  age: number;
}

function isPerson(obj: any): obj is Person {
  return "name" in obj && "age" in obj;
}

axios
  .get("/v1/api/test")
  .then((res: AxiosResponse) => res.data)
  .then((data: unknown) => {
    if (isPerson(data)) {
      // 通过自定义Type Guard，可以断定此处data是Person类型
      console.log(`${data.name.toUpperCase()} is ${data.age} years old`);
    }
  });
```

自定义 Type Guard 常用于未知的外部的数据类型校验，如从后端返回的数据，因为 TypeScript 不会侵入运行时环境，所以 TypeScript 在这种外部数据的情况下是无法做到类型约束的，TypeScript 不得不信任我们提供的类型，可以利用自定义 Type Guard 提供一个类型断言，当数据满足提供的校验函数时，就可以将数据作为提供的类型进行处理了，而且这个校验函数能够在运行时工作。

要注意此时就需要保证校验函数的严谨性及具体的数据的正确性了，比如上面断定了 data 是 Person 类型，所以当`data.name`是`string`类型，所以能够调用`toUpperCase`方法，但是如果后端返回的值是`{ name: 12, age: 22 }`，也能通过`isPerson`的校验，但是调用`toUpperCase`就会报错。此时可以再细化一下`isPerson`的实现：

```ts
function isPerson(obj: any): obj is Person {
  return (
    "name" in obj &&
    typeof obj.name === "string" &&
    "age" in obj &&
    typeof obj.age === "number"
  );
}
```

## 断言签名

有这样一个例子，需要断言 str 是 string ，如果 str 不是 string，那么没法用大写的方法。

```ts
function yell(str: any) {
  if (typeof str !== "string") {
    throw new TypeError("str should have been a string.");
  }
  return str.toUpperCase();
}
```

如果想动态的判断条件呢？比如这么写：

```ts
function yell(str: any) {
  assert(typeof str === "string");
  return str.toUpperCase();
}

function assert(condition: any) {
  if (!condition) {
    throw new Error("错误");
  }
}
```

由于不是一个函数里进行 throw 的，并且是进行判断，虽然 ts 没有报错，但是 ts 定的 str 是 any 而不是 string。

此时，就需要一种断言参数来进行断言：

```ts
function yell(str: any) {
  assert(typeof str === "string");
  return str.toUpperCase();
}

function assert(condition: any): asserts condition {
  if (!condition) {
    throw new Error("错误");
  }
}
```

对参数进行断言签名，此时 str 会被 ts 认定为 string，而不是上面那个 any。当然，在另一个函数中写 throw 可能让你觉得是 throw 帮助了 ts。其实帮助 ts 的是 assert，ts 不会去检测另一个函数中的判断语句。比如这么写：

```ts
function yell(str: any) {
  console.log(str); //此时仍是any
  assert(typeof str === "string");
  return str.toUpperCase();
}

function assert(condition: any): asserts condition {
  return condition;
}
```

assert 函数并没有 throw 别的类型，直接返回，但是由于 asserts 存在，下方的 str 依然变为 string。asserts 断言签名，还有种谓词签名，就是 is 了。

## 谓词签名

is 是谓词签名，所谓谓词签名，就是在另一个函数里强转参数，让使用其函数的函数可以正确判断类型。还是刚才例子，利用 is 来让 str 变成判断为 string。

```ts
function yell(str: any) {
  console.log(str); //此时仍是any
  if (assert(str)) {
    return str.toUpperCase(); //这里是string
  }
  return str.toUpperCase(); //这里是any
}

function assert(condition: any): condition is string {
  return condition;
}
```

## 实用场景

考虑如下代码：

```ts
type Person = {
  name: string;
  age?: number;
};

// 获得所有age属性
function getPersonAges(persons: Person[]): number[] {
  return persons
    .filter((person) => person.age !== undefined)
    .map((person) => person.age);
}
```

但是上面的代码却会报错：

```sh
Type '(number | undefined)[]' is not assignable to type 'number[]'.
Type 'number | undefined' is not assignable to type 'number'.
Type 'undefined' is not assignable to type 'number'.
```

因为使用 filter 处理得到的结果类型仍然是 Person[]，到 map 对 Person 类型的数据取值 age 自然会得到`number | undefined`类型，因为默认情况下使用的 Array.filter 的函数签名是这样的：

```ts
// lib.es5.d.ts
filter(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[]
```

很显然，此时数组为 T[]类型，得到的结果也肯定是 T[]类型的。那有什么方法能够解决上面的错误呢？实际上 Array.filter 还有另一种利用了 Type Guard 的函数签名：

```ts
// lib.es5.d.ts
filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[]

```

在此种情况下，首先需要提供一个类型 T 的子类型 S，然后回调函数需要提供一个 Type Guard 的断言函数，用于校验当前处理的值是否为 S 类型，抛弃掉不满足 S 类型的值，从而使得返回值的类型为 S[]。使用此方式重写上面的例子：

```ts
type Person = {
  name: string;
  age?: number;
};

type FullPerson = Required<Person>;

function getPersonAges(persons: Person[]): number[] {
  return persons
    .filter<FullPerson>(
      (person): person is FullPerson => person.age !== undefined
    )
    .map((person) => person.age);
}
```

这样经过 filter 处理后得到的结果类型为 FullPerson[]，到达 map 对 FullPerson 类型的数据取值 age 就能得到想要的 number 类型数据了。

自定义 Type Guard 需要开发者提供断言函数，提供符合某类型的校验实现。断言函数和普通的函数定义类似，只是在函数返回值的签名处有所差异：普通函数返回值的签名是一个具体的类型，而断言函数返回值的签名需要是一个断言：

```ts
// 普通函数
function isPerson(obj: any): boolean {
  // 具体实现，需要返回一个boolean值
}

// Type Guard断言函数
function isPerson(obj: any): obj is Person {
  // 具体实现，返回true表示obj经过我们验证是Person类型，返回false表示obj经过我们验证不是Person类型
}
```
