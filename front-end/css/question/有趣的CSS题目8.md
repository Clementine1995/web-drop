# 有趣的CSS题目8

>文章参考自[谈谈一些有趣的CSS题目（28）-- 不可思议的颜色混合模式 mix-blend-mode](https://github.com/chokcoco/iCSS/issues/16)
>
>文章参考自[不可思议的混合模式 background-blend-mode](https://github.com/chokcoco/iCSS/issues/31)
>
>文章参考自[谈谈一些有趣的CSS题目（31）-- 纯 CSS 实现波浪效果！](https://github.com/chokcoco/iCSS/issues/22)
>
>文章参考自[CSS新特性contain，控制页面的重绘与重排](https://github.com/chokcoco/iCSS/issues/23)

CSS3 新增了一个很有意思的属性 -- mix-blend-mode ，其中 mix 和 blend 的中文意译均为混合，那么这个属性的作用直译过来就是混合混合模式，当然，我们我们通常称之为混合模式。

混合模式最常见于 photoshop 中，是 PS 中十分强大的功能之一。当然，瞎用乱用混合模式谁都会，利用混合模式将多个图层混合得到一个新的效果，只是要用到恰到好处，或者说在 CSS 中利用混合模式制作出一些效果则需要对混合模式很深的理解及不断的尝试。

我个人对混合模式的理解也十分浅显，本文只是带领大家走进 CSS 混合模式的世界，初浅的了解混合模式及尝试使用它制作一些效果。
mix-blend-mode 概述

上文也说了，mix-blend-mode 描述了元素的内容应该与元素的直系父元素的内容和元素的背景如何混合。我们将 PS 中图层的概念替换为 HTML 中的元素。

看看可取的值有哪些：

{
  mix-blend-mode: normal;         // 正常
  mix-blend-mode: multiply;       // 正片叠底
  mix-blend-mode: screen;         // 滤色
  mix-blend-mode: overlay;        // 叠加
  mix-blend-mode: darken;         // 变暗
  mix-blend-mode: lighten;        // 变亮
  mix-blend-mode: color-dodge;    // 颜色减淡
  mix-blend-mode: color-burn;     // 颜色加深
  mix-blend-mode: hard-light;     // 强光
  mix-blend-mode: soft-light;     // 柔光
  mix-blend-mode: difference;     // 差值
  mix-blend-mode: exclusion;      // 排除
  mix-blend-mode: hue;            // 色相
  mix-blend-mode: saturation;     // 饱和度
  mix-blend-mode: color;          // 颜色
  mix-blend-mode: luminosity;     // 亮度
  
  mix-blend-mode: initial;
  mix-blend-mode: inherit;
  mix-blend-mode: unset;
}

除去 initial 默认、inherit 继承 和 unset 还原这 3 个所有 CSS 属性都可以取的值外，还有另外的 16 个具体的取值，对应不同的混合效果。

如果不是专业的 PSer 天天和混合模式打交道，想要记住这么多效果，还是挺困难的。不过有前人帮我们总结了一番，看看如何比较好的理解或者说记忆这些效果，摘自Photoshop中高级进阶系列之一——图层混合模式原理：

image

当然，上图是 PS 中的混合模式，数量比 CSS 中的多出几个，但是分类还是通用的。
mix-blend-mode 实例

眼见为实，要会使用 mix-blend-mode ，关键还是要迈出使用这一步。这里我写了一个简单的 Demo，包括了所有的混合模式，可以大概试一下各个模式的效果：

CodePen Demo

当然，仅仅是这样是感受不到混合模式的魅力的，下面就列举几个利用了混合模式制作的 CSS 动画。
使用 mix-blend-mode: screen 滤色模式制作 loading 效果

为了照顾某些访问 codepen 慢同学，特意制作了该效果的 Gif，看看效果：

mixmode-loading

CodePen Demo

这里使用了 mix-blend-mode: screen 滤色模式，这是一种提亮图像形混合模式。滤色的英文是 screen，也就是两个颜色同时投影到一个屏幕上的合成颜色。具体做法是把两个颜色都反相，相乘，然后再反相。简单记忆为"让白更白，而黑不变"。（不一定十分准确，如有错误还请指正）

我们将三个 div 按照不同延时(animation-delay)小幅度旋转起来，来达到一种很显眼很魔性的效果，适合做 loading 图。
使用 mix-blend-mode: difference 差值模式

再举个例子， mix-blend-mode: difference 差值模式。查看每个通道中的颜色信息，比较底色和绘图色，用较亮的像素点的像素值减去较暗的像素点的像素值。与白色混合将使底色反相；与黑色混合则不产生变化。

通俗一点就是上方图层的亮区将下方图层的颜色进行反相，暗区则将颜色正常显示出来，效果与原图像是完全相反的颜色。

看看利用了这个混合模式，运用在一些多图层效果里，可以产生十分绚烂的混合效果：

mixmode-different

CodePen Demo

上图看似复杂，其实了解原理之后非常的简单，6 个旋转的 div ，通过 mix-blend-mode: difference 混合在一起。
使用多混合模式制作文字故障效果

最后，想到我之前制作的一个文字故障效果，也可以很好的融合混合模式，制作出下列效果：

mixmode-word-break

CodePen Demo

不用怀疑你的眼睛，上图的效果是纯 CSS 实现的效果，运用了多种颜色混合模式实现颜色叠加，变亮等效果。

本文涉及的专业理论知识很少，没有用很大的篇幅去描述每一个混合模式的效果及作用。我对混合模式的理解也比较粗浅，本文旨在通过一些 Demo 让读者学会开始去使用这些混合模式效果，俗话说修行在个人，如果真的感兴趣的可以自行深入研究。

最后，看一眼兼容性吧，这种奇妙的属性兼容性通常都不怎么好，我之前几篇文章也提到过了，面向未来编程，所以本文的 CodePen Demo 都要求在 -webkit- 内核浏览器下观看：

image
最后

本文有下半篇：不可思议的混合模式 background-blend-mode，可以配合阅读，效果更好。

-----

本文接前文：不可思议的混合模式 mix-blend-mode 。由于 mix-blend-mode 这个属性的强大，很多应用场景和动效的制作不断完善和被发掘出来，遂另起一文继续介绍一些使用 mix-blend-mode 制作的酷炫动画。

CSS3 新增了一个很有意思的属性 -- mix-blend-mode ，其中 mix 和 blend 的中文意译均为混合，那么这个属性的作用直译过来就是混合混合模式，当然，我们我们通常称之为混合模式。

混合模式最常见于 photoshop 中，是 PS 中十分强大的功能之一。当然，瞎用乱用混合模式谁都会，利用混合模式将多个图层混合得到一个新的效果，只是要用到恰到好处，或者说在 CSS 中利用混合模式制作出一些效果则需要对混合模式很深的理解及不断的尝试。
mix-blend-mode 简介

关于 mix-blend-mode 最基本的用法和描述，可以简单看看上篇文章 不可思议的混合模式 mix-blend-mode 。
background-blend-mode 简介

除了 mix-blend-mode ，CSS 还提供一个 background-blend-mode 。也就是背景的混合模式。

    可以是背景图片与背景图片的混合，
    也可以是背景图片和背景色的之间的混合。

background-blend-mode 的可用取值与 mix-blend-mode一样，不重复介绍，下面直接进入应用阶段。
background-blend-mode 基础应用

对于 background-blend-mode ，最简单的应用就是将两个或者多个图片利用混合模式叠加在一起。假设我们存在下述两张图片，可以利用背景混合模式 background-blend-mode 叠加在一起：

person
timg

经过背景混合模式 background-blend-mode:lighten 处理之后：

image

CodePen Demo -- image mix by bg-blend-mode

当然，这里使用的是 background-blend-mode:lighten 变亮这个混合模式，核心代码如下：

<div class="container"></div>

.container {
    background: url($pic1), url($pic2);
    background-size: cover;
    background-blend-mode: lighten;
}

我们可以尝试其他的组合，也就是改变 background-blend-mode 的各种取值，将会得到各种不同的感官效果。
使用 background-blend-mode: difference 制作黑白反向动画

黑色白色这两种颜色，无疑是使用频率最高也是我认为最搭的两个颜色。当这两种颜色结合在一起，总是能碰撞出不一样的火花。

扯远了，借助 difference 差值混合模式，配合黑白 GIF，能产生奇妙的效果，假设我们拥有这样一张 GIF 图（图片来自网络，侵删）：

timg

利用 background-blend-mode: difference ，将它叠加到不同的黑白背景之下（黑白背景由 CSS 画出来）：

image

产生的效果如下：

bg-gif

CodePen Demo -- https://codepen.io/Chokcoco/pen/vpLWBW

我们可以尝试其他的组合，将会得到各种不同的感官效果。
使用 background-blend-mode 制作 hover 效果

想象一下，在上面第一个例子中，如果背景的黑白蒙层不是一开始就叠加在 GIF 图下，而是通过某些交互手段叠加上去。

应用这种方式，我们可以使用 background-blend-mode 来制作点击或者 hover 时候的蒙板效果。

假设我们有这样一张原图（黑白效果较好）：

image

通过混合渐变背景色，配合 Hover 效果，我们可以给这些图配上一些我们想要的色彩：

bgblendmodehover

CodePen Demo --background-blend-mode && Hover

代码非常简单，示意如下：

.pic {
    width: 300px;
    height: 200px;
    background: url($img),
        linear-gradient(#f00, #00f);
    background-size: cover, 100% 100%;
    background-position: 0 0, -300px 0;
    background-blend-mode: luminosity;
    background-repeat: no-repeat;
    transition: .5s background-position linear;
}

.pic:hover { 
    background-position: 0 0, 0 0; 
}

这里有几点需要注意的：

    这里使用了背景色渐变动画，背景色的渐变动画有几种方式实现（戳这里了解更多方法），这里使用的是位移 background-position
    实现上述效果使用的 background-blend-mode 不限制具体某一种混合模式，可以自己多尝试

使用 mix-blend-mode || background-blend-mode 改变图标的颜色

如果再运用上上一篇文章介绍的知识 两行 CSS 代码实现图片任意颜色赋色技术 ，我们可以实现 ICON 的颜色的动态改变。

假设我们有这样一张 ICON 图，注意主色是黑色，底色的白色（底色不是透明色），所以符合要求的 JPG、PNG、GIF 图都可以：

iconmonstr-cursor-31

利用 background-blend-mode: lighten 可以实现动态改变图标主色的效果：

bgblendhover

而且这里的具体颜色（渐变、纯色皆可），动画方向都可以可以随意控制的。

CodePen Demo -- bg-blend-mode && hover

又或者是这种 hover fadeIn 效果：

bgblendhover2

CodePen Demo -- mix-blend-mode && hover
使用 mix-blend-mode 制作文字背景图

我们将上面 ICON 这个场景延伸一下，ICON 图可以延伸为任意黑色主色白色底色图片，而颜色则可以是纯色、渐变色、或者是图片。

那么我们可以尝试让文字带上渐变色，或者说让文字透出图片。当然这个效果有一些 CSS 属性也可以完成。

譬如 background-clip: text 背景裁剪就可以让文字带上渐变色或者展示图片，可以戳这里看看 使用 background-clip 实现文字渐变。

这里我们使用 mix-blend-mode 也能够轻易实现，我们只需要构造出黑色文字，白色底色的文字 div ，叠加上图片，再运用 mix-blend-mode 即可，简单原理如下：

image

核心代码如下，可以看看：

<div class="container">
    <div class="pic"></div>
    <div class="text">IMAGE</div>
</div>

.pic {
    position: relative;
    width: 100%;
    height: 100%;
    background: url($img);
    background-repeat: no-repeat;
    background-size: cover;
}

.text {
    position: absolute;
    width:100%;
    height:100%;
    color: #000;
    mix-blend-mode: lighten;
    background-color: #fff;
}

CodePen Demo -- mix-blend-mode && TEXT IMAGE
最后

更多精彩 CSS 技术文章汇总在我的 Github -- iCSS ，持续更新，欢迎点个 star 订阅收藏。

-----

一直以来，使用纯 CSS 实现波浪效果都是十分困难的。

因为实现波浪的曲线需要借助贝塞尔曲线。

bezier

而使用纯 CSS 的方式，实现贝塞尔曲线，额，暂时是没有很好的方法。

fxxk

当然，借助其他力量（SVG、CANVAS），是可以很轻松的完成所谓的波浪效果的，先看看，非 CSS 方式实现的波浪效果。
使用 SVG 实现波浪效果

借助 SVG ，是很容易画出三次贝塞尔曲线的。

看看效果：

wave

代码如下：

<svg width="200px" height="200px" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <text class="liquidFillGaugeText" text-anchor="middle" font-size="42px" transform="translate(100,120)" style="fill: #000">50.0%</text>
    <!-- Wave -->
    <g id="wave">
        <path id="wave-2" fill="rgba(154, 205, 50, .8)" d="M 0 100 C 133.633 85.12 51.54 116.327 200 100 A 95 95 0 0 1 0 100 Z">
        <animate dur="5s" repeatCount="indefinite" attributeName="d" attributeType="XML" values="M0 100 C90 28, 92 179, 200 100 A95 95 0 0 1 0 100 Z;
                                    M0 100 C145 100, 41 100, 200 100 A95 95 0 0 1 0 100 Z;
                                    M0 100 C90 28, 92 179, 200 100 A95 95 0 0 1 0 100 Z"></animate>
        </path>
    </g>
    <circle cx="100" cy="100" r="80" stroke-width="10" stroke="white" fill="transparent"></circle>
    <circle cx="100" cy="100" r="90" stroke-width="20" stroke="yellowgreen" fill="none" class="percentage-pie-svg"></circle>
</svg>

CodePen Demo -- SVG Wave

画出三次贝塞尔曲线的核心在于 <path id="wave-2" fill="rgba(154, 205, 50, .8)" d="M 0 100 C 133.633 85.12 51.54 116.327 200 100 A 95 95 0 0 1 0 100 Z"> 这一段。感兴趣的可以自行去研究研究。
使用 canvas 实现波浪效果

使用 canvas 实现波浪效果的原理与 SVG 一样，都是利用路径绘制出三次贝塞尔曲线并赋予动画效果。

canvaswave

使用 canvas 的话，代码如下：

$(function() {
    let canvas = $("canvas");
    let ctx = canvas[0].getContext('2d');
    let radians = (Math.PI / 180) * 180;
    let startTime = Date.now();
    let time = 2000;
    let clockwise = 1;
    let cp1x, cp1y, cp2x, cp2y;
    
    // 初始状态
    // ctx.bezierCurveTo(90, 28, 92, 179, 200, 100);
    // 末尾状态
    // ctx.bezierCurveTo(145, 100, 41, 100, 200, 100);
    
    requestAnimationFrame(function waveDraw() {  
        let t = Math.min(1.0, (Date.now() - startTime) / time);
          
        if(clockwise) {
            cp1x = 90 + (55 * t);
            cp1y = 28 + (72 * t);
            cp2x = 92 - (51 * t);
            cp2y = 179 - (79 * t);
        } else {
            cp1x = 145 - (55 * t);
            cp1y = 100 - (72 * t);
            cp2x = 41 + (51 * t);
            cp2y = 100 + (79 * t);
        }
        
        ctx.clearRect(0, 0, 200, 200); 
        ctx.beginPath();
        ctx.moveTo(0, 100);
        // 绘制三次贝塞尔曲线
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, 200, 100);
        // 绘制圆弧
        ctx.arc(100, 100, 100, 0, radians, 0);
        ctx.fillStyle = "rgba(154, 205, 50, .8)";
        ctx.fill();
        ctx.save();  
        
        if( t == 1 ) {
            startTime = Date.now();
            clockwise = !clockwise;
        } 

        requestAnimationFrame(waveDraw);
    });
})

CodePen Demo -- Canvas Wave

主要是利用了动态绘制 ctx.bezierCurveTo() 三次贝塞尔曲线实现波浪的运动效果，感兴趣的可以自行研究。
纯 CSS 实现波浪效果

好，接下来才是本文的重点！使用纯 CSS 的方式，实现波浪的效果。

你 TM 在逗我？刚刚不是还说使用 CSS 无能为力吗？xx

是，我们没有办法直接绘制出三次贝塞尔曲线，但是我们可以利用一些讨巧的方法，模拟达到波浪运动时的效果，姑且把下面这种方法看作一种奇技淫巧。
原理

原理十分简单，我们都知道，一个正方形，给它添加 border-radius: 50%，将会得到一个圆形。

image

    border-radius：用来设置边框圆角，当使用一个半径时确定一个圆形。

好的，如果 border-radius 没到 50%，但是接近 50% ，我们会得到一个这样的图形：

image

注意边角，整个图形给人的感觉是有点圆，却不是很圆。额，这不是废话吗 dt

好的，那整这么个图形又有什么用？还能变出波浪来不成？

没错！就是这么神奇。:) 我们让上面这个图形滚动起来(rotate) ，看看效果：

bdrotate

可能很多人看到这里还没懂旋转起来的意图，仔细盯着一边看，是会有类似波浪的起伏效果的。

而我们的目的，就是要借助这个动态变换的起伏动画，模拟制造出类似波浪的效果。
实现

当然，这里看到是全景实现图，所以感觉并不明显，OK，让我们用一个个例子看看具体实现起来能达到什么样的效果。

我们利用上面原理可以做到的一种波浪运动背景效果图：

screenwave

后面漂浮的波浪效果，其实就是利用了上面的 border-radius: 45% 的椭圆形，只是放大了很多倍，视野之外的图形都 overflow: hidden ，只留下了一条边的视野，并且增加了一些相应的 transform 变换。

    注意，这里背景是蓝色静止的，运动是白色的椭圆形。

代码也很简单，SCSS 代码如下：

body {
    position: relative;
    align-items: center;
    min-height: 100vh;
    background-color: rgb(118, 218, 255);
    overflow: hidden;

    &:before, &:after {
        content: "";
        position: absolute;
        left: 50%;
        min-width: 300vw;
        min-height: 300vw;
        background-color: #fff;
        animation-name: rotate;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }

    &:before {
        bottom: 15vh;
        border-radius: 45%;
        animation-duration: 10s;
    }

    &:after {
        bottom: 12vh;
        opacity: .5;
        border-radius: 47%;
        animation-duration: 10s;
    }
}

@keyframes rotate {
    0% {
        transform: translate(-50%, 0) rotateZ(0deg);
    }
    50% {
        transform: translate(-50%, -2%) rotateZ(180deg);
    }
    100% {
        transform: translate(-50%, 0%) rotateZ(360deg);
    }
}

    为了方便写 DEMO，用到的长度单位是 VW 与 VH，不太了解这两个单位的可以戳这里：vh、vw、vmin、vmax 知多少

CodePen Demo -- Pure Css Wave

可能有部分同学，还存在疑问，OK，那我们把上面的效果缩小 10 倍，将视野之外的动画也补齐，那么其实生成波浪的原理是这样的：

scalewave

图中的虚线框就是我们实际的视野范围。

image
值得探讨的点

值得注意的是，要看到，这里我们生成波浪，并不是利用旋转的椭圆本身，而是利用它去切割背景，产生波浪的效果。那为什么不直接使用旋转的椭圆本身模拟波浪效果呢？因为

    中间高，两边低的效果不符合物理学原理，看上去十分别扭；

可以点进去看看下面这个例子：

CodePen Demo -- pure css wave
使用纯 CSS 实现波浪进度图

好，既然掌握了这种方法，下面我们就使用纯 CSS 实现上面最开始使用 SVG 或者 CANVAS 才能实现的波浪进度图。

HTML 结构如下：

<div class="container">
    <div class="wave"></div>
</div>

CSS 代码如下：

.wave {
    position: relative;
    width: 200px;
    height: 200px;
    background-color: rgb(118, 218, 255);
    border-radius: 50%;
 
    &::before,
    &::after{
        content: "";
        position: absolute;
        width: 400px;
        height: 400px;
        top: 0;
        left: 50%;
        background-color: rgba(255, 255, 255, .4);
        border-radius: 45%;
        transform: translate(-50%, -70%) rotate(0);
        animation: rotate 6s linear infinite;
        z-index: 10;
    }
    
    &::after {
        border-radius: 47%;
        background-color: rgba(255, 255, 255, .9);
        transform: translate(-50%, -70%) rotate(0);
        animation: rotate 10s linear -5s infinite;
        z-index: 20;
    }
}

@keyframes rotate {
    50% {
        transform: translate(-50%, -73%) rotate(180deg);
    } 100% {
        transform: translate(-50%, -70%) rotate(360deg);
    }
}

效果图：

waveloading

CodePen Demo -- Pure Css Wave Loading

虽然效果差了一点点，但是相较于要使用学习成本更高的 SVG 或者 CANVAS，这种纯 CSS 方法无疑可使用的场景更多，学习成本更低！
一些小技巧

单纯的让一个 border-radius 接近 50 的椭圆形旋转，动画效果可能不是那么逼真，我们可以适当的添加一些其他变换因素，让动画效果看上去更真实：

    在动画过程中，动态的改变 border-radius 的值；
    在动画过程中，利用 transform 对旋转椭圆进行轻微的位移、变形；
    上面也演示到了，多个椭圆同时转动，赋予不同时长的动画，并且添加轻微的透明度，让整个效果更佳逼真。

-----

在介绍新的 CSS 属性 contain 之前，先简单介绍一下什么是页面的重绘与重排。

发现之前已经描述过很多次了，可以看看这个提高 CSS 动画性能的正确姿势。

OK，下面进入本文正题，
contain 为何？

contain 属性允许我们指定特定的 DOM 元素和它的子元素，让它们能够独立于整个 DOM 树结构之外。目的是能够让浏览器有能力只对部分元素进行重绘、重排，而不必每次都针对整个页面。

    The contain property allows an author to indicate that an element and its contents are, as much as possible, independent of the rest of the document tree. This allows the browser to recalculate layout, style, paint, size, or any combination of them for a limited area of the DOM and not the entire page.

contain 语法

看看它的语法：

{
  /* No layout containment. */
  contain: none;
  /* Turn on containment for layout, style, paint, and size. */
  contain: strict;
  /* Turn on containment for layout, style, and paint. */
  contain: content;
  /* Turn on size containment for an element. */
  contain: size;
  /* Turn on layout containment for an element. */
  contain: layout;
  /* Turn on style containment for an element. */
  contain: style;
  /* Turn on paint containment for an element. */
  contain: paint;
}