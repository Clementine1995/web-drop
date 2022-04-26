# Inner 的理解与使用

> [Inner 的理解与使用](https://blog.csdn.net/yehuozhili/article/details/108253532)

## 类型分发

首先看一下类型分发的基本例子：

```ts
interface Fish {
  fish: string;
}
interface Water {
  water: string;
}
interface Bird {
  bird: string;
}
interface Sky {
  sky: string;
}
//naked type
type Condition<T> = T extends Fish ? Water : Sky;

let condition1: Condition<Fish | Bird> = { water: "水" };
let condition2: Condition<Fish | Bird> = { sky: "天空" };
```

这个例子有个特点，就是下面的 condition1 和 condition2 里定义的类型里所传的泛型与后面赋值的类型并不一样。也就是说，类型分发一般是用来先知道已知类型，赋的值的类型会基于这个分发进行判断推出相应类型。乍看之下好像还是没什么用，比如 condition1，都知道类型，直接写个 Sky|Water 类型不好吗？为啥还搞个类型分发？上面那个例子确实没啥用，但是如果判断继承的也是泛型，那么就可以快速取出一些类型，而不用自己重新去定义：（虽然这些很多都是内置的）

```ts
type Diff<T, U> = T extends U ? never : T;

type R = Diff<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"

type Filter<T, U> = T extends U ? T : never;
type R1 = Filter<string | number | boolean, number>;
```

## infer

infer，returnType 就是 infer 搞得，代码是这样：

```ts
type ReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;
```

乍看之下好像有点难懂，其实仔细看发现还是很好理解的，它也是个类型分发。这个 infer 其实就相当于占位，也就是一个不知道的类型，用 infer X 去给他占位，再结合类型分发。但是 ts 不是能自动推断类型吗？为什么需要 Infer X 去推断类型，这个就是理解 Infer 的关键。

先结合个示例来进行说明：

```ts
export {};
type Parameters<T> = T extends (...args: infer R) => any ? R : any;
type T0 = Parameters<() => string>; // []
type T1 = Parameters<(s: string) => void>; // [string]
type T2 = Parameters<<T>(arg: T) => T>; // [unknown]
```

这个 parameter 也是内置的，可以看见，也是个类型分发，跟 returnType 区别就是 infer X 的占位跑到参数上去定义类型了。如果把 infer R 换成已知类型，那么这个类型分发就跟一开始的 demo 没太大区别：

```ts
type Parameters<T> = T extends (...args: string[]) => any ? string[] : any;
type T0 = Parameters<() => string>;
```

如果不换成已知类型，那么只写 R 不写 infer 会报错，因为不知道 R 是什么东西。那么如果通过泛型传呢？可惜 args 必须是个数组类型，所以用泛型传还得限定下它的条件：

```ts
type Parameters<T, R extends Array<any>> = T extends (...args: R) => any
  ? R
  : any;

type T0 = Parameters<() => string, string[]>;
```

可以发现，这么传跟已知类型传其实没太大区别，因为在传第二个泛型的时候，这个类型是知道的，所以这种情况，也没什么太大用处，除非传泛型的是另一个人，那么在写这个库的时候，倒是可以拿到用户所定义的类型。这时倒是有点作用。这样一换就可以发现，infer 可以在类型推导中去占任何位置，最后的推导的类型可以借助这之间所需的类型。可以看下这个例子加深理解:

```ts
type T1 = { name: string };
type T2 = { age: number };

type UnionToIntersection<T> = T extends {
  a: (x: infer U) => void;
  b: (x: infer U) => void;
}
  ? U
  : never;
type T3 = UnionToIntersection<{ a: (x: T1) => void; b: (x: T2) => void }>; // T1 & T2
```

这个例子就是 infer 取得参数，两个函数的参数，对于为啥 2 个会出来交叉类型，这里是协变，所以是交叉类型。
