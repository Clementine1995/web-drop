# 有趣的CSS题目9

>文章参考自[fixed 定位失效 | 不受控制的 position:fixed](https://github.com/chokcoco/iCSS/issues/24)
>
>文章参考自[你所不知道的 CSS 动画技巧与细节](https://github.com/chokcoco/iCSS/issues/27)
>
>文章参考自[你所不知道的 CSS 滤镜技巧与细节](https://github.com/chokcoco/iCSS/issues/30)
>
>文章参考自[谈谈一些有趣的CSS题目（29）-- text-fill-color 与 color 的异同](https://github.com/chokcoco/iCSS/issues/17)

本文为纯理论文章，可能会略微枯燥。

大家都知道，position:fixed 在日常的页面布局中非常常用，在许多布局中起到了关键的作用。它的作用是：

position:fixed 的元素将相对于屏幕视口（viewport）的位置来指定其位置。并且元素的位置在屏幕滚动时不会改变。

但是，在许多特定的场合，指定了 position:fixed 的元素却无法相对于屏幕视口进行定位。这是为何呢？

xx
失效的 position:fixed

在许多情况下，position:fixed 将会失效。MDN 用一句话概括了这种情况：

    当元素祖先的 transform 属性非 none 时，容器由视口改为该祖先。

What！还有这种操作？可能有部分同学还没 get 到上面这句话的意思，通俗的讲就是指定了 position:fixed 的元素，如果其祖先元素存在非 none 的 transform 值 ，那么该元素将相对于设定了 transform 的祖先元素进行定位。

那么，为什么会发生这种情况呢？说好的相对视口（Viewport）定位呢？

这个问题，就牵涉到了 Stacking Context ，也就是堆叠上下文的概念了。解释上面的问题分为两步：

    任何非 none 的 transform 值都会导致一个堆叠上下文（Stacking Context）和包含块（Containing Block）的创建。

    由于堆叠上下文的创建，该元素会影响其子元素的固定定位。设置了 position:fixed 的子元素将不会基于 viewport 定位，而是基于这个父元素。

Stacking Context -- 堆叠上下文

好的嘛，好的嘛，又冒出新的名词了，堆叠上下文（又译作层叠上下文），又是什么？

堆叠上下文（Stacking Context）：堆叠上下文是 HTML 元素的三维概念，这些 HTML 元素在一条假想的相对于面向（电脑屏幕的）视窗或者网页的用户的 z 轴上延伸，HTML 元素依据其自身属性按照优先级顺序占用层叠上下文的空间。

概念比较抽象，简单理解，记住 生成了 Stacking Context 的元素会影响该元素的层叠关系与定位关系。

关于 生成了 Stacking Context 的元素会影响该元素的层叠关系 这一点，具体可以看看这篇文章 层叠顺序（stacking level）与堆栈上下文（stacking context）知多少？

而本文提到了生成了 Stacking Context 的元素会影响该元素定位关系 。按照上面的说法，堆叠上下文的创建，该元素会影响其子元素的固定定位。设置了 position:fixed 的子元素将不会基于 viewport 定位，而是基于这个父元素。

那么问题来了，是否所有能够生成堆叠上下文的元素，都会使得其子元素的 position:fixed 相对它，而不是相对视口（Viewport）进行定位呢？
创建堆叠上下文的方式

为此，首先要找到所有能够使元素生成堆叠上下文的方法。

So，如何触发一个元素形成 堆叠上下文 ？方法如下（参考自 MDN）：

    根元素 (HTML),
    z-index 值不为 "auto"的 绝对/相对定位，
    一个 z-index 值不为 "auto"的 flex 项目 (flex item)，即：父元素 display: flex|inline-flex，
    opacity 属性值小于 1 的元素（参考 the specification for opacity），
    transform 属性值不为 "none"的元素，
    mix-blend-mode 属性值不为 "normal"的元素，
    filter值不为“none”的元素，
    perspective值不为“none”的元素，
    isolation 属性被设置为 "isolate"的元素，
    position: fixed
    在 will-change 中指定了任意 CSS 属性，即便你没有直接指定这些属性的值
    -webkit-overflow-scrolling 属性被设置 "touch"的元素

接下来，我们要验证，是否所有设置了上面属性样式之一的元素，都有使其子元素的 position: fixed 失效的能力？

为此我做了下面一个小实验，基于最新的 Blink 内核。可戳：

层叠上下文对 fixed 定位的影响（不同内核下表现可能不一致）

image

我们设置两个父子 div，子元素 fixed 定位，通过修改父元素生成层叠上下文，观察子元素的 fixed 定位是否不再相对视口。

<div class="container"> 
  <div class="fixed"> </div>
</div>

最初的 CSS ：

.container {
    width:10vw;
    height: 10vw;
    background: rgba(255, 100, 100, .8);
}

.fixed {
    position: fixed;
    top: 1vw;
    left: 1vw;
    right: 1vw;
    bottom: 1vw;
    background: rgba(100, 100, 255, .8);
}

一探 position:fixed 失效的最终原因

通过上面的试验，在最新的 Blink 内核下，发现并不是所有能够生成层叠上下文的元素都会使得 position:fixed 失效，但也不止 transform 会使 position:fixed 失效。

所以，MDN 关于 position:fixed 的补充描述不够完善。下述 4 种方式目前都会使得 position:fixed 定位的基准元素改变（本文重点）：

    transform 属性值不为 none 的元素
    设置了 transform-style: preserve-3d 的元素
    perspective 值不为 none 的元素
    在 will-change 中指定了任意 CSS 属性

不同内核的不同表现

完了吗？没有！我们再看看其他内核下的表现。
image

上面也谈到了，上述结论是在最新的 Chrome 浏览器下（Blink内核），经过测试发现，在 MAC 下的 Safari 浏览器（WebKit内核，Version 9.1.2 (11601.7.7)）和 IE Trident/ 内核及 Edge 浏览器下，上述三种方式都不会改变 position: fixed 的表现！

所以，当遇到 position: fixed 定位基准元素改变的时候，需要具体问题具体分析，多尝试一下，根据需要兼容适配的浏览器作出调整，不能一概而论。
position: fixed 的其他问题

当然，position: fixed 在移动端实现头部、底部模块定位。或者是在 position: fixed 中使用了 input 也会存在一些问题，这个有很多文章都描述过并且存在很多解决方案，本文不讨论这块问题。

这方面的问题，可以看看这篇文章：[移动端web页面使用position:fixed问题总结](https://github.com/maxzhang/maxzhang.github.com/issues/2)

-----

怕标题起的有点大，下述技巧如果你已经掌握了看看就好，欢迎斧正，本文希望通过介绍一些 CSS 不太常用的技巧，辅以一些实践，让读者可以更加深入的理解掌握 CSS 动画。

废话少说，直接进入正题，本文提到的动画不加特殊说明，皆指 CSS 动画。
正负旋转相消

嗯。名字起的很奇怪，好像数学概念一样。image

在动画中，旋转是非常常用的属性，

{
  transform: rotate(90deg);
}

那旋转有一些什么高级点的技巧呢？当然是可以改变 transfrom-origin ，改变旋转中心点啦。

image

开个玩笑，改变旋转中心点这个估计大家都知道了，这里要介绍的技巧是利用父级元素正反两个方向的旋转，来制作一些酷炫的 3d 效果。

首先假设一下场景，我们有这样的一层 HTML 结构：

<div class="reverseRotate">
    <div class="rotate">
        <div class="content">正负旋转相消3D动画</div>
    </div>
</div>

样式如下：

image

.content 内是我们的主要内容，好了，现在想象一下，如果祖先元素 .rotate 进行正向 linear 360° 旋转，父级元素 .reverseRotate 进行反向 linear 360° 旋转，效果回是啥样？

CSS 代码如下：

.rotate {
    animation: rotate 5s linear infinite; 
}

.reverseRotate {
    animation: reverseRotate 5s linear infinite; 
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes reverseRotate {
    100% {
        transform: rotate(-360deg);
    }
}

神奇！因为一正一反的旋转，且缓动函数一样，所以整个 content 看上去依然是静止的！注意，这里整个 content 静止的非常重要。

有读者看到这里就要骂街了，作者你个智障，静止了不就没动画了吗？哪来的动画技巧？

image

别急！虽然看上去是静止的，但是其实祖先两个元素都是在旋转的！这会看上去风平浪静的效果底下其实是暗流涌动。用开发者工具选取最外层祖先元素是这样的：

rotate

既然如此，我们继续思考，如果我在其中旋转的一个祖先元素上，添加一些别的动画会是什么效果？想想就很刺激啊。image

为了和文案里面的 3D 动画扯上关系，我们先给这几个元素添加 3D 转换：

div {
    transform-style: preserve-3d;
    perspective: 500px;
}

接着，尝试修改上面的旋转动画，在内层旋转上额外添加一个 rotateX：

@keyframes rotate {
    0% {
        transform: rotateX(0deg) rotateZ(0deg);
    }
    50% {
        transform: rotateX(40deg) rotateZ(180deg);
    }
    100% {
        transform: rotateX(0deg) rotateZ(360deg);
    }
}

效果如下：

reverserotate

Wow，这里需要好好理解一下。由于内容 content 层是静止的但其实外层两个图层都在旋转，通过设置额外的 rotateX(40deg) ，相当于叠加多了一个动画，由于正反旋转抵消了，所有整个动画只能看到旋转的 rotateX(40deg) 这个动画，产生了上述的效果。

CodePen Demo -- Css正负旋转相消动画
动画相同，缓动不同

好的，继续下一个小技巧。

有的时候我们页面存在一些具有相同动画的元素，为了让动画不那么死板，我们可以给相同的动画，赋予不同的缓动函数，来达到动画效果。

假设我们有如下的结构：

<div class="container">
    <div class="ball ball1"></div>
    <div class="ball ball2"></div>
    <div class="ball ball3"></div>
</div>

样式如下：

image

我们给它们相同的动画，但是赋予不一样的缓动函数（animation-timing-function），就像这样：

.ball1 {
    animation: move 1s ease-in infinite alternate;
}

.ball2 {
    animation: move 1s linear infinite alternate;
}

.ball3 {
    animation: move 1s ease-out infinite alternate;
}

@keyframes move {
    100% {
        transform: translateY(5vw);
    }
}

这样，一个简单的 loading 效果就制作好了。（当然这个技巧比较简单，学会合理运用是关键）

animationtimingf

CodePen Demo -- 动画相同，缓动不同
奇妙的缓动

缓动函数 timing-function 在动画中占据了非常重要的地位。

当你不想使用 CSS 默认提供的 linear、ease-in、ease-out 之类缓动函数的，可以自定义 cubic-bezier(1, 1, 0, 0)，这里有个非常好用的工具推荐，下面这个网站，可以方便的调出你需要的缓动函数并且拿到对应的 cubic-bezier 。

cubic-bezier.com
过渡取消

我们在制作页面的时候，为了让页面更加有交互感，会给按钮，阴影，颜色等样式添加过渡效果，配合 hover 一起使用。

这个是常规思维，如果我们的元素一开始是没有过渡效果，只有 hover 上去才给它添加一个过渡，又或者一开始元素是有过渡效果的，当我们 hover 上去时，取消它的过渡，会碰撞出什么样的火花呢？

使用这个技巧（也许算不上技巧，纯粹好玩），我们可以制作出一些有趣的效果，例如下面这个感觉是利用就 JS 才完成的动画，其实是纯 CSS 动画：

transitionstop

其实就小圆圈是元素默认是带有 transition 的，只有在 hover 上去的时候，取消它的过渡，简单的过程：

    由于一开始它的颜色的透明的，而 hover 的时候会赋予它颜色值，但是由于 hover 时过渡被取消了，所有它会直接显示。

    hover 离开的时候，它的原本的过渡又回来了，这个时候它会从有颜色到透明值缓慢渐变消失。

可以戳这里感受一下：

CodePen Demo -- Cancle transition
动画层级的控制，保持动画层级在最上方

这个问题可能有一点难理解。需要了解 CSS 动画渲染优化的相关知识。

先说结论，动画层级的控制的意思是尽量让需要进行 CSS 动画的元素的 z-index 保持在页面最上方，避免浏览器创建不必要的图形层（GraphicsLayer），能够很好的提升渲染性能。

OK，再一次提到了图形层（GraphicsLayer），这是一个浏览器渲染原理相关的知识（WebKit/blink内核下）。

image

简单来说，浏览器为了提升动画的性能，为了在动画的每一帧的过程中不必每次都重新绘制整个页面。在特定方式下可以触发生成一个合成层，合成层拥有单独的 GraphicsLayer。

需要进行动画的元素包含在这个合成层之下，这样动画的每一帧只需要去重新绘制这个 Graphics Layer 即可，从而达到提升动画性能的目的。

那么一个元素什么时候会触发创建一个 Graphics Layer 层？从目前来说，满足以下任意情况便会创建层：

    硬件加速的 iframe 元素（比如 iframe 嵌入的页面中有合成层）
    硬件加速的插件，比如 flash 等等
    使用加速视频解码的 元素
    3D 或者 硬件加速的 2D Canvas 元素
    3D 或透视变换(perspective、transform) 的 CSS 属性
    对自己的 opacity 做 CSS 动画或使用一个动画变换的元素
    拥有加速 CSS 过滤器的元素
    元素有一个包含复合层的后代节点(换句话说，就是一个元素拥有一个子元素，该子元素在自己的层里)
    元素有一个 z-index 较低且包含一个复合层的兄弟元素

本题中说到的动画层级的控制，原因就在于上面生成层的最后一条：

    元素有一个 z-index 较低且包含一个复合层的兄弟元素。

这里是存在坑的地方，首先我们要明确两点：

    我们希望我们的动画得到 GPU 硬件加速，所以我们会利用类似 transform: translate3d() 这样的方式生成一个 Graphics Layer 层。
    Graphics Layer 虽好，但不是越多越好，每一帧的渲染内核都会去遍历计算当前所有的 Graphics Layer ，并计算他们下一帧的重绘区域，所以过量的 Graphics Layer 计算也会给渲染造成性能影响。

记住这两点之后，回到上面我们说的坑。

假设我们有一个轮播图，有一个 ul 列表，结构如下：

<div class="container">
    <div class="swiper">轮播图</div>
    <ul class="list">
        <li>列表li</li>
        <li>列表li</li>
        <li>列表li</li>
        <li>列表li</li>
    </ul>
</div>

假设给他们定义如下 CSS：

.swiper {
    position: static;
    animation: 10s move infinite;
}
    
.list {
    position: relative;
}

@keyframes move {
    100% {
        transform: translate3d(10px, 0, 0);
    }
}

由于给 .swiper 添加了 translate3d(10px, 0, 0) 动画，所以它会生成一个 Graphics Layer，如下图所示，用开发者工具可以打开层的展示，图形外的黄色边框即代表生成了一个独立的复合层，拥有独立的 Graphics Layer 。

image

但是！在上面的图中，我们并没有给下面的 list 也添加任何能触发生成 Graphics Layer 的属性，但是它也同样也有黄色的边框，生成了一个独立的复合层。

原因在于上面那条元素有一个 z-index 较低且包含一个复合层的兄弟元素。我们并不希望 list 元素也生成 Graphics Layer ，但是由于 CSS 层级定义原因，下面的 list 的层级高于上面的 swiper，所以它被动的也生成了一个 Graphics Layer 。

使用 Chrome，我们也可以观察到这种层级关系，可以看到 .list 的层级高于 .swiper：

image

所以，下面我们修改一下 CSS ，改成：

.swiper {
    position: relative;
    z-index: 100;
}
    
.list {
    position: relative;
}

这里，我们明确使得 .swiper 的层级高于 .list ，再打开开发者工具观察一下：

image

可以看到，这一次，.list 元素已经没有了黄色外边框，说明此时没有生成 Graphics Layer 。再看看层级图：

image

此时，层级关系才是我们希望看到的，.list 元素没有触发生成 Graphics Layer 。而我们希望需要硬件加速的 .swiper 保持在最上方，每次动画过程中只会独立重绘这部分的区域。
总结

这个坑最早见于张云龙发布的这篇文章CSS3硬件加速也有坑，这里还要总结补充的是：

    GPU 硬件加速也会有坑，当我们希望使用利用类似 transform: translate3d() 这样的方式开启 GPU 硬件加速，一定要注意元素层级的关系，尽量保持让需要进行 CSS 动画的元素的 z-index 保持在页面最上方。

    Graphics Layer 不是越多越好，每一帧的渲染内核都会去遍历计算当前所有的 Graphics Layer ，并计算他们下一帧的重绘区域，所以过量的 Graphics Layer 计算也会给渲染造成性能影响。

    可以使用 Chrome ，用上面介绍的两个工具对自己的页面生成的 Graphics Layer 和元素层级进行观察然后进行相应修改。

    上面观察页面层级的 chrome 工具非常吃内存？好像还是一个处于实验室的功能，分析稍微大一点的页面容易直接卡死，所以要多学会使用第一种观察黄色边框的方式查看页面生成的 Graphics Layer 这种方式。

数字动画

很多技巧单独拿出来可能都显得比较单薄，我觉得最重要的是平时多积累，学会融会贯通，在实际项目中灵活组合运用，最近项目需要一个比较富有科技感的数字计数器，展示在线人数的不断增加。因为是内部需求，没有设计稿，靠前端自由发挥。

运用了上面提到的一些小技巧，参考了一些 CodePen 上的效果，整了个下述的 3D 数字计数效果，纯 CSS 实现，效果图如下：

numbercount

CodePen Demo -- 3d Number Count

-----

承接上一篇你所不知道的 CSS 动画技巧与细节，本文主要介绍 CSS 滤镜的不常用用法，希望能给读者带来一些干货！

OK，下面直接进入正文。本文所描述的滤镜，指的是 CSS3 出来后的滤镜，不是 IE 系列时代的滤镜，语法如下，还未接触过这个属性的可以先简单到 MDN -- filter 了解下：

{
    filter: blur(5px);
    filter: brightness(0.4);
    filter: contrast(200%);
    filter: drop-shadow(16px 16px 20px blue);
    filter: grayscale(50%);
    filter: hue-rotate(90deg);
    filter: invert(75%);
    filter: opacity(25%);
    filter: saturate(30%);
    filter: sepia(60%);

    /* Apply multiple filters */
    filter: contrast(175%) brightness(3%);

    /* Global values */
    filter: inherit;
    filter: initial;
    filter: unset;
}

基本用法

先简单看看几种滤镜的效果：

image

CodePen Demo -- Css3 filter

你可以通过 hover 取消滤镜，观察该滤镜的效果。

简单来说，CSS 滤镜就是提供类似 PS 的图形特效，像模糊，锐化或元素变色等功能。通常被用于调整图片，背景和边界的渲染。本文就会围绕这些滤镜展开，看看具体能怎么使用或者玩出什么花活。

image
常用用法

既然是标题是你所不知道的技巧与细节，那么比较常用的一些用法就不再赘述，通常我们见得比较多的 CSS 滤镜用法有：

    使用 filter: blur() 生成毛玻璃效果
    使用 filter: drop-shadow() 生成整体阴影效果
    使用 filter: opacity() 生成透明度

如果对上面的技巧不是很了解，可以稍稍百度谷歌一下，下文将由浅及深，介绍一些不大常见的滤镜的具体用法及一些小细节：
contrast/brightness -- hover 增亮图片

通常页面上的按钮，都会有 hover/active 的颜色变化，以增强与用户的交互。但是一些图片展示，则很少有 hover 的交互，运用 filter: contrast() 或者 filter: brightness() 可以在 hover 图片的时候，调整图片的对比图或者亮度，达到聚焦用户视野的目的。

    brightness表示亮度，contrast 表示对比度。

当然，这个方法同样适用于按钮，简单的 CSS 代码如下：

.btn:hover,
.img:hover {
    transition: filter .3s;
    filter: brightness(1.1) contrast(110%);
}

filterhover

CodePen Demo -- CSS3 filter hover IMG
blur -- 生成图像阴影

通常而言，我们生成阴影的方式大多是 box-shadow 、filter: drop-shadow() 、text-shadow 。但是，使用它们生成阴影是阴影只能是单色的。

有读者同学会问了，你这么说，难道还可以生成渐变色的阴影不成？
image

额，当然不行。

image

这个真不行，但是通过巧妙的利用 filter: blur 模糊滤镜，我们可以假装生成渐变色或者说是颜色丰富的阴影效果。

假设我们有下述这样一张头像图片：

image

下面就利用滤镜，给它添加一层与原图颜色相仿的阴影效果，核心 CSS 代码如下：

.avator {
    position: relative;
    background: url($img) no-repeat center center;
    background-size: 100% 100%;
    
    &::after {
        content: "";
        position: absolute;
        top: 10%;
        width: 100%;
        height: 100%;
        background: inherit;
        background-size: 100% 100%;
        filter: blur(10px) brightness(80%) opacity(.8);
        z-index: -1;
    }
}

看看效果：

image

其简单的原理就是，利用伪元素，生成一个与原图一样大小的新图叠加在原图之下，然后利用滤镜模糊 filter: blur() 配合其他的亮度/对比度，透明度等滤镜，制作出一个虚幻的影子，伪装成原图的阴影效果。

嗯，最重要的就是这一句 filter: blur(10px) brightness(80%) opacity(.8); 。

CodePen Demo -- filter create shadow
blur 混合 contrast 产生融合效果

接下来介绍的这个，是本文的重点，模糊滤镜叠加对比度滤镜产生的融合效果。让你知道什么是 CSS 黑科技！

单独将两个滤镜拿出来，它们的作用分别是：

    filter: blur()： 给图像设置高斯模糊效果。
    filter: contrast()： 调整图像的对比度。

但是，当他们“合体”的时候，产生了奇妙的融合现象。

先来看一个简单的例子：

filtermix

CodePen Demo -- filter mix between blur and contrast

仔细看两圆相交的过程，在边与边接触的时候，会产生一种边界融合的效果，通过对比度滤镜把高斯模糊的模糊边缘给干掉，利用高斯模糊实现融合效果。

上述效果的实现基于两点：

    图形是在被设置了 filter: contrast() 的画布背景上进行动画的
    进行动画的图形被设置了 filter: blur()（ 进行动画的图形的父元素需要是被设置了 filter: contrast() 的画布）

意思是，上面两圆运动的背后，其实是叠加了一张设置了 filter: contrast() 的大白色背景，而两个圆形则被设置了 filter: blur() ，两个条件缺一不可。

当然，背景色不一定是白色，我们稍稍修改上面的Demo，简单的示意图如下：

image
燃烧的火焰

好，上面介绍完原理，下面看看使用这个效果制作的一些强大 CSS 效果，其中最为惊艳的就是使用融合效果制作生成火焰，这个效果我最早是见于 Yusuke Nakaya 这位作者：

filterfire

不用怀疑你的眼睛，上述 GIF 效果就是使用纯 CSS 实现的。

核心还是 filter: contrast() 与 filter: blur() 配合使用，不过实现的过程也非常有趣，我们需要使用 CSS 画出一个火焰形状。

火焰形状 CSS 核心代码如下：

.fire {
    width: 0;
    height: 0;
    border-radius: 45%;
    box-sizing: border-box;
    border: 100px solid #000;
    border-bottom: 100pxsolid transparent;
    background-color: #b5932f;
    transform: scaleX(.4);
    filter: blur(20px) contrast(30);
}

大概是长这样：

image

分解一下过程：

image

放在纯黑的背景下，就得到了上述图片的效果。

    这里会有个很大的疑问，增加了 filter: blur(20px) contrast(30); 之后，为什么纯色黑色和黄色的中间，生成了一条红色的边框？

    这里我咨询了几个设计师、前端同事，得到的答复大概是两个不同滤镜的色值处理算法在边界处叠加作用得到了另外一种颜色。（不一定准确，求赐教），在 PS 里尝试还原这个效果，但是 PS 没有 contrast() 滤镜，得到的效果偏差挺大的。

OK，继续正文，接下来，我们只需要在火焰 .fire 这个 div 内部，用大量的黑色圆形，由下至上，无规律穿过火焰即可。由于滤镜的融合效果，火焰效果随之产生，这里为了方便理解，我把背景色切换成白色，火焰动画原理一看即懂：

fireanimation

具体完整实现可以看这里：

CodePen Demo -- CSS fire | CSS filter mix
文字融合动画

另外，我们可以在动画的过程中，动态改变元素滤镜的 filter: blur() 的值。

利用这个方法，我们还可以设计一些文字融合的效果：

wordanimation

bluranimation

具体实现你可以看这里：

CodePen Demo -- word animation | word filter
值得注意的细节点

动画虽然美好，但是具体使用的过程中，仍然有一些需要注意的地方：

    CSS 滤镜可以给同个元素同时定义多个，例如 filter: contrast(150%) brightness(1.5) ，但是滤镜的先后顺序不同产生的效果也是不一样的；

    也就是说，使用 filter: contrast(150%) brightness(1.5) 和 filter: brightness(1.5) contrast(150%) 处理同一张图片，得到的效果是不一样的，原因在于滤镜的色值处理算法对图片处理的先后顺序。

    滤镜动画需要大量的计算，不断的重绘页面，属于非常消耗性能的动画，使用时要注意使用场景。记得开启硬件加速及合理使用分层技术；
    blur() 混合 contrast() 滤镜效果，设置不同的颜色会产生不同的效果，这个颜色叠加的具体算法本文作者暂时也不是很清楚，使用时比较好的方法是多尝试不同颜色，观察取最好的效果；
    CSS3 filter 兼容性不算太好，但是在移动端已经可以比较正常的使用，更为精确的兼容性列表，查询 Can i Use。

    更新于 2017-09-20，关于 blur 与 contrast 的融合算法，可以看看我这位大腿同事给出的解释：滤镜算法以及WebGL实现

结语

好了，本文到此结束，希望对你有帮助 :)

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

-----

挺有意思的。大部分人都知道 color ，但是只有很少一部分人知道 text-fill-color 。

那么，text-fill-color 究竟是何方神圣呢？从字面意思理解，直译就是文本填充颜色，其实它与 color 的作用是一样的，为文字设定颜色值。

而且，text-fill-color 会覆盖 color 所定义的字体颜色，也就是前者的优先级更高。可以看看这个 Demo：

CodePen -- Demo

那么，有了 color ，为何还多此一举出现了一个 text-fill-color？
text-fill-color 与 color 的差异

关于这个说法，网上大部分文章给出的解释是，text-fill-color 可以设置 transparent 关键字，也就是使文字透明，而 color 无法设置 transparent 关键字。

这个说法是不准确的。

在 CSS3 之前，transparent 关键字不是一个真实的颜色，只能用于 background-color 和 border-color
中，表示一个透明的颜色。而在支持 CSS3 的浏览器中，它被重新定义为一个真实的颜色，transparent 可以用于任何需要 color 值的地方，也就是 color 属性是支持 transparent 的。

text-fill-color 与 color 的最大的差异，我觉得是 text-fill-color 的概念是借鉴了 SVG 图形，从 SVG 引进的，而 color 是传统意义上 CSS 的概念。

    在 SVG 中，我们使用 fill 内联属性给 SVG 图形文本上色。

text-fill-color 的兼容性

相比之下，其实 text-fill-color 的兼容性更差，大部分时候，我们使用它需要加上 -webkit- 前缀。

看看 Can i use :

image
配合 text-stroke

说到 text-fill-color， 可以顺便再提一下 text-stroke，它也是 SVG 引进的概念，与 border 类似，不同的是它可以给文字描边。看看下面这个 Demo：

CodePen -- Demo