# CSS3 多列布局

> [CSS 并不简单：多栏布局（Multi-Columns Layout）](https://juejin.im/post/5af2b9926fb9a07aa34a3fbd)
>
> [浅谈 CSS3 多列布局](https://juejin.im/post/58290dae2f301e00585904f3)

## 简介

分列布局，在以前虽然可以实现，可是难度却是不小，工作量很大，必须使用 JavaScript 对内容分段，再配合上绝对定位或浮动等 CSS 样式来实现多列布局。但现在，强大的 CSS3 为我们提供了“multi-column”，让我们可以很轻松的实现这样的分列布局。

## 结构

多栏布局的结构很简单，主要由 multi-column container 和 column box 组成。
当一个元素设置了 column-width 和 column-count 属性并且值不为 auto，那么这个元素就是 multi-column container。
multi-column container 内部通过多个 column box 来展示内容。

## 相关的 css 属性

- 列数和列宽：column-count、column-width、columns
- 列的间距和分列样式：column-gap、column-rule-color、column-rule-style、column-rule-width、column-rule
- 跨越列：column-span
- 填充列：column-fill
- 分栏符：column-break-before、column-break-after、column-break-inside

整体看一下这些属性对应的位置：
![img](https://lc-gold-cdn.xitu.io/3b8a45dbf1b7f3e177ea.jpg?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## 列数和列宽

### 列数（column-count）

column-count：用来指定一个多列元素的列数。

语法：`column-count: auto || number`

auto 是 column-count 的默认值，当设置为 auto 时，元素分栏由其他属性决定，比如后面要讲的 column-width；它还可以是任何正整数数字，不能带单位，用来表示多列布局的列数。

实例：

```css
css.columns3 {
  -moz-column-count: 3;
  -webkit-column-count: 3;
  column-count: 3;
}
```

```css
.columns4 {
  -moz-column-count: 4;
  -webkit-column-count: 4;
  column-count: 4;
}
```

![img](https://lc-gold-cdn.xitu.io/8e4233a306ac45a7aa78.jpg?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 列宽（column-width）

column-width：用来设置多列布局的列宽。

语法：`column-width: auto || length;`

默认值为 auto，如果设置为 auto 或没有显式的设置此值时，列宽由其他属性来决定，比如：由 column-count 来决定；此值还可以用固定值来设置列宽，单位可以是 px 或 em，但不能是负值。

```css
/*左图*/
.columnsWidth1 {
  column-width: 100px;
}
```

```css
/*右图*/
.columnsWidth2 {
  column-width: 75px;
}
```

![img](https://user-gold-cdn.xitu.io/2016/11/29/df1bbfcfbec520b359225a07f93d2ecf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### columns

columns 是复合属性，是 colunm-width 与 column-count 的缩写，语法：`columns: column-width column-count;`，使用时要注意兼容性。

## 列的间距和分列样式

### 列的间距（column-gap）

column-gap：用来设置列与列之间的距离。
语法：`column-gap: normal || length;`

默认值为 normal，W3C 建议 `1em` 值。此值还可以是任何非负整数值，单位可以是 px、em、vw 等。

实例：

```css
.gap {
  -moz-column-gap: 40px;
  -webkit-column-gap: 40px;
  column-gap: 40px;
}
```

效果图：

![image](https://lc-gold-cdn.xitu.io/fe68b7464de35aca31f9.jpg?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

注意：**column-gap 设置的值只作用于列与列之间**。

### 分列样式（column-rule）

column-rule：用来设置列与列之间的边框宽度、样式和颜色。

语法：`column-rule: column-rule-width column-rule-style column-rule-color;`

参数说明：

- column-rule-width：用来设置 column-rule 的样式，默认值为“none”，类似于 border-width 属性。
- column-rule-style：用来设置 column-rule 的样式，默认为 none，此属性的样式和 border-style 的样式一样：
- column-rule-color：用来设置 column-rule 的颜色，类似 border-color 属性，如果不想显示颜色，可设置为 transparent（透明色）。

column-rule 还可以拆分开来：

```css
column-rule-width: length;
column-rule-style: style;
column-rule-color: color;
```

实例：

```css
.rule1 {
  -moz-column-rule-width: 5px;
  -webkit-column-rule-width: 5px;
  column-rule-width: 5px;
  -moz-column-rule-style: dotted;
  -webkit-column-rule-style: dotted;
  column-rule-style: dotted;
  -moz-column-rule-color: blue;
  -webkit-column-rule-color: blue;
  column-rule-color: blue;
}

.rule2 {
  -moz-column-rule: 5px double red;
  -webkit-column-rule: 5px double red;
  column-rule: 5px double red;
}
```

![image](https://lc-gold-cdn.xitu.io/b109f9f1d29ed0e858a1.jpg?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

注意：column-rule 并不会占据空间位置，看下面的例子：

```css
.rule3{
  -moz-column-rule: 50px solid red;
  -webkit-column-rule: 50px solid red;
  column-rule: 50px solid red;
```

效果图：

![image](https://user-gold-cdn.xitu.io/2016/11/29/fd263eb6b59ec02d185400d3bbabfebe?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

从上面的例子可以看出，column-rule-width 增大并不会影响列的布局，只是将其往元素两边扩展。

## 跨越列

column-span：指定某个元素跨越多少列。
语法：`column-span: none || all;`
默认值为 none，表示不跨越任何列；all 表示元素跨越所有列。

实例：

```html
.columns{ border:1px solid #000; padding:10px; width:350px; columns:auto 3; }
h2{ -webkit-column-span:all; column-span:all; }
<div class="columns">
  <h2>My Very Special Columns</h2>
  <p>
    This is a bunch of text split into three columns using the CSS `columns`
    property. The text is equally distributed over the columns.
  </p>
</div>
```

效果图：

![image](https://user-gold-cdn.xitu.io/2016/11/29/c15a2de98da5ed16d1632dc29bc5ab99?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

标题 h2 按列的布局跨越了三列布局，也就是当前的所有列。

## 填充列

column-fill：用来设置元素所有列的高度是否统一。

语法：`column-fill: auto || balance;`

默认值为 auto，表示列高度自适应内容；此值设为 balance 时，所有列的高度以其中最高的一列统一。

## 分栏符

column-break-before、column-break-after、column-break-inside 三个属性都是用来设置对象何时断行。

- column-break-before：设置或检索对象之前是否断行。
- column-break-after：设置或检索对象之后是否断行。
- column-break-inside：设置或检索对象内部是否断行。

## writing-mode

writing-mode 属性定义了文本在水平或垂直方向上如何排布，这个属性属于多列布局，但是它也可以实现某些多列布局的效果。
语法：`writing-mode: horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr`

- horizontal-tb：水平方向自上而下的书写方式。即 left-right-top-bottom
- vertical-rl：垂直方向自右而左的书写方式。即 top-bottom-right-left
- vertical-lr：垂直方向内内容从上到下，水平方向从左到右
- sideways-rl：内容垂直方向从上到下排列，实验值
- sideways-lr：内容垂直方向从下到上排列，实验值
