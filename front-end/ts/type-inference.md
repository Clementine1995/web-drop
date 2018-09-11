# 类型推论

## 基础

TypeScript里，在有些没有明确指出类型的地方，类型推论会帮助提供类型。

```typescript
let x = 3;
```

变量x的类型被推断为数字。 这种推断发生在初始化变量和成员，设置默认参数值和决定函数返回值时。

## 最佳通用类型

当需要从几个表达式中推断类型时候，会使用这些表达式的类型来推断出一个最合适的通用类型。例如，

```typescript
	let x = [0, 1, null];
```

为了推断x的类型，我们必须考虑所有元素的类型。 这里有两种选择： number和null。
计算通用类型算法会考虑所有的候选类型，并给出一个兼容所有候选类型的类型。

```typescript
	let zoo = [new Rhino(), new Elephant(), new Snake()];
```

这里，我们想让zoo被推断为Animal[]类型，但是这个数组里没有对象是Animal类型的，因此不能推断出这个结果。 为了更正，当候选类型不能使用的时候我们需要明确的指出类型：

```typescript
let zoo: Animal[] = [new Rhino(), new Elephant(), new Snake()];
```

如果没有找到最佳通用类型的话，类型推断的结果为联合数组类型，(Rhino | Elephant | Snake)[]。

## 上下文类型

按上下文归类会发生在表达式的类型与所处的位置相关时。比如：

```typescript
	window.onmousedown = function(mouseEvent) {
			console.log(mouseEvent.button);  //<- Error
	};
```