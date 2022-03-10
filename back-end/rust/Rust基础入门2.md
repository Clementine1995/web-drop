# Rust 基础入门：复合类型

## 字符串与切片

```rust
fn main() {
  let my_name = "Pascal";
  greet(my_name);
}

fn greet(name: String) {
  println!("Hello, {}!", name);
}
```

上面代码是会报错的，编译器提示 greet 函数需要一个 String 类型的字符串，却传入了一个 &str 类型的字符串

### 切片(slice)

切片并不是 Rust 独有的概念，它允许你引用集合中部分连续的元素序列，而不是引用整个集合。

对于字符串而言，切片就是对 String 类型中某一部分的引用，它看起来像这样：

```rust
#![allow(unused)]
fn main() {
let s = String::from("hello world");

let hello = &s[0..5];
let world = &s[6..11];
}
```

hello 没有引用整个 String s，而是引用了 s 的一部分内容，通过 [0..5] 的方式来指定。

这就是创建切片的语法，使用方括号包括的一个序列: `[开始索引..终止索引]`，其中开始索引是切片中第一个元素的索引位置，而终止索引是最后一个元素后面的索引位置，也就是这是一个 `右半开区间`。在切片数据结构内部会保存开始的位置和切片的长度，其中长度是通过 `终止索引 - 开始索引` 的方式计算得来的。

```rust
fn main() {
let s = String::from("hello");

// 在使用 Rust 的 `..` range 序列语法时，如果你想从索引 0 开始，可以使用如下的方式，这两个是等效的：
let slice = &s[0..2];
let slice = &s[..2];

// 如果你的切片想要包含 String 的最后一个字节，则可以这样使用:
let len = s.len();

let slice = &s[4..len];
let slice = &s[4..];

// 也可以截取完整的 String 切片：
let len = s.len();

let slice = &s[0..len];
let slice = &s[..];
}
```

在对字符串使用切片语法时需要格外小心，切片的索引必须落在字符之间的边界位置，也就是 UTF-8 字符的边界，例如中文在 UTF-8 中占用三个字节,下面的代码就会崩溃:

```rust
let s = "中国人";
let a = &s[0..2];
// 如果改成 &s[0..3]，则可以正常通过编译。
println!("{}",a);
```

字符串切片的类型标识是 &str，因此我们可以这样声明一个函数，输入 String 类型，返回它的切片: fn first_word(s: &String) -> &str 。

#### 其它切片

因为切片是对集合的部分引用，因此不仅仅字符串有切片，其它集合类型也有，例如数组：

```rust
fn main() {
let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];

assert_eq!(slice, &[2, 3]);
}
```

### 字符串字面量是切片

之前提到过字符串字面量,但是没有提到它的类型：

```rust
let s = "Hello, world!";
// 实际上，s 的类型是 &str，因此你也可以这样声明：
let s: &str = "Hello, world!";
```

该切片指向了程序可执行文件中的某个点，这也是为什么字符串字面量是不可变的，因为 &str 是一个不可变引用。

### 什么是字符串?

Rust 中字符用单引号表示，是 Unicode 类型，因此每个字符占据 4 个字节内存空间。在字符串中不一样，字符串是 UTF-8 编码，也就是字符串中的字符所占的字节数是变化的(1 - 4)，这样有助于大幅降低字符串所占用的内存空间。

Rust 在语言级别，只有一种字符串类型： str，它通常是以引用类型出现 &str，也就是上文提到的字符串切片。虽然语言级别只有上述的 str 类型，但是在标准库里，还有多种不同用途的字符串类型，其中使用最广的即是 String 类型。

str 类型是硬编码进可执行文件，也无法被修改，但是 String 则是一个可增长、可改变且具有所有权的 UTF-8 编码字符串，当 Rust 用户提到字符串时，往往指的就是 String 类型和 &str 字符串切片类型，这两个类型都是 UTF-8 编码。

除了 String 类型的字符串，Rust 的标准库还提供了其他类型的字符串，例如 OsString， OsStr， CsString 和 CsStr 等，它们分别对应的是具有所有权和被借用的变量。

#### 操作字符串

由于 String 是可变字符串，因此我们可以对它进行创建、增删操作

```rust
fn main() {
  // 创建一个空String
  let mut s = String::new();
  // 将&str类型的"hello,world"添加到s中
  s.push_str("hello,world");
  // 将字符'!'推入s中
  s.push('!');
  // 最后s的内容是"hello,world!"
  assert_eq!(s,"hello,world!");

  // 从现有的&str切片创建String类型
  let mut s = "hello,world".to_string();
  // 将字符'!'推入s中
  s.push('!');
  // 最后s的内容是"hello,world!"
  assert_eq!(s,"hello,world!");

  // 从现有的&str切片创建String类型
  // String与&str都是UTF-8编码，因此支持中文
  let mut s = String::from("你好,世界");
  // 将字符'!'推入s中
  s.push('!');
  // 最后s的内容是"你好,世界!"
  assert_eq!(s,"你好,世界!");

  let s1 = String::from("hello,");
  let s2 = String::from("world!");
  // 在下句中，s1的所有权被转移走了，因此后面不能再使用s1
  let s3 = s1 + &s2;
  assert_eq!(s3,"hello,world!");
  // 下面的语句如果去掉注释，就会报错
  // println!("{}",s1);
}
```

在上面代码中，有一处需要解释的地方，就是使用 + 来对字符串进行相加操作， 这里之所以使用 s1 + &s2 的形式，是因为 + 使用了 add 方法，该方法的定义类似：`fn add(self, s: &str) -> String {`

因为该方法涉及到更复杂的特征功能，因此这里简单说明下， self 是 String 类型的字符串 s1，该函数说明，只能将 &str 类型的字符串切片添加到 String 类型的 s1 上，然后返回一个新的 String 类型，所以 let s3 = s1 + &s2; 就很好解释了，将 String 类型的 s1 与 &str 类型的 s2 进行相加，最终得到 String 类型的 s3。

在上面代码中，做了一个有些难以理解的 &String 操作，下面来展开讲讲。

### String 与 &str 的转换

在之前的代码中，已经见到好几种从 &str 类型生成 String 类型的操作：

- String::from("hello,world")
- "hello,world".to_string()

那么如何将 String 类型转为 &str 类型呢？答案很简单，取引用即可：

```rust
fn main() {
  let s = String::from("hello,world!");
  say_hello(&s);
  say_hello(&s[..]);
  say_hello(s.as_str());
}
fn say_hello(s: &str) {
  println!("{}",s);
}
```

实际上这种灵活用法是因为 deref 隐式强制转换，具体会在 Deref 特征进行详细讲解。

### 字符串索引

在其它语言中，使用索引的方式访问字符串的某个字符或者子串是很正常的行为，但是在 Rust 中就会报错

```rust
fn main() {
  let s1 = String::from("hello");
  let h = s1[0];
  // 会报错：^^^^^ `String` cannot be indexed by `{integer}`
}
```

#### 深入字符串内部

字符串的底层的数据存储格式实际上是[ u8 ]，一个字节数组。对于 `let hello = String::from("Hola");` 这行代码来说， hello 的长度是 4 个字节，因为 "hola" 中的每个字母在 UTF-8 编码中仅占用 1 个字节。

但是对于这行的代码呢？`let hello = String::from("中国人");`，但是实际上是 9 个字节的长度，因为大部分常用汉字在 UTF-8 中的长度是 3 个字节，因此这种情况下对 hello 进行索引，访问 &hello[0] 没有任何意义，因为你取不到 `中` 这个字符

### 操作 UTF8 字符串

#### 字符

如果你想要以 Unicode 字符的方式遍历字符串，最好的办法是使用 chars 方法，例如：

```rust
for c in "中国人".chars() {
    println!("{}", c);
}
```

#### 字节

这种方式是返回字符串的底层字节数组表现形式：

```rust
for b in "中国人".bytes() {
    println!("{}", b);
}
```

#### 获取子串

想要准确的从 UTF-8 字符串中获取子串是较为复杂的事情，使用标准库你是做不到的。需要在 crates.io 上搜索 utf8 来寻找想要的功能。可以考虑尝试下这个库:utf8_slice。

### 字符串深度剖析

那么问题来了，为啥 String 可变，而字符串字面值 str 却不可以？

就字符串字面值来说，我们在编译时就知道其内容，最终字面值文本被直接硬编码进可执行文件中，这使得字符串字面值快速且高效，这主要得益于字符串字面值的不可变性。

对于 String 类型，为了支持一个可变、可增长的文本片段，需要在堆上分配一块在编译时未知大小的内存来存放内容，这些都是在程序运行时完成的：

- 首先向操作系统请求内存来存放 String 对象
- 在使用完成后，将内存释放，归还给操作系统

其中第一部分由 String::from 完成，它创建了一个全新的 String。

重点来了，到了第二部分，对于 Rust 而言，Rust 的开发者想出了一个无比惊艳的办法：变量在离开作用域后，就自动释放其占用的内存。

与其它系统编程语言的 free 函数相同，Rust 也提供了一个释放内存的函数： drop，但是不同的是，其它语言要手动调用 free 来释放每一个变量占用的内存，而 Rust 则在变量离开作用域时，自动调用 drop 函数: 上面代码中，Rust 在结尾的 } 处自动调用 drop。

## 元组

元组是由多种类型组合到一起形成的，因此它是复合类型，元组的长度是固定的，元组中元素的顺序也是固定的。

可以通过以下语法创建一个元组：

```rust
fn main() {
  let tup: (i32, f64, u8) = (500, 6.4, 1);
}
```

变量 tup 被绑定了一个元组值 (500, 6.4, 1)，该元组的类型是 (i32, f64, u8)，可以使用模式匹配或者 . 操作符来获取元组中的值。

### 用模式匹配解构元组

```rust
fn main() {
  let tup = (500, 6.4, 1);
  let (x, y, z) = tup;
  println!("The value of y is: {}", y);
}
```

### 用 . 来访问元组

模式匹配可以让我们一次性把元组中的值全部或者部分获取出来，如果只想要访问某个特定元素，那模式匹配就略显繁琐，对此，Rust 提供了 . 的访问方式：

```rust
fn main() {
  let x: (i32, f64, u8) = (500, 6.4, 1);
  let five_hundred = x.0;
  let six_point_four = x.1;
  let one = x.2;
}
```

### 元组的使用示例

元组在函数返回值场景很常用，例如下面的代码，可以使用元组返回多个值：

```rust
fn main() {
  let s1 = String::from("hello");
  let (s2, len) = calculate_length(s1);
  println!("The length of '{}' is {}.", s2, len);
}

fn calculate_length(s: String) -> (String, usize) {
  let length = s.len(); // len() 返回字符串的长度
  (s, length)
}
```

## 结构体

结构体跟之前讲过的元组有些相像：都是由多种类型组合而成。但是与元组不同的是，结构体可以为内部的每个字段起一个富有含义的名称。因此结构体更加灵活更加强大，无需依赖这些字段的顺序来访问和解析它们。

### 结构体语法

#### 定义结构体

一个结构体有几部分组成：

- 通过关键字 struct 定义
- 一个清晰明确的结构体 名称
- 几个有名字的结构体 字段

例如以下结构体定义了某网站的用户：

```rust
struct User {
  active: bool,
  username: String,
  email: String,
  sign_in_count: u64,
}
```

#### 创建结构体实例

```rust
let user1 = User {
  email: String::from("someone@example.com"),
  username: String::from("someusername123"),
  active: true,
  sign_in_count: 1,
};
```

有几点值得注意:

- 初始化实例时，每个字段都需要进行初始化
- 初始化时的字段顺序不需要和结构体定义时的顺序一致

#### 访问结构体字段

通过 . 操作符即可访问结构体实例内部的字段值，也可以修改它们：

```rust
let mut user1 = User {
  email: String::from("someone@example.com"),
  username: String::from("someusername123"),
  active: true,
  sign_in_count: 1,
};

user1.email = String::from("anotheremail@example.com");
```

需要注意的是，必须要将结构体实例声明为**可变**的，才能修改其中的字段，Rust 不支持将某个结构体某个字段标记为可变。

#### 简化结构体创建

下面的函数类似一个构建函数，返回了 User 结构体的实例：

```rust
fn build_user(email: String, username: String) -> User {
  // 当函数参数和结构体字段同名时，可以直接使用缩略的方式进行初始化
  User {
    email,
    username,
    active: true,
    sign_in_count: 1,
  }
}
```

#### 结构体更新语法

在实际场景中，有一种情况很常见：根据已有的结构体实例，创建新的结构体实例，例如根据已有的 user1 实例来构建 user2：

```rust
let user2 = User {
  active: user1.active,
  username: user1.username,
  email: String::from("another@example.com"),
  sign_in_count: user1.sign_in_count,
};
// 下面是简写语法跟js很像

let user2 = User {
  email: String::from("another@example.com"),
  ..user1
  // 必须在结构体的尾部使用。
};
```

注意：user1 的部分字段所有权被转移到 user2 中：username 字段发生了所有权转移，作为结果，user1 无法再被使用。但是并不代表 user1 内部的其它字段不能被继续使用，非所有权转移的字段仍旧可以访问。

### 元组结构体(Tuple Struct)

结构体必须要有名称，但是结构体的字段可以没有名称，这种结构体长得很像元组，因此被称为元组结构体，例如：

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

元组结构体在你希望有一个整体名称，但是又不关心里面字段的名称时将非常有用。例如上面的 Point 元组结构体，众所周知 3D 点是 (x, y, z) 形式的坐标点，因此我们无需再为内部的字段逐一命名为：x, y, z。

### 单元结构体(Unit-like Struct)

单元结构体就跟 单元类型 很像，没有任何字段和属性，但是好在，它还挺有用。

如果你定义一个类型，但是不关心该类型的内容, 只关心它的行为时，就可以使用 单元结构体：

```rust
struct AlwaysEqual;

let subject = AlwaysEqual;

// 我们不关心 AlwaysEqual 的字段数据，只关心它的行为，因此将它声明为单元结构体，然后再为它实现某个特征
impl SomeTrait for AlwaysEqual {
}
```

### 结构体数据的所有权

在之前的 User 结构体的定义中，有一处细节：我们使用了自身拥有所有权的 String 类型而不是基于引用的 &str 字符串切片类型。这是一个有意而为之的选择：因为我们想要这个结构体拥有它所有的数据，而不是从其它地方借用数据。

也可以让 User 结构体从其它对象借用数据，不过这么做，就需要引入生命周期(lifetimes)这个新概念（也是一个复杂的概念），简而言之，生命周期能确保结构体的作用范围要比它所借用的数据的作用范围要小。

总之，如果你想在结构体中使用一个引用，就必须加上生命周期，否则就会报错，未来在生命周期中会讲到如何修复这个问题以便在结构体中存储引用。

### 使用 #[derive(Debug)] 来打印结构体的信息

如果直接对结构体使用 `println!("user1 is {}", user1);` 会报错

```rust
error[E0277]: `Rectangle` doesn't implement `std::fmt::Display`
```

提示我们结构体 Rectangle 没有实现 Display 特征，这是因为如果我们使用 {} 来格式化输出，那对应的类型就必须实现 Display 特征，以前见到的基本类型，都默认实现了该特征。

编辑器提示使用 `{:?}` ，可是依然无情报错了:

```rust
error[E0277]: `Rectangle` doesn't implement `Debug`
```

还需要实现 Debug，首先，Rust 默认不会为我们实现 Debug，为了实现，有两种方式可以选择：

- 手动实现
- 使用 derive 派生实现

后者简单的多，但是也有限制，来看看该如何使用:

```rust
#[derive(Debug)]
struct Rectangle {
  width: u32,
  height: u32,
}
fn main() {
  let rect1 = Rectangle {
    width: 30,
    height: 50,
  };
  println!("rect1 is {:?}", rect1);
}
```

当结构体较大时，我们可能希望能够有更好的输出表现，此时可以使用 `{:#?}` 来替代 `{:?}`。

还有一个简单的输出 debug 信息的方法，那就是使用 dbg! 宏，它会拿走表达式的所有权，然后打印出相应的文件名、行号等 debug 信息，当然还有我们需要的表达式的求值结果。除此之外，它最终还会把表达式值的所有权返回！

注意：dbg! 输出到标准错误输出 stderr，而 println! 输出到标准输出 stdout

## 枚举

枚举(enum 或 enumeration)允许你通过列举可能的成员来定义一个枚举类型，例如扑克牌花色：

```rust
enum PokerSuit {
  Clubs,
  Spades,
  Diamonds,
  Hearts,
}
```

枚举类型是一个类型，它会包含所有可能的枚举成员, 而枚举值是该类型中的具体某个成员的实例。

### 枚举值

现在来创建 PokerSuit 枚举类型的两个成员实例：

```rust
let heart = PokerSuit::Hearts;
let diamond = PokerSuit::Diamonds;
```

通过 `::` 操作符来访问 PokerSuit 下的具体成员，从代码可以清晰看出，heart 和 diamond 都是 PokerSuit 枚举类型的，接着可以定义一个函数来使用它们：

```rust
fn main() {
  let heart = PokerSuit::Hearts;
  let diamond = PokerSuit::Diamonds;

  print_suit(heart);
  print_suit(diamond);
}

fn print_suit(card: PokerSuit) {
  println!("{:?}",card);
}
```

还可以直接将数据信息关联到枚举成员上

```rust
enum PokerCard {
  Clubs(u8),
  Spades(u8),
  Diamonds(u8),
  Hearts(u8),
}

fn main() {
  let c1 = PokerCard::Spades(5);
  let c2 = PokerCard::Diamonds(13);
}
// 同一个枚举类型下的不同成员还能持有不同的数据类型，例如让某些花色打印 1-13 的字样，另外的花色打印上 A-K 的字样：
enum PokerCard {
  Clubs(u8),
  Spades(u8),
  Diamonds(char),
  Hearts(char),
}
```

**任何类型的数据都可以放入枚举成员中**: 例如字符串、数值、结构体甚至另一个枚举。

复杂一点的例子：

```rust
enum Message {
  Quit, // Quit 没有任何关联数据
  Move { x: i32, y: i32 }, // Move 包含一个匿名结构体
  Write(String), // Write 包含一个 String 字符串
  ChangeColor(i32, i32, i32), // ChangeColor 包含三个 i32
}
```

### Option 枚举用于处理空值

在其它编程语言中，往往都有一个 null 关键字，该关键字用于表明一个变量当前的值为空（不是零值，例如整形的零值是 0），也就是不存在值。当你对这些 null 进行操作时，例如调用一个方法，就会直接抛出 null 异常，导致程序的崩溃，因此我们在编程时需要格外的小心去处理这些 null 空值。

Rust 吸取了众多教训，决定抛弃 null，而改为使用 Option 枚举变量来表述这种结果。

Option 枚举包含两个成员，一个成员表示含有值：Some(T), 另一个表示没有值：None，定义如下：

```rust
enum Option<T> {
  Some(T),
  None,
}
```

其中 T 是泛型参数，Some(T)表示该枚举成员的数据类型是 T，换句话说，Some 可以包含任何类型的数据。

`Option<T>` 枚举是如此有用以至于它被包含在了 `prelude`（prelude 属于 Rust 标准库，Rust 会将最常用的类型、函数等提前引入其中，省得我们再手动引入）之中，你不需要将其显式引入作用域。另外，它的成员 Some 和 None 也是如此，无需使用 Option:: 前缀就可直接使用 Some 和 None。

```rust
let some_number = Some(5);
let some_string = Some("a string");

let absent_number: Option<i32> = None;
```

如果使用 None 而不是 Some，需要告诉 Rust `Option<T>` 是什么类型的，因为编译器只通过 None 值无法推断出 Some 成员保存的值的类型。

在对 `Option<T>` 进行 T 的运算之前必须将其转换为 T。通常这能帮助我们捕获到空值最常见的问题之一：期望某值不为空但实际上为空的情况。

match 表达式就是这么一个处理枚举的控制流结构：它会根据枚举的成员运行不同的代码，这些代码可以使用匹配到的值中的数据。

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

## 数组

在 Rust 中，最常用的数组有两种，第一种是速度很快但是长度固定的 array，第二种是可动态增长的但是有性能损耗的 Vector，在本书中，我们称 array 为数组，Vector 为动态数组。

数组的三要素：

- 长度固定
- 元素必须有相同的类型
- 依次线性排列

这里说的是固定长度的基本类型数组

### 创建数组

在 Rust 中，数组是这样定义的：

```rust
fn main() {
  let a = [1, 2, 3, 4, 5];
  let b: [i32; 5] = [1, 2, 3, 4, 5];
  let a = [3; 5]; // 相当于 [3, 3, 3, 3, 3]
}
```

数组语法跟 JavaScript 很像，也跟大多数编程语言很像。由于它的元素类型大小固定，且长度也是固定，因此数组 array 是存储在栈上，性能也会非常优秀。

这里，数组类型是通过方括号语法声明，i32 是元素类型，分号后面的数字 5 是数组长度，数组类型也从侧面说明了数组的元素类型要统一，长度要固定。

还可以使用上面的语法初始化一个某个值重复出现 N 次的数组。

### 访问数组元素

因为数组是连续存放元素的，因此可以通过索引的方式来访问存放其中的元素：

```rust
fn main() {
  let a = [9, 8, 7, 6, 5];
  let first = a[0]; // 获取a数组第一个元素
  let second = a[1]; // 获取第二个元素
}
```

### 越界访问

当你尝试使用索引访问元素时，Rust 将检查你指定的索引是否小于数组长度。如果索引大于或等于数组长度，Rust 会出现 panic。

### 数组切片

数组切片允许我们引用数组的一部分：

```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];
let slice: &[i32] = &a[1..3];

assert_eq!(slice, &[2, 3]);
```

切片的特点：

- 切片的长度可以与数组不同，并不是固定的，而是取决于你使用时指定的起始和结束位置
- 创建切片的代价非常小，因为切片只是针对底层数组的一个引用
- 切片类型[T]拥有不固定的大小，而切片引用类型&[T]则具有固定的大小，因为 Rust 很多时候都需要固定大小数据类型，因此&[T]更有用,&str 字符串切片也同理

### 数组总结

```rust
fn main() {
  // 编译器自动推导出one的类型
  let one             = [1, 2, 3];
  // 显式类型标注
  let two: [u8; 3]    = [1, 2, 3];
  let blank1          = [0; 3];
  let blank2: [u8; 3] = [0; 3];

  // arrays是一个二维数组，其中每一个元素都是一个数组，元素类型是[u8; 3]
  let arrays: [[u8; 3]; 4]  = [one, two, blank1, blank2];

  // 借用arrays的元素用作循环中
  for a in &arrays {
    print!("{:?}: ", a);
    // 将a变成一个迭代器，用于循环
    // 你也可以直接用for n in a {}来进行循环
    for n in a.iter() {
      print!("\t{} + 10 = {}", n, n+10);
    }

    let mut sum = 0;
    // 0..a.len,是一个 Rust 的语法糖，其实就等于一个数组，元素是从0,1,2一直增加到到a.len-1
    for i in 0..a.len() {
      sum += a[i];
    }
    println!("\t({:?} = {})", a, sum);
  }
}
```

- 数组类型容易跟数组切片混淆，[T;n]描述了一个数组的类型，而[T]描述了切片的类型， 因为切片是运行期的数据结构，它的长度无法在编译器得知，因此不能用[T;n]的形式去描述
- [u8; 3]和[u8; 4]是不同的类型，数组的长度也是类型的一部分
- 在实际开发中，使用最多的是数组切片[T]，我们往往通过引用的方式去使用&[T]，因为后者有固定的类型大小
