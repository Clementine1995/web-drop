# Rust 基础入门 2

## 复合类型

### 字符串与切片

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

#### 切片(slice)

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
