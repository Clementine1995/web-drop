# 弹性布局Flex

>[Flex 布局教程：语法篇](https://juejin.im/post/5ac2329b6fb9a028bf057caf)
>[Flex-弹性布局原来如此简单！！](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

## Flex 布局是什么

Flex布局，可以简便、完整、响应式地实现各种页面布局。目前，它已经得到了所有浏览器的支持。 Flex是 Flexible Box 的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。

任何一个容器都可以指定为 Flex 布局。行内元素也可以使用 Flex 布局。
**注意，设为 Flex 布局以后，子元素的float、clear和vertical-align属性将失效**。

### 兼容性

flex在演化过程有三个版本，旧版本 display:box | inline-box, 混合版本 display:flexbox | inline-flexbox, 新版本 display: flex | inline-flex。

## 基本概念

采用 Flex 布局的元素，称为 Flex 容器（flex container），简称"容器"。它的所有子元素自动成为容器成员，称为 Flex 项目（flex item），简称"项目"。
![image](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071004.png)

容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的开始位置（与边框的交叉点）叫做`main start`，结束位置叫做`main end`；交叉轴的开始位置叫做`cross start`，结束位置叫做`cross end`。

项目默认沿主轴排列。单个项目占据的主轴空间叫做`main size`，占据的交叉轴空间叫做`cross size`。

## Flex容器属性

### 基本语法

```css
.box {
  display: flex; /* 或者 inline-flex */
}
```

上述写法，定义了一个flex容器，根据设值的不同可以是块状容器或内联容器。这使得直接子结点拥有了一个flex上下文。

### 属性

+ flex-direction
+ flex-wrap
+ flex-flow
+ justify-content
+ align-items
+ align-content

### flex-direction属性

flex-direction属性决定主轴的方向（即项目的排列方向）。

基本语法：

```css
.box {
  flex-direction: row | row-reverse | column | column-reverse;
}
```

+ row（默认值） 主轴为水平方向，起点在左端。表示从左向右排列
+ row-reverse 主轴为水平方向，起点在右端。表示从右向左排列
+ column 主轴为垂直方向，起点在上沿。表示从上向下排列
+ column-reverse 主轴为垂直方向，起点在下沿。表示从下向上排列

演示：

![flex-direction](https://user-gold-cdn.xitu.io/2018/4/2/1628695cd0b76595?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### flex-wrap

默认情况下，项目都排在一条线（又称"轴线"）上。flex-wrap属性定义，如果一条轴线排不下，如何换行。

```css
.box {
  flex-wrap: nowrap | wrap | wrap-reverse;
}
```

+ nowrap（默认）：不换行。
+ wrap：所有Flex项目多行排列，按从上到下的顺序。换行，第一行在上方。
+ wrap-reverse：所有Flex项目多行排列，按从下到上的顺序（换行，第一行在下方）。

演示：

![flex-wrap](https://user-gold-cdn.xitu.io/2018/4/2/1628695cb12db292?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### flex-flow

flex-flow属性是flex-direction属性和flex-wrap属性的简写形式，默认值为row nowrap

```css
.box {
  flex-flow: <flex-direction> || <flex-wrap>;
}
```

### justify-content属性

justify-content属性定义了项目在主轴上的对齐方式及额外空间的分配方式。

```css
.box  {
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
}
```

它可能取6个值，具体对齐方式与轴的方向有关。下面假设主轴为从左到右。

+ flex-start（默认值）：左对齐，从启点线开始顺序排列
+ flex-end：右对齐，相对终点线顺序排列
+ center： 居中排列，项目均匀分布，第一项在启点线，最后一项在终点线
+ space-between：两端对齐，项目之间的间隔都相等。项目均匀分布，第一项在启点线，最后一项在终点线
+ space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。
+ space-evenly：项目均匀分布，所有项目之间及项目与边框之间距离相等

演示：

![justify-content](https://user-gold-cdn.xitu.io/2018/4/2/1628695cb20616af?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### align-items属性

align-items属性定义项目在交叉轴上的对齐方式。单行，多行并且指定高度与否都有效

```css
.box {
  align-items: stretch | flex-start | flex-end | center | baseline;
}
```

它可能取5个值。具体的对齐方式与交叉轴的方向有关，下面假设交叉轴从上到下。

+ stretch(缺省)：交叉轴方向拉伸显示，如果项目未设置高度或设为auto，将占满整个容器的高度。
+ flex-start：项目按交叉轴起点线对齐
+ flex-end：项目按交叉轴终点线对齐
+ center：交叉轴方向项目中间对齐
+ baseline：交叉轴方向按第一行文字基线对齐

演示：

![align-items](https://user-gold-cdn.xitu.io/2018/4/2/1628695cb18083e3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### align-content

align-content属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用，类似于主轴上justify-content的作用。除此之外，多行不指定高度也是无效的，但是单行固定高度，flex-wrap设置为wrap时是有效果的。

```css
.box {
    align-content: stretch | flex-start | flex-end | center | space-between | space-around ;
}
```

该属性可能取6个值。

+ stretch（默认值）：轴线占满整个交叉轴。
+ flex-start：与交叉轴的起点对齐。
+ flex-end：与交叉轴的终点对齐。
+ center：与交叉轴的中点对齐。
+ space-between：与交叉轴两端对齐，轴线之间的间隔平均分布。
+ space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。

演示：

![align-content](https://user-gold-cdn.xitu.io/2018/4/2/1628695cb17eb348?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

总结：

+ align-items属性是针对单独的每一个flex子项起作用，它的基本单位是每一个子项，在所有情况下都有效果（当然要看具体的属性值）。
+ align-content属性是将flex子项作为一个整体起作用，它的基本单位是子项构成的行，只在两种情况下有效果：1.子项多行且flex容器高度固定，2.子项单行，flex容器高度固定且设置了flex-wrap:wrap。

## Flex项目属性

### order

缺省情况下，Flex项目是按照在代码中出现的先后顺序排列的。然而order属性可以控制项目在容器中的先后顺序。

```css
.item {
  order: <integer>; /* 缺省 0 */
}
```

按order值从小到大顺序排列，可以为负值，缺省为0。

演示：

![order](https://user-gold-cdn.xitu.io/2018/4/2/1628695cd362d2ce?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### flex-grow

flex-grow属性定义项目的放大比例，flex-grow 值是一个单位的正整数，表示放大的比例。默认为0，即如果存在额外空间，也不放大，负值无效。
如果所有项目的flex-grow属性都为1，则它们将等分剩余空间（如果有的话）。如果一个项目的flex-grow属性为2，其他项目都为1，则前者占据的剩余空间将比其他项多一倍。

```css
.item {
  flex-grow: <number>; /* 缺省 0 */
}
```

演示：

![flex-grow](https://user-gold-cdn.xitu.io/2018/4/2/1628695cd4e13d3f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### flex-shrink

flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小，负值无效。

```css
.item {
  flex-shrink: <number>; /* 缺省 1 */
}
```

如果所有项目的flex-shrink属性都为1，当空间不足时，都将等比例缩小。如果一个项目的flex-shrink属性为0，其他项目都为1，则空间不足时，前者不缩小。

演示：
![flex-shrink](https://user-gold-cdn.xitu.io/2018/4/2/1628695ce473e24c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### flex-basis

flex-basis属性定义项目在分配额外空间之前的缺省尺寸。属性值可以是长度（20%，10rem等）或者关键字auto。它的默认值为auto，即项目的本来大小。

```css
.item {
  flex-basis: <length> | content | auto; /* 缺省 auto */
}
```

取值：

+ <'width'>：width 值可以是 `{{cssxref("<length>")}};` 该值也可以是一个相对于其父弹性盒容器主轴尺寸的`{{cssxref("<percentage>", "百分数")}}` 。负值是不被允许的。默认为 0。
+ content：基于 flex 的元素的内容自动调整大小。
+ 还有几个width宽度的取值也可以用fill,max-content,min-content,fit-content.

演示：

![flex-shrink](https://user-gold-cdn.xitu.io/2018/4/2/1628695cee00902d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### flex

flex属性是flex-grow, flex-shrink 和flex-basis的简写，默认值为initial(0 1 auto)。后两个是可选属性。

```css
.item {
  flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
}
```

该属性有两个快捷值：auto (1 1 auto) 和 none (0 0 auto)。

+ initial：元素会根据自身宽高设置尺寸。它会缩短自身以适应 flex 容器，但不会伸长并吸收 flex 容器中的额外自由空间来适应 flex 容器 。相当于将属性设置为"flex: 0 1 auto"。
+ auto：元素会根据自身的宽度与高度来确定尺寸，但是会伸长并吸收 flex 容器中额外的自由空间，也会缩短自身来适应 flex 容器。这相当于将属性设置为 "flex: 1 1 auto".
+ none：元素会根据自身宽高来设置尺寸。它是完全非弹性的：既不会缩短，也不会伸长来适应 flex 容器。相当于将属性设置为"flex: 0 0 auto"。

一般推荐使用这种简写的方式，而不是分别定义每一个属性。

### align-self

align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。

```css
.item {
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

除了auto值以外，align-self属性与容器的align-items属性基本一致。

演示：

![flex-shrink](https://user-gold-cdn.xitu.io/2018/4/2/1628695cf0a7bb39?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### justify-self

本以为有可以覆盖align-items属性的align-self，应该也有可以覆盖justify-content的justify-self，可惜没有。。

## Flex上下文中的自动(auto)margin

>参考自[探秘 flex 上下文中神奇的自动 margin](https://juejin.im/post/5ce60afde51d455ca04361b1)

### 如何让 margin: auto 在垂直方向上居中元素

在传统的`display: block`中，当给块级元素中子元素设置了`margin: auto`，只会让其在水平方向居中

#### BFC 下 margin: auto 垂直方向无法居中元素的原因

>If both 'margin-left' and 'margin-right' are 'auto', their used values are equal. This horizontally centers the element with respect to the edges of the containing block.[—CSS2 Visual formatting model details: 10.3.3](https://www.w3.org/TR/CSS2/visudet.html#Computing_heights_and_margins)
>
>If 'margin-top', or 'margin-bottom' are 'auto', their used value is 0.—CSS2 Visual formatting model details: 10.6.3

在块格式化上下文中，如果 margin-left 和 margin-right 都是 auto，则它们的表达值相等，这将使元素相对于包含块的边缘水平居中。( 这里的计算值为元素剩余可用剩余空间的一半)
而如果 margin-top 和 margin-bottom 都是 auto，则他们的值都为 0，当然也就无法造成垂直方向上的居中。

#### 使用 FFC/GFC 使 margin: auto 在垂直方向上居中元素

为了使单个元素使用 `margin: auto` 在垂直方向上能够居中元素，需要让该元素处于 `FFC`，或者 `GFC` 上下文中。

为何FFC 下 margin: auto 垂直方向可以居中元素？

> Prior to alignment via justify-content and align-self, any positive free space is distributed to auto margins in >that dimension. -[CSS Flexible Box Layout Module Level 1 -- 8.1. Aligning with auto margins](https://www.w3.org/TR/2018/CR-css-flexbox-1-20181119/#auto-margins)

是在 flex 格式化上下文中，设置了 margin: auto 的元素，在通过 justify-content 和 align-self 进行对齐之前，任何正处于空闲的空间都会分配到该方向的自动 margin 中去，因此不止水平方向，垂直方向也会自动去分配剩余空间。

### 使用自动 margin 实现 flex 布局下的 space-between | space-around

实现space-around关键点就是对flex子元素设置`margin: auto`

实现space-between关键点是对flex子元素设置`margin: auto`，然后第一个子元素`margin-left: 0`，最后一个子元素`margin-right: 0`

### 使用自动 margin 实现 flex 下的 align-self: flex-start | flex-end | center

实现`align-self: center`关键点就是对flex子元素设置`margin: auto`，而实现`align-self: flex-start | flex-end`关键点则是分别设置`margin-bottom: auto;margin-top: 0;`和`margin-bottom: 0;margin-top: auto;`。

### 不同方向上的自动 margin

#### 使用 margin-left: auto 实现不规则两端对齐布局

假设我们需要有如下布局：

![不规则两端对齐](https://user-gold-cdn.xitu.io/2019/5/23/16ae29a9ba7b094a?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

DOM 结构如下：

```html
<ul class="g-nav">
  <li>导航A</li>
  <li>导航B</li>
  <li>导航C</li>
  <li>导航D</li>
  <li class="g-login">登陆</li>
</ul>
```

只需要对最后一个元素使用 `margin-left: auto`，可以很容易实现这个布局：

```css
.g-nav {
  display: flex;
}
.g-login {
  margin-left: auto;
}
```

当然，不一定是要运用在第一个或者最后一个元素之上

#### 垂直方向上的多行居中

会有这样的需求，一大段复杂的布局中的某一块，高度或者宽度不固定，需要相对于它所在的剩余空间居中：

![垂直方向上的多行居中](https://user-gold-cdn.xitu.io/2019/5/23/16ae29a9bafac980?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这里有 5 行文案，我们需要其中的第三、第四行相对于剩余空间进行垂直居中。只需要在需要垂直居中的第一个元素上进行 `margin-top: auto`，最后一个元素上进行 `margin-bottom: auto` 即可。当然，这里将任意需要垂直居中剩余空间的元素用一个 `div` 包裹起来，对该 div 进行 `margin: auto 0` 也是可以的。

#### 使用 margin-top: auto 实现粘性 footer 布局

要求：页面存在一个 footer 页脚部分，如果整个页面的内容高度小于视窗的高度，则 footer 固定在视窗底部，如果整个页面的内容高度大于视窗的高度，则 footer 正常流排布（也就是需要滚动到底部才能看到 footer），算是粘性布局的一种。

![使用 margin-top: auto 实现粘性 footer 布局](https://user-gold-cdn.xitu.io/2019/5/23/16ae29a9c4276f0d?imageslim)

这个需求如果能够使用 `flex` 的话，使用 `justify-content: space-between` 可以很好的解决，同理使用 `margin-top: auto` 也非常容易完成

### 注意的点

+ 块格式化上下文中 `margin-top` 和 `margin-bottom` 的值如果是 `auto`，则他们的值都为 `0`
+ flex 格式化上下文中，在通过 `justify-content` 和 `align-self` 进行对齐之前，任何正处于空闲的空间都会分配到该方向的自动 `margin` 中去
+ 单个方向上的自动 `margin` 也非常有用，它的计算值为该方向上的剩余空间
+ 使用了自动 `margin` 的 `flex` 子项目，它们父元素设置的 `justify-content` 以及它们本身的 `align-self` 将不再生效

## 应用

### 移动端实现顶部吸顶，底部吸底，中间自适应

```html
<style>
.wrapper{
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.content{
  flex: 1;
  /* margin: auto 0; */
  overflow-y: auto;
}
</style>
<div class="wrapper">
  <header>这里是头部</header>
  <div class="content">这里是内容</div>
  <footer>这里是底部</footer>
</div>
```
