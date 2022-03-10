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
