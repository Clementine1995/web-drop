# Java8 新特性

## Lambda 表达式

Lambda 允许把函数作为一个方法的参数（函数作为参数传递进方法中）。

lambda 表达式只能引用标记了 final 的外层局部变量

lambda 表达式的局部变量可以不用声明为 final，但是必须不可被后面的代码修改（即隐性的具有 final 的语义）

```java
(parameters) -> expression
// 或
(parameters) -> { statements; }
```

## 方法引用

方法引用通过方法的名字来指向一个方法，使用一对冒号 `::`。

## 函数式接口

## 默认方法

默认方法就是接口可以有实现方法，而且不需要实现类去实现其方法，还可以声明（并且可以提供实现）静态方法。

## Stream

添加了一个新的抽象称为流 Stream，可以让你以一种声明的方式处理数据，引入了函数式编程风格。

有两种方法生成流

- stream() − 为集合创建串行流
- parallelStream() − 为集合创建并行流。

并且提供了新的方法来处理流中数据。forEach、map、filter、limit、sorted。

## Optional 类

Optional 类主要解决的问题是空指针异常（NullPointerException），这是一个包含有可选值的包装类，这意味着 Optional 类既可以含有对象也可以为空。

## 新的日期时间 API
