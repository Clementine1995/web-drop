# 冴羽ES6系列学习

主要记录冴羽博客中ES6系列阅读后的关键点记录与总结

>[冴羽的博客](https://github.com/mqyqingfeng/Blog)

## let 和 const

let 和 const 的特点

+ 不会被提升
+ 重复声明报错
+ 不绑定全局作用域

注意 for 循环中的 let 具有不同的行为，每次迭代循环时都创建一个新变量，并以之前迭代中同名变量的值将其初始化。圆括号之内有隐藏的作用域。普通 for 循环是不能使用 const 作为循环变量的，但是 forof 与 forin 每次循环是创建新的绑定，可以使用 const。
