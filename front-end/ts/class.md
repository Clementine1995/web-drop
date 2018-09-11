# 类

## 类（声明）

```typescript
class Greeter {
	greeting: string;
	constructor(message: string) {
		this.greeting = message;
	}
	greet() {
		return "Hello, " + this.greeting;
	}
}
let greeter = new Greeter("world");
```

## 继承

关键字extends

```typescript
	class Animal {
    name: string;
    constructor(theName: string) { this.name = theName; }
    move(distanceInMeters: number = 0) {
			console.log(`${this.name} moved ${distanceInMeters}m.`);
    }
	}

	class Snake extends Animal {
		constructor(name: string) { super(name); }
		move(distanceInMeters = 5) {
			console.log("Slithering...");
			super.move(distanceInMeters);
		}
	}

	class Horse extends Animal {
		constructor(name: string) { super(name); }
		move(distanceInMeters = 45) {
			console.log("Galloping...");
			super.move(distanceInMeters);
		}
	}

	let sam = new Snake("Sammy the Python");
	let tom: Animal = new Horse("Tommy the Palomino");

	sam.move();
	tom.move(34);
```

派生类如果包含了一个构造函数，它必须调用 super()，并且super()应该放在构造函数第一行执行

## 公共，私有与受保护的修饰符

### 默认为public

TypeScript里，成员都默认为 public。可以供类外访问

### 理解private

+ 当成员被标记成 private时，它就不能在声明它的类的外部访问。
+ 父类对象可以赋值给子类对象，前提是子类没有多余属性
+ 子类对象可以赋值给父类对象，这跟java中是一样的，同样这时父类对象也不可以调用子类扩展的属性

### 理解protected

+ protected成员在派生类中仍然可以访问，但在类外不可以访问
+ 构造函数也可以被标记成protected。这意味着这个类不能在包含它的类外被实例化，但是能被继承

## readonly修饰符

使用 readonly关键字将属性设置为只读的。 只读属性必须在声明时或构造函数里被初始化。

```typescript
	class Octopus {
    readonly name: string;
    readonly numberOfLegs: number = 8;
    constructor (theName: string) {
			this.name = theName;
    }
	}
	let dad = new Octopus("Man with the 8 strong legs");
	dad.name = "Man with the 3-piece suit"; // 错误! name 是只读的.
```

### 参数属性

参数属性通过给构造函数参数添加一个访问限定符来声明。使用 private限定一个参数属性会声明并初始化一个私有成员；对于 public和 protected来说也是一样。

```typescript
	class Animal {
    constructor(private name: string) { }
    move(distanceInMeters: number) {
			console.log(`${this.name} moved ${distanceInMeters}m.`);
		}
	}
```

## 存取器(getter/setter)

只带有 get不带有 set的存取器自动被推断为 readonly。存取器要求你将编译器设置为输出ECMAScript 5或更高。

```
	let passcode = "secret passcode";
	class Employee {
		private _fullName: string;

		get fullName(): string {
				return this._fullName;
		}

		set fullName(newName: string) {
				if (passcode && passcode == "secret passcode") {
						this._fullName = newName;
				}
				else {
						console.log("Error: Unauthorized update of employee!");
				}
		}
	}
	let employee = new Employee();
	employee.fullName = "Bob Smith";
	if (employee.fullName) {
			alert(employee.fullName);
	}
```

## 静态属性

关键字static，静态属性通过 类名.属性 的方式调用

```typescript
	class Grid {
    static origin = {x: 0, y: 0};
    calculateDistanceFromOrigin(point: {x: number; y: number;}) {
			let xDist = (point.x - Grid.origin.x);
			let yDist = (point.y - Grid.origin.y);
			return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale;
    }
    constructor (public scale: number) { }
	}

	let grid1 = new Grid(1.0);  // 1x scale
	let grid2 = new Grid(5.0);  // 5x scale

	console.log(grid1.calculateDistanceFromOrigin({x: 10, y: 10}));
	console.log(grid2.calculateDistanceFromOrigin({x: 10, y: 10}));
```

## 抽象类

抽象类做为其它派生类的基类使用。abstract关键字是用于定义抽象类和在抽象类内部定义抽象方法。它们一般不会直接被实例化。
不同于接口，抽象类可以包含成员的实现细节。

```typescript
	abstract class Animal {
    abstract makeSound(): void;
    move(): void {
			console.log('roaming the earch...');
    }
	}
```	

抽象类中的抽象方法不包含具体实现并且必须在派生类中实现，并且该类方法必须被abstract修饰。

## 高级技巧

### 构造函数

### 把类当做接口使用