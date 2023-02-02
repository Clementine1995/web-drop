# 函数

## 函数介绍

和JavaScript一样，TypeScript函数可以创建有名字的函数和匿名函数。

## 函数类型

### 为函数定义类型

可以给每个参数添加类型之后再为函数本身添加返回值类型。

```typescript
function add(x: number, y: number): number {
  return x + y;
}

let myAdd = function(x: number, y: number): number { return x + y; };
```

### 书写完整函数类型

只要参数类型是匹配的，那么就认为它是有效的函数类型，而不在乎参数名是否正确。
对于返回值，在函数和返回值类型之前使用( =>)符号,如果函数没有返回任何值，必须指定返回值类型为void而不能留空。

```typescript
let myAdd: (x: number, y: number) => number = function(x: number, y: number): number { return x + y; };
```

## 可选参数和默认参数

TypeScript里的每个函数参数都是必须的。而JS中函数参数可以不定，参数少，未传为undefined，传多了可以通过...拿到。
当在TS中使用?实现可选参数的功能,可选参数必须跟在必须参数后面。

```typescript
function buildName(firstName: string, lastName?: string) {
  if (lastName)
    return firstName + " " + lastName;
  else
  return firstName;
}

let result1 = buildName("Bob");  // works correctly now
let result2 = buildName("Bob", "Adams", "Sr.");  // error, too many parameters
let result3 = buildName("Bob", "Adams");  // ah, just right
// 默认参数，使用与ES6相同
function buildName(firstName: string, lastName = "Smith") {
  return firstName + " " + lastName;
}
```

可选参数与末尾的默认参数共享参数类型。
与普通可选参数不同的是，带默认值的参数不需要放在必须参数的后面。
如果带默认值的参数出现在必须参数前面，用户必须明确的传入 undefined值来获得默认值。

## 剩余参数，与ES6中相同

```typescript
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}

let employeeName = buildName("Joseph", "Samuel", "Lucas", "MacKinzie");
```

## this

### this和箭头函数

如果你给编译器设置了--noImplicitThis标记，它会在必要时指出this的指向问题

### this参数

但是即使使用了箭头函数，当把鼠标放到this上时，它依然会显示any，尽管在运行时它的指向正确
修改的方法是，提供一个显式的 this参数。 this参数是个假的参数，它出现在参数列表的最前面

```typescript
function f(this: void) {
// make sure `this` is unusable in this standalone function
}
像这个例子中，鼠标放上this指向Deck
interface Card {
  suit: string;
  card: number;
}
interface Deck {
  suits: string[];
  cards: number[];
  createCardPicker(this: Deck): () => Card;
}
let deck: Deck = {
  suits: ["hearts", "spades", "clubs", "diamonds"],
  cards: Array(52),
  // NOTE: The function now explicitly specifies that its callee must be of type Deck
  createCardPicker: function(this: Deck) {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return {suit: this.suits[pickedSuit], card: pickedCard % 13};
    }
  }
}

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

### this参数在回调函数里

## 重载

也就是方法名称相同，但参数个数，名称以及返回值类型可以不同的几个函数构成重载
为同一个函数提供多个函数类型定义来进行函数重载。 编译器会根据这个列表去处理函数的调用，下面例子中只有两个重载

```typescript
let suits = ["hearts", "spades", "clubs", "diamonds"];

function pickCard(x: {suit: string; card: number; }[]): number;
function pickCard(x: number): {suit: string; card: number; };
function pickCard(x): any {
  // Check to see if we're working with an object/array
  // if so, they gave us the deck and we'll pick the card
  if (typeof x == "object") {
    let pickedCard = Math.floor(Math.random() * x.length);
    return pickedCard;
  }
  // Otherwise just let them pick the card
  else if (typeof x == "number") {
    let pickedSuit = Math.floor(x / 13);
    return { suit: suits[pickedSuit], card: x % 13 };
  }
}

let myDeck = [{ suit: "diamonds", card: 2 }, { suit: "spades", card: 10 }, { suit: "hearts", card: 4 }];
let pickedCard1 = myDeck[pickCard(myDeck)];
alert("card: " + pickedCard1.card + " of " + pickedCard1.suit);

let pickedCard2 = pickCard(15);
alert("card: " + pickedCard2.card + " of " + pickedCard2.suit);
```

## 调用签名

In JavaScript, functions can have properties in addition to being callable. However, the function type expression syntax doesn’t allow for declaring properties. If we want to describe something callable with properties, we can write a call signature in an object type:

在 JS 中，函数除了可以调用之外，还可以拥有属性，然而函数类型表达式语法不允许声明属性，如果想要描述可调用的东西拥有某些属性，可以通过对象类型来编写调用签名。

```ts
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};
function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6));
}
```

> 注意，与函数类型表达式声明语法不同，调用签名在参数列表和返回值类型之间使用 `:` 而不是 `=>`
