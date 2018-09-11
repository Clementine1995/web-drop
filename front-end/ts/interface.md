# 接口

## 接口初探

```typescript
	interface LabelledValue {
		label: string;
	}
	function printLabel(labelledObj: LabelledValue) {
		console.log(labelledObj.label);
	}
	let myObj = {size: 10, label: "Size 10 Object"};
	printLabel(myObj);
```

LabelledValue接口就好比一个名字，用来描述上面例子里的要求。 它代表了有一个 label属性且类型为string的对象。 
需要注意的是，我们在这里并不能像在其它语言里一样，说传给 printLabel的对象实现了这个接口。类型检查器不会去检查属性的顺序。

## 可选属性

接口里的属性不全都是必需的时候，可选属性名字定义的后面加一个?符号

```typescript
	interface SquareConfig {
		color?: string;
		width?: number;
	}
```

可选属性的好处之一是可以对可能存在的属性进行预定义，好处之二是可以捕获引用了不存在的属性时的错误。

## 只读属性

一些对象属性只能在对象刚刚创建的时候修改其值。 你可以在属性名前用 readonly来指定只读属性:

```typescript
	interface Point {
			readonly x: number;
			readonly y: number;
	}
```

你可以通过赋值一个对象字面量来构造一个Point。赋值后，x和y再也不能被改变了。

```typescript
	let p1: Point = { x: 10, y: 20 };
	p1.x = 5; // error!
```

TypeScript具有ReadonlyArray<T>类型，它与Array<T>相似，只是把所有可变方法去掉了，
因此可以确保数组创建后再也不能被修改，也不可以把它再赋值给其他普通数组，但是可以用as重写赋值

### readonly vs const

最简单判断该用readonly还是const的方法是看要把它做为变量使用还是做为一个属性。 做为变量使用的话用 const，若做为属性则使用readonly。

## 额外的属性检查

对象字面量会被特殊对待而且会经过 额外属性检查，当将它们赋值给变量或作为参数传递的时候。 如果一个对象字面量存在任何“目标类型”不包含的属性时，你会得到一个错误。

```typescript
	interface SquareConfig {
    color?: string;
    width?: number;
	}
	function createSquare(config: SquareConfig): { color: string; area: number } {
			// ...
	}
	let mySquare = createSquare({ colour: "red", width: 100 });
```

这种情况，最简便的方法是使用类型断言

```typescript
	let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

但是也可以动态的给接口添加属性，前提是你能够确定这个对象可能具有某些做为特殊用途使用的额外属性。

```typescript
	interface SquareConfig {
		color?: string;
		width?: number;
		[propName: string]: any;
	}
```

还可以将该对象字面量赋值给一个对象，来跳过这种额外检查，但是大部分额外属性检查错误是真正的bug，应该去审查一下你的类型声明。

```typescript
	let squareOptions = { colour: "red", width: 100 };
	let mySquare = createSquare(squareOptions);
```

## 函数类型

为了使用接口表示函数类型，我们需要给接口定义一个调用签名。
它就像是一个只有参数列表和返回值类型的函数定义。参数列表里的每个参数都需要名字和类型。

```typescript
	interface SearchFunc {
		(source: string, subString: string): boolean;
	}
	let mySearch: SearchFunc;
	mySearch = function(source: string, subString: string) {
		let result = source.search(subString);
		return result > -1;
	}
```

注意函数的参数名不需要与接口里定义的名字相匹配。

## 可索引的类型

可以描述那些能够“通过索引得到”的类型，比如a[10]或ageMap["daniel"]。
可索引类型具有一个索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。

```typescript
	interface StringArray {
		[index: number]: string;
	}
	let myArray: StringArray;
	myArray = ["Bob", "Fred"];
	let myStr: string = myArray[0];
	共有支持两种索引签名：字符串和数字，可以同时使用两种类型的索引，但是数字索引的返回值必须是字符串索引返回值类型的子类型。
	将索引签名设置为只读，可以防止了给索引赋值
	interface ReadonlyStringArray {
    readonly [index: number]: string;
	}
	let myArray: ReadonlyStringArray = ["Alice", "Bob"];
	myArray[2] = "Mallory"; // error!
```

## 类类型

与C#或Java里接口的基本作用一样，明确的强制一个类去符合某种契约

```typescript
	interface ClockInterface {
    currentTime: Date;
    setTime(d: Date);
	}

	class Clock implements ClockInterface {
		currentTime: Date;
		setTime(d: Date) {
			this.currentTime = d;
		}
		constructor(h: number, m: number) { }
	}
```

接口描述了类的公共部分，而不是公共和私有两部分。
当一个类实现了一个接口时，只对其实例部分进行类型检查。constructor存在于类的静态部分，所以不在检查的范围内。
即约束类的构造方法，又约束类的公共部分，需要定义两个接口。

```typescript
	interface ClockConstructor {
		new (hour: number, minute: number): ClockInterface;
	}
	interface ClockInterface {
		tick();
	}
	function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
		return new ctor(hour, minute);
	}
	class DigitalClock implements ClockInterface {
		constructor(h: number, m: number) { }
		tick() {
			console.log("beep beep");
		}
	}
	class AnalogClock implements ClockInterface {
		constructor(h: number, m: number) { }
		tick() {
			console.log("tick tock");
		}
	}
	let digital = createClock(DigitalClock, 12, 17);
	let analog = createClock(AnalogClock, 7, 32);
```

## 继承接口

和类一样，接口也可以相互继承。

```typescript
	interface Shape {
    color: string;
	}

	interface Square extends Shape {
		sideLength: number;
	}

	let square = <Square>{};
	square.color = "blue";
	square.sideLength = 10;
```

## 混合类型

```
	interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
	}
	function getCounter(): Counter {
		let counter = <Counter>function (start: number) { };
		counter.interval = 123;
		counter.reset = function () { };
		return counter;
	}
	let c = getCounter();
	c(10);
	c.reset();
	c.interval = 5.0;
```

## 接口继承类

当接口继承了一个类类型时，它会继承类的成员但不包括其实现。接口同样会继承到类的private和protected成员。
