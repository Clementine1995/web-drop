# 有趣的CSS题目7

>文章参考自[谈谈一些有趣的CSS题目（22）-- 纯 CSS 方式实现 CSS 动画的暂停与播放](https://github.com/chokcoco/iCSS/issues/12)
>
>文章参考自[谈谈一些有趣的CSS题目（23）-- 谈谈 CSS 关键字 initial、inherit 和 unset](https://github.com/chokcoco/iCSS/issues/12)
>
>文章参考自[谈谈一些有趣的CSS题目（25）-- vh、vw、vmin、vmax 知多少](https://github.com/chokcoco/iCSS/issues/15)
>
>文章参考自[谈谈一些有趣的CSS题目（26）-- 奇妙的-webkit-background-clip: text](https://github.com/chokcoco/iCSS/issues/14)
>
>文章参考自[谈谈一些有趣的CSS题目（27）-- 神奇的 conic-gradient 圆锥渐变](https://github.com/chokcoco/iCSS/issues/19)

使用纯 CSS 的方法，能否暂停、播放纯 CSS 动画？看起来不可能，至少很麻烦。

我们知道，在 CSS3 animation 中，有这样一个属性可以播放、暂停动画：

{
    animation-play-state: paused | running;
}

    animation-play-state: 属性定义一个动画是否运行或者暂停。可以通过查询它来确定动画是否正在运行。另外，它的值可以被设置为暂停和恢复的动画的重放。

如果借助 Javascrip，我们可以实现控制 CSS 动画的运行和播放，下面列出部分关键代码：

<div class="btn">stop</div>
<div class="animation"></div>

<style>
.animation {
    animation: move 2s linear infinite alternate;
}

@keyframes move {
    0% {
        transform: translate(-100px, 0);
    }
    100% {
        transform: translate(100px, 0);
    }
}
</style>

document.querySelector('.btn').addEventListener('click', function() {
    let btn = document.querySelector('.btn');
    let elem = document.querySelector('.animation');
    let state = elem.style['animationPlayState'];
    
    if(state === 'paused') {
        elem.style['animationPlayState'] = 'running';
        btn.innerText = 'stop';
    } else {
        elem.style['animationPlayState'] = 'paused';
        btn.innerText = 'play';
    }
    
});

CodePen -- Demo -- pause CSS Animation
纯 CSS 实现

下面我们探讨下，使用纯 CSS 的方式能否实现。
hover 伪类实现

使用 hover 伪类，在鼠标悬停在按钮上面时，控制动画样式的暂停。

关键代码如下:

<div class="btn stop">stop</div>
<div class="animation"></div>

<style>
.stop:hover ~ .animation {
    animation-play-state: paused;
}
</style>

Demo -- 纯 CSS 方式实现 CSS 动画的暂停与播放 (Hover)

当然，这个方法不够智能，如果释放鼠标的自由，点击一下暂停、再点击一下播放就好了。还有其他方法吗？
checked 伪类实现

之前的文章也谈过，使用 radio 标签的 checked 伪类，加上 <label for> 实现纯 CSS 捕获点击事情。

并且利用被点击的元素可以控制一些 CSS 样式。实现如下：

<input id="stop" type="radio" />
<input id="play" type="radio" />

<div class="box">
    <label for="stop">
        <div class="btn">stop</div>
    </label>
    <label for="play">
        <div class="btn">play</div>
    </label>
</div>

<div class="animation"></div>

部分关键 CSS 代码：

.animation {
    animation: move 2s linear infinite alternate;
}

#stop:checked ~ .animation {
    animation-play-state: paused;
}

#play:checked ~ .animation {
    animation-play-state: running;
}

我们希望当 #stop 和 #play 两个 radio 被击时，给 .animation 元素分别赋予 animation-play-state: paused 或是 animation-play-state: running 。

DEMO -- 纯 CSS 方式实现 CSS 动画的暂停与播放

上面的示例 Demo 中，实现了纯 CSS 方式实现 CSS 动画的暂停与播放。

当然，使用 :target 伪类选择器也能实现上面同样的效果，感兴趣的可以尝试一下。

-----

经常会碰到，问一个 CSS 属性，例如 position 有多少取值。

通常的回答是 static、relative、absolute 和 fixed 。当然，还有一个极少人了解的 sticky 。其实，除此之外， CSS 属性通常还可以设置下面几个值：

    initial
    inherit
    unset
    revert

{
  position: initial;
  position: inherit;
  position: unset

  /* CSS Cascading and Inheritance Level 4 */
  position: revert;
}

了解 CSS 样式的 initial（默认）和 inherit（继承）是熟练使用 CSS 的关键。
initial

initial 关键字用于设置 CSS 属性为它的默认值，可作用于任何 CSS 样式。（IE 不支持该关键字）
inherit

每一个 CSS 属性都有一个特性就是，这个属性必然是默认继承的 (inherited: Yes) 或者是默认不继承的 (inherited: no)其中之一，我们可以在 MDN 上通过这个索引查找，判断一个属性的是否继承特性。

譬如，以 background-color 为例，由下图所示，表明它并不会继承父元素的 background-color:

image
可继承属性

最后罗列一下默认为 inherited: Yes 的属性：

    所有元素可继承：visibility 和 cursor
    内联元素可继承：letter-spacing、word-spacing、white-space、line-height、color、font、 font-family、font-size、font-style、font-variant、font-weight、text- decoration、text-transform、direction
    块状元素可继承：text-indent和text-align
    列表元素可继承：list-style、list-style-type、list-style-position、list-style-image
    表格元素可继承：border-collapse

还有一些 inherit 的妙用可以看看这里：谈谈一些有趣的CSS题目（四）-- 从倒影说起，谈谈 CSS 继承 inherit，合理的运用 inherit 可以让我们的 CSS 代码更加符合 DRY（Don‘’t Repeat Yourself ）原则。
unset

名如其意，unset 关键字我们可以简单理解为不设置。其实，它是关键字 initial 和 inherit 的组合。

什么意思呢？也就是当我们给一个 CSS 属性设置了 unset 的话：

    如果该属性是默认继承属性，该值等同于 inherit
    如果该属性是非继承属性，该值等同于 initial

举个例子，先列举一些 CSS 中默认继承父级样式的属性：

    部分可继承样式: font-size, font-family, color, text-indent
    部分不可继承样式: border, padding, margin, width, height

使用 unset 继承父级样式：

看看下面这个简单的结构：

<div class="father">
    <div class="children">子级元素一</div>
    <div class="children unset">子级元素二</div>
</div>

.father {
    color: red;
    border: 1px solid black;
}

.children {
    color: green;
    border: 1px solid blue;
}

.unset {
    color: unset;
    border: unset;
}

    由于 color 是可继承样式，设置了 color: unset 的元素，最终表现为了父级的颜色 red。

    由于 border 是不可继承样式，设置了 border: unset 的元素，最终表现为 border: initial ，也就是默认 border 样式，无边框。

CodePen Demo -- unset Demo;
unset 的一些妙用

例如下面这种情况，在我们的页面上有两个结构类似的 position: fixed 定位元素。

image

区别是其中一个是 top:0; left: 0;，另一个是 top:0; right: 0;。其他样式相同。

假设样式结构如下：

<div class="container">
    <div class="left">fixed-left</div>
    <div class="right">fixed-right</div>
</div>

通常而言，样式如下：

.left,
.right {
    position: fixed;
    top: 0;    
    ...
}
.left {
    left: 0;
}
.right {
    right: 0;
}

使用 unset 的方法：

.left,
.right {
    position: fixed;
    top: 0;    
    left: 0;
    ...
}
.right {
    left: unset;
    right: 0;
}

-----

介绍一些 CSS3 新增的单位，平时可能用的比较少，但是由于单位的特性，在一些特殊场合会有妙用。
vw and vh

    1vw 等于1/100的视口宽度 （Viewport Width）

    1vh 等于1/100的视口高度 （Viewport Height）

综上，一个页面而言，它的视窗的高度就是 100vh，宽度就是 100vw 。看个例子：

CodePen Demo

响应式web设计离不开百分比。但是，CSS百分比并不是所有的问题的最佳解决方案。CSS的宽度是相对于包含它的最近的父元素的宽度的。但是如果你就想用视口（viewpoint）的宽度或者高度，而不是父元素的，那该肿么办？ 这就是 vh 和 vw 单位为我们提供的。

1vh 等于1/100的视口高度。栗子：浏览器高度900px, 1 vh = 900px/100 = 9 px。同理，如果视口宽度为750， 1vw = 750px/100 = 7.5 px。

可以想象到的，他们有很多很多的用途。比如，我们用很简单的方法只用一行CSS代码就实现同屏幕等高的框。

.slide {
    height: 100vh;
}

假设你要来一个和屏幕同宽的标题，你只要设置这个标题的font-size的单位为vw，那标题的字体大小就会自动根据浏览器的宽度进行缩放，以达到字体和viewport大小同步的效果。
vmin and vmax

vh和 vw 依据于视口的高度和宽度，相对的，vmin 和 vmax则关于视口高度和宽度两者的最小或者最大值

    vmin — vmin的值是当前vw和vh中较小的值。
    vmax — vw和vh中较大的值。

这个单位在横竖屏的切换中，十分有用。

在一些 Demo 示例，或者大页面中，我们经常都会看到上述 4 个单位的身影。灵活使用，就可以减少很多 CSS 的代码量。

-----

说起 background-clip ，可能很多人都很陌生。Clip 的意思为修剪，那么从字面意思上理解，background-clip 的意思即是背景裁剪。

我曾经在 从条纹边框的实现谈盒子模型 一文中谈到了这个属性，感兴趣的可以回头看看。

简单而言，background-clip 的作用就是设置元素的背景（背景图片或颜色）的填充规则。

与 box-sizing 的取值非常类似，通常而言，它有 3 个取值：

{
    background-clip: border-box;  // 背景延伸到边框外沿（但是在边框之下）
    background-clip: padding-box; // 边框下面没有背景，即背景延伸到内边距外沿。
    background-clip: content-box; // 背景裁剪到内容区 (content-box) 外沿。
}

不过这些都不是本文的主角。本文的主角是 background-clip: text; ，当然现在只有 chrome 支持，所以通常想使用它，需要 -webkit-background-clip:text;。
何为 -webkit-background-clip:text

使用了这个属性的意思是，以区块内的文字作为裁剪区域向外裁剪，文字的背景即为区块的背景，文字之外的区域都将被裁剪掉。

看个最简单的 Demo ，没有使用 -webkit-background-clip:text :

<div>Clip</div>

<style>
div {
  font-size: 180px;
  font-weight: bold;
  color: deeppink;
  background: url($img) no-repeat center center;
  background-size: cover;
}
</style>

效果如下：

image

CodePen Demo
使用 -webkit-background-clip:text

我们稍微改造下上面的代码，添加 -webkit-background-clip:text：

div {
  font-size: 180px;
  font-weight: bold;
  color: deeppink;
  background: url($img) no-repeat center center;
  background-size: cover;
  -webkit-background-clip: text;
}

效果如下：

image

CodePen Demo

看到这里，可能有人就纳闷了，wtf，啥玩意呢，这不就是文字设置 color 属性嘛。
将文字设为透明 color: transparent

别急！当然还有更有意思的，上面由于文字设置了颜色，挡住了 div 块的背景，如果将文字设置为透明呢？文字是可以设置为透明的 color: transparent 。

div {
  color: transparent;
  -webkit-background-clip: text;
}

效果如下：

image

CodePen Demo

通过将文字设置为透明，原本 div 的背景就显现出来了，而文字以为的区域全部被裁剪了，这就是 -webkit-background-clip:text 的作用。
嗨起来

了解了最基本的用法，接下来可以想想如何去运用这个元素制作一些效果。

    大大增强了文字的颜色填充选择
    文字颜色的动画效果
    配合其他元素，实现一些其他巧妙的用法

实现文字渐变效果

利用这个属性，我们可以十分便捷的实现文字的渐变色效果。

CodePen Demo;
背景渐变动画 && 文字裁剪

因为有用到 background 属性，回忆一下，我在上一篇 巧妙地制作背景色渐变动画！ 利用了渐变 + animation 巧妙的实现了一些背景的渐变动画。可以很好的和本文的知识结合起来。

结合渐变动画，当然不一定需要过渡动画，这里我使用的是逐帧动画。配合 -webkit-background-clip:text，实现了一种，嗯，很红灯区的感觉 qq 20170105104256

CodePen Demo
按钮填充效果

运用这个属性，我们可以给按钮实现这样一种遮罩填充动画(主要是用于防止文字闪烁)：

CodePen Demo
图片窥探效果

再演示其中一个用法，利用两个 div 层一起使用，设置相同的背景图片，父 div 层设置图片模糊，其中子 div 设置 -webkit-background-clip:text，然后利用 animation 移动子 div ，去窥探图片：

CodePen Demo

其实还有很多有趣的用法，只有敢想并动手实践。当然很多人会吐槽这个属性的兼容性，确实，我个人觉得前端现在的生态有一点面向未来编程的感觉（调戏）。不过提前掌握总体而言利大于弊，多多拓宽自己的视野。

-----

开始使用 conic-gradient 圆锥渐变

感谢 LeaVerou 大神，让我们可以提前使用上这么美妙的属性。

conic-gradient 是个什么？说到 conic-gradient ，就不得不提的它的另外两个兄弟：

    linear-gradient : 线性渐变
    lg
    radial-gradient : 径向渐变
    rg

说这两个应该还是有很多人了解并且使用过的。CSS3 新增的线性渐变及径向渐变给 CSS 世界带来了很大的变化。

而 conic-gradient ，表示圆锥渐变，另外一种渐变方式，给 CSS 世界带来了更多可能。

下面进入正文，本文中所有示例，请在高版本 Chrome 内核下预览。
API

看看它最简单的 API：

{
    /* Basic example */ 
    background: conic-gradient(deeppink, yellowgreen);
}

image
与线性渐变及圆锥渐变的异同

那么它和另外两个渐变的区别在哪里呢？

    linear-gradient 线性渐变的方向是一条直线，可以是任何角度
    radial-gradient径向渐变是从圆心点以椭圆形状向外扩散

而从方向上来说，圆锥渐变的方向是这样的：

conic-gradient渐变方向

划重点：

从图中可以看到，圆锥渐变的渐变方向和起始点。起始点是图形中心，然后以顺时针方向绕中心实现渐变效果。
使用 conic-gradient 实现颜色表盘

从上面了解了 conic-gradient 最简单的用法，我们使用它实现一个最简单的颜色表盘。

conic-gradient 不仅仅只是从一种颜色渐变到另一种颜色，与另外两个渐变一样，可以实现多颜色的过渡渐变。

由此，想到了彩虹，我们可以依次列出 赤橙黄绿青蓝紫 七种颜色：

    conic-gradient: (red, orange, yellow, green, teal, blue, purple)

上面表示，在圆锥渐变的过程中，颜色从设定的第一个 red 开始，渐变到 orange ，再到 yellow ，一直到最后设定的 purple 。并且每一个区间是等分的。

我们再给加上 border-radius: 50% ，假设我们的 CSS 如下，

{
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: conic-gradient(red, orange, yellow, green, teal, blue, purple);
}

看看效果：

image

wow，已经有了初步形状了。但是，总感觉哪里不大自然。总之，浑身难受 fxxk

嗯？问题出在哪里呢？一是颜色不够丰富不够明亮，二是起始处与结尾处衔接不够自然。让我再稍微调整一下。

我们知道，表示颜色的方法，除了 rgb() 颜色表示法之外，还有 hsl() 表示法。

    hsl() 被定义为色相-饱和度-明度（Hue-saturation-lightness）

    色相（H）是色彩的基本属性，就是平常所说的颜色名称，如红色、黄色等。
    饱和度（S）是指色彩的纯度，越高色彩越纯，低则逐渐变灰，取0-100%的数值。
    明度（V），亮度（L），取0-100%。

这里，我们通过改变色相得到一个较为明亮完整的颜色色系。

也就是采用这样一个过渡 hsl(0%, 100%, 50%) --> hsl(100%, 100%, 50%)，中间只改变色相，生成 20 个过渡状态。借助 SCSS ，CSS 语法如下:

$colors: ();
$totalStops:20;

@for $i from 0 through $totalStops{
    $colors: append($colors, hsl($i *(360deg/$totalStops), 100%, 50%), comma);
}

.colors {
    width: 200px;
    height: 200px;
    background: conic-gradient($colors);
    border-radius: 50%;
}

得到如下效果图，这次的效果很好：

image

CodePen Demo -- conic-gradinet colors
配合百分比使用

当然，我们可以更加具体的指定圆锥渐变每一段的比例，配合百分比，可以很轻松的实现饼图。

假设我们有如下 CSS：

{
    width: 200px;
    height: 200px;
    background: conic-gradient(deeppink 0, deeppink 30%, yellowgreen 30%, yellowgreen 70%, teal 70%, teal 100%);
    border-radius: 50%;
}

上图，我们分别指定了 0~30%，30%~70%，70%~100% 三个区间的颜色分别为 deeppink(深红)，yellowgreen(黄绿) 以及 teal(青) ，可以得到如下饼图：

image

当然，上面只是百分比的第一种写法，还有另一种写法也能实现：

{
    background: conic-gradient(deeppink 0 30%, yellowgreen 0 70%, teal 0 100%);
}

这里表示 ：

    0-30% 的区间使用 deeppink
    0-70% 的区间使用 yellowgreen
    0-100% 的区间使用 teal

而且，先定义的颜色的层叠在后定义的颜色之上。

CodePen Demo -- use proportion in conic-gradient
配合 background-size 使用

使用了百分比控制了区间，再配合使用 background-size 就可以实现各种贴图啦。

我们首先实现一个基础圆锥渐变图形如下：

{
    width: 250px;
    height: 250px;
    margin: 50px auto;
    background: conic-gradient(#000 12.5%, #fff 0 37.5%, #000 0 62.5%, #fff 0 87.5%, #000 0);
}

效果图：

image

再加上 background-size: 50px 50px;，也就是：

{
    width: 250px;
    height: 250px;
    margin: 50px auto;
    background: conic-gradient(#000 12.5%, #fff 0 37.5%, #000 0 62.5%, #fff 0 87.5%, #000 0);
    background-size: 50px 50px;
}

得到：

image

CodePen Demo -- conic-gradient wallpaper
重复圆锥渐变 repaeting-conic-gradient

与线性渐变及径向渐变一样，圆锥渐变也是存在重复圆锥渐变 repaet-conic-gradient 的。

我们假设希望不断重复的片段是 0~30° 的一个片段，它的 CSS 代码是 conic-gradient(deeppink 0 15deg, yellowgreen 0 30deg) 。

image

那么，使用了 repaeting-conic-gradient 之后，会自动填充满整个区域，CSS 代码如下：

{
    width: 200px;
    height: 200px;
    background: repeating-conic-gradient(deeppink 0 15deg, yellowgreen 0 30deg);
    border: 1px solid #000;
}

image

CodePen Demo -- repeating-conic-gradient
圆锥渐变动画

基本的一些用法了解完了，看看使用圆锥渐变可以玩出什么花来。

借助 SCSS 的强大，我们可以制作出一些非常酷炫的背景展板。

使用 SCSS ，我们随机生成一个多颜色的圆锥渐变图案：

假设我们的 HTML 结构如下：

<div></div>

CSS/SCSS 代码如下：

@function randomNum($max, $min: 0, $u: 1) {
	@return ($min + random($max)) * $u;
}

@function randomConicGradient() {
    $n: random(30) + 10;
	$list: ();
    
	@for $i from 0 to $n {
		$list: $list, rgb(randomNum(255), randomNum(255), randomNum(255));
	}
		
	@return conic-gradient($list, nth($list, 1));
}

div {
    width: 100vw;
    height: 100vh;
    background: randomConicGradient();
}

简单解释下上面的 SCSS 代码，

    randomNum() 用于生成随机数，randomNum(255) 相当于随机生成 1~255 的随机数；
    randomConicGradient() 用于生成整个 conic-gradient() 内的参数，也就是每一区间的颜色；
    vw 和 vh 是比较新的 CSS 单位，一个页面而言，它的视窗的高度就是 100vh，宽度就是 100vw 。

OK，刷新页面，得到如下效果图：

image

卧槽，很酷炫，bling bling 闪闪发光的感觉啊！而且是随机生成的各种颜色，所以每次刷新都有新体验有木有！！

blingblig

还没完，接下来给它加上旋转动画，蹬蹬蹬，旋转起来大概是这样：

rotate-conic

由于 GIF 图大小的限制，只看 GIF 没办法感受到全屏下那种科幻眩晕的感觉，墙裂建议你戳进来看看：

CodePen Demo -- conic-gradient Animation
脑洞时刻

到这里我还是不是很满足。想到了之前的 mix-blend-mode 属性。

    想了解 mix-blend-mode 这个属性，可以戳我看看：不可思议的颜色混合模式 mix-blend-mode

如果多个圆锥渐变层级叠加，并且运用上 mix-blend-mode 会发生什么？好可怕的想法...

xx

最终捣鼓出这种非常科幻的效果：

rotate-conic2

上图使用了 2 个半透明的圆锥渐变，相对反向进行旋转，并且在底层使用 mix-blend-mode: overlay 叠加了一个白黑径向渐变图层。可以看看代码及效果：

CodePen Demo -- conic-gradient Animation
在项目中使用 conic-gradient

上面的例子酷炫归酷炫，但是在项目中实用性不强。那么圆锥渐变是否能用于业务中的？答案是肯定的。

看看下面这个图，芝麻信用分背景渐变颜色条，不使用 JS，纯 CSS 借助 conic-gradient 如何画出来。

zhima

假设我们的结构如下：

<div class="bg">
    <div class="point"></div>
</div>

.bg {
    position: relative;
    margin: 50px auto;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: conic-gradient(#f1462c 0%, #fc5d2c 12.4%, #fff 12.5%, #fff 12.5%, #fc5d2c 12.5%, #fba73e 24.9%, #fff 24.9%, #fff 25%, #fba73e 25%, #e0fa4e 37.4%, #fff 37.4%, #fff 37.5%, #e0fa4e 37.5%, #12dd7e 49.9%, #fff 49.9%, #fff 50%, #12dd7e 50%, #0a6e3f 62.4%, #fff 62.4%, #fff 62.5%);
    transform: rotate(-112.5deg);
    transform-origin: 50% 50%;
}

.bg::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 370px;
    height: 370px;
    border-radius: 50%;
    background: #fff;
}

.bg::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: 
        radial-gradient(#fff 0%, #fff 25%, transparent 25%, transparent 100%),
        conic-gradient(#f1462c 0 12.5%, #fba73e 0 25%, #e0fa4e 0 37.5%, #12dd7e 0 50%, #0a6e3f 0 62.5%, #fff 0 100%);
        
}

.point {
    position: absolute;
    width: 30px;
    height: 30px;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    background: radial-gradient(#467dc6 0%, #a4c6f3 100%);
    border-radius: 50%;
    z-index: 999;
}

.point::before {
    content: "";
    position: absolute;
    width: 5px;
    height: 350px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(0);
    border-radius: 100% 100% 5% 5%;
    background: linear-gradient(
        180deg,
        #9bc7f6 0,
        #467dc6 50%,
        transparent 50%,
        transparent 100%
    );
    animation: rotate 3s cubic-bezier(.93, 1.32, .89, 1.15) infinite;
}

@keyframes rotate {
	50% {
		transform: translate(-50%, -50%) rotate(150deg);
	}
	100% {
		transform: translate(-50%, -50%) rotate(150deg);
	}
}

为了凸显 conic-gradient 的实用性，简单将二者合二为一，模拟了一下。看看效果，大功告成，所以说 conic-gradient 还是有用武之地的：

credit-conic

CodePen Demo -- 使用 conic-gradient 实现表盘信用分示例
圆锥渐变 conic-gradient polyfill 垫片库

看到这里，想必读者们都跃跃欲试这么神奇的属性。

但是，按照惯例，这种 “高科技” 通常兼容性都不怎么滴。conic-gradient 兼容性又如何呢？

非常惨烈，CSS 官方对其的描述是：

    处于修正阶段的模块(Modules in the revising phase)

    处于修正阶段的模块没有处于改善阶段的模块稳定。通常它们的语法还需要详细审查，说不定还会有很大的变化，而且不保证和之前的兼容。替代的语法通常经过测试并已经实现。

万幸的是，在文章开头我也提到了，感谢 LeaVerou 大神，让我们可以提前使用上这么美妙的属性。

LeaVerou 提供了一个垫片库，按照本文上述的语法，添加这个垫片库，就可以开心的使用起来啦。

    polyfill 是一个开发术语，在 Web 开发中，polyfill 垫片库的准确意思为：用于实现浏览器并不支持的原生API的代码。现在引申为实现浏览器并不支持的某些功能的兼容库。

你需要添加如下的 JS ，垫片库会按照 CSS 语法，生成对应的圆锥渐变图案，并且转化为 BASE64 代码：

<script src="//cdnjs.cloudflare.com/ajax/libs/prefixfree/1.0.7/prefixfree.min.js"></script>
<script src="//leaverou.github.io/conic-gradient/conic-gradient.js"></script>

    因为垫片库的作用是将我们的 CSS 语法转化成为 BASE64 代码替换 background-image: url() 中的内容，所以，上线后是不需要再添加这两个库的。

好了，本文到此结束，希望对你有帮助 :)

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

参考文献

CSS conic-gradient() polyfill