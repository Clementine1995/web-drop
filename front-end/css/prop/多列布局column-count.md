# CSS3多列布局

>[CSS并不简单：多栏布局（Multi-Columns Layout）](https://juejin.im/post/5af2b9926fb9a07aa34a3fbd)
>[浅谈CSS3多列布局](https://juejin.im/post/58290dae2f301e00585904f3)

## 简介

分列布局，在以前虽然可以实现，可是难度却是不小，工作量很大，必须使用JavaScript对内容分段，再配合上绝对定位或浮动等CSS样式来实现多列布局。但现在，强大的CSS3为我们提供了“multi-column”，让我们可以很轻松的实现这样的分列布局。

## 结构

多栏布局的结构很简单，主要由multi-column container和column box组成。
当一个元素设置了column-width和column-count属性并且值不为auto，那么这个元素就是multi-column container。
multi-column container内部通过多个column box来展示内容。

## 相关的css属性

+ 列数和列宽：column-count、column-width、columns
+ 列的间距和分列样式：column-gap、column-rule-color、column-rule-style、column-rule-width、column-rule
+ 跨越列：column-span
+ 填充列：column-fill
+ 分栏符：column-break-before、column-break-after、column-break-inside

整体看一下这些属性对应的位置：
![img](https://lc-gold-cdn.xitu.io/3b8a45dbf1b7f3e177ea.jpg?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## 列数和列宽

### 列数（column-count）

column-count：用来指定一个多列元素的列数。

语法：`column-count: auto || number`

auto是column-count的默认值，当设置为auto时，元素分栏由其他属性决定，比如后面要讲的column-width；它还可以是任何正整数数字，不能带单位，用来表示多列布局的列数。

实例：

```css
css.columns3{
  -moz-column-count: 3;
  -webkit-column-count: 3;
  column-count: 3;
}
```

```css
.columns4{
  -moz-column-count: 4;
  -webkit-column-count: 4;
  column-count: 4;  
}
```

![img](https://lc-gold-cdn.xitu.io/8e4233a306ac45a7aa78.jpg?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 列宽（column-width）

column-width：用来设置多列布局的列宽。

语法：`column-width: auto || length;`

默认值为auto，如果设置为auto或没有显式的设置此值时，列宽由其他属性来决定，比如：由column-count来决定；此值还可以用固定值来设置列宽，单位可以是px或em，但不能是负值。

```css
/*左图*/
.columnsWidth1{
  column-width: 100px;
}
```

```css
/*右图*/
.columnsWidth2{
  column-width: 75px;  
}
```

![img](https://user-gold-cdn.xitu.io/2016/11/29/df1bbfcfbec520b359225a07f93d2ecf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### columns

columns是复合属性