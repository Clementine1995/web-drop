# 枚举

## 枚举介绍

TypeScript支持数字的和基于字符串的枚举。

### 数字枚举

与java中相同，默认第一项值为0，如果初始化了某一项，后面的自动在此基础上加一

```typescript
enum Direction {
	Up = 1,
	Down,
	Left,
	Right
}
使用例子
enum Choose {
	Wife,
	Mother
}
function saveWhich(choose: Choose): string {
	if(choose === Choose.Wife) {
		return 'saved wife'
	} else {
		return 'saved mother'
	}
}

console.log(saveWhich(Choose.Wife))
```

### 字符串枚举

在一个字符串枚举里，每个成员都必须用字符串字面量，或另外一个字符串枚举成员进行初始化。
字符串枚举没有自增长的行为，字符串枚举可以很好的序列化。

```typescript
	enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
	}
```

### 异构枚举

从技术的角度来说，枚举可以混合字符串和数字成员

```typescript
	enum BooleanLikeHeterogeneousEnum {
    No = 0,
    Yes = "YES",
	}
```

### 计算的和常量成员

每个枚举成员都带有一个值，它可以是常量或计算出来的。
当满足如下条件时，枚举成员被当作是常量：

+ 它是枚举的第一个成员且没有初始化器，这种情况下它被赋予值0
+ 它不带有初始化器且它之前的枚举成员是一个数字常量。 这种情况下，当前枚举成员的值为它上一个枚举成员的值加1。
+ 枚举成员使用常量枚举表达式初始化。常数枚举表达式是TypeScript表达式的子集，它可以在编译阶段求值。当一个表达式满足下面条件之一时，它就是一个常量枚举表达式：
  + 一个枚举表达式字面量（主要是字符串字面量或数字字面量）
  + 一个对之前定义的常量枚举成员的引用（可以是在不同的枚举类型中定义的）
  + 带括号的常量枚举表达式
  + 一元运算符 +, -, ~其中之一应用在了常量枚举表达式
  + 常量枚举表达式做为二元运算符 +, -, *, /, %, <<, >>, >>>, &, |, ^的操作对象。 若常数枚举表达式求值后为 NaN或 Infinity，则会在编译阶段报错。

### 联合枚举与枚举成员的类型

字面量枚举成员是指不带有初始值的常量枚举成员，或者是值被初始化为：

+ 任何字符串字面量（例如： "foo"， "bar"， "baz"）
+ 任何数字字面量（例如： 1, 100）
+ 应用了一元 -符号的数字字面量（例如： -1, -100）

当所有枚举成员都拥有字面量枚举值时，枚举成员成为了类型

### 运行时的枚举

```typescript
enum E {
	X, Y, Z
}
// 可以作为参数传递给函数
function f(obj: { X: number }) {
		return obj.X;
}
// 成功运作，只要E有一个number类型的X属性
f(E);
```

### 反向映射

数字枚举成员还具有了反向映射，从枚举值到枚举名字。

```typescript
enum Enum {
	A
}
let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

不会为字符串枚举成员生成反向映射

### const枚举

```typescript
const enum Directions {
  Up,
  Down,
  Left,
  Right
}
```

其编译为js代码后只是一个数组[0,1,2,3]

## 外部枚举

外部枚举用来描述已经存在的枚举类型的形状。

```typescript
declare enum Enum {
	A = 1,
	B,
	C = 2
}
```

外部枚举和非外部枚举之间有一个重要的区别，在正常的枚举里，没有初始化方法的成员被当成常数成员。 
对于非常数的外部枚举而言，没有初始化方法时被当做需要经过计算的。