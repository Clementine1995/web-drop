# Rust 基础入门 4

## 方法 Method

Rust 的方法往往跟结构体、枚举、特征一起使用

### 定义方法

Rust 使用 impl 来定义方法，例如以下代码：

```rust
struct Circle {
  x: f64,
  y: f64,
  radius: f64,
}
// 这样的写法表明 impl 语句块中的一切都是跟 Circle 相关联的。
impl Circle {
  // new是Circle的关联函数，因为它的第一个参数不是self
  // 这种方法往往用于初始化当前结构体的实例
  fn new(x: f64, y: f64, radius: f64) -> Circle {
    Circle {
      x: x,
      y: y,
      radius: radius,
    }
  }
  // Circle的方法，&self表示借用当前的Circle结构体
  fn area(&self) -> f64 {
    std::f64::consts::PI * (self.radius * self.radius)
  }
}
```

可以看出，其它语言中所有定义(方法和属性)都在 class 中，但是 Rust 的对象定义和方法定义是分离的，这种数据和使用分离的方式，会给予使用者极高的灵活度。

#### self、&self 和 &mut self

在上面例子里 area 的签名中，使用 &self 替代 rectangle: &Rectangle，&self 其实是 self: &Self 的简写（注意大小写）。在一个 impl 块内，Self 指代被实现方法的结构体类型，self 指代此类型的实例，换句话说，self 指代的是 Rectangle 结构体实例。

需要注意的是，self 依然有所有权的概念：

- self 表示 Rectangle 的所有权转移到该方法中，这种形式用的较少
- &self 表示该方法对 Rectangle 的不可变借用
- &mut self 表示可变借用

总之，self 的使用就跟函数参数一样，要严格遵守 Rust 的所有权规则。仅仅通过使用 self 作为第一个参数来使方法获取实例的所有权是很少见的，这种使用方式往往用于把当前的对象转成另外一个对象时使用，转换完后，就不再关注之前的对象，且可以防止对之前对象的误调用。

使用方法代替函数有以下好处：

- 不用在函数签名中重复书写 self 对应的类型
- 代码的组织性和内聚性更强，对于代码维护和阅读来说，好处巨大

#### 方法名跟结构体字段名相同

在 Rust 中，允许方法名跟结构体的字段名相同：

```rust
impl Rectangle {
  fn width(&self) -> bool {
    self.width > 0
  }
}

fn main() {
  let rect1 = Rectangle {
    width: 30,
    height: 50,
  };

  if rect1.width() {
    println!("The rectangle has a nonzero width; it is {}", rect1.width);
  }
}
```

当使用 rect1.width() 时， Rust 知道调用的是它的方法，如果使用 rect1.width，则是访问它的字段。

一般来说，方法跟字段同名，往往适用于实现 getter 访问器，例如:

```rust
impl Rectangle {
  pub fn new(width: u32, height: u32) -> Self {
    Rectangle { width, height }
  }
  pub fn width(&self) -> u32 {
    return self.width;
  }
}
```

Rust 有一个叫 自动引用和解引用的功能，当使用 object.something() 调用方法时，Rust 会自动为 object 添加 &、&mut 或 `*` 以便使 object 与方法签名匹配。

也就是说，这些代码是等价的：

```rust
p1.distance(&p2);
(&p1).distance(&p2);
```

### 带有多个参数的方法

```rust
impl Rectangle {
  fn area(&self) -> u32 {
    self.width * self.height
  }
  fn can_hold(&self, other: &Rectangle) -> bool {
    self.width > other.width && self.height > other.height
  }
}

fn main() {
  let rect1 = Rectangle { width: 30, height: 50 };
  let rect2 = Rectangle { width: 10, height: 40 };
  let rect3 = Rectangle { width: 60, height: 45 };

  println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
  println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```

### 关联函数

定义在 impl 中且没有 self 的函数被称之为关联函数： 因为它没有 self，不能用 f.read() 的形式调用，因此它是一个函数而不是方法，它又在 impl 中，与结构体紧密关联，因此称为关联函数。

在之前的代码中，已经多次使用过关联函数，例如 String::from，用于创建一个动态字符串。

因为是函数，所以不能用 `.` 的方式来调用，需要用`::`来调用，例如 let sq = Rectangle::new(3,3);。这个方法位于结构体的命名空间中：`::` 语法用于关联函数和模块创建的命名空间。

### 多个 impl 定义

Rust 允许为一个结构体定义多个 impl 块，目的是提供更多的灵活性和代码组织性，例如当方法多了后，可以把相关的方法组织在同一个 impl 块中，那么就可以形成多个 impl 块，各自完成一块儿目标：

```rust
impl Rectangle {
  fn area(&self) -> u32 {
    self.width * self.height
  }
}

impl Rectangle {
  fn can_hold(&self, other: &Rectangle) -> bool {
    self.width > other.width && self.height > other.height
  }
}
```

### 为枚举实现方法

枚举类型之所以强大，不仅仅在于它好用、可以同一化类型，还在于可以像结构体一样，为枚举实现方法：

```rust
fn main() {
  enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
  }

  impl Message {
    fn call(&self) {
      // 在这里定义方法体
    }
  }

  let m = Message::Write(String::from("hello"));
  m.call();
}
```

除了结构体和枚举，还能为特征(trait)实现方法，这将在下一章进行讲解，在此之前，先来看看泛型。

## 泛型 Generics

实际上，泛型就是一种多态。泛型主要目的是为程序员提供编程的便利，减少代码的臃肿，同时可以极大地丰富语言本身的表达能力。

### 泛型详解

使用泛型参数，有一个先决条件，必需在使用前对其进行声明：

```rust
fn largest<T>(list: &[T]) -> T {
```

该泛型函数的作用是从列表中找出最大的值，其中列表中的元素类型为 T。首先 `largest<T>` 对泛型参数 T 进行了声明，然后才在函数参数中进行使用该泛型参数 `list: &[T]`，&[T] 是数组切片。

具体的泛型函数实现如下：

```rust
fn largest<T>(list: &[T]) -> T {
  let mut largest = list[0];

  for &item in list.iter() {
    if item > largest {
      largest = item;
    }
  }
  largest
}

fn main() {
  let number_list = vec![34, 50, 25, 100, 65];

  let result = largest(&number_list);
  println!("The largest number is {}", result);

  let char_list = vec!['y', 'm', 'a', 'q'];

  let result = largest(&char_list);
  println!("The largest char is {}", result);
}
```

上面的例子会报错，因为 T 可以是任何类型，但不是所有的类型都能进行比较，因此上面的错误中，编译器建议给 T 添加一个类型限制：使用 std::cmp::PartialOrd 特征（Trait）对 T 进行限制，特征的目的就是让类型实现可比较的功能。

### 结构体中使用泛型

结构体中的字段类型也可以用泛型来定义，下面代码定义了一个坐标点 Point，它可以存放任何类型的坐标值：

```rust
struct Point<T> {
  x: T,
  y: T,
}

fn main() {
  let integer = Point { x: 5, y: 10 };
  let float = Point { x: 1.0, y: 4.0 };
}
```

这里有两点需要特别的注意：

- 提前声明，跟泛型函数定义类似，首先在使用泛型参数之前必需要进行声明 `Point<T>`，接着就可以在结构体的字段类型中使用 T 来替代具体的类型
- x 和 y 是相同的类型

如果想让 x 和 y 即能类型相同，又能类型不同，需要使用不同的泛型参数：

```rust
struct Point<T,U> {
  x: T,
  y: U,
}
fn main() {
  let p = Point{x: 1, y :1.1};
}
```

### 枚举中使用泛型

提到枚举类型，Option 永远是第一个应该被想起来的，在之前的章节中，它也多次出现：

```rust
enum Option<T> {
  Some(T),
  None,
}
```

`Option<T>` 是一个拥有泛型 T 的枚举类型，它第一个成员是 Some(T)，存放了一个类型为 T 的值。得益于泛型的引入，我们可以在任何一个需要返回值的函数中，去使用 `Option<T>` 枚举类型来做为返回值，用于返回一个任意类型的值 Some(T)，或者没有值 None。

除了 Option 枚举，还有 Result 它关注的主要是值的正确性。

```rust
enum Result<T, E> {
  Ok(T),
  Err(E),
}
```

如果函数正常运行，则最后返回一个 Ok(T)，T 是函数具体的返回值类型，如果函数异常运行，则返回一个 Err(E)，E 是错误类型。

### 方法中使用泛型

方法上也可以使用泛型：

```rust
struct Point<T> {
  x: T,
  y: T,
}

impl<T> Point<T> {
  fn x(&self) -> &T {
    &self.x
  }
}

fn main() {
  let p = Point { x: 5, y: 10 };

  println!("p.x = {}", p.x());
}
```

使用泛型参数前，依然需要提前声明：`impl<T>`，只有提前声明了，才能在`Point<T>`中使用它，这样 Rust 就知道 Point 的尖括号中的类型是泛型而不是具体类型。需要注意的是，这里的 `Point<T>` 不再是泛型声明，而是一个完整的结构体类型，因为定义的结构体就是 `Point<T>` 而不再是 Point。

除了结构体中的泛型参数，还能在该结构体的方法中定义额外的泛型参数，就跟泛型函数一样：

```rust
struct Point<T, U> {
  x: T,
  y: U,
}

impl<T, U> Point<T, U> {
  fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
    Point {
      x: self.x,
      y: other.y,
    }
  }
}

fn main() {
  let p1 = Point { x: 5, y: 10.4 };
  let p2 = Point { x: "Hello", y: 'c'};

  let p3 = p1.mixup(p2);

  println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

这个例子中，T,U 是定义在结构体 Point 上的泛型参数，V,W 是单独定义在方法 mixup 上的泛型参数，它们并不冲突，说白了，可以理解为，一个是结构体泛型，一个是函数泛型。

#### 为具体的泛型类型实现方法

对于 `Point<T>` 类型不仅能定义基于 T 的方法，还能针对特定的具体类型，进行方法定义：

```rust
impl Point<f32> {
  fn distance_from_origin(&self) -> f32 {
    (self.x.powi(2) + self.y.powi(2)).sqrt()
  }
}
```

这段代码意味着 `Point<f32>` 类型会有一个方法 distance_from_origin，而其他 T 不是 f32 类型的 `Point<T>` 实例则没有定义此方法。

### const 泛型（Rust 1.51 版本引入的重要特性）

在之前的泛型中，可以抽象为一句话：针对类型实现的泛型，所有的泛型都是为了抽象不同的类型，那有没有针对值的泛型？可能很多同学感觉很难理解，值怎么使用泛型？不急，先从数组讲起。

在数组那节，有提到过很重要的一点：[i32; 2] 和 [i32; 3] 是不同的数组类型，比如下面的代码：

```rust
fn display_array(arr: [i32; 3]) {
  println!("{:?}", arr);
}
fn main() {
  let arr: [i32; 3] = [1, 2, 3];
  display_array(arr);

  let arr: [i32;2] = [1,2];
  display_array(arr);
}
// 运行报错
// 期望一个长度为3的数组，却发现一个长度为2的
```

修改代码，让 display_array 能打印任意长度的 i32 数组：

```rust
fn display_array(arr: &[i32]) {
  println!("{:?}", arr);
}
```

接着，将 i32 改成所有类型的数组：

```rust
fn display_array<T: std::fmt::Debug>(arr: &[T]) {
  println!("{:?}", arr);
}
```

唯一要注意的是需要对 T 加一个限制 std::fmt::Debug，该限制表明 T 可以用在 println!("{:?}", arr) 中，因为 {:?} 形式的格式化输出需要 arr 实现该特征。

现在有了 const 泛型，也就是针对值的泛型，正好可以用于处理数组长度的问题：

```rust
fn display_array<T: std::fmt::Debug, const N: usize>(arr: [T; N]) {
  println!("{:?}", arr);
}
fn main() {
  let arr: [i32; 3] = [1, 2, 3];
  display_array(arr);

  let arr: [i32; 2] = [1, 2];
  display_array(arr);
}
```

如上所示，定义了一个类型为 [T; N] 的数组，其中 T 是一个基于类型的泛型参数，这个和之前讲的泛型没有区别，而重点在于 N 这个泛型参数，它是一个基于值的泛型参数！因为它用来替代的是数组的长度。

N 就是 const 泛型，定义的语法是 `const N: usize`，表示 const 泛型 N ，它基于的值类型是 usize。

在泛型参数之前，Rust 完全不适合复杂矩阵的运算，自从有了 const 泛型，一切即将改变。

#### const 泛型表达式

假设某段代码需要在内存很小的平台上工作，因此需要限制函数参数占用的内存大小，此时就可以使用 const 泛型表达式来实现：

```rust
// 目前只能在nightly版本下使用
#![allow(incomplete_features)]
#![feature(generic_const_exprs)]

fn something<T>(val: T)
where Assert<{ core::mem::size_of::<T>() < 768 }>: IsTrue,
  //       ^-----------------------------^ 这里是一个 const 表达式，换成其它的 const 表达式也可以
{
  //
}

fn main() {
  something([0u8; 0]); // ok
  something([0u8; 512]); // ok
  something([0u8; 1024]); // 编译错误，数组长度是1024字节，超过了768字节的参数长度限制
}

// ---
pub enum Assert<const CHECK: bool> {
  //
}
pub trait IsTrue {
  //
}
impl IsTrue for Assert<true> {
  //
}
```

#### const fn

### 泛型的性能

在 Rust 中泛型是零成本的抽象，意味着在使用泛型时，完全不用担心性能上的问题。

但是任何选择都是权衡得失的，Rust 是在编译期为泛型对应的多个类型，生成各自的代码，因此损失了编译速度和增大了最终生成文件的大小。

具体来说：

Rust 通过在编译时进行泛型代码的 单态化(monomorphization)来保证效率。单态化是一个通过填充编译时使用的具体类型，将通用代码转换为特定代码的过程。

## 特征 Trait

特征很类似接口，例如 `#[derive(Debug)]`，它在定义的类型（struct）上自动派生 Debug 特征，接着可以使用 println!("{:?}", x) 打印这个类型。

特征定义了一个可以被共享的行为，只要实现了特征，就能使用该行为。

### 定义特征

如果不同的类型具有相同的行为，那么我们就可以定义一个特征，然后为这些类型实现该特征。定义特征是把一些方法组合在一起，目的是定义一个实现某些目标所必需的行为的集合。

例如，现在有文章 Post 和微博 Weibo 两种内容载体，想对相应的内容进行总结，也就是无论是文章内容，还是微博内容，都可以在某个时间点进行总结，那么总结这个行为就是共享的，因此可以用特征来定义：

```rust
pub trait Summary {
  fn summarize(&self) -> String;
}
```

这里使用 trait 关键字来声明一个特征，Summary 是特征名。在大括号中定义了该特征的所有方法，在这个例子中是： fn summarize(&self) -> String。

特征只定义行为看起来是什么样的，而不定义行为具体是怎么样的。因此，只定义特征方法的签名，而不进行实现，此时方法签名结尾是 `;`，而不是一个 `{}`。

接下来，每一个实现这个特征的类型都需要具体实现该特征的相应方法，编译器也会确保任何实现 Summary 特征的类型都拥有与这个签名的定义完全一致的 summarize 方法。

### 为类型实现特征

需要为类型实现具体的特征，定义行为具体是怎么样的。

首先来为 Post 和 Weibo 实现 Summary 特征：

```rust
pub trait Summary {
  fn summarize(&self) -> String;
}
pub struct Post {
  pub title: String, // 标题
  pub author: String, // 作者
  pub content: String, // 内容
}

impl Summary for Post {
  fn summarize(&self) -> String {
    format!("文章{}, 作者是{}", self.title, self.author)
  }
}

pub struct Weibo {
  pub username: String,
  pub content: String
}

impl Summary for Weibo {
  fn summarize(&self) -> String {
    format!("{}发表了微博{}", self.username, self.content)
  }
}
```

实现特征的语法与为结构体、枚举实现方法很像：`impl Summary for Post`，读作“为 Post 类型实现 Summary 特征”，然后在 impl 的花括号中实现该特征的具体方法。

接下来就可以在这个类型上调用特征的方法：

```rust
fn main() {
  let post = Post{title: "Rust语言简介".to_string(),author: "Sunface".to_string(), content: "Rust棒极了!".to_string()};
  let weibo = Weibo{username: "sunface".to_string(),content: "好像微博没Tweet好用".to_string()};

  println!("{}",post.summarize());
  println!("{}",weibo.summarize());
}
```

#### 特征定义与实现的位置(孤儿规则)

关于特征实现与定义的位置，有一条非常重要的原则：如果想要为类型 A 实现特征 T，那么 A 或者 T 至少有一个是在当前作用域中定义的。

无法在当前作用域中，为 String 类型实现 Display 特征，因为它们俩都定义在标准库中，其定义所在的位置都不在当前作用域，该规则被称为孤儿规则，可以确保其它人编写的代码不会破坏你的代码

#### 默认实现

可以在特征中定义具有默认实现的方法，这样其它类型无需再实现该方法，或者也可以选择重载该方法：

```rust
pub trait Summary {
  fn summarize(&self) -> String {
    String::from("(Read more...)")
  }
}
```

默认实现允许调用相同特征中的其他方法，哪怕这些方法没有默认实现。如此，特征可以提供很多有用的功能而只需要实现指定的一小部分内容。例如，可以定义 Summary 特征，使其具有一个需要实现的 summarize_author 方法，然后定义一个 summarize 方法，此方法的默认实现调用 summarize_author 方法：

```rust
pub trait Summary {
  fn summarize_author(&self) -> String;

  fn summarize(&self) -> String {
    format!("(Read more from {}...)", self.summarize_author())
  }
}
```

为了使用 Summary，只需要实现 summarize_author 方法即可：

```rust
impl Summary for Weibo {
  fn summarize_author(&self) -> String {
    format!("@{}", self.username)
  }
}
println!("1 new weibo: {}", weibo.summarize());
```

### 使用特征作为函数参数

先定义一个函数，使用特征用做函数参数：

```rust
// 它的意思是 实现了Summary特征 的 item 参数。
pub fn notify(item: &impl Summary) {
  println!("Breaking news! {}", item.summarize());
}
```

可以使用任何实现了 Summary 特征的类型作为该函数的参数，同时在函数体内，还可以调用该特征的方法，例如 summarize 方法。

### 特征约束(trait bound)

虽然 impl Trait 这种语法非常好理解，但是实际上它只是一个语法糖：

```rust
pub fn notify<T: Summary>(item: &T) {
  println!("Breaking news! {}", item.summarize());
}
```

真正的完整书写形式如上所示，形如 T: Summary 被称为特征约束。

在简单的场景下 impl Trait 的语法就足够使用，但是对于复杂的场景，特征约束可以让我们拥有更大的灵活性和语法表现能力，例如一个函数接受两个 impl Summary 的参数：

```rust
pub fn notify(item1: &impl Summary, item2: &impl Summary) {}
```

如果函数两个参数是不同的类型，那么上面的方法很好，只要这两个类型都实现了 Summary 特征即可。但是如果想要强制函数的两个参数是同一类型呢？上面的语法就无法做到这种限制，此时只能使特征约束来实现：

```rust
// 泛型类型 T 说明了 item1 和 item2 必须拥有同样的类型，同时 T: Summary 说明了 T 必须实现 Summary 特征。
pub fn notify<T: Summary>(item1: &T, item2: &T) {}
```

#### 多重约束

除了单个约束条件，还可以指定多个约束条件，例如除了让参数实现 Summary 特征外，还可以让参数实现 Display 特征以控制它的格式化输出：

```rust
pub fn notify(item: &(impl Summary + Display)) {}

// 除了上述的语法糖形式，还能使用特征约束的形式：
pub fn notify<T: Summary + Display>(item: &T) {}
```

#### Where 约束

当特征约束变得很多时，函数的签名将变得很复杂：

```rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {}
```

通过 where 能对其做一些形式上的改进：

```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{}
```

#### 使用特征约束有条件地实现方法或特征

特征约束，可以让我们在指定类型 + 指定特征的条件下去实现方法，例如：

```rust
use std::fmt::Display;

struct Pair<T> {
  x: T,
  y: T,
}

impl<T> Pair<T> {
  fn new(x: T, y: T) -> Self {
    Self {
      x,
      y,
    }
  }
}

impl<T: Display + PartialOrd> Pair<T> {
  fn cmp_display(&self) {
    if self.x >= self.y {
      println!("The largest member is x = {}", self.x);
    } else {
      println!("The largest member is y = {}", self.y);
    }
  }
}
```

cmd_display 方法，并不是所有的 `Pair<T>` 结构体对象都可以拥有，只有 T 同时实现了 Display + PartialOrd 的 `Pair<T>` 才可以拥有此方法。

也可以有条件地实现特征, 例如，标准库为任何实现了 Display 特征的类型实现了 ToString 特征：

```rust
impl<T: Display> ToString for T {
  // --snip--
}
```

### 函数返回中的 impl Trait

可以通过 impl Trait 来说明一个函数返回了一个类型，该类型实现了某个特征：

```rust
fn returns_summarizable() -> impl Summary {
  Weibo {
    username: String::from("sunface"),
    content: String::from("m1 max太厉害了，电脑再也不会卡"),
  }
}
```

虽然知道这里是一个 Weibo 类型，但是对于 returns_summarizable 的调用者而言，他只知道返回了一个实现了 Summary 特征的对象，但是并不知道返回了一个 Weibo 类型。

这种 impl Trait 形式的返回值，在一种场景下非常非常有用，那就是返回的真实类型非常复杂，你不知道该怎么声明时，此时就可以用 impl Trait 的方式简单返回。例如，闭包和迭代器就是很复杂，可以用 impl Iterator 来告诉调用者，返回了一个迭代器，因为所有迭代器都会实现 Iterator 特征。

但是这种返回值方式有一个很大的限制：只能有一个具体的类型，不能返回不同的类型。如果想要实现返回不同的类型，需要使用特征对象。

### 修复上一节中的 largest 函数

```rust
fn largest<T>(list: &[T]) -> T {
  let mut largest = list[0];

  for &item in list.iter() {
    if item > largest {
      largest = item;
    }
  }

  largest
}
```

这个例子中 `T` 类型上是无法应用 `>` 运算符的，`>` 运算符是标准库中特征 std::cmp::PartialOrd 的一个默认方法。所以需要在 T 的特征约束中指定 PartialOrd，这样 largest 函数可以用于内部元素类型可比较大小的数组切片。

```rust
fn largest<T: PartialOrd>(list: &[T]) -> T {}
```

加上之后又会出现新的错误 `cannot move out of type [T], a non-copy slice`，原因是 T 没有实现 Copy 特性，因此只能把所有权进行转移，毕竟只有 i32 等基础类型才实现了 Copy 特性，可以存储在栈上，而 T 可以指代任何类型。因此，为了让 T 拥有 Copy 特性，我们可以增加特征约束：

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {}
```

如果并不希望限制 largest 函数只能用于实现了 Copy 特征的类型，我们可以在 T 的特征约束中指定 Clone 特征 而不是 Copy 特征。并克隆 list 中的每一个值使得 largest 函数拥有其所有权。

另一种 largest 的实现方式是返回在 list 中 T 值的引用。如果将函数返回值从 T 改为 &T 并改变函数体使其能够返回一个引用，将不需要任何 Clone 或 Copy 的特征约束而且也不会有任何的堆分配。

### 通过 derive 派生特征

在本书中，形如 #[derive(Debug)] 的代码已经出现了很多次，这种是一种特征派生语法，被 derive 标记的对象会自动实现对应的默认特征代码，继承相应的功能。

例如 Debug 特征，它有一套自动实现的默认代码，当给一个结构体标记后，就可以使用 println!("{:?}", s) 的形式打印该结构体的对象。

再如 Copy 特征，它也有一套自动实现的默认代码，当标记到一个类型上时，可以让这个类型自动实现 Copy 特征，进而可以调用 copy 方法，进行自我复制。

总之，derive 派生出来的是 Rust 默认给我们提供的特征，在开发过程中极大的简化了自己手动实现相应特征的需求，当然，如果有特殊的需求，还可以自己手动重载该实现。

### 调用方法需要引入特征

在一些场景中，使用 as 关键字做类型转换会有比较大的限制，因为想要在类型转换上拥有完全的控制，例如处理转换错误，那么将需要 TryInto：

```rust
use std::convert::TryInto;

fn main() {
  let a: i32 = 10;
  let b: u16 = 100;
  let b_ = b.try_into().unwrap();
  if a < b_ {
    println!("Ten is less than one hundred.");
  }
}
```

上面代码中引入了 std::convert::TryInto 特征，但是却没有使用它，可能有些同学会为此困惑，主要原因在于如果要使用一个特征的方法，那么需要引入该特征到当前的作用域中，在上面用到了 `try_into` 方法，因此需要引入对应的特征。

但是 Rust 又提供了一个非常便利的办法，即把最常用的标准库中的特征通过 std::prelude 模块提前引入到当前作用域中，其中包括了 std::convert::TryInto。

### 几个综合例子

#### 为自定义类型实现 + 操作

在 Rust 中除了数值类型的加法，String 也可以做加法，因为 Rust 为该类型实现了 `std::ops::Add` 特征，同理，如果为自定义类型实现了该特征，那就可以实现 Point1 + Point2 的操作:

```rust
use std::ops::Add;

// 为Point结构体派生Debug特征，用于格式化输出
#[derive(Debug)]
struct Point<T: Add<T, Output = T>> { //限制类型T必须实现了Add特征，否则无法进行+操作。
  x: T,
  y: T,
}

impl<T: Add<T, Output = T>> Add for Point<T> {
  type Output = Point<T>;
  fn add(self, p: Point<T>) -> Point<T> {
    Point{
      x: self.x + p.x,
      y: self.y + p.y,
    }
  }
}

fn add<T: Add<T, Output=T>>(a:T, b:T) -> T {
  a + b
}

fn main() {
  let p1 = Point{x: 1.1f32, y: 1.1f32};
  let p2 = Point{x: 2.1f32, y: 2.1f32};
  println!("{:?}", add(p1, p2));

  let p3 = Point{x: 1i32, y: 1i32};
  let p4 = Point{x: 2i32, y: 2i32};
  println!("{:?}", add(p3, p4));
}
```

#### 自定义类型的打印输出

在开发过程中，往往只要使用 #[derive(Debug)] 对自定义类型进行标注，即可实现打印输出的功能，但是在实际项目中，往往需要对自定义类型进行自定义的格式化输出，以让用户更好的阅读理解类型，此时就要为自定义类型实现 std::fmt::Display 特征

## 特征对象

在上一节中有一段代码无法通过编译:

```rust
fn returns_summarizable(switch: bool) -> impl Summary {
  if switch {
    Post {
      // ...
    }
  } else {
    Weibo {
      // ...
    }
  }
}
```

其中 Post 和 Weibo 都实现了 Summary 特征，因此上面的函数试图通过返回 impl Summary 来返回这两个类型，但是编译器却无情地报错了，原因是 impl Trait 的返回值类型并不支持多种不同的类型返回，可以利用枚举解决这个问题，但是如果对象集合并不能事先明确地知道呢？在拥有继承的语言中，可以定义一个类，其他子类从父类派生并因此继承方法。它们各自都可以覆盖方法来定义自己的行为，不过 Rust 并没有继承，得另寻出路。

### 特征对象定义

为了解决上面的所有问题，Rust 引入了一个概念 —— 特征对象。

在介绍特征对象之前，先来为之前的 UI 组件定义一个特征：

```rust
pub trait Draw {
  fn draw(&self);
}
// 假设有一个 Button 和 SelectBox 组件实现了 Draw 特征
pub struct Button {
  pub width: u32,
  pub height: u32,
  pub label: String,
}

impl Draw for Button {
  fn draw(&self) {
    // 绘制按钮的代码
  }
}

struct SelectBox {
  width: u32,
  height: u32,
  options: Vec<String>,
}

impl Draw for SelectBox {
  fn draw(&self) {
    // 绘制SelectBox的代码
  }
}
// 此时，还需要一个动态数组来存储这些 UI 对象
pub struct Screen {
  pub components: Vec<?>,
}
```

注意到上面代码中的 ? 吗？它的意思是：应该填入什么类型，可以说就之前学过的内容里，找不到哪个类型可以填入这里，但是因为 Button 和 SelectBox 都实现了 Draw 特征，那是不是可以把 Draw 特征的对象作为类型，填入到数组中呢？答案是肯定的。

特征对象指向实现了 Draw 特征的类型的实例，也就是指向了 Button 或者 SelectBox 的实例，这种映射关系是存储在一张表中，可以在运行时通过特征对象找到具体调用的类型方法。

可以通过 `&` 引用或者 `Box<T>` 智能指针的方式来创建特征对象:

```rust
trait Draw {
  fn draw(&self) -> String;
}

impl Draw for u8 {
  fn draw(&self) -> String {
    format!("u8: {}", *self)
  }
}

impl Draw for f64 {
  fn draw(&self) -> String {
    format!("f64: {}", *self)
  }
}

fn draw1(x: Box<dyn Draw>) {
  x.draw();
}

fn draw2(x: &dyn Draw) {
  x.draw();
}

fn main() {
  let x = 1.1f64;
  // do_something(&x);
  let y = 8u8;

  draw1(Box::new(x));
  draw1(Box::new(y));
  draw2(&x);
  draw2(&y);
}
```

上面代码，有几个非常重要的点：

- draw1 函数的参数是 `Box<dyn Draw>` 形式的特征对象，该特征对象是通过 `Box::new(x)` 的方式创建的
- draw2 函数的参数是 `&dyn Draw` 形式的特征对象，该特征对象是通过 `&x` 的方式创建的
- dyn 关键字只用在特征对象的类型声明上，在创建时无需使用 `dyn`

因此，可以使用特征对象来代表泛型或具体的类型。

继续来完善之前的 UI 组件代码，首先来实现 Screen：

```rust
pub struct Screen {
  pub components: Vec<Box<dyn Draw>>,
}
```

其中存储了一个动态数组，里面元素的类型是 Draw 特征对象：`Box<dyn Draw>`，任何实现了 Draw 特征的类型，都可以存放其中。

再来为 Screen 定义 run 方法，用于将列表中的 UI 组件渲染在屏幕上：

```rust
impl Screen {
  pub fn run(&self) {
    for component in self.components.iter() {
      component.draw();
    }
  }
}
```

至此，就完成了之前的目标：在列表中存储多种不同类型的实例，然后将它们使用同一个方法逐一渲染在屏幕上

再来看看，如果通过泛型实现，会如何：

```rust
pub struct Screen<T: Draw> {
  pub components: Vec<T>,
}

impl<T> Screen<T>
  where T: Draw {
  pub fn run(&self) {
    for component in self.components.iter() {
      component.draw();
    }
  }
}
```

但是这种写法限制了 Screen 实例的 `Vec<T>` 中的每个元素必须是 Button 类型或者全是 SelectBox 类型。

如果只需要同质（相同类型）集合，更倾向于这种写法：使用泛型和 特征约束，因为实现更清晰，且性能更好(特征对象，需要在运行时从 vtable 动态查找需要调用的方法)。

现在来运行渲染下精心设计的 UI 组件列表：

```rust
fn main() {
  let screen = Screen {
    components: vec![
      Box::new(SelectBox {
        width: 75,
        height: 10,
        options: vec![
          String::from("Yes"),
          String::from("Maybe"),
          String::from("No")
        ],
      }),
      Box::new(Button {
        width: 50,
        height: 10,
        label: String::from("OK"),
      }),
    ],
  };

  screen.run();
}
```

在动态类型语言中，有一个很重要的概念：鸭子类型(duck typing)，简单来说，就是只关心值长啥样，而不关心它实际是什么。当一个东西走起来像鸭子，叫起来像鸭子，那么它就是一只鸭子，就算它实际上是一个奥特曼，也不重要，就当它是鸭子。

在上例中，Screen 在 run 的时候，并不需要知道各个组件的具体类型是什么。它也不检查组件到底是 Button 还是 SelectBox 的实例，只要它实现了 Draw 特征，就能通过 `Box::new` 包装成 `Box<dyn Draw>` 特征对象，然后被渲染在屏幕上。

注意 dyn 不能单独作为特征对象的定义，例如下面的代码编译器会报错，原因是特征对象可以是任意实现了某个特征的类型，编译器在编译期不知道该类型的大小，不同的类型大小是不同的。而 `&dyn` 和 `Box<dyn>` 在编译期都是已知大小，所以可以用作特征对象的定义。

```rust
fn draw2(x: dyn Draw) {
  x.draw();
  // ^ doesn't have a size known at compile-time
}
```

### 特征对象的动态分发

泛型是在编译期完成处理的：编译器会为每一个泛型参数对应的具体类型生成一份代码，这种方式是静态分发(static dispatch)，因为是在编译期完成的，对于运行期性能完全没有任何影响。

与静态分发相对应的是动态分发(dynamic dispatch)，在这种情况下，直到运行时，才能确定需要调用什么方法。之前代码中的关键字 dyn 正是在强调这一“动态”的特点。

当使用特征对象时，Rust 必须使用动态分发。编译器无法知晓所有可能用于特征对象代码的类型，所以它也不知道应该调用哪个类型的哪个方法实现。为此，Rust 在运行时使用特征对象中的指针来知晓需要调用哪个方法。动态分发也阻止编译器有选择的内联方法代码，这会相应的禁用一些优化。

- 特征对象大小不固定：这是因为，对于特征 Draw，类型 Button 可以实现特征 Draw，类型 SelectBox 也可以实现特征 Draw，因此特征没有固定大小
- 几乎总是使用特征对象的引用方式，如 `&dyn Draw`、`Box<dyn Draw>`
  - 虽然特征对象没有固定大小，但它的引用类型的大小是固定的，它由两个指针组成（ptr 和 vptr），因此占用两个指针大小
  - 一个指针 ptr 指向实现了特征 Draw 的具体类型的实例，也就是当作特征 Draw 来用的类型的实例，比如类型 Button 的实例、类型 SelectBox 的实例
  - 另一个指针 vptr 指向一个虚表 vtable，vtable 中保存了类型 Button 或类型 SelectBox 的实例对于可以调用的实现于特征 Draw 的方法。当调用方法时，直接从 vtable 中找到方法并调用。之所以要使用一个 vtable 来保存各实例的方法，是因为实现了特征 Draw 的类型有多种，这些类型拥有的方法各不相同，当将这些类型的实例都当作特征 Draw 来使用时(此时，它们全都看作是特征 Draw 类型的实例)，有必要区分这些实例各自有哪些方法可调用

简而言之，当类型 Button 实现了特征 Draw 时，类型 Button 的实例对象 btn 可以当作特征 Draw 的特征对象类型来使用，btn 中保存了作为特征对象的数据指针（指向类型 Button 的实例数据）和行为指针（指向 vtable）。

一定要注意，此时的 btn 是 Draw 的特征对象的实例，而不再是具体类型 Button 的实例，而且 btn 的 vtable 只包含了实现自特征 Draw 的那些方法（比如 draw），因此 btn 只能调用实现于特征 Draw 的 draw 方法，而不能调用类型 Button 本身实现的方法和类型 Button 实现于其他特征的方法。也就是说，btn 是哪个特征对象的实例，它的 vtable 中就包含了该特征的方法。

### Self 与 self

在 Rust 中，有两个 self，一个指代当前的实例对象，一个指代特征或者方法类型的别名：

```rust
trait Draw {
  fn draw(&self) -> Self;
}

#[derive(Clone)]
struct Button;
impl Draw for Button {
  fn draw(&self) -> Self {
    return self.clone()
  }
}

fn main() {
  let button = Button;
  let newb = button.draw();
}
```

上述代码中，self 指代的就是当前的实例对象，也就是 button.draw() 中的 button 实例，Self 则指代的是 Button 类型。

### 特征对象的限制

不是所有特征都能拥有特征对象，只有对象安全的特征才行。当一个特征的所有方法都有如下属性时，它的对象才是安全的：

- 方法的返回类型不能是 Self
- 方法没有任何泛型参数

对象安全对于特征对象是必须的，因为一旦有了特征对象，就不再需要知道实现该特征的具体类型是什么了。如果特征方法返回了具体的 Self 类型，但是特征对象忘记了其真正的类型，那这个 Self 就非常尴尬，因为没人知道它是谁了。但是对于泛型类型参数来说，当使用特征时其会放入具体的类型参数：此具体类型变成了实现该特征的类型的一部分。而当使用特征对象时其具体类型被抹去了，故而无从得知放入泛型参数类型到底是什么。

标准库中的 Clone 特征就不符合对象安全的要求：

```rust
pub trait Clone {
  fn clone(&self) -> Self;
}
```

因为它的其中一个方法，返回了 Self 类型，因此它是对象不安全的。

String 类型实现了 Clone 特征， String 实例上调用 clone 方法时会得到一个 String 实例。类似的，当调用 `Vec<T>` 实例的 clone 方法会得到一个 `Vec<T>` 实例。clone 的签名需要知道什么类型会代替 Self，因为这是它的返回值。如果违反了对象安全的规则，编译器会提示你。

## 深入了解特征

### 关联类型

关联类型是在特征定义的语句块中，申明一个自定义类型，这样就可以在特征的方法签名中使用该类型：

```rust
pub trait Iterator {
  type Item;
  fn next(&mut self) -> Option<Self::Item>;
}
```

以上是标准库中的迭代器特征 Iterator，它有一个 Item 关联类型，用于替代遍历的值的类型。同时，next 方法也返回了一个 Item 类型，不过使用 Option 枚举进行了包裹，假如迭代器中的值是 i32 类型，那么调用 next 方法就将获取一个 `Option<i32>` 的值。Self 用来指代当前调用者的具体类型，那么 Self::Item 就用来指代该类型实现中定义的 Item 类型：

```rust
impl Iterator for Counter {
  type Item = u32;
  fn next(&mut self) -> Option<Self::Item> {
    // --snip--
  }
}
fn main() {
  let c = Counter{..}
  c.next()
}
```

在上述代码中，为 Counter 类型实现了 Iterator 特征，变量 c 是特征 Iterator 的实例，也是 next 方法的调用者。对于 next 方法而言，Self 是调用者 c 的具体类型： Counter，而 Self::Item 是 Counter 中定义的 Item 类型: u32。

### 默认泛型类型参数

当使用泛型类型参数时，可以为其指定一个默认的具体类型，例如标准库中的 std::ops::Add 特征：

```rust
#![allow(unused)]
fn main() {
trait Add<RHS=Self> {
    type Output;
    fn add(self, rhs: RHS) -> Self::Output;
  }
}
```

它有一个泛型参数 RHS，但是与我们以往的用法不同，这里它给 RHS 一个默认值，也就是当用户不指定 RHS 时，默认使用两个同样类型的值进行相加，然后返回一个关联类型 Output。

```rust
use std::ops::Add;

#[derive(Debug, PartialEq)]
struct Point {
  x: i32,
  y: i32,
}

impl Add for Point {
  type Output = Point;

  fn add(self, other: Point) -> Point {
    Point {
      x: self.x + other.x,
      y: self.y + other.y,
    }
  }
}

fn main() {
  assert_eq!(Point { x: 1, y: 0 } + Point { x: 2, y: 3 }, Point { x: 3, y: 3 });
}
```

上面的代码主要干了一件事，就是为 Point 结构体提供 + 的能力，这就是运算符重载，只有定义在 std::ops 中的运算符才能进行重载。

跟 + 对应的特征是 std::ops::Add，在之前也看过它的定义 `trait Add<RHS=Self>`，但是上面的例子中并没有为 Point 实现 `Add<RHS>` 特征，而是实现了 Add 特征（没有默认泛型类型参数），这意味着使用了 RHS 的默认类型，也就是 Self。

与上面的例子相反，下面的例子，来创建两个不同类型的相加：

```rust
use std::ops::Add;

struct Millimeters(u32);
struct Meters(u32);

impl Add<Meters> for Millimeters {
  type Output = Millimeters;

  fn add(self, other: Meters) -> Millimeters {
    Millimeters(self.0 + (other.0 * 1000))
  }
}
```

这里，是进行 Millimeters + Meters 两种数据类型的 + 操作，因此此时不能再使用默认的 RHS，否则就会变成 Millimeters + Millimeters 的形式。使用 `Add<Meters>` 可以将 RHS 指定为 Meters，那么 fn add(self, rhs: RHS) 自然而言的变成了 Millimeters 和 Meters 的相加。

默认类型参数主要用于两个方面：

1. 减少实现的样板代码
2. 扩展类型但是无需大幅修改现有的代码

### 调用同名的方法

不同特征拥有同名的方法是很正常的事情，甚至除了特征上的同名方法外，在类型上，也有同名方法：

```rust
trait Pilot {
  fn fly(&self);
}

trait Wizard {
  fn fly(&self);
}

struct Human;

impl Pilot for Human {
  fn fly(&self) {
    println!("This is your captain speaking.");
  }
}
impl Wizard for Human {
  fn fly(&self) {
    println!("Up!");
  }
}
impl Human {
  fn fly(&self) {
    println!("*waving arms furiously*");
  }
}
```

#### 优先调用类型上的方法

当调用 Human 实例的 fly 时，编译器默认调用该类型中定义的方法

#### 调用特征上的方法

为了能够调用两个特征的方法，需要使用显式调用的语法：

```rust
fn main() {
  let person = Human;
  Pilot::fly(&person); // 调用Pilot特征上的方法
  Wizard::fly(&person); // 调用Wizard特征上的方法
  person.fly(); // 调用Human类型自身的方法
}
```

当显式调用时，编译器就可以根据调用的类型( self 的类型)决定具体调用哪个方法。如果方法没有 self 参数呢？比如关联函数。

```rust
trait Animal {
  fn baby_name() -> String;
}

struct Dog;

impl Dog {
  fn baby_name() -> String {
    String::from("Spot")
  }
}

impl Animal for Dog {
  fn baby_name() -> String {
    String::from("puppy")
  }
}

fn main() {
  println!("A baby dog is called a {}", Dog::baby_name());
  // A baby dog is called a Spot
}
```

Dog::baby_name() 的调用方式显然不行，并不能调用到 Animal 上的 baby_name 函数。

```rust
fn main() {
  println!("A baby dog is called a {}", Animal::baby_name());
  //                                    ^^^^^^^^^^^^^^^^^ cannot infer type // 无法推断类型
}
```

这时需要完全限定语法

完全限定语法是调用函数最为明确的方式：

```rust
fn main() {
  println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}
```

完全限定语法定义为：`<Type as Trait>::function(receiver_if_method, next_arg, ...);`

上面定义中，第一个参数是方法接收器 receiver （三种 self），只有方法才拥有，例如关联函数就没有 receiver。

### 特征定义中的特征约束

例如有一个特征 OutlinePrint，它有一个方法，能够对当前的实现类型进行格式化输出：

```rust
use std::fmt::Display;

trait OutlinePrint: Display {
  fn outline_print(&self) {
    let output = self.to_string();
    let len = output.len();
    println!("{}", "*".repeat(len + 4));
    println!("*{}*", " ".repeat(len + 2));
    println!("* {} *", output);
    println!("*{}*", " ".repeat(len + 2));
    println!("{}", "*".repeat(len + 4));
  }
}
```

这里有一个眼熟的语法: OutlinePrint: Display，感觉很像之前讲过的特征约束，只不过用在了特征定义中而不是函数的参数中，用来说明一个特征需要实现另一个特征，这里就是：如果你想要实现 OutlinePrint 特征，首先你需要实现 Display 特征。

想象一下，假如没有这个特征约束，那么 self.to_string 还能够调用吗（ to_string 方法会为实现 Display 特征的类型自动实现）

```rust
struct Point {
  x: i32,
  y: i32,
}

impl OutlinePrint for Point {}
```

因为 Point 没有实现 Display 特征，会得到下面的报错：

```sh
error[E0277]: the trait bound `Point: std::fmt::Display` is not satisfied
  --> src/main.rs:20:6
   |
20 | impl OutlinePrint for Point {}
   |      ^^^^^^^^^^^^ `Point` cannot be formatted with the default formatter;
try using `:?` instead if you are using a format string
   |
   = help: the trait `std::fmt::Display` is not implemented for `Point`
```

既然有求于编译器，那只能选择满足它：

```rust
use std::fmt;

impl fmt::Display for Point {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "({}, {})", self.x, self.y)
  }
}
```

### 在外部类型上实现外部特征(newtype)

在特征章节中，有提到孤儿规则，简单来说，就是特征或者类型必需至少有一个是本地的，才能在此类型上定义特征。

这里提供一个办法来绕过孤儿规则，那就是使用 `newtype` 模式，简而言之：就是为一个元组结构体创建新类型。该元组结构体封装有一个字段，该字段就是希望实现特征的具体类型。

该封装类型是本地的，因此我们可以为此类型实现外部的特征。newtype 不仅仅能实现以上的功能，而且它在运行时没有任何性能损耗，因为在编译期，该类型会被自动忽略。

下面来看一个例子，有一个动态数组类型： `Vec<T>`，它定义在标准库中，还有一个特征 Display，它也定义在标准库中，如果没有 newtype，是无法为 `Vec<T>` 实现 Display 的：

```sh
error[E0117]: only traits defined in the current crate can be implemented for arbitrary types
--> src/main.rs:5:1
|
5 | impl<T> std::fmt::Display for Vec<T> {
| ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^------
| |                             |
| |                             Vec is not defined in the current crate
| impl doesn't use only types from inside the current crate
|
= note: define and implement a trait or new type instead
```

编译器给了提示： define and implement a trait or new type instead，重新定义一个特征，或者使用 new type，前者当然不可行，那么来试试后者：

```rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "[{}]", self.0.join(", "))
  }
}

fn main() {
  let w = Wrapper(vec![String::from("hello"), String::from("world")]);
  println!("w = {}", w);
}
```

其中，`struct Wrapper(Vec<String>)` 就是一个元组结构体，它定义了一个新类型 Wrapper。

既然 new type 有这么多好处，它有没有不好的地方呢？答案是肯定的。注意到怎么访问里面的数组吗？self.0.join(", ")，是的，很啰嗦，因为需要先从 Wrapper 中取出数组: self.0，然后才能执行 join 方法。

Rust 提供了一个特征叫 Deref，实现该特征后，可以自动做一层类似类型转换的操作，可以将 Wrapper 变成 `Vec<String>` 来使用。这样就会像直接使用数组那样去使用 Wrapper，而无需为每一个操作都添加上 self.0。
