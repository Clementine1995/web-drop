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

特征很类似接口，例如 `#[derive(Debug)]`，它在我们定义的类型（struct）上自动派生 Debug 特征，接着可以使用 println!("{:?}", x) 打印这个类型。

特征定义了一个可以被共享的行为，只要实现了特征，你就能使用该行为。

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
