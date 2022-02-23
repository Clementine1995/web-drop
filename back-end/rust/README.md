# Rust

> [Rust 语言圣经](https://book.rust.team/into-rust.html)

## 认识 Cargo

Cargo 就是 Rust 的包管理工具，就像 nodejs 的 npm 一样

### 创建项目

```shell
cargo new world_hello
```

上面的命令使用 cargo new 创建一个项目，项目名是 world_hello，下面是生成的项目结构

```shell
.
├── .git
├── .gitignore
├── Cargo.toml
└── src
    └── main.rs
```

### 运行项目

运行项目有两种方式

1. cargo run
2. 手动编译和运行项目

```shell
# 手动编译并运行项目
cargo build

# debug 表示运行的是 debug 模式，代码编译速度很快，运行速度就会慢一些
./target/debug/world_hello

# 如果想要高性能代码，需要使用 release 编译
cargo run --release
cargo build --release
```

### cargo check

快速的检查一下代码能否编译通过。因此该命令速度会非常快，能节省大量的编译时间。

### Cargo.toml 和 Cargo.lock

- Cargo.toml 是 cargo 特有的项目数据描述文件。它存储了项目的所有元配置信息，如果 Rust 开发者希望 Rust 项目能够按照期望的方式进行构建、测试和运行，那么，必须按照合理的方式构建 Cargo.toml。
- Cargo.lock 文件是 cargo 工具根据同一项目的 toml 文件生成的项目依赖详细清单，因此一般不用修改它，只需要对着 Cargo.toml 文件撸就行了。

> 什么情况下该把 Cargo.lock 上传到 git 仓库里？很简单，当你的项目是一个可运行的程序时，就上传 Cargo.lock，如果是一个依赖库项目，那么请把它添加到 .gitignore 中

打开 VSCode 进入根目录的 Cargo.toml，可以看到其中信息

#### package 配置段落

```py
[package]
name = "world_hello"  # 项目名称
version = "0.1.0"     # 当前版本
edition = "2021"      # Rust 大版本
```

#### 定义项目依赖

在 Cargo.toml 中，主要通过各种依赖段落来描述该项目的各种依赖项：

- 基于 Rust 官方仓库 crates.io，通过版本说明来描述
- 基于项目源代码的 git 仓库地址，通过 URL 来描述
- 基于本地项目的绝对路径或者相对路径，通过类 Unix 模式的路径来描述

这三种形式具体写法如下：

```py
[dependencies]
rand = "0.3"
hammer = { version = "0.5.0"}
color = { git = "https://github.com/bjz/color-rs" }
geometry = { path = "crates/geometry" }
```
