# Rust 基础入门 3

## 流程控制

Rust 程序是从上而下顺序执行的，在此过程中，我们可以通过循环、分支等流程控制方式，更好的实现相应的功能。

### 使用 if 来做分支控制

if else 表达式根据条件执行不同的代码分支：

```rust
if condition == true {
  // A...
} else {
  // B...
}

fn main() {
  let condition = true;
  let number = if condition {
    5
  } else {
    6
  };

  println!("The value of number is: {}", number);
}
```

- if 语句块是表达式，这里我们使用 if 表达式的返回值来给 number 进行赋值：number 的值是 5
- 用 if 来赋值时，要保证每个分支返回的类型一样，此处返回的 5 和 6 就是同一个类型，如果返回类型不一致就会报错。

#### 使用 else if 来处理多重条件

```rust
fn main() {
  let n = 6;

  if n % 4 == 0 {
    println!("number is divisible by 4");
  } else if n % 3 == 0 {
    println!("number is divisible by 3");
  } else if n % 2 == 0 {
    println!("number is divisible by 2");
  } else {
    println!("number is not divisible by 4, 3, or 2");
  }
}
```

### 循环控制

在 Rust 语言中有三种循环方式：for、while 和 loop。

#### for 循环

for 循环语义表达如下：

```rust
for item in &container {
  // ...
}
```

使用 for 时我们往往使用集合的引用形式，除非你不想在后面的代码中继续使用该集合，因为会把所有权转移到 for 语句块中。

对于实现了 copy 特征的数组(例如 [i32; 10] )而言， for item in arr 并不会把 arr 的所有权转移，而是直接对其进行了拷贝，因此循环之后仍然可以使用 arr 。

如果想在循环中，修改该元素，可以使用 mut 关键字：

```rust
for item in &mut collection {
  // ...
}
```

| 使用方法                    | 等价使用方式                                    | 所有权     |
| --------------------------- | ----------------------------------------------- | ---------- |
| for item in collection      | for item in IntoIterator::into_iter(collection) | 转移所有权 |
| for item in &collection     | for item in collection.iter()                   | 不可变借用 |
| for item in &mut collection | for item in collection.iter_mut()               | 可变借用   |

如果想在循环中获取元素的索引：

```rust
fn main() {
  let a = [4,3,2,1];
  // `.iter()` 方法把 `a` 数组变成一个迭代器
  for (i,v) in a.iter().enumerate() {
    println!("第{}个元素是{}",i+1,v);
  }
}
```

不想单独声明一个变量来控制这个流程:

```rust
for _ in 0..10 {
  // ...
}
```

在 Rust 中 `_` 的含义是忽略该值或者类型的意思，如果不使用 `_`，那么编译器会给你一个 `变量未使用的` 的警告。

##### 两种循环方式优劣对比

以下代码，使用了两种循环方式：

```rust
// 第一种
let collection = [1, 2, 3, 4, 5];
for i in 0..collection.len() {
  let item = collection[i];
  // ...
}

// 第二种
for item in collection {

}
```

第一种方式是循环索引，然后通过索引下标去访问集合，第二种方式是直接循环集合中的元素，优劣如下：

- 性能：第一种使用方式中 collection[index] 的索引访问，会因为边界检查(Bounds Checking)导致运行时的性能损耗 —— Rust 会检查并确认 index 是否落在集合内，但是第二种直接迭代的方式就不会触发这种检查，因为编译器会在编译时就完成分析并证明这种访问是合法的
- 安全：第一种方式里对 collection 的索引访问是非连续的，存在一定可能性在两次访问之间，collection 发生了变化，导致脏数据产生。而第二种直接迭代的方式是连续访问，因此不存在这种风险（这里是因为所有权吗？是的话可能要强调一下）

##### continue

使用 continue 可以跳过当前当次的循环，开始下次的循环：

```rust
for i in 1..4 {
  if i == 2 {
    continue;
  }
  println!("{}",i);
}
```

##### break

使用 break 可以直接跳出当前整个循环：

```rust
for i in 1..4 {
  if i == 2 {
    break;
  }
  println!("{}",i);
}
```

#### while 循环

如果你需要一个条件来循环，当该条件为 true 时，继续循环，条件为 false，跳出循环，那么 while 就非常适用：

```rust
fn main() {
  let mut n = 0;
  while n <= 5  {
    println!("{}!", n);
    n = n + 1;
  }
  println!("我出来了！");
}
```

#### while vs for

for 可以不使用索引去访问数组，因此更安全也更简洁，同时避免 运行时的边界检查，性能更高。

#### loop 循环

loop 就是一个简单的无限循环，你可以在内部实现逻辑通过 break 关键字来控制循环何时结束。

```rust
fn main() {
  let mut counter = 0;
  let result = loop {
    counter += 1;
    if counter == 10 {
      break counter * 2;
    }
  };
  println!("The result is {}", result);
}
```

- break 可以单独使用，也可以带一个返回值，有些类似 return
- loop 是一个表达式，因此可以返回一个值

## 模式匹配

### match 和 if let

在 Rust 中，模式匹配最常用的就是 match 和 if let，本章节将对两者及相关的概念进行详尽介绍。

#### match 匹配

首先来看看 match 的通用形式：

```rust
match target {
  模式1 => 表达式1,
  模式2 => {
    语句1;
    语句2;
    表达式2
  },
  _ => 表达式3
}
```

该形式清晰的说明了何为模式，何为模式匹配：将模式与 target 进行匹配，即为模式匹配，而模式匹配不仅仅局限于 match。match 允许我们将一个值与一系列的模式相比较，并根据相匹配的模式执行对应的代码

```rust
enum Coin {
  Penny,
  Nickel,
  Dime,
  Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
  match coin {
    Coin::Penny =>  {
      println!("Lucky penny!");
      1
    },
    Coin::Nickel => 5,
    Coin::Dime => 10,
    Coin::Quarter => 25,
  }
}
```

value_in_cents 函数根据匹配到的硬币，返回对应的美分数值。match 后紧跟着的是一个表达式，跟 if 很像，但是 if 后的表达式必须是一个布尔值，而 match 后的表达式返回值可以是任意类型，只要能跟后面的分支中的模式匹配起来即可，这里的 coin 是枚举 Coin 类型。

接下来是 match 的分支。一个分支有两个部分：一个模式和针对该模式的处理代码。第一个分支的模式是 Coin::Penny，其后的 => 运算符将模式和将要运行的代码分开。这里的代码就仅仅是表达式 1，不同分支之间使用逗号分隔。

当 match 表达式执行时，它将目标值 coin 按顺序依次与每一个分支的模式相比较，如果模式匹配了这个值，那么模式之后的代码将被执行。如果模式并不匹配这个值，将继续执行下一个分支。

每个分支相关联的代码是一个表达式，而表达式的结果值将作为整个 match 表达式的返回值。如果分支有多行代码，那么需要用 {} 包裹，同时最后一行代码需要是一个表达式。

##### 使用 match 表达式赋值

match 本身也是一个表达式，因此可以用它来赋值

##### 模式绑定

模式匹配的另外一个重要功能是从模式中取出绑定的值，例如：

```rust
#[derive(Debug)]
enum UsState {
  Alabama,
  Alaska,
  // --snip--
}

enum Coin {
  Penny,
  Nickel,
  Dime,
  Quarter(UsState), // 25美分硬币
}

fn value_in_cents(coin: Coin) -> u8 {
  match coin {
    Coin::Penny => 1,
    Coin::Nickel => 5,
    Coin::Dime => 10,
    Coin::Quarter(state) => {
      println!("State quarter from {:?}!", state);
      25
    },
  }
}
```

上面代码中，在匹配 Coin::Quarter(state) 模式时，我们把它内部存储的值绑定到了 state 变量上，因此 state 变量就是对应的 UsState 枚举类型。

例如有一个印了阿拉斯加州标记的 25 分硬币：Coin::Quarter(UsState::Alaska)), 它在匹配时，state 变量将被绑定 UsState::Alaska 的枚举值。

##### 穷尽匹配

match 的匹配必须穷尽所有情况

```rust
enum Direction {
  East,
  West,
  North,
  South,
}

fn main() {
  let dire = Direction::South;
  match dire {
    Direction::East => println!("East"),
    Direction::North | Direction::South => {
      println!("South or North");
    },
  };
}
```

没有处理 Direction::West 的情况，因此会报错

##### `_` 通配符

当我们不想在匹配的时候列出所有值的时候，可以使用 Rust 提供的一个特殊模式 `_` 替代：

```rust
let some_u8_value = 0u8;
match some_u8_value {
  1 => println!("one"),
  3 => println!("three"),
  5 => println!("five"),
  7 => println!("seven"),
  _ => (),
}
```

通过将 `_` 其放置于其他分支后，`_` 将会匹配所有遗漏的值。() 表示返回单元类型与所有分支返回值的类型相同，所以当匹配到 \_ 后，什么也不会发生。

#### if let 匹配

有时会遇到只有一个模式的值需要被处理，其它值直接忽略的场景，可以用 if let 的方式来实现：

```rust
if let Some(3) = v {
  println!("three");
}
```

当你只要匹配一个条件，且忽略其他条件时就用 if let ，否则都用 match。

#### matches!宏

Rust 标准库中提供了一个非常实用的宏：matches!，它可以将一个表达式跟模式进行匹配，然后返回匹配的结果 true or false。

例如，有一个动态数组，里面存有以下枚举：

```rust
enum MyEnum {
  Foo,
  Bar
}
fn main() {
  let v = vec![MyEnum::Foo,MyEnum::Bar,MyEnum::Foo];
}
```

现在如果想对 v 进行过滤，只保留类型是 MyEnum::Foo 的元素，你可能想这么写：

```rust
v.iter().filter(|x| x == MyEnum::Foo);
```

但是，实际上这行代码会报错，因为你无法将 x 直接跟一个枚举成员进行比较。可以使用 match 来完成，但是会导致代码更为啰嗦，是否有更简洁的方式？答案是使用 `matches!`：

```rust
v.iter().filter(|x| matches!(x, MyEnum::Foo));
```

#### 变量覆盖

无论是是 match 还是 if let，他们都可以在模式匹配时覆盖掉老的值，绑定新的值:

```rust
fn main() {
  let age = Some(30);
  println!("在匹配前，age是{:?}",age);
  if let Some(age) = age {
    println!("匹配出来的age是{}",age);
  }
  println!("在匹配后，age是{:?}",age);
}
```

### 解构 Option

在枚举那里提到过 Option 枚举，用来解决 Rust 中变量是否有值的问题，如何去使用这个 Option 枚举类型可以通过 match 来实现。

#### 匹配 `Option<T>`

使用 `Option<T>`，是为了从 Some 中取出其内部的 T 值以及处理没有值的情况，为了演示这一点，下面一起来编写一个函数，它获取一个 `Option<i32>`，如果其中含有一个值，将其加一；如果其中没有值，则函数返回 None 值：

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
  match x {
    None => None,
    Some(i) => Some(i + 1),
  }
}
let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

plus_one 接受一个 `Option<i32>` 类型的参数，同时返回一个 `Option<i32>` 类型的值(这种形式的函数在标准库内随处所见)，在该函数的内部处理中，如果传入的是一个 None ，则返回一个 None 且不做任何处理；如果传入的是一个 `Some(i32)`，则通过模式绑定，把其中的值绑定到变量 i 上，然后返回 i+1 的值，同时用 `Some` 进行包裹。

### 模式适用场景

模式是 Rust 中的特殊语法，它用来匹配类型中的结构和数据，它往往和 match 表达式联用，以实现强大的模式匹配能力。模式一般由以下内容组合而成：

- 字面值
- 解构的数组、枚举、结构体或者元组
- 变量
- 通配符
- 占位符

#### 所有可能用到模式的地方

- match 分支：match 的每个分支就是一个模式
- if let 分支：用于匹配一个模式
- while let 条件循环：它允许只要模式匹配就一直进行 while 循环。
- for 循环
- let 语句
- 函数参数
- if 和 if let：要求完全覆盖匹配，才能通过编译。

### 全模式列表

#### 匹配字面值

```rust
let x = 1;

match x {
  1 => println!("one"),
  2 => println!("two"),
  3 => println!("three"),
  _ => println!("anything"),
}
```

#### 匹配命名变量

在 match 中，有讲过变量覆盖的问题，这个在匹配命名变量时会遇到：

```rust
fn main() {
  let x = Some(5);
  let y = 10;

  match x {
    Some(50) => println!("Got 50"),
    Some(y) => println!("Matched, y = {:?}", y),
    _ => println!("Default case, x = {:?}", x),
  }

  println!("at the end: x = {:?}, y = {:?}", x, y);
}
```

第一个匹配分支的模式并不匹配 x 中定义的值，所以代码继续执行。

第二个匹配分支中的模式引入了一个新变量 y，它会匹配任何 Some 中的值。因为这里的 y 在 match 表达式的作用域中，而不是之前 main 作用域中，所以这是一个新变量，不是开头声明为值 10 的那个 y。这个新的 y 绑定会匹配任何 Some 中的值，在这里是 x 中的值。因此这个 y 绑定了 x 中 Some 内部的值。这个值是 5，所以这个分支的表达式将会执行并打印出 Matched，y = 5。

如果 x 的值是 None 而不是 Some(5)，头两个分支的模式不会匹配，所以会匹配模式 `_`。这个分支的模式中没有引入变量 x，所以此时表达式中的 x 会是外部没有被覆盖的 x，也就是 Some(5)。

一旦 match 表达式执行完毕，其作用域也就结束了，同理内部 y 的作用域也结束了。最后的 println! 会打印 at the end: x = Some(5), y = 10。

如果不想引入变量覆盖，那么需要使用匹配守卫(match guard)的方式。

#### 单分支多模式

在 match 表达式中，可以使用 | 语法匹配多个模式，它代表 或的意思：

```rust
let x = 1;

match x {
  1 | 2 => println!("one or two"),
  3 => println!("three"),
  _ => println!("anything"),
}
```

#### 通过序列 ..= 匹配值的范围

序列语法，该语法不仅可以用循环中，还能用于匹配模式。

`..=` 语法允许你匹配一个闭区间序列内的值。在如下代码中，当模式匹配任何在此序列内的值时，该分支会执行：

```rust
let x = 5;

match x {
  1..=5 => println!("one through five"),
  _ => println!("something else"),
}
```

如果 x 是 1、2、3、4 或 5，第一个分支就会匹配。这相比使用 | 运算符表达相同的意思更为方便。

序列只允许用于数字或字符类型，原因是：它们可以连续，同时编译器在编译期可以检查该序列是否为空，字符和数字值是 Rust 中仅有的可以用于判断是否为空的类型。

#### 解构并分解值

也可以使用模式来解构结构体、枚举、元组和引用。

##### 解构结构体

下面代码展示了如何用 let 解构一个带有两个字段 x 和 y 的结构体 Point：

```rust
struct Point {
  x: i32,
  y: i32,
}

fn main() {
  let p = Point { x: 0, y: 7 };
  // 指定变量名为 a 和 b，与 js 解构类似
  let Point { x: a, y: b } = p;
  // let Point { x, y } = p; 这样也可以
  assert_eq!(0, a);
  assert_eq!(7, b);
}
```

##### 解构枚举

下面代码以 Message 枚举为例，编写一个 match 使用模式解构每一个内部值：

```rust
enum Message {
  Quit,
  Move { x: i32, y: i32 },
  Write(String),
  ChangeColor(i32, i32, i32),
}

fn main() {
  let msg = Message::ChangeColor(0, 160, 255);

  match msg {
    Message::Quit => {
      println!("The Quit variant has no data to destructure.")
    }
    Message::Move { x, y } => {
      println!(
        "Move in the x direction {} and in the y direction {}",
        x,
        y
      );
    }
    Message::Write(text) => println!("Text message: {}", text),
    Message::ChangeColor(r, g, b) => {
      println!(
        "Change the color to red {}, green {}, and blue {}",
        r,
        g,
        b
      )
    }
  }
}
```

##### 解构嵌套的结构体和枚举

目前为止，所有的例子都只匹配了深度为一级的结构体或枚举。 match 也可以匹配嵌套的项！

##### 解构结构体和元组

甚至可以用复杂的方式来混合、匹配和嵌套解构模式。如下是一个复杂结构体的例子，其中结构体和元组嵌套在元组中，并将所有的原始类型解构出来：

```rust
struct Point {
    x: i32,
    y: i32,
}

let ((feet, inches), Point {x, y}) = ((3, 10), Point { x: 3, y: -10 });
```

#### 忽略模式中的值

可以在另一个模式中使用 `_` 模式，使用一个以下划线开始的名称，或者使用 .. 忽略所剩部分的值。

##### 使用 `_` 忽略整个值

虽然 `_` 模式作为 match 表达式最后的分支特别有用，但是它的作用还不限于此。例如可以将其用于函数参数中：

```rust
fn foo(_: i32, y: i32) {
  println!("This code only uses the y parameter: {}", y);
}
fn main() {
  foo(3, 4);
}
```

这段代码会完全忽略作为第一个参数传递的值 3。但是大部分情况当不再需要特定函数参数时，最好修改签名不再包含无用的参数。

##### 使用嵌套的 `_` 忽略部分值

可以在一个模式内部使用 `_` 忽略部分值：

```rust
let mut setting_value = Some(5);
let new_setting_value = Some(10);

match (setting_value, new_setting_value) {
  (Some(_), Some(_)) => {
    println!("Can't overwrite an existing customized value");
  }
  _ => {
    setting_value = new_setting_value;
  }
}
println!("setting is {:?}", setting_value);
```

这段代码会打印出 Can't overwrite an existing customized value 接着是 setting is Some(5)。

第一个匹配分支，不关心里面的值，只关心元组中两个元素的类型，因此对于 Some 中的值，直接进行忽略。 剩下的形如 `(Some(_),None)`，`(None, Some(_))`, `(None,None)` 形式，都由第二个分支 `_` 进行分配。

还可以在一个模式中的多处使用下划线来忽略特定值，如下所示

```rust
let numbers = (2, 4, 8, 16, 32);

match numbers {
  (first, _, third, _, fifth) => {
    println!("Some numbers: {}, {}, {}", first, third, fifth)
  },
}
```

##### 使用下划线开头忽略未使用的变量

如果你创建了一个变量却不在任何地方使用它，Rust 通常会给你一个警告，因为这可能会是个 BUG。希望告诉 Rust 不要警告未使用的变量，为此可以用下划线作为变量名的开头：

```rust
fn main() {
  let _x = 5;
  let y = 10;
}
```

注意, 只使用 `_` 和使用以下划线开头的名称有些微妙的不同：比如 `_x` 仍会将值绑定到变量，而 `_` 则完全不会绑定。

```rust
let s = Some(String::from("Hello!"));

if let Some(_s) = s {
  println!("found a string");
}
println!("{:?}", s);
```

s 是一个拥有所有权的动态字符串，在上面代码中，我们会得到一个错误，因为 s 的值会被转移给 `_s`，在 println! 中再次使用 s 会报错：`borrow of partially moved value: 's'`

只使用下划线本身，则并不会绑定值，因为 s 没有被移动进 `_`：

```rust
let s = Some(String::from("Hello!"));

if let Some(_) = s {
  println!("found a string");
}
println!("{:?}", s);
```

##### 用 .. 忽略剩余值

对于有多个部分的值，可以使用 .. 语法来只使用部分值而忽略其它值，这样也不用再为每一个被忽略的值都单独列出下划线。.. 模式会忽略模式中剩余的任何没有显式匹配的值部分。

```rust
struct Point {
  x: i32,
  y: i32,
  z: i32,
}

let origin = Point { x: 0, y: 0, z: 0 };

match origin {
  Point { x, .. } => println!("x is {}", x),
}
```

这里列出了 x 值，接着使用了 .. 模式来忽略其它字段，这样的写法要比一一列出其它字段，然后用 \_ 忽略简洁的多。

还可以用 .. 来忽略元组中间的某些值：

```rust
fn main() {
  let numbers = (2, 4, 8, 16, 32);

  match numbers {
    (first, .., last) => {
      println!("Some numbers: {}, {}", first, last);
    },
  }
}
```

然而使用 `..` 必须是无歧义的。如果期望匹配和忽略的值是不明确的，Rust 会报错。

#### 匹配守卫提供的额外条件

匹配守卫（match guard）是一个位于 match 分支模式之后的额外 if 条件，它能为分支模式提供更进一步的匹配条件。

这个条件可以使用模式中创建的变量：

```rust
let num = Some(4);

match num {
  Some(x) if x < 5 => println!("less than five: {}", x),
  Some(x) => println!("{}", x),
  None => (),
}
```

在之前，我们提到可以使用匹配守卫来解决模式中变量覆盖的问题，那里 match 表达式的模式中新建了一个变量而不是使用 match 之外的同名变量。内部变量覆盖了外部变量，意味着此时不能够使用外部变量的值，下面代码展示了如何使用匹配守卫修复这个问题。

```rust
fn main() {
  let x = Some(5);
  let y = 10;

  match x {
    Some(50) => println!("Got 50"),
    Some(n) if n == y => println!("Matched, n = {}", n),
    _ => println!("Default case, x = {:?}", x),
  }

  println!("at the end: x = {:?}, y = {}", x, y);
}
```

现在这会打印出 Default case, x = Some(5)。现在第二个匹配分支中的模式不会引入一个覆盖外部 y 的新变量 y，这意味着可以在匹配守卫中使用外部的 y。

也可以在匹配守卫中使用 或 运算符 | 来指定多个模式，同时匹配守卫的条件会作用于所有的模式。

```rust
let x = 4;
let y = false;

match x {
  4 | 5 | 6 if y => println!("yes"),
  _ => println!("no"),
}
```

这个匹配条件表明此分支只匹配 x 值为 4、5 或 6 同时 y 为 true 的情况。

#### @绑定

`@` 运算符允许为一个字段绑定另外一个变量。

下面例子中，我们希望测试 Message::Hello 的 id 字段是否位于 3..=7 范围内，同时也希望能将其值绑定到 id_variable 变量中以便此分支中相关的代码可以使用它。我们可以将 id_variable 命名为 id，与字段同名，不过出于示例的目的这里选择了不同的名称。

```rust
enum Message {
  Hello { id: i32 },
}

let msg = Message::Hello { id: 5 };

match msg {
  Message::Hello { id: id_variable @ 3..=7 } => {
    println!("Found an id in range: {}", id_variable)
  },
  Message::Hello { id: 10..=12 } => {
    println!("Found an id in another range")
  },
  Message::Hello { id } => {
    println!("Found some other id: {}", id)
  },
}
```

上例会打印出 Found an id in range: 5。通过在 3..=7 之前指定 id_variable @，我们捕获了任何匹配此范围的值并同时将该值绑定到变量 id_variable 上。

第二个分支只在模式中指定了一个范围，id 字段的值可以是 10、11 或 12，不过这个模式的代码并不知情也不能使用 id 字段中的值，因为没有将 id 值保存进一个变量。

最后一个分支指定了一个没有范围的变量，此时确实拥有可以用于分支代码的变量 id，因为这里使用了结构体字段简写语法。不过此分支中没有像头两个分支那样对 id 字段的值进行测试：任何值都会匹配此分支。

##### @前绑定后解构

使用 @ 还可以在绑定新变量的同时，对目标进行解构：

```rust
#[derive(Debug)]
struct Point {
  x: i32,
  y: i32,
}

fn main() {
  // 绑定新变量 `p`，同时对 `Point` 进行解构
  let p @ Point {x: px, y: py } = Point {x: 10, y: 23};
  println!("x: {}, y: {}", px, py);
  println!("{:?}", p);

  let point = Point {x: 10, y: 5};
  if let p @ Point {x: 10, y} = point {
    println!("x is 10 and y is {} in {:?}", y, p);
  } else {
    println!("x was not 10 :(");
  }
}
```

##### @新特性

考虑下面一段代码:

```rust
fn main() {
  match 1 {
    num @ 1 | 2 => {
      println!("{}", num);
    }
    _ => {}
  }
}
```

编译不通过，是因为 num 没有绑定到所有的模式上，只绑定了模式 1，你可能会试图通过这个方式来解决：

```rust
num @ (1 | 2)
```
