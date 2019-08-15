# CSS揭秘学习

## 背景与边框

### 半透明边框

假设我们想给一个容器设置一层白色背景和一道半透明白色边框，body 的背景会从它的半透明边框透上来。我们最开始的尝试可能是这样的

```css
border: 10px solid hsla(0,0%,100%,.5);
background: white;
```

但是实际上，并没有出现半透明边框，造成这个现象的原因是，background默认是从border开始的，通过设置虚线border就可以发现这一点。

解决办法就是通过 background-clip 属性来调整上述默认行为所带来的不便。这个属性的初始值是 border-box，意味着背景会被元素的 border box（边框的外沿框）裁切掉。如果不希望背景侵入边框所在的范围，把它的值设为 padding-box，这样浏览器就会用内边距的外沿来把背景裁切掉。

### 多重边框

#### box-shadow 方案

利用 box-shadow 第四个参数（称作“扩张半径”），通过指定正值或负值，可以让投影面积加大或者减小。一个正值的扩张半径加上两个为零的偏移量以及为零的模糊值，得到的“投影”其实就像一道实线边框.

这并没有什么了不起的，因为你完全可以用 border 属性来生成完全一样的边框效果。不过 box-shadow 的好处在于，它支持**逗号分隔语法**，可以创建任意数量的投影。

唯一需要注意的是，box-shadow 是层层叠加的，第一层投影位于最顶层，依次类推。多重投影解决方案在绝大多数场合都可以很好地工作，但有一些注意事项。

+ 投影的行为跟边框不完全一致，因为它不会影响布局，而且也不会 受到 box-sizing 属性的影响。不过，你还是可以通过内边距或外边 距（这取决于投影是内嵌和还是外扩的）来额外模拟出边框所需要 占据的空间。
+ 上述方法所创建出的假“边框”出现在元素的外圈。它们并不会响 应鼠标事件，比如悬停或点击。如果这一点非常重要，你可以给 box-shadow 属性加上 inset 关键字，来使投影绘制在元素的内圈。 请注意，此时你需要增加额外的内边距来腾出足够的空隙。

#### outline 方案

在某些情况下，你可能只需要两层边框，那就可以先设置一层常规边框，再加上 outline（描边）属性来产生外层的边框。这种方法的一大优点在于边框样式十分灵活，不像上面的 box-shadow 方案只能模拟实线边框（假设我们需要产生虚线边框效果，box-shadow 就没辙了）。

描边的另一个好处在于，你可以通过 outline-offset 属性来控制它跟元素边缘之间的间距，这个属性甚至可以接受负值。对一层 dashed（虚线）描边使用 负的outline-offset 后，可以得到简单的缝边效果.

这个方案同样也有一些需要注意的地方。

+ 只适用于双层“边框”的场景，因为 outline 并不能 接受用逗号分隔的多个值。
+ 边框不一定会贴合 border-radius 属性产生的圆角，因此如果元素 是圆角的，它的描边可能还是直角
+ 描边可以不是矩形

### 灵活的背景定位

#### background-position 的扩展语法方案

background-position 属性已经得到扩展，它允许我们指定背景图片距离任 意角的偏移量，只要我们在偏移量前面指定关键字。举例来说，如果想让背 景图片跟右边缘保持 20px 的偏移量，同时跟底边保持 10px 的偏移量，可以 这样做（结果如图 2-11 所示）：

```css
background: url(code-pirate.svg) no-repeat #58a;
background-position: right 20px bottom 10px;
```

#### background-origin 方案

background-position 是以 padding box 为准的，这样边框才不会遮住背景图片。因此，top left 默认指的是 padding box 的左上角。不过，在背景与边框（第三版）中， 我们得到了一个新的属性 background-origin，可以用它来改变这种行为。 在默认情况下，它的值是padding-box。如果把它的值改成 content-box（参见下面的代码），我们在 background-position 属性中使用的边角关键字将会以内容区的边缘作为基准。

#### calc() 方案

### 边框内圆角

有时我们需要一个容器，只在内侧有圆角，而边框或描边的四个角在外部仍然保持直角的形状，如何只用一个元素达成同样的效果呢？

```css
background: tan;
border-radius: .8em;
padding: 1em;
box-shadow: 0 0 0 .6em #655;
outline: .6em solid #655;
```

描边并不会跟着元素的圆角走（因而显示出直角），但 box-shadow 却是会的。因此，如果我们把这两者叠加到一起，box-shadow 会刚好填补描边和容器圆角之间的空隙，这两者的组合达成了我们想要的效果。为了让这个效果得 以达成，扩张半径需要比描边的宽度值小，但它同时又要比(根2 - 1)r − 大。

### 条纹背景

在线性渐变里，如果把两个色标重合在一起，就会产生条纹的效果，再通过 background-size 来调整其尺寸，由于背景在默认情况下是重复平铺的，整个容器其实已经被填满了水平条纹。

```css
background: linear-gradient(#fb3 50%, #58a 50%);
background-size: 100% 30px;
```

为了避免每次改动条纹宽度时都要修改两个数字，我们可以再次从规范那里找到捷径。第二个色标的位置值设置为 0，那它的位置就总是会被浏览器调整为前一个色标的位置值。如果要创建超过两种颜色的条纹，也是很容易的。举例来说，下面的代 码可以生成三种颜色的水平条纹：

```css
background: linear-gradient(#fb3 33.3%,#58a 0, #58a 66.6%, yellowgreen 0);
background-size: 100% 45px;
```

如果想要垂直条纹，只需要将 `background-size` 改为 30px 100% ，并且渐变方向改为 to right，默认为to bottom。

斜向条纹，这里先以45deg的角度为例，如果想要指定条纹的宽度，则需要指定背景图size为 2x * 根2，x就是想要的宽度。

```css
background: linear-gradient(45deg, #fb3 25%, #58a 0, #58a 50%, #fb3 0, #fb3 75%, #58a 0);
background-size: 30px 30px;
```

如果想要实现更好的斜向条纹，比如60deg之类的，则需要使用 repeating-linear-gradient()

### 连续的图像边框

有时我们想把一幅图案或图片应用为边框，而不是背景。你可能会想到：border-image，但它的原理基本上就是九宫格伸缩法：把图片切割成九块，然后把它们应用到元素边框相应的边和角。而我们希望出现在拐角处的图片区域是随着元素宽高和边框厚度的变化而变化，用 border-image 是做不到的。

最简单的办法是使用两个 HTML 元素：一个元素用来把我们的图片设为背景，另一个元素用来存放内容，并设置纯白背景，然后覆盖在前者之上。

在引入了对 CSS 渐变和背景的扩展，使得我们只用一个元素就能达成完全一样的效果。主要的思路就是在石雕背景图片之上，再叠加一层纯白的实色背景。为了让下层的图片背景透过边框区域显示出来，我们需要给两层背景指定不同的 background-clip 值。还要注意的是，我们只能在多重背景的最底层设置背景色，因此需要用一道从白色过渡到白色的 CSS 渐变来模拟出纯白实色背景的效果。

同时还需要注意 background-origin 的默认值是 padding-box，因此，图片的显示尺寸不仅取决于 padding box 的尺寸，而且被放置在了 padding box 的原点（左上角）。我们看到的实际上就是背景图片以平铺的方式蔓延到 border box 区域的效果。为了修正这个问题，只需把 background-origin 也设置为 border-box 就可以了

```css
padding: 1em;
border: 1em solid transparent;
background: linear-gradient(white, white), url(stone-art.jpg);
background-size: cover;
background-clip: padding-box, border-box;
background-origin: border-box;
```

流动边框：

```css
@keyframes ants { to { background-position: 100% } }
.marching-ants {
  padding: 1em;
  width: 200px;
  height: 200px;
  border: 1px solid transparent;
  background:
  linear-gradient(white, white) padding-box,
  repeating-linear-gradient(-45deg,
  black 0, black 25%, white 0, white 50%
  ) 0 / .6em .6em;
  animation: ants 12s linear infinite;
}
```

## 形状

### 自适应的椭圆

只要设置 border-radius: 50%; 即可。

#### 半椭圆

border-radius: 50% / 100% 100% 0 0;

#### 四分之一椭圆

border-radius: 100% 0 0 0;

### 平行四边形

可以通过 skew() 的变形属性来对这个矩形进行斜向拉伸，但是，这导致它的内容也发生了斜向变形，这很不好看，而且难读。有没有办法只让容器的形状倾斜，而保持其内容不变呢？

#### 嵌套元素方案

对内容再应用一次反向的 skew() 变形，从而抵消容器的变形效果，最终产生我们所期望的结果。不幸的是，这意味着我们将不得不使用一层额外的 HTML 元素来包裹内容，比如用一个 div，注意变形对行内元素是不会生效的。

```html
<a href="#yolo" class="button">
 <div>Click me</div>
</a>
.button { transform: skewX(-45deg); }
.button > div { transform: skewX(45deg); }
```

#### 伪元素方案

另一种思路是把所有样式（背景、边框等）应用到伪元素上，然后再对伪元素进行变形。这个技巧不仅对 skew() 变形来说很有用，还适用于其他任何变形样式，当我们想变形一个元素而不想变形它的内容时就可以用到它。

```css
.button {
 position: relative;
 /* 其他的文字颜色、内边距等样式…… */
}
.button::before {
 content: ''; /* 用伪元素来生成一个矩形 */
 position: absolute;
 top: 0; right: 0; bottom: 0; left: 0;
 z-index: -1;
 background: #58a;
 transform: skew(45deg);
}
```

### 菱形图片

#### 基于变形的方案

需要把图片用一个 `<div>` 包裹起来，然后对其应用相反的 rotate() 变形样式。

```html
<div class="picture">
 <img src="adam-catlace.jpg" alt="..." />
</div>
.picture {
 width: 400px;
 transform: rotate(45deg);
 overflow: hidden;
}
.picture > img {
 max-width: 100%;
 transform: rotate(-45deg);
}
```

但是这样并没达到想要的效果，因为这会生成一个八边形。主要问题在于 max-width: 100% 这条声明。100% 会被解析为容器（.picture）的边长。但是，我们想让图片的宽度与容器的对角线相等，而不是与边长相等。需要把maxwidth 的值设置为变长的根2倍，也可以使用scale() 变形样式来把这个图片放大，推荐使用这种方式

```css
.picture {
 width: 400px;
 transform: rotate(45deg);
 overflow: hidden;
}
.picture > img {
 max-width: 100%;
 transform: rotate(-45deg) scale(1.42);
}
```

#### 裁切路径方案

具体可以查看裁剪相关的内容

```css
clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
```

### 切角效果

