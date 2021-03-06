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

#### 渐变

只需要一个线性渐变就可以达到目标。这个渐 变需要把一个透明色标放在切角处，然后在相同位置设置另一个色标，并且 把它的颜色设置为我们想要的背景色。CSS 代码如下所示（假设切角的深度 是 15px）：

```css
background: #58a;
background: linear-gradient(-45deg, transparent 15px, #58a 0);
```

#### 弧形切角

上述渐变技巧还有一个变种，可以用来创建弧形切角（很多人也把这种 效果称为“内凹圆角”，因为它看起来就像是圆角的反向版本）。唯一的区别 在于，我们会用径向渐变来替代上述线性渐变：

```css
background: #58a;
background:
  radial-gradient(circle at top left,transparent 15px, #58a 0) top left,
  radial-gradient(circle at top right,transparent 15px, #58a 0) top right,
  radial-gradient(circle at bottom right,transparent 15px, #58a 0) bottom right,
  radial-gradient(circle at bottom left,transparent 15px, #58a 0) bottom left;
  background-size: 50% 50%;
  background-repeat: no-repeat;
```

#### 内联 SVG 与 border-image 方案以及裁切路径方案

#### corner-shape

CSS 背景与边框（第四版）（`http://dev.w3.org/csswg/css-backgrounds-4/`）将引入一个全新的属性 `corner-shape`，可以彻底解决这个痛点。这个属性需要跟 border-radius 配合使用，从而产生各种不同形状的切角效果，而切角的尺寸正是 border-radius 的值。

### 梯形标签页

由于透视的关系，我们最终看到的二维图像往往就是一个梯形！谢天谢地，我们可以在 CSS 中用 3D 旋转来模拟出这个效果：

```css
transform: perspective(.5em) rotateX(5deg);
```

对元素使用了 3D 变形之后，其内部的变形效应是“不可逆转”的，这一点跟 2D 变形不同 （在 2D 变形的体系之下，内部的逆向变形可以抵消外部的变形效应）。取消 其内部的变形效应在技术上是有可能的，但非常复杂。因此，如果我们想发挥 3D 变形的功能来生成梯形，唯一可行的途径就是把变形效果作用在伪元素上。

当我们没有设置 transform-origin 属性 时，应用变形效果会让这个元素以它自身的中心线为轴进行空间上的旋转。 因此，元素投射到 2D 屏幕上的尺寸会发生多种变化，它的宽度会增加，它所占据的位置会稍稍下移，它在高度上会有少许缩减，等等。这些变化导致它在设计上很难控制。为了让它的尺寸更好掌握，我们可以为它指定 transform-origin: bottom;，当它在 3D 空间中旋转时，可以把它的底边固定住。不过这样一来，高度的缩水会变得更加显眼，通过变形属性来改变它的尺寸

```css
transform: scaleY(1.3) perspective(.5em) rotateX(5deg);
transform-origin: bottom;
```

这样还有好处就是，给它添加背景、边框、圆角、投影等一系列样式，它们都可以完美生效！不仅如此，我们只需要把 transform-origin 改成 bottom left 或 bottom right，就可以立即得到左侧倾斜或右侧倾斜的标签页。

### 简单的饼图

角向渐变

```css
.pie {
  width: 100px; height: 100px;
  border-radius: 50%;
  background: conic-gradient(#655 40%, yellowgreen 0);
}
```

不仅如此，一旦 attr() 函数在 CSS 值（第三版）（`http://w3.org/TR/css3-values/#attr-notation`）中的扩展定义得到广泛实现之后，你将可以通过一个简单的 HTML 标签属性来控制饼图的比率显示。

```css
background: conic-gradient(#655 attr(data-value %), yellowgreen 0);
```

## 视觉效果

### 单侧阴影

利用 box-shadow 应用一个负的扩张半径，而它的值刚好等于模糊半径，那么投影的尺寸就会与投影所属元素的尺寸完全一致。

```css
box-shadow: 0 5px 4px -4px black;
```

#### 邻边投影

+ 扩张半径不应设为模糊半径的相反值，而应该 是这个相反值的一半。
+ 需要指定两个偏移量，因为我们希望投影在水平和垂直方向上同时移动。它们的值需要大于或等于模糊半径的一半，因为我们希望把投影藏进另外两条边之内

```css
box-shadow: 3px 3px 6px -3px black;
```

#### 双侧投影

唯一的办法是用两块投影（每边各一块）来达到目的。然后基本上就是把“单侧投影”中的 技巧运用两次

### 不规则投影

利用filter滤镜效果中的drop-shadow()，CSS 滤镜最大的好处在于，它们可以平稳退化。另外一件需要牢记的事情就是，任何非透明的部分都会被一视同仁地 打上投影，包括文本（如果背景是透明的）。此外，如果你已经用 textshadow 在文本上加了投影效果，文本投影还会被 drop-shadow() 滤镜再加 上投影，这本质上是给投影打了投影。

### 染色效果

利用filter滤镜效果，或者基于混合模式

### 毛玻璃效果

借助 blur() 滤镜，我们在 CSS 中获得了对元素进行模糊处理的能力。

如果我们直接使用 blur() 滤镜， 整个元素都会被模糊，如果其中有文字，文本反而变得更加无法阅读了。
由于我们不能直接对元素本身进行模糊处理，就 对一个伪元素进行处理，然后将其定位到元素的下层，它的背景将会无缝匹配 `<body>` 的背景。

```css
main {
  position: relative;
  background: hsla(0,0%,100%,.3);
  overflow: hidden; /* 有一圈模糊效果超出了容器可以把多余的模糊区域裁切掉了 */
  /* [其余样式] */
}

main::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(255,0,0,.5); /* 仅用于调试 给它设置了一层半透明的 red 背景 */
  z-index: -1; /* 来把伪元素移动到宿主元素的后面 */
  filter: blur(20px);
  margin: -30px; /* 模糊效果在中心区域看起来非常完美，但在接近边缘处会逐渐消退。让伪元素相对其宿主元素的尺寸再向外扩大至少 20px（即它的模糊半径）。 */
}
```

### 折角效果

#### 45°折角的解决方案

要用这个技巧在右上角创建一个大小为 1em 的斜面切角，然后需要增加一个暗色的三角形来实现翻折效果，增加另一层渐变来生成这个三角形并将其定位在右上角，这样就可以通过 background-size 来控制折角的大小。

```css
background: #58a; /* 回退样式 */
background:
 linear-gradient(to left bottom,transparent 50%, rgba(0,0,0,.4) 0) no-repeat 100% 0 / 2em 2em,
 linear-gradient(-135deg, transparent 1.41em, #58a 0);
```

#### 其他角度的解决方案

```css
.note {
  position: relative;
  width: 300px;
  height: 200px;
  border-radius: .5em;
  background: #58a; /* 回退样式 */
  background:
    linear-gradient(-150deg,transparent 1.5em, #58a 0);
}

.note::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  background: linear-gradient(to left bottom,
    transparent 50%, rgba(0,0,0,.2) 0, rgba(0,0,0,.4))
    100% 0 no-repeat;
  border-bottom-left-radius: inherit;
  box-shadow: -.2em .2em .3em -.1em rgba(0,0,0,.15);
  width: 1.73em;
  height: 3em;
  transform: translateY(-1.3em) rotate(-30deg);
  transform-origin: bottom right;
}
```

## 字体排印

### 连字符断行

设计师迷恋文本的两端对齐效果。不过在网页中，两端对齐却极少使用，而且越是有经验的设计师就越少使用。从 CSS 1 开始就已经有 `text-align: justify;` 了，为什么还会形成这个局面呢？在对文本进行两端对齐处理时，需要调整单词的间距，此时会出现“单词孤岛”现象。这个结果不仅看起来很糟糕，而且损伤了可读性。

CSS 文本（第三版）引入了一个新的属性 hyphens。none、manual 和 auto。manual 是它的初始值，其行为正好对应了现有的工作方式：我们可以在任何时候手工插入软连字符，来实现断词折行的效果。很显然 hyphens: none; 会禁用这种行为；而最为神奇的是，只需这短短一行 CSS 就可以产生我们梦寐以求的效果。

### 文本行的斑马条纹

CSS 中用渐变直接生成背景图像，而且可以用 em 单位来设定背景尺寸，这样背景就可以自动适应 font-size 的变化了。首先，我们需要运用“条纹背景”一节中所描述的方法，创建出水平条纹背景。它的 background-size 需要设置为 line-height 的两倍，因为每个背景贴片需要覆盖两行代码。我们对容器应用了 .5em 的内边距，这个距离正是这些条纹与理想位置之间的偏差，让我们回顾一下“灵活的背景定位”中提到的 background-origin。这个属性正是我们所需要的：它可以告诉浏览器在解析background-position 时以 content box 的外沿作为基准，而不是默认的 padding box 外沿。

```css
.stripes {
  padding: .5em;
  line-height: 1.5;
  background: beige;
  background-size: auto 3em;
  background-origin: content-box;
  background-image: linear-gradient(rgba(0,0,0,.2) 50%, transparent 0);
}
```

### 调整 tab 的宽度

CSS 文本（第三版）中，一个新的 CSS 属性 tab-size 可以控制这个情况。这个属性接受一个数字（表示字符数）或者一个长度值（这个不那么实用）。我们通常希望把它设置为 4（表示 4 个字符的宽度）或 2，后者是最近更为流行的缩进尺寸。

### 连字

在 CSS 字体（第三版）（`http://w3.org/TR/css3-fonts`）中，原有的 fontvariant 被升级成了一个简写属性，由很多新的展开式属性组合而成。其中之一叫作 font-variant-ligatures，专门用来控制连字效果的开启和关闭。如果要启用所有可能的连字，需要同时指定这三个标识符：

```css
font-variant-ligatures: common-ligatures discretionary-ligatures historical-ligatures;
```

这个属性是可继承的。比如，发现酌情连字可能会干扰到正常文字的阅读效果时，你可能希望把它单独关掉。在这种情况下，你可能只想开启通用连字：

```css
font-variant-ligatures: common-ligatures;
```

你甚至可以显式地把其他两种连字关闭：

```css
font-variant-ligatures: common-ligatures no-discretionary-ligatures no-historical-ligatures;
```

font-variant-ligatures还接受none这个值，它会把所有的连字效果都关掉。千万不要使用none，除非你绝对清楚自己是在做什么。如果要把fontvariant-ligatures属性复位为初始值，应该使用normal而不是none。

### 自定义下划线

最佳方案来自于 background-image 及其相关属性。

```css
background: linear-gradient(gray, gray) no-repeat;
background-size: 100% 1px;
background-position: 0 1.15em;
/* 下划线在遇到字母时会自动断开避让可以设置两层与背景色相同的 text-shadow 来模拟这种效果 */
text-shadow: .05em 0 white, -.05em 0 white;

/* 使用渐变来实现下划线的高明之处在于，这些线条极为灵活如果要生成一条虚线下划线 */

background: linear-gradient(90deg,gray 66%, transparent 0) repeat-x;
background-size: .2em 2px;
background-position: 0 1em;
```

新的CSS规范中添加了这些功能，不过浏览器兼容性不太好

+ text-decoration-color 用于自定义下划线或其他装饰效果的颜色。
+ text-decoration-style 用于定义装饰效果的风格（比如实线、虚线、波浪线等）。
+ text-decoration-skip 用于指定是否避让空格、字母降部或其他对象。
+ text-underline-position 用于微调下划线的具体摆放位置。

### 现实中的文字效果

主要用到 text-shadow

#### 凸版印刷效果

当我们在浅色背景上使用深色文字时，在底部 加上浅色投影通常效果最佳。

```css
background: hsl(210, 13%, 60%);
color: hsl(210, 13%, 30%);
text-shadow: 0 1px 1px hsla(0,0%,100%,.8);
/* 不过如果需要处理的文字字号跨度非常大，那么 em 单位可 能更合适。 */
text-shadow: 0 .03em .03em hsla(0,0%,100%,.8);
/* 在深色底、浅色文字的情况下，给文字顶部加深色投影是最佳方案  */
background: hsl(210, 13%, 40%);
color: hsl(210, 13%, 75%);
text-shadow: 0 -1px 1px black;
```

#### 空心字效果

```css
background: deeppink;
color: white;
text-shadow: 1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black;

/* 除此以外，还可以重叠多层轻微模糊的投影来模拟描边。这种方法不需 要设置偏移量： */

text-shadow: 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black;

/* 不幸的是，我们需要的描边越粗，这两种方案产生的结果就越差 */
```

#### 文字外发光效果

```css
background: #203;
color: #ffc;
text-shadow: 0 0 .1em, 0 0 .3em;
```

不过你要牢记一点，依赖 text-shadow 来实现文字显示的做法无法实现平稳退化：如果浏览器不支持 text-shadow，那就什么字也看不见了。

#### 文字凸起效果

## 用户体验

### 选用合适的鼠标光标

### 扩大可点击区域

扩张热区最简单的办法是为它设置一圈透明边框，因为鼠标对元素边框的交互也会触发鼠标事件，这一点是描边和投影所不及的。

```css
border: 10px solid transparent;
/* 简单好用的 background-clip 属性可以把背景限制在原本的区域之内 */
background-clip: padding-box;
/* 当你需要给按钮加上真正的边框效果时，可以用内嵌投影来模拟出一道（实色）边框  */
box-shadow: 0 0 0 1px rgba(0,0,0,.3) inset;
```

伪元素同样可以代表其宿主元素来响应鼠标交互。只要有任何一个伪元素可供利用，这个方法就可以发挥作用，也不会干 扰其他任何效果。这个基于伪元素的解决方案极为灵活，我们基本上可以把 热区设置为任何想要的尺寸、位置或形状，甚至可以脱离元素原有的位置。

```css
button {
  position: relative;
  /* [其余样式] */
}

button::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  bottom: -10px;
  left: -10px;
}
```

### 自定义复选框

tip: 你是否还在为伪类选择 符 :checked 和属性选择符 [checked] 之间的区别感到疑惑？后者是不会根据用户的交互行为进行更新的，因为用户的交互并不会影响到HTML标签上的属性。

我们倒是可以基于复 选框的勾选状态借助组合选择符来给其他元素设置样式。当 `<label>` 元素与复选框关联之后，也可以起到触发开关的作用。

```html
<style>
input[type="checkbox"] + label::before {
  content: '\a0';
  display: inline-block;
  vertical-align: .2em;
  width: .8em;
  height: .8em;
  margin-right: .2em;
  border-radius: .2em;
  background: silver;
  text-indent: .15em;
  line-height: .65;

  /* 原来的复选框仍然是可见的，待会儿我们会将其隐藏。现在需要给复选框的勾选状态加上不同的样式。 */
  content: '\2713';
  background: yellowgreen;
}
/* 现在，我们需要把原来的复选框以一种不损失可 访问性的方式隐藏起来。这意味着不能使用 display: none，因为那样会 把它从键盘 tab 键切换焦点的队列中完全删除。 */
input[type="checkbox"] {
  position: absolute;
  clip: rect(0,0,0,0);
}

</style>
<input type="checkbox" id="awesome" />
<label for="awesome">Awesome!</label>
```

这就完成了，我们得到了一个简单定制化的复选框！我们还可以进一步优化，比如在它聚焦或禁用时改变它的样式，你甚至可以用过渡或动画来让各个状态之间的切换更加平滑，或者脑子 一热创建一个拟物化的开关。这方面的可能性真的是无穷无尽。

### 通过阴影来弱化背景

弹出层以及交互式的“快速指南”就是这种效果的典型案例。这个效果最常见的实现方法就是增加一个额外的 HTML 元素用于遮挡背景，然后为它添加如下样式

```css
.overlay {
  /* 用于遮挡背景 */
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,.8);
}

.lightbox { /* 需要吸引用户注意的元素 */
  position: absolute;
  z-index: 1;
  /* [其余样式] */
}
```

这个方法稳定可 靠，但需要增加一个额外的 HTML 元素，这意味着该效果无法由 CSS 单独 实现。这不是一个很严重的问题，但对我们来说又确实是个麻烦事

#### 通过阴影来弱化背景伪元素方案

```css
body.dimmed::before {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: rgba(0,0,0,.8);
}
```

如果把遮罩层交给这个元素自己的 ::before 伪元素来实现，就可以弥补这些不足了。给伪元素设置 z-index: -1; 就可以让它出现在元素的背后。尽管这解决了可移植性的问题，但无法对遮罩层的Z 轴层次进行细粒度的控制。这个方法还有一个问题，伪元素无法绑定独立的 JavaScript 事件处理函数。

#### 通过阴影来弱化背景box-shadow 方案

具体做法就是生成一个巨大的投影，不偏移也不模糊，简单而 拙劣地模拟出遮罩层的效果：

```css
box-shadow: 0 0 0 999px rgba(0,0,0,.8);
```

这个初步的解决方案有一个明显的问题，就是它无法在较大的屏幕分 辨率（>2000px）下正常工作，因此，满足我们需求的最小值就是 50vmax。由于投影是同时向四个方向扩展的，这个遮罩层的最终尺寸将是 100vmax 加上元素本身的尺寸。

```css
box-shadow: 0 0 0 50vmax rgba(0,0,0,.8);
```

这个技巧非常简洁易用，但它存在两个非常严重的问题，从而制约了其使用场景。

+ 当我们滚动页面时，遮罩层的边缘就露出来了，除非给它加上 position: fixed; 相反，推荐有限度地应用这个技巧，比如配合固定定位来使用，或者当页面没有滚 动条时再用。
+ boxshadow 它只能在视觉上起到引导注意力的作用，却无法阻止鼠标交互。

#### ::backdrop 方案

### 通过模糊来弱化背景

我们还是得动用一个额外的 HTML 元素来实现这个效果：需要把页面上除了关键元素之外的一切都包裹起来，这样就可以只对这个容器元素进行模糊处理了

```html
<main>Bacon Ipsum dolor sit amet...</main>
<dialog>O HAI, I'm a dialog. Click on me to dismiss.</dialog>
<!-- 其他对话框都写在这里 -->
<style>
main {
  transition: .6s filter;
}
/* 每个弹出框弹出时增加一个类名  */
main.de-emphasized {
  filter: blur(3px) contrast(.8) brightness(.8);
}
</style>
```

### 滚动提示

```css
ul {
  overflow: auto;
  width: 10em;
  height: 8em;
  padding: .3em .5em;
  border: 1px solid silver;
  /* 一层用来生成那条阴影 另一个用来遮挡阴影的白色矩形， */
  background: linear-gradient(white 30%, transparent),
    radial-gradient(at 50% 0, rgba(0,0,0,.2), transparent 70%);
  background-repeat: no-repeat;
  background-size: 100% 50px, 100% 15px;
  background-attachment: local, scroll;
}
```

### 交互式的图片对比控件

#### CSS resize 方案

这个属性实际上适用于任何元素，只要它的 overflow 属性不是 visible。对几乎所有元素来说，resize 默认都是设置为 none 的，即禁用调整大小的特性。除了 both 之外，这个属性接受的值还有 horizontal 和 vertical，它们可以限制元素调整大小的方向。

```css
.image-slider {
 position:relative;
 display: inline-block;
}
.image-slider > div {
 position: absolute;
 top: 0; bottom: 0; left: 0;
 width: 50%;
 max-width: 100%;overflow: hidden;
 resize: horizontal;
}
.image-slider > div::before {
 content: '';
 position: absolute;
 bottom: 0; right: 0;
 width: 12px; height: 12px;
 padding: 5px;
 background:
 linear-gradient(-45deg, white 50%, transparent 0);
 background-clip: content-box;
 cursor: ew-resize;
}
.image-slider img {
 display: block;
 user-select: none;
}
```

## 结构与布局

### 自适应内部元素

主要用到 width: min-content;

### 根据兄弟元素的数量来设置样式

对于只有一个列表项的特殊场景来说，解决方案显然就是 :only-child，这个伪类选择符就是为这种情况而设计的。举例来说，当列表中只有一个列表项时，我们想把删除按钮隐藏起来了，这个需求是可以由 :only-child 选择符来完成的。实际上，:only-child 等 效 于 :first-child:last-child，。:last-child 其实也是一个快捷写法，相当于 :nth-last-child(1)。

仅当列表项的总数为 4 时才对这些列表项设置样式。

```css
li:first-child:nth-last-child(4),
li:first-child:nth-last-child(4) ~ li {
 /* 当列表正好包含四项时，命中所有列表项 */
}
```

### 根据兄弟元素的数量范围来匹配元素

:nth-child() 选择符在这方面非常好用，我们可以用它来命中一个范围，比如“选中第 4 项之后的所有项”这样的需求就完全不在话下。它的参数不仅可以是简单的数字，也可以是像 an+b 这样的表达式（比如 :nth-child(2n+1)）。这里的 n 表示一个变量，理论上的范围是 0 到 + ∞

n+b 这种形式的表达式可以选中从第 b 个开始的所有子元素。举例来说，:nth-child(n+4) 将会选中除了第一、二、三个子元素之外的所有子元素。

利用这个技巧，我们可以在列表项的总数是 4 或更多时选中所有列表项。在这种情况下，我们可以把表达式 n+4 传给 :nth-lastchild()

```css
li:first-child:nth-last-child(n+4),
li:first-child:nth-last-child(n+4) ~ li {
 /* 当列表至少包含四项时，命中所有列表项 */
}
```

同理，-n+b 这种形式的表达式可以选中开头的 b 个元素。

当然，我们还可以把这两种技巧组合起来使用，不过代码也会变得更加复杂。假设我们希望在列表包含 2 ～ 6 个列表项时命中所有的列表项，可以这样写：

```css
li:first-child:nth-last-child(n+2):nth-last-child(-n+6),
li:first-child:nth-last-child(n+2):nth-last-child(-n+6) ~ li {
 /* 当列表包含2～6项时，命中所有列表项 */
}
```

### 满幅的背景，定宽的内容

在过去的几年间，有一种网页设计手法逐渐流行起来，我将它称作背景宽度满幅，内容宽度固定。这个设计的一些典型特征如下。

+ 页面中包含多个大区块，每个区块都占据了整个视口的宽度，区块的背景也各不相同。
+ 内容是定宽的，即使在不同分辨率下的宽度不一样，那也只是因为媒体查询改变了这个固定的宽度值而已。在某些情况下，不同区块的内容也可能具有不同的宽度。

要实现这种设计风格，最常见的方法就是为每个区块准备两层元素：外层用来实现满幅的背景，内层用来实现定宽的内容。后者是通过 margin: auto 实现水平居中的。

难道为了这个效果就一定要添加一层额外的元素？CSS 值与单位（第三版）（`http://w3.org/TR/css-values-3/#calc`）定义了一个 calc() 函数，它允许我们在 CSS 中直接以这种简单的算式来指定属性的值。如果用 calc() 取代原先的 auto，就可以省掉多余的元素。

```css
footer {
 padding: 1em;
 padding: 1em calc(50% - 450px);
 background: #333;
}
```

### 垂直居中

### 紧贴底部的页脚

#### 固定高度的解决方案

```css
.main {
  /* 主要是calc 计算出最小高度 */
 min-height: calc(100vh - 2.5em - 7em);
 /* 避免内边距或边框搞乱高度的计算： */
 box-sizing: border-box;
}
```

#### 更灵活的解决方案

```css
body {
 display: flex;
 flex-flow: column;
 min-height: 100vh;
}
main { flex: 1; }
```

## 过渡与动画

### 缓动效果

#### 弹跳动画

不论是在 animation/transition 简写属性中，还是在 animationtiming-function/transition-timing-function 展开式属性中，你都可以把这个默认的调速函数显式指定为 ease 关键字。同时还有 ease-in ,ease-out 等。作为对上述五种预定义曲线的补充，CSS 提供了一个 cubic-bezier()函数，允许我们指定自定义的调速函数。

#### 弹性过渡

可以使用动画

```css
@keyframes elastic-grow {
 from { transform: scale(0); }
 70% {
 transform: scale(1.1);
 animation-timing-function:
 cubic-bezier(.1,.25,1,.25); /* 反向的ease */
 }
}
input:focus + .callout { animation: elastic-grow .5s; }
.callout { transform-origin: 1.4em -.4em; }
```

动画确实更加强大，但在这个场景中，我们所需要的其实只是给这个过渡加入一些弹性的感觉，因此动画在这里显得大材小用了，有一种杀鸡用牛刀的感觉。有没有可能只用过渡就做出这个效果呢？

这个问题的解决方案仍然来自于自定义调速函数 cubic-bezier()。到目前为止，我们只是讨论了曲线的控制锚点处在 0~1 区间内的情况。前面曾经提到过，我们无法在水平方向上超越这个范围，但我们可以在垂直方向上突破 0~1 区间，从而让过渡达到低于 0 或高于 100% 的程度。

```css
input:not(:focus) + .callout {
 transform: scale(0) transform;;
 transition-timing-function: ease;
 transition: .25s;
}
.callout {
 transform-origin: 1.4em -.4em;
 transition: .5s cubic-bezier(.25,.1,.3,1.5) transform;;
}
```

#### 逐帧动画

与贝塞尔曲线调速函数迥然不同的是，steps() 会根据你指定的步进数量，把整个动画切分为多帧，而且整个动画会在帧与帧之间硬切，不会做任何插值处理。

#### 闪烁效果

#### 状态平滑的动画

举例来说，用户的鼠标可能会触发一个华丽的 :hover 动画，而在动画还没有播完的时候，鼠标就从元素上移走了。在这种情况下，你觉得动画会如何收场呢？
如果觉得“动画应该停留在当前状态”或者“动画应该平滑地过渡回开始状态”，那你就要大跌眼镜了。在默认情况下，动画只会立即停止播放，并生硬地跳回开始状态。

我们需要把动画加在样式中，但是让它一开始就处于暂停状态，直到 :hover 时再启动动画。这再也不是添加和取消动画的问题了，而只是暂停和继续一个一直存在的动画，因此再也不会有生硬的跳回现象了。用到 animation-play-state 属性。

#### 沿环形路径平移的动画

每个 transform-origin 都是可以被两个translate() 模拟出来的。
