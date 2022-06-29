# CSS Border 用法详解

> 文章参考自[CSS Border 用法详解](https://github.com/junruchen/junruchen.github.io/wiki/CSS-Border%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3)

## 内容

- 透明边框的实现
- 多层边框的几种实现方法
- border-radius 圆角的使用
- border-image 边框背景详解
- box-shadow 邻边投影、单侧投影、对边投影以及一些虚线边框等特殊元素的不规则阴影使用
- border-spacing 与 border-collapse

### 透明边框的实现

要求: 给内部盒子设置一个透明边框, 可以看到外层盒子的背景。

dom 结构:

```html
<div class="border-box">
  <div class="border-item">内部盒子区</div>
</div>
```

效果图:

![透明边框](https://camo.githubusercontent.com/5db3a01f9cef299c331a61fb33f6eab3a338d16d/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137326639303030316664323930323834303139322e706e67)

浏览器默认从边框外沿剪裁背景图, 所以为了使边框透明, 需将浏览器的剪裁范围缩小到内边距的外沿, 而 background-clip 属性正好可以实现此效果。

background-clip 属性的默认值为 border-box , 即浏览器默认剪裁背景到边框外边框, 可将它的值设为 padding-box , 这样浏览器就会从内边距的外沿来剪裁背景。

代码示例

```css
.border-box {
  backrgound-image: url(image.png);
}
.border-item {
  border: 15px solid rgba(255, 255, 255, 0.5);
  background: white;
  background-clip: padding-box;
}
```

### 多层边框的几种实现方法

以下效果均只使用一个元素实现。

常见的实现方法有两种, box-shadow 方案以及 outline 方案。

效果图:

![多层边框](https://camo.githubusercontent.com/bb661e17afd91ac70cac222906fbaa3c250339a9/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137343566303030313465666130353538303135322e706e67)

利用 `box-shadow` 实现多重边框, 不会影响布局, 不受 `box-sizing` 影响, 可通过内外边距来模拟边框所需占据的空间。

代码示例：

```css
border: 5px solid #fb3;
outline: 5px solid #58a;
box-shadow: 0 0 0 5px #58a, 0 0 0 5px #fb3;
```

注意: outline 描边绝大多数情况下都是矩形, 所以如果想实现带圆角的多重边框, 可以选择使用 box-shadow 。

圆角情况下 outline 描边效果图:

![outline描边](https://camo.githubusercontent.com/8e0d56debc4a7272f71c6e93daf4d1fe2247c741/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137353636303030316562396430323534303133342e706e67)

### border-radius 圆角的使用

#### 属性说明

IE9+、Firefox 4+、Chrome、Safari 5+ 以及 Opera 支持 border-radius 属性。

border-radius 是一个简写属性, 分别指定左上角[border-top-left-radius]、右上角[border-top-right-radius]、右下角[border-bottom-right-radius]、左下角[border-bottom-left-radius]的圆角半径。

border-radius 可以分别设置水平半径和垂直半径, 以 "/" 分隔, 水平和垂直半径都可以设置 1-4 个值,分别指定四个角的半径, 可以是具体的长度值也可以是百分比。 如: border-radius: 50% / 20%; 斜线"/"之前的表示四个角的水平半径均为 50%, 之后的表示四个角的垂直半径均为 20%。

不论是水平半径还是垂直半径都遵循以下规则:

- 如果只设置一个值，将用于全部的四个角;
- 如果设置两个值，第一个用于左上角、右下角，第二个用于右上角、左下角;
- 如果设置三个值，第一个用于左上角，第二个用于右上角和左下角，第三个用于右下角。[可以联想 margin]

#### 自适应椭圆的实现

这里需要使用百分比。

代码示例:

```css
border-radius: 50% /50%;
/* 或者 */
border-radius: 50%;
```

注意: **这里设置的百分比不论是单独指定水平半径、垂直半径还是统一指定, 均是根据百分比, 分别相对 border box 的宽度和高度进行计算。也就是说相同的百分比可能会计算出不同的水平和垂直半径。**

比如设置 border-radius: 50% , border box 的宽度高度分别是 200px 100px, 则根据 50%计算出的水平半径为 100px, 垂直半径为 50px。

效果图:

![椭圆](https://camo.githubusercontent.com/c5ad20ff304cb327ce70e6308c0281d41b7bd65d/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137373339303030316266376230323535303133392e706e67)

#### 50%和 100%的区别

通常我们都是用 CSS 的 border-radius 属性实现圆形：先画一个方形，然后将它的 border-radius 设置成 50%。但是将 border-radius 设置为 100%，也可以实现同样的效果，W3C 对于重合曲线有这样的规范：如果两个相邻角的半径和超过了对应的盒子的边的长度，那么浏览器要重新计算保证它们不会重合。它会导致浏览器进行不必要的计算，所以建议使用 50%，但是值为 50%与 100%在动画效果表上有所不同。

#### 自适应半椭圆以及自适应四分之一椭圆

效果图:

![半椭圆 1/4椭圆](https://camo.githubusercontent.com/fee2bdb2d714b929b2385789e4ae847166f459f6/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137373865303030313839636230353030303134312e706e67)

上图中半椭圆水平对称, 所以左上角和左下角的半径相等, 右上角和右下角的半径相等;

图中整个左侧是一条曲线且占据了整个宽度, 也就是说左上角和左下角的垂直半径之和等于整个形状的高度, 水平半径应该为整个形状的宽度; 而右侧没有任何圆角, 所以右上角的右下角的垂直半径之和也应该为整个形状的高度, 水平方向为 0。

观察上图中的四分之一椭圆, 很容易可以看出整个圆角都集中在左上角, 而其他三个角都没有圆角。

代码示例：

```css
/* 半椭圆  */
border-radius: 100% 0 0 100% / 50%;
/* 1/4椭圆 */
border-radius: 100% 0 0 0;
```

#### 其他形状多变的圆角效果图

![圆角效果图](https://camo.githubusercontent.com/a9e3feaa7705f28c5052517374905944289bf5d8/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137383732303030313833663630373331303039352e706e67)

代码示例

```css
1、 border-radius: 50% / 100%;
2、 border-radius: 10% / 50%;
3、 border-radius: 10% 50% / 100%;
4、 border-radius: 100% 10% 10% 10%;
5、 border-radius: 40% 40% 20% 20% / 100% 100% 50% 50%;
```

注意: **当任意两个相邻圆角的半径之和超过 border box 的尺寸时, 用户代理必须按比例减小各个边框所使用的值, 直到它们不会相互重叠为止。**拿上图中最后一个图形举例说明。

假设盒子的宽高分别为: 800px 400px, 按照 border-radius 设置的百分比半径, 分别计算:

左上角半径：320px 400px 右上角半径：320px 400px

左下角半径：160px 200px 右下角半径：160px 200px

很明显, 此时左上角和左下角的垂直半径之和[400px+200px]大于盒子的高度[400px], 同理右上角和右下角的垂直半径之和也大于盒子的高度。

根据上述理论, 用户代理必须按比例减小各个边框所使用的值, 直到它们不会相互重叠为止。当然按比例缩小这一步操作是由浏览器完成, 下面只是模拟浏览器绘制圆角边框的过程。

缩小后的半径为:

左上角半径：320px 267px 右上角半径：320px 133px

左下角半径：160px 133px 右下角半径：160px 267px

左上角和左下角根据新的半径, 画圆效果如下图所示:

![圆角1](https://camo.githubusercontent.com/a2bd5e77a6a1bb2e7b68965f090735689327b6b2/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137393932303030313665666430383030303533372e706e67)

最终效果图:

![圆角2](https://camo.githubusercontent.com/ac4381d82de58945041c32405893b03cb292d078/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137396230303030316161306530383030303533352e706e67)

### border-image 边框背景详解

> [MDN(border-image)](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-image)

border-image 属性可指定边框样式使用图像来填充, 图像可以是绝对或相对地址引入的图片, 也可以是渐变色。使用时, 需指定 border-style 指定边框样式。

IE11+、Firefox 3.5+、Chrome、Safari 以及 Opera 支持 border-image 属性。为支持低版本, 最好增加带有-moz-以及-webkit-前缀的写法。

border-image 为简写属性, 可分别设置以下 5 个属性的值: border-image-source、border-image-slice、border-image-width、border-image-outset、border-image-repeat。 属性间用"/"分隔。

#### 1、border-image-source

取值: none | image ; 当值为 none 时, 会自动使用 border-style 的值。

#### 2、border-image-slice 指定图片分隔的长度

取值: {1,4} [number | %] && fill ; 注意, 使用 number 时, 默认单位为像素, 所以不需要加上单位, 另外百分比是分别相对盒子的宽和高。

border-image-slice 属性指定从上，右，下，左方位来分隔图像，将图像分成 4 个角，4 条边和中间区域共 9 份，中间区域始终是透明的（即没图像填充），除非加上关键字 fill, 此时中间区域会覆盖背景。

![slice属性](https://camo.githubusercontent.com/5b7be3fdd73f09ec0fc14fc1932642eac131cdcc/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137623136303030313233663130373337303237352e706e67)

#### 3、border-image-width 指定边框背景的宽度

取值: {1,4} number | % | length | auto ; 注意, 这里的 number 是相对于 border-width 的倍数, 如 border-image-width: 1 ; 如果没有指定 border-image-width 的值, 则取 border-wdith 的值。

#### 4、border-image-outset 指定偏移距离

取值: {1,4} number | length ; number 是相对于 border-width 的倍数。

![outset属性](https://camo.githubusercontent.com/1fd34324275d10b83c4467be82569a65f329adf2/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137623330303030316330386630343835303137302e706e67)

#### 5、border-image-repeat 指定边框背景的平铺方式

取值: {1,2} 拉伸 stretch | 重复 repeat | 环绕 round ;

可 1-2 个值, 两个值表示水平[只对上下中起作用]和垂直方向[只对左右中起作用], 平铺可能会改变图片的大小, 而重复不会改变图片的大小。 四个角上的角边框图片是没有任何展示效果的, 不会平铺, 不会重复, 也不会拉伸。

效果图：

![repeat属性](https://camo.githubusercontent.com/4fc5c180e3a79e5b453b0599a3fc07d5e14efc68/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538383137623362303030316636343030353330303134362e706e67)

代码示例

```css
/* 第一个效果图代码: */
border-image: url("border-image.png");
border-image-slice: 60;
border-image-width: 20px;
border-image-outset: 10px;
border-image-repeat: repeat;

/* 第二个效果图代码: */
border-image: url("border-image.png") 60 / 20px / 10px round;
```

#### border-image 的应用实现一个带圆角渐变边框

> [巧妙实现带圆角的渐变边框](https://juejin.im/post/5e4a3a20e51d45270c277754)

### box-shadow 各种投影的实现

#### 属性简单介绍

box-shadow 有 6 个参数值：X 轴偏移量、Y 轴偏移量、模糊距离、扩展距离、颜色值以及 inset 设置为内阴影。

#### 邻边投影

最简单，如：

```css
box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.5);
```

效果图如下：

![box-shadow](https://camo.githubusercontent.com/5561598c661201b276fdfefd6e33919ac0916e5c/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d316230353938623865333532343866652e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f363030)

其中模糊距离以及扩展距离是指四个边都有变化，如模糊距离 2px，则四个方向上都会进行 2px 的扩展。利用这一特性，可实现单边阴影。

#### 单边投影

底边阴影代码示例：

```css
box-shadow: 0 8px 4px -4px rgba(0, 0, 0, 0.5);
//Y轴向下偏移8px，四周模糊4px，扩展-4px，正好抵消掉。
```

效果图：

![box-shadow1](https://camo.githubusercontent.com/317ef384620f040cd851a30b0117790a93f663ac/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d636565363030666432663638626432362e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f363030)

#### 对边投影

对边阴影实际上就是两个单边阴影

代码示例：

```css
box-shadow: 8px 0 4px -4px rgba(0, 0, 0, 0.5), -8px 0 4px -4px rgba(0, 0, 0, 0.5);
//Y轴向下偏移8px，四周模糊4px，扩展-4px，正好抵消掉。
```

效果图：

![box-shadow](https://camo.githubusercontent.com/679babd01ebcfa9d3364100f83a526c1b4d1655f/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d326430373233323838356633643465662e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f363030)

#### box-shadow 阴影的特殊情况－－不规则阴影

使用阴影时经常会遇到伪元素、虚线边框、折角背景等效果，当给这一类元素加上阴影时，往往得不到很好的效果。

使用 css3 filter 可以很好的解决这一问题。

看图[左边是使用 box-shadow 的效果，右边是使用 filter 的效果]：

![filter1](https://camo.githubusercontent.com/5cf34b88659d030b85349f2e2bdcb937166159c9/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d613931363132616139316536313632382e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f31323430)

![filter2](https://camo.githubusercontent.com/0c02608a9ef1dd79b7d969b45c329c38212a32e6/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d393265316332336433366165383331312e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f31323430)

![filter3](https://camo.githubusercontent.com/e3655b1d8d27c151f7ec81c759b64d54b28aaf43/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d636330373438336136616363313263322e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f31323430)

具体不详细讲解，看代码：

```css
/* 左边的阴影 */
box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.5);

/* 右边的阴影 */
filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
```

filter 的 drop-shadow 用法与 box-shadow 类似，四个属性分别是：x 轴 y 轴扩展半径和模糊距离以及颜色。

需要注意的是：box-shadow 兼容性稍微好一些，IE9+；而 filter 的兼容性差一点，IE13+，android4+

### border-spacing 与 border-collapse

border-collapse 是用来决定表格的边框是分开的还是合并的。在分隔模式下，相邻的单元格都拥有独立的边框。在合并模式下，相邻单元格共享边框。

语法：

```css
border-collapse: collapse;
border-collapse: separate;
```

border-spacing 属性指定相邻单元格边框之间的距离，该属性只适用于 border-collapse 值是 separate 的时候。

语法：

```css
/* horizontal <length> | vertical <length> 可以指定水平方向与垂直方向 */
border-spacing: 1cm 2em;
```
