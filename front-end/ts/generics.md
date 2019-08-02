# 泛型

## 泛型定义

```typescript
function identity(arg: number): number {
  return arg;
}
function identity(arg: any): any {
  return arg;
}
```

可能有很多...可以使用泛型代表这一类函数，T叫做类型变量，帮助我们捕获用户传入的类型

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

定义了泛型函数后，可以用两种方法使用。 明确的指定了T是string类型，或者利用类型推论

```typescript
  let output = identity<string>("myString");
  let output = identity("myString");
```

## 使用泛型变量

```typescript
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length);  // Error: T doesn't have .length
  return arg;
}
```

编译器会报错说我们使用了arg的.length属性，但是没有地方指明arg具有这个属性

```typescript
function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length);  // Array has a .length, so no more error
  return arg;
}
```

这可以让我们把泛型变量T当做类型的一部分使用，而不是整个类型，增加了灵活性。

或者利用接口

```ts
interface Length {
    length: number;
}

function same6<T extends Length>(arg: T): T {
    console.log(arg.length);
    return arg;
}
console.log(same6(18));
console.log(same6('十八'));
console.log(same6(['pr', '30', 'boy']));
```

## 泛型类型

泛型函数的类型

```typescript
	function identity<T>(arg: T): T {
    return arg;
	}

	let myIdentity: <T>(arg: T) => T = identity;
```


也可以使用不同的泛型参数名，只要在数量上和使用方式上能对应上就可以

```typescript
	function identity<T>(arg: T): T {
    return arg;
	}

	let myIdentity: <U>(arg: U) => U = identity;
```

还可以使用带有调用签名的对象字面量来定义泛型函数：

```typescript
	function identity<T>(arg: T): T {
    return arg;
	}

	let myIdentity: {<T>(arg: T): T} = identity;
```

把上面例子里的对象字面量拿出来做为一个接口

```typescript
	interface GenericIdentityFn {
    <T>(arg: T): T;
	}

	function identity<T>(arg: T): T {
			return arg;
	}

	let myIdentity: GenericIdentityFn = identity;
```

泛型参数当作整个接口的一个参数，这时需要传入一个类型参数来指定泛型类型（这里是：number），锁定了之后代码里使用的类型。

```typescript
	interface GenericIdentityFn<T> {
    (arg: T): T;
	}

	function identity<T>(arg: T): T {
			return arg;
	}

	let myIdentity: GenericIdentityFn<number> = identity;
```

对于描述哪部分类型属于泛型部分来说，理解何时把参数放在调用签名里和何时放在接口上是很有帮助的。

## 泛型类

泛型类使用（ <>）括起泛型类型，跟在类名后面。

```typescript
	class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
	}

	let myGenericNumber = new GenericNumber<number>();
	myGenericNumber.zeroValue = 0;
	myGenericNumber.add = function(x, y) { return x + y; };
```

泛型类指的是实例部分的类型，所以类的静态属性不能使用这个泛型类型。

## 泛型约束

我们定义一个接口来描述约束条件。 创建一个包含 .length属性的接口，使用这个接口和extends关键字来实现约束：

```typescript
	interface Lengthwise {
			length: number;
	}

	function loggingIdentity<T extends Lengthwise>(arg: T): T {
			console.log(arg.length);  // Now we know it has a .length property, so no more error
			return arg;
	}
```

现在这个泛型函数被定义了约束，因此它不再是适用于任意类型：

```typescript
loggingIdentity(3);  // Error, number doesn't have a .length property
```

我们需要传入符合约束类型的值，必须包含必须的属性：

```typescript
loggingIdentity({length: 10, value: 3});
```

### 在泛型约束中使用类型参数

你可以声明一个类型参数，且它被另一个类型参数所约束。现在我们想要用属性名从对象里获取这个属性。
并且我们想要确保这个属性存在于对象 obj上，因此我们需要在这两个类型之间使用约束。

```typescript
	function getProperty(obj: T, key: K) {
    return obj[key];
	}

	let x = { a: 1, b: 2, c: 3, d: 4 };

	getProperty(x, "a"); // okay
	getProperty(x, "m"); // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.
```

### 在泛型里使用类类型

```typescript
	function create<T>(c: {new(): T; }): T {
    return new c();
	}
```

一个更高级的例子，使用原型属性推断并约束构造函数与类实例的关系。

```typescript
	class BeeKeeper {
			hasMask: boolean;
	}
	class ZooKeeper {
			nametag: string;
	}
	class Animal {
			numLegs: number;
	}
	class Bee extends Animal {
			keeper: BeeKeeper;
	}
	class Lion extends Animal {
			keeper: ZooKeeper;
	}
	function createInstance<A extends Animal>(c: new () => A): A {
			return new c();
	}
	createInstance(Lion).keeper.nametag;  // typechecks!
	createInstance(Bee).keeper.hasMask;   // typechecks!
```