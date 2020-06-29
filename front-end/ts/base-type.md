# 基础类型

## 布尔值

```typescript
let isDone: boolean = false;
```

## 数字

```typescript
let decLiteral: number = 6;
let octalLiteral: number = 0o744;
```

## 字符串

`let name: string = "bob";`

还可以使用模版字符串，它可以定义多行文本和内嵌表达式

```typescript
let name: string = `Gene`;
```

## 数组

第一种，可以在元素类型后面接上 []

`let list: number[] = [1, 2, 3];`

第二种方式是使用数组泛型，Array<元素类型>：

`let list: Array<number> = [1, 2, 3];`

还有第三种是借助于接口来实现

```ts
// arrayInterface.ts
interface ArrayNumber {
  [index: number]: number
}

let arrayNumberInterface: ArrayNumber = [1, 1, 2, 3, 5];
```

对于类数组的处理：

```ts
function arrayArguments2(){
  let args: IArguments = arguments;
}
```

## 元组 Tuple

元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。
`let x: [string, number];`表示x这个数组中既可以有string，也可以有number，同时该数组上元素拥有这两种类型的方法

## 枚举

```typescript
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
```

默认情况下，从0开始为元素编号。你也可以手动的指定成员的数值。

`enum Color {Red = 1, Green = 2, Blue = 4}`

通过Color[2]也可以找到Color这个枚举类型中值为2的枚举值名称，这里应该返回'Green'

## Any

可以使用 any类型来标记编程阶段还不清楚类型的变量

```typescript
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false;
```

Object虽然在含义上能实现类似，但Object类型的变量只是允许你给它赋任意值，却不能够在它上面调用任意的方法。

## Void

它表示没有任何类型。 最常见是函数没有返回值时

```typescript
function warnUser(): void {
alert("This is my warning message");
}
```

当一个变量声明为void类型是，只能为它赋予undefined和null

## Null 和 Undefined

默认情况下null和undefined是所有类型的子类型，所以他俩赋值给其他类型的变量，比如number。
当你指定了--strictNullChecks标记，null和undefined只能赋值给void和它们各自。

## unknown

unknown类型与any都可以表示任何类型，但是它更安全，any 类型的变量是可以进行任意进行赋值、实例化、函数执行等操作，但是 unknown 只允许赋值，不允许实例化、函数执行等操作。

## Never

never类型表示的是那些永不存在的值的类型，比如：总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型，还有无限死循环的函数

never类型是任何类型的子类型，也可以赋值给任何类型；没有类型是never的子类型或可以赋值给never类型（除了never本身之外）。即使any也不可以赋值给never。

```typescript
function error(message: string): never {
  throw new Error(message);
}
function infiniteLoop(): never {
  while (true) {
  }
}
```

## 类型断言

也就是其他语言中的强制类型转换，有两种形式：
其一是“尖括号”语法：

```typescript
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;
```

其二是as语法

```typescript
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```

当你在TypeScript里使用JSX时，只有as是允许的。
