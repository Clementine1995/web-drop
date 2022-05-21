# CSS shapes

> 文章参考自[CSS Shapes 101](http://www.w3cplus.com/css3/css-shapes-101.html)
>
> 文章参考自[shapes 创建炫酷的内容流](https://juejin.im/post/5aaf9bf2f265da239f072eb6)

## CSS shapes 介绍

div 套 div，这是我们网页布局一直使用的一种方式。通过使用 CSS，我们一直试图摆脱这种创建几何形状的限制，但这些形状没有影响形状内的内容，或者与页面其他元素相互影响。由 Adobe 在 2012 年中期提出的新的 CSS shapes 规范 改变了这一现状。它的目标是为 web 设计人员提供一种新的方式，来使内容流入或者环绕在任意复杂的形状上著作权归作者所有。简单来说，它赋予了我们一种更为自由的图文混排的能力。

## shape-outside

这个属性定义了一个行内内容应该包裹的形状，默认值是 margin-box

### 关键字值

1. margin-box // 形状包含元素的 margin 值 content + margin
2. padding-box // 形状包含 padding 值 content + padding
3. content-box // 形状就是元素本身的值 content
4. border-box // 形状包含元素的 border 值 content + border
5. none // 不设置

### 函数值

形状可以通过以下的函数来创建:

1. circle()
2. ellipse()
3. inset()
4. polygon()

每一个形状是都是由一组点定义的。有些函数把点作为参数,另外一些则采用偏移量--最终他们都会在元素上绘制一个由一组点组成的形状。形状也可以经由从图像中提取的 alpha 通道来定位。当一个图像传递给形状属性时,浏览器将基于`shape-image-threshold`属性来提取图像的形状。图像必须是 CORS 兼容的。如果提供的图片因任何理由不能显示 (例如图片不存在),元素不会被应用任何的形状。

以下的形状属性,接受上面的函数做为值:

- shape-outside:在一个形状(外)包裹内容
- shape-inside:在一个形状内包裹内容

可以使用`shape-outside`属性结合`shape-margin`属性添加一个带有边距的形状,从而将内容推离形状，以便在形状和内容之间创造更多的空间。同样我们也可以把`shape-inside`跟`shape-padding`属性相配合,来增加文字跟形状的距离。

可以简单的添加一行 CSS，来使用形状属性和函数来声明一个元素上的形状:

```css
.element {
  shape-outside: circle(

  ); /* content will flow around the circle defined on the element */
}
```

如果你把这条 CSS 应用到元素上,形状不会应用到元素上,除非满足两个条件:

- 元素必须是浮动状态的。下一级别的 css shapes 可能会允许我们在未浮动元素上定义形状，但不是现在。
- 元素必须包含维度。给元素设置好高度和宽度即可给元素建立一个维度坐标系。

#### circle()

语法：`circle() = circle( [<shape-radius>]? [at <position>]? )`

问号表示，这些参数是可选的，可以省略。默认 radius 为元素的宽度的一半，x 和 y 的坐标是 50%，也就是元素的中间，x 和 y 可以是百分比也可以是具体数值。也就是说将默认为一个圆心在元素中心的的圆。通过更改 x 和 y 的左标,可以更改圆心的位置，但是并不更改元素的实际大小。

你可以使用任何单位指定圆的半径长度 (px,em,pt 等)。还可以使用 closest-side 或 furthest-side 来指定半径，默认为 closest-side，这意味着浏览器将使用从元素的中心到距离最近的边缘的长度作为半径。farthest-side 使用从中心到最远的边缘的长度作为半径。

```css
shape-outside: circle(
  farthest-side at 25% 25%
); /* defines a circle whose radius is half the length of the longest side, positioned at the point of coordinates 25% 25% on the element’s coordinate system*/
shape-inside: circle(
  250px at 500px 300px
); /* defines a circle whose center is positioned at 500px horizontally and 300px vertically, with a radius of 250px */
```

效果图来自 w3cplus：

![效果图1](http://www.w3cplus.com/sites/default/files/styles/print_image/public/blogs/2014/1405/shape-7.jpg)

#### ellipse()

语法：`ellipse() = ellipse( [<shape-radius>{2}]? [at <position>]? )`

用来创建一个椭圆形区域，第一个是水平方向半径，第二个是垂直方向半径，函数类似 circle()函数，具有相同的参数列表。如果只是设置 ellipse()，水平、垂直方向半径均为元素的一半，x、y 也都是 50%，也就是元素中心上自己大小的正圆，如果元素不是正方形，两个半径就各是元素宽高的一半，水平对应宽而垂直对应高。

#### inset()

语法：`inset() = inset( offset{1,4} [round <border-radius>]? )`

inset()函数接受一个到四个偏移值,指定相对于参考盒的偏移量。定义矩形的位置与 margin 和 padding 一样都是`top right bottom left`，如`inset(25px 53px 50px 30px)`，一个数值的时候可以理解为所有方向的缩放， 如`inset(10%)`，设置矩形的 border-radius，使用 round 关键字 如 inset(10% round 50%)，也可以分开来设置每个方向的圆角，这和 border-radius 的语法一致， 如 inset(10% round 50px 20px 40px 0)。

#### polygon()

语法：`polygon(<position>{3,n})`

定义多边形，语法为 polygon(x1 y1, x2 y2, x3 y3),设置多个点的坐标来定义多边形，坐标可以是具体数值和百分比，并且开始与结束必须是一个闭合的路径。很多情况下形状会跟 clip-path 一起使用。多边形 polygon()函数也接受一个可选的关键词作为参数,可以是 nonzero 或 evenodd。这指定当多边形内部出现相交时，如何确认是否为多边形的内部区域。

### url 值

还可以使用透明的 PNG 图片创建形状，语法如下

```css
shape-outside: url(bg.png); // 背景图
shape-image-threshold: 0.5; // 用来设置不透明度  [0,1] 1为不透明 0为完全透明
```

我们将用下面的图像定义一个形状，并用文字包裹起来:

![CSS Shapes 101](http://www.w3cplus.com/sites/default/files/styles/print_image/public/blogs/2014/1405/shape-11.jpg)

使用 shape-outside 的 url()值来指向这张图片,我们可以用这个属性来让内容围成树叶的形状。

```css
.leaf-shaped-element {
  float: left;
  width: 400px;
  height: 400px;
  shape-outside: url(leaf.png);
  shape-margin: 15px;
  shape-image-threshold: 0.5;
  background: #009966 url(path/to/background-image.jpg);
  mask-image: url(leaf.png);
}
```

当然,如果你要把叶子形状作为元素背景,那图像中形状之外的需要被裁减掉。你可以使用 mask-image 属性(用适当的前缀)做到这一点,因为 clip-path 属性并不能接收一个 alpha 图片作为值。结果如下所示:

![CSS Shapes 101](http://www.w3cplus.com/sites/default/files/styles/print_image/public/blogs/2014/1405/shape-12.jpg)

## shape-margin

shape-margin，它是用来给浮动区域添加空白区域，可以使用 px、rem、em 等单位。
