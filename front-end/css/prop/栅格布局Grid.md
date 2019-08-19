# 栅格布局

>参考自[CSS Grid 系列(上)-Grid布局完整指南](https://segmentfault.com/a/1190000012889793?utm_source=tag-newest)
>
>参考自[未来布局之星Grid](https://juejin.im/post/59c722b35188257a125d7960#heading-18)
>
>参考自[Grid 布局发车啦](https://juejin.im/post/5a96d3795188257a5a4ce688)
>
>参考自[写给自己看的display: grid布局教程](https://www.zhangxinxu.com/wordpress/2018/11/display-grid-css-css3/)

CSS 网格布局(Grid Layout) 是CSS中最强大的布局系统。 这是一个二维系统，这意味着它可以同时处理列和行，不像 flexbox 那样主要是一维系统。

## 兼容性

![grid](https://user-gold-cdn.xitu.io/2018/3/1/161dd2b405a18880?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

看了看浏览器的兼容性就知道，如今主流浏览器都已经支持了 Grid 布局

## 基本概念

+ Container: 网格容器，当我们设置 display: grid; 就将一个容器变成了网格容器，网格容器为其内容建立新的网格格式化上下文，是内部网格项的边界。
+ Item: 网格项，在我们设置的网格容器中的每一个子元素（直接子元素）都是网格项。
+ Line: 水平垂直分割线，构建出网格轨道、网格单元格和网格区域。就像经纬，分割出南北半球、东西半球，热带、南北温带、南北寒带。网格线是有数字索引的，也可以自己取名字。![Grid Line](https://segmentfault.com/img/remote/1460000012889800?w=383&h=219)
+ Track: 网格轨道，两条相邻的网格线之间的空间，也就是网格的行或列。![Grid Track](https://segmentfault.com/img/remote/1460000012889801?w=383&h=219)
+ Cell: 网格单元，两个相邻的行和列之间的区域，是可以放置内容的最小区块。比如用横纵三条网格线划分了页面，那么单元格就是九宫格中的一块。![Grid Cell](https://segmentfault.com/img/remote/1460000012889802?w=383&h=219)
+ Area: 网格区域，四条网格线包围起来的区域。![Grid Area](https://segmentfault.com/img/remote/1460000012889803?w=383&h=219)

## 属性列表

### Grid Container 的全部属性

+ display
+ grid-template-columns
+ grid-template-rows
+ grid-template-areas
+ grid-template
+ grid-column-gap
+ grid-row-gap
+ grid-gap
+ justify-items
+ align-items
+ place-items
+ justify-content
+ align-content
+ place-content
+ grid-auto-columns
+ grid-auto-rows
+ grid-auto-flow
+ grid

### Grid Items 的全部属性

+ grid-column-start
+ grid-column-end
+ grid-row-start
+ grid-row-end
+ grid-column
+ grid-row
+ grid-area
+ justify-self
+ align-self
+ place-self

## grid-container

### display

将元素定义为 grid contaienr，并为其内容建立新的网格格式化上下文(grid formatting context)。
值：

+ grid - 生成一个块级(block-level)网格
+ inline-grid - 生成一个行级(inline-level)网格
+ subgrid - 如果你的 grid container 本身就是一个 grid item（即,嵌套网格），你可以使用这个属性来表示你想从它的父节点获取它的行/列的大小，而不是指定它自己的大小。

```css
.container {
  display: grid | inline-grid | subgrid;
}
```

注意：

+ 在Grid布局中，float，display:inline-block，display:table-cell，vertical-align以及column-*这些属性和声明对grid子项是没有任何作用的。这个可以说是Grid布局中的常识，面试经常会问的，一定要记得。
+ IE10-IE15虽然名义上支持Grid布局，但支持的是老版本语法（本文是介绍的全是2.0全新语法），还需要加-ms-私有前缀

### grid-template-columns | grid-template-rows

语法：

```css
grid-template-columns: <track-size> ... | <line-name> <track-size> ...;
grid-template-rows: <track-size> ... | <line-name> <track-size> ...;
```

有很多中形式，常见的是这么几种：

```css
grid-template-columns: 100px 1fr;
grid-template-columns: [linename] 100px;    // 定义网格线名字
grid-template-columns: [linename1] 100px [linename2 linename3]; // 一条网格线多个名字
grid-template-columns: minmax(100px, 1fr);  // 最小100px, 最大满屏
grid-template-columns: fit-content(40%);    // 指定最大值不超过屏宽40%
grid-template-columns: repeat(3, 200px);    // 三列200px
```

```css
// 给网格线指定名字
.box {
  grid-template-columns: [first] 40px [line2] 50px [line3] auto [col4-start] 50px [five] 40px [end];
  grid-template-rows: [row1-start] 25% [row1-end] 100px [third-line] auto [last-line];
}
```

![yanshi](https://user-gold-cdn.xitu.io/2017/9/24/c941f114fd42f8f81d3023300944d7e9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

#### fr 单位以及 repeat

上面我们通过一些基础的属性，现在讲一下在 grid 中的一个单位值 — fr。那么这个 fr，代表的是什么意思呢？在 flex 中也有类似的属性，fr 的意思就是在自由空间进行分配的一个单位，那么是什么意思呢？
比如说，容器宽度为 1000px，现在假如 grid-template-columns: 200px 1fr 1fr 2fr。那么这就表示分了 4 列，第一列为 200px，然后剩下的 800px 就是自由空间了，经过计算可以得出 1fr 为 200px，这就是 fr 的意义。
那么，我们上面的例子其实可以这样写 grid-template-columns: 1fr 1fr 1fr;。但是现在又出现了一个问题，这个 1fr 写的好烦，能不能就写一个。
好消息，是有的，我们可以使用 repeat 来简写，于是上面的例子又可以改成 `grid-template-columns: repeat(3, 1fr)`。

### grid-template-areas

通过引用 `grid-area`属性指定的网格区域的名称来定义网格模板。 重复网格区域的名称导致内容扩展到这些单元格。 点号表示一个空单元格。 语法本身提供了网格结构的可视化。

值：

+ `<grid-area-name>` - 使用 grid-area 属性设置的网格区域的名称
+ . - 点号代表一个空网格单元
+ none - 没有定义网格区域

举例：

```css
.item-a {
  grid-area: header;
}
.item-b {
  grid-area: main;
}
.item-c {
  grid-area: sidebar;
}
.item-d {
  grid-area: footer;
}

.container {
  grid-template-columns: 50px 50px 50px 50px;
  grid-template-rows: auto;
  grid-template-areas:
    "header header header header"
    "main main . sidebar"
    "footer footer footer footer";
}
```

这将创建一个四列宽三行高的网格。 整个第一行将由 header 区域组成。 中间一行将由两个 main 区域、一个空单元格和一个 sidebar 区域组成。 最后一行是footer区域组成。

![image](https://segmentfault.com/img/remote/1460000012889806?w=427&h=330)

由于grid-template不会重置一些隐式的grid属性（如grid-auto-columns，grid-auto-rows和grid-auto-flow），因此，大多数时候，还是推荐使用grid代替grid-template。

### grid-gap

是grid-row-gap、grid-column-gap两个属性的缩写，定义网格之间的间距（不包括grid-item到容器边缘的间距）。如果没有指定 grid-row-gap，则会被设置为与 grid-column-gap 相同的值。

举例：

```css
.container {
  grid-template-columns: 100px 50px 100px;
  grid-template-rows: 80px auto 80px;
  grid-column-gap: 10px;
  grid-row-gap: 15px;
  /* grid-gap: 10px 15px; */
}
```

![image](https://segmentfault.com/img/remote/1460000012889807?w=322&h=273)

### justify-items

沿着行轴对齐网格内的内容（与之对应的是 align-items, 即沿着列轴对齐），该值适用于容器内的所有的 grid items。类似于flex-container的justify-content，只不过没有space-around和space-between。

语法：`justify-items: start | end | center | stretch(默认)`;

+ start: 内容与网格区域的左端对齐
+ end: 内容与网格区域的右端对齐
+ center: 内容位于网格区域的中间位置
+ stretch: 内容宽度占据整个网格区域空间(这是默认值)

```css
.container {
  justify-items: start;
}
```

![image](https://segmentfault.com/img/remote/1460000012889808?w=312&h=125)

```css
.container {
  justify-items: start;
}
```

![image](https://segmentfault.com/img/remote/1460000012889809?w=312&h=125)

```css
.container {
  justify-items: center;
}
```

![image](https://segmentfault.com/img/remote/1460000012889810?w=312&h=125)

```css
.container {
  justify-items: stretch;
}
```

![image](https://segmentfault.com/img/remote/1460000012889811?w=312&h=125)

也可以通过给单个 grid item 设置justify-self属性来达到上述效果。

### align-items

定义网格子项的内容垂直方向上的对齐方式，类似于flex-container的align-items,该值适用于容器内的所有 grid items。

语法：`align-items: start | end | center | stretch(默认)`;

+ start: 内容与网格区域的顶端对齐
+ end: 内容与网格区域的底部对齐
+ center: 内容位于网格区域的垂直中心位置
+ stretch: 内容高度占据整个网格区域空间(这是默认值)

```css
.container {
  justify-items: start;
}
```

![image](https://segmentfault.com/img/remote/1460000012889812?w=312&h=125)

```css
.container {
  align-items: end;
}
```

![image](https://segmentfault.com/img/remote/1460000012889813?w=312&h=125)

```css
.container {
  align-items: center;
}
```

![image](https://segmentfault.com/img/remote/1460000012889814?w=312&h=125)

```css
.container {
  align-items: stretch;
}
```

![image](https://segmentfault.com/img/remote/1460000012889815?w=312&h=125)

也可以通过给单个 grid item 设置align-self属性来达到上述效果。

### place-items

place-items可以让align-items和justify-items属性写在单个声明中。语法如下：

```css
.container {
    place-items: <align-items> / <justify-items>;
}
```

如果有兼容性顾虑，建议还是分开书写。

### justify-content

网格的总大小可能小于其网格容器的大小。如果你的所有 grid items 都使用像px这样的非弹性单位来设置大小，则可能发生这种情况。此时，你可以设置网格容器内的网格的对齐方式。此属性仅在网格总宽度小于grid容器宽度时候有效果。

语法：`justify-content: start | end | center | stretch | space-around | space-between | space-evenly;`

+ start - 网格与网格容器的左边对齐
+ end - 网格与网格容器的右边对齐
+ center - 网格与网格容器的中间对齐
+ stretch - 调整 grid item 的大小，让宽度填充整个网格容器
+ space-around - 在 grid item 之间设置均等宽度的空白间隙，其外边缘间隙大小为中间空白间隙宽度的一半
+ space-between - 在 grid item 之间设置均等宽度空白间隙，其外边缘无间隙
+ space-evenly - 在每个 grid item 之间设置均等宽度的空白间隙，包括外边缘

```css
.container {
  justify-content: start;
}
```

![image](https://segmentfault.com/img/remote/1460000012889816?w=387&h=187)

```css
.container {
  justify-content: end;
}
```

![image](https://segmentfault.com/img/remote/1460000012889817?w=387&h=187)

```css
.container {
  justify-content: center;
}
```

![image](https://segmentfault.com/img/remote/1460000012889818?w=387&h=187)

```css
.container {
  justify-content: stretch;
}
```

![image](https://segmentfault.com/img/remote/1460000012889819?w=387&h=187)

```css
.container {
  justify-content: space-around;  
}
```

![image](https://segmentfault.com/img/remote/1460000012889820?w=387&h=187)

```css
.container {
  justify-content: space-between;
}
```

![image](https://segmentfault.com/img/remote/1460000012889821?w=387&h=187)

```css
.container {
  justify-content: space-evenly;  
}
```

![image](https://segmentfault.com/img/remote/1460000012889822?w=387&h=187)

### align-content

网格的总大小可能小于其网格容器的大小。如果你的所有 grid items 都使用像px这样的非弹性单位来设置大小，则可能发生这种情况。此时，你可以设置网格容器内的网格的对齐方式。此属性沿着列轴对齐网格，并且属性值与justify-content相同

align-content: start | end | center | stretch | space-around | space-between | space-evenly;
效果类似不再展示

### place-content

place-content可以让align-content和justify-content属性写在一个CSS声明中，也就是俗称的缩写。语法如下：

```css
.container {
    place-items: <align-content> / <justify-content>;
}
```

如果有兼容性顾虑，建议还是分开书写。

### grid-auto-columns / grid-auto-rows

指定自动生成的网格轨道（又名隐式网格轨道）的大小。 隐式网格轨道在你显式的定位超出指定网格范围的行或列（使用 grid-template-rows/grid-template-columns）时被创建。

语法：

```css
grid-auto-columns: <track-size> ...;
grid-auto-rows: <track-size> ...;
```

`<track-size>` - 可以是一个长度值，一个百分比值，或者一个自由空间的一部分（使用 fr 单位）

为了说明如何创建隐式网格轨道，思考如下代码：

```css
.container {
  grid-template-columns: 60px 60px;
  grid-template-rows: 90px 90px
}
```

![image](https://segmentfault.com/img/remote/1460000012889830?w=188&h=229)

这里创建了一个 2x2的网格。

但是，现在想象一下，使用 grid-column 和 grid-row 来定位你的网格项目，如下所示：

```css
.item-a {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}
.item-b {
  grid-column: 5 / 6;
  grid-row: 2 / 3;
}
```

![image](https://segmentfault.com/img/remote/1460000012889831?w=320&h=229)

这里我们指定 .item-b开始于列网格线 5 并结束于在列网格线 6，但我们并未定义列网格线 5 或 6。因为我们引用不存在的网格线，宽度为0的隐式轨道的就会被创建用与填补间隙。我们可以使用 grid-auto-columns 和 grid-auto-rows属性来指定这些隐式轨道的宽度：

```css
.container {
  grid-auto-columns: 60px;
}
```

![image](https://segmentfault.com/img/remote/1460000012889832?w=401&h=229)

### grid-auto-flow

如果你存在没有显示指明放置在网格上的 grid item，则自动放置算法会自动放置这些项目。 而该属性则用于控制自动布局算法的工作方式。

语法： `grid-auto-flow: row | column | row dense | column dense`

+ row - 告诉自动布局算法依次填充每行，根据需要添加新行
+ column - 告诉自动布局算法依次填充每列，根据需要添加新列
+ dense - 告诉自动布局算法，如果后面出现较小的 grid item，则尝试在网格中填充空洞

**需要注意的是，dense 可能导致您的 grid item 乱序**。

举例， 考虑如下 HTML：

```html
<section class="container">
  <div class="item-a">item-a</div>
  <div class="item-b">item-b</div>
  <div class="item-c">item-c</div>
  <div class="item-d">item-d</div>
  <div class="item-e">item-e</div>
</section>
```

你定义一个有5列和2行的网格，并将 grid-auto-flow 设置为 row（这也是默认值）：

```css
.container {
  display: grid;
  grid-template-columns: 60px 60px 60px 60px 60px;
  grid-template-rows: 30px 30px;
  grid-auto-flow: row;
}
```

当把 grid item 放在网格上时，你只把其中两个设置了固定的位置：

```css
.item-a {
  grid-column: 1;
  grid-row: 1 / 3;
}
.item-e {
  grid-column: 5;
  grid-row: 1 / 3;
}
```

因为我们将 grid-auto-flow 设置为row，所以我们的grid就像这样。 注意观察我们没有做设置的三个项目（item-b，item-c和item-d）是如何在剩余的行水平摆放位置的：

![image](https://segmentfault.com/img/remote/1460000012889833?w=371&h=77)

如果我们将 grid-auto-flow 设置为 column，则 item-b，item-c 和 item-d 以列的顺序上下摆放：

```css
.container {
  display: grid;
  grid-template-columns: 60px 60px 60px 60px 60px;
  grid-template-rows: 30px 30px;
  grid-auto-flow: column;
}
```

![image](https://segmentfault.com/img/remote/1460000012889834?w=371&h=77)

### grid

在单个属性中设置所有以下属性的简写：grid-template-rows，grid-template-columns，grid-template-areas，grid-auto-rows，grid-auto-columns和grid-auto-flow。 它同时也将 sets grid-column-gap 和 grid-row-gap 设置为它们的初始值，即使它们不能被此属性显示设置。

语法：`grid: none | <grid-template-rows> / <grid-template-columns> | <grid-auto-flow> [<grid-auto-rows> [/ <grid-auto-columns>]]`;

## Grid-item

### grid-column-start | grid-column-end | grid-row-start | grid-row-end

使用特定的网格线确定 grid item 在网格内的位置。grid-column-start/grid-row-start 属性表示grid item的网格线的起始位置，grid-column-end/grid-row-end属性表示网格项的网格线的终止位置。

取值：

+ `<line>`: 可以是一个数字来指代相应编号的网格线，也可使用名称指代相应命名的网格线
+ span `<number>`: 网格项将跨越指定数量的网格轨道
+ span `<name>`: 网格项将跨越一些轨道，直到碰到指定命名的网格线
+ auto: 自动布局， 或者自动跨越， 或者跨越一个默认的轨道

举例：

```css
.item-a {
  grid-column-start: 2;
  grid-column-end: five;
  grid-row-start: row1-start;
  grid-row-end: 3;
}
```

![image](https://segmentfault.com/img/remote/1460000012889835?w=514&h=365)

```css
.item-b {
  grid-column-start: 1;
  grid-column-end: span col4-start;
  grid-row-start: 2;
  grid-row-end: span 2;
}
```

![image](https://segmentfault.com/img/remote/1460000012889836?w=514&h=365)

如果没有声明 grid-column-end / grid-row-end，默认情况下，该网格项将跨越1个轨道。
网格项可以相互重叠。 您可以使用z-index来控制它们的堆叠顺序。

如果希望某些元素占满整行，而不会受屏幕影响，可以写成grid-column: 1 / -1;

### grid-column / grid-row

grid-column-start + grid-column-end, 和 grid-row-start + grid-row-end 的简写形式。每个值的用法都和属性分开写时的用法一样

```css
grid-column: <start-line> / <end-line> | <start-line> / span <value>;
grid-row: <start-line> / <end-line> | <start-line> / span <value>;
```

### grid-area

给 grid item 进行命名以便于使用 grid-template-areas 属性创建模板时来进行引用。另外也可以做为 grid-row-start + grid-column-start + grid-row-end + grid-column-end 的简写形式。

举例:

给一个网格项命名

```css
.item-d {
  grid-area: header;
}
```

作为 grid-row-start + grid-column-start + grid-row-end + grid-column-end 的简写:

```css
.item-d {
  grid-area: 1 / col4-start / last-line / 6;
}
```

![img](https://segmentfault.com/img/remote/1460000012889838?w=514&h=365)

### justify-self

沿着行轴对齐grid item 里的内容（与之对应的是 align-self, 即沿列轴对齐）。 此属性对单个网格项内的内容生效。

+ start - 将内容对齐到网格区域的左端
+ end - 将内容对齐到网格区域的右端
+ center - 将内容对齐到网格区域的中间
+ stretch - 填充网格区域的宽度 (这是默认值)

举例：

```css
.item-a {
  justify-self: start;
}
```

![img](https://segmentfault.com/img/remote/1460000012889839?w=312&h=125)

```css
.item-a {
  justify-self: end;
}
```

![img](https://segmentfault.com/img/remote/1460000012889840?w=312&h=125)

```css
.item-a {
  justify-self: center;
}
```

![img](https://segmentfault.com/img/remote/1460000012889841?w=312&h=125)

```css
.item-a {
  justify-self: stretch;
}
```

![img](https://segmentfault.com/img/remote/1460000012889842?w=312&h=125)

要为网格中的所有grid items 设置对齐方式，也可以通过 justify-items 属性在网格容器上设置此行为。

### align-self

沿着列轴对齐grid item 里的内容（与之对应的是 justify-self, 即沿行轴对齐）。 此属性对单个网格项内的内容生效。

+ start - 将内容对齐到网格区域的顶部
+ end - 将内容对齐到网格区域的底部
+ center - 将内容对齐到网格区域的中间
+ stretch - 填充网格区域的高度 (这是默认值)

要为网格中的所有grid items 统一设置对齐方式，也可以通过 align-items 属性在网格容器上设置此行为。
效果与justify-self类似，不再展示

### place-self

place-items可以让align-self和justify-self属性写在单个声明中。语法如下：

```css
.container {
  place-items: <align-self> / <justify-self>;
}
```

如果有兼容性顾虑，建议还是分开书写。

## repeat 进阶

在上面，我们说过一种 repeat 的简单用法，创建网格时重复指定的次数，但是有的时候我们并不想指定次数，而是希望自动填充，这时候怎么办呢？
这时候我们就要提到 `auto-fit` 和 `auto-fill` 了。
首先，我们通过 repeat 先把格子建出来：

```css
.container {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: 50px;
  grid-gap: 2px 4px;
}
```

这样我们就创建了一个基于 9 列的网格系统，如果我们的视窗不断变小，那么我们的每一格也会相应的变窄，我们不希望它变得非常窄，咋办呢？
Grid 有一个 `minmax()` 函数可以使用，这个函数接收两个参数，一个最小值，一个最大值，当浏览器窗口发生改变的时候，它能够保证该元素是在这个范围之内改变。比如说：

```css
.container{
  grid-template-columns: repeat(9, minmax(250px, 1fr));
}
```

当我们把 `grid-template-columns` 变成这样之后，每一列的宽度都会在 250px 到 1fr 之间，但是我们会发现，他装不下这些格子，但是它也没有换行，因为你告诉它有 9 列，于是出现了滚动条，但是你不希望出现这东西，咋办呢？
这时候就到了我们上面说的两个参数出场的时候到了。

```css
.container{
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
```

复制代码当我们加上这个参数过后，就会让浏览器去处理列宽和换行的问题，如果你给的容器宽度不够，它就会换行。
那么 fit 和 fill 有啥区别呢？我找了一些资料，里面有两句总结是这么说的：

+ auto-fill 倾向于容纳更多的列，所以如果在满足宽度限制的前提下还有空间能容纳新列，那么它会暗中创建一些列来填充当前行。即使创建出来的列没有任何内容，但实际上还是占据了行的空间。
+ auto-fit 倾向于使用最少列数占满当前行空间，浏览器先是和 auto-fill 一样，暗中创建一些列来填充多出来的行空间，然后坍缩（collapse）这些列以便腾出空间让其余列扩张。

做一个实验，当宽度足够大时，这两者区别就出来了：

```css
.container1{
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
}
.container2{
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
}
```

![image](https://user-gold-cdn.xitu.io/2018/3/1/161dd2c9470b4457?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这样可以看出区别了，fill 是尽可能多容纳列，它会自己造一些列来填充剩余空间，其实它是铺满了的，只是你看不见而已，而 fit 是扩张原有列来铺满这一行。
至于具体详细的解释，大家可以去这篇[译文](https://www.colabug.com/2395888.html)看一看，说得非常详细了。

## fit-content()

fit-content()相当于 min('max-content', max('auto', argument));
