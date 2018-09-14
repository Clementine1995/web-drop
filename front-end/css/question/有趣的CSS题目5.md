# 有趣的CSS题目3

>文章参考自[谈谈一些有趣的CSS题目（18）-- 使用 position:sticky 实现粘性布局](https://github.com/chokcoco/iCSS/issues/8)
>
>文章参考自[谈谈一些有趣的CSS题目（19）-- 深入探讨 CSS 特性检测](https://github.com/chokcoco/iCSS/issues/9)
>
>文章参考自[谈谈一些有趣的CSS题目（20）-- 巧妙地制作背景色渐变动画！](https://github.com/chokcoco/iCSS/issues/10)

问，CSS 中 position 属性的取值有几个？
大部分人的回答是，大概是下面这几个吧？

{
    position: static;
    position: relative;
    position: absolute;
    position: fixed;
}

额，其实，我们还可以有这 3 个取值：

{
    /* 全局值 */
    position: inherit;
    position: initial;
    position: unset;
}

没了吗？偶然发现其实还有一个处于实验性的取值，position:sticky（戳我查看MDN解释）：

{
    position: sticky;
}

卧槽，什么来的？

fakerfder

前端发展太快，新东西目接不暇，但是对于有趣的东西，还是忍不住一探究竟。（只怪当初...）
初窥 position:sticky

sticky 英文字面意思是粘，粘贴，所以姑且称之为粘性定位。下面就来了解下这个处于实验性的取值的具体功能及实用场景。

这是一个结合了 position:relative 和 position:fixed 两种定位功能于一体的特殊定位，适用于一些特殊场景。

什么是结合两种定位功能于一体呢？

元素先按照普通文档流定位，然后相对于该元素在流中的 flow root（BFC）和 containing block（最近的块级祖先元素）定位。

而后，元素定位表现为在跨越特定阈值前为相对定位，之后为固定定位。

这个特定阈值指的是 top, right, bottom 或 left 之一，换言之，指定 top, right, bottom 或 left 四个阈值其中之一，才可使粘性定位生效。否则其行为与相对定位相同。
不乐观的兼容性

在讲述具体示例之前，还是很有必要了解一下 position:sticky 的兼容性，嗯，不乐观的兼容性。

看看 CANIUSE 下的截图：

image
image

SHIT，这么好的属性支持性居然这么惨淡。

shit

IOS 家族（SAFARI && IOS SAFARI）和 Firefox 很早开始就支持 position:sticky 了。而 Chrome53~55 则需要启用实验性网络平台功能才行。其中 webkit 内核的要添加上私有前缀 -webkit-。
Chrome 53~55 开启 #enable-experimental-web-platform-features

地址栏输入 chrome://flags/ ，找到 enable-experimental-web-platform-features ，选择启用：

image

所以下面的 CodePen 示例，需要上述几个浏览器下观看。
position:sticky 示例

嗯，上面的文字描述估计还是很难理解，看看下面这张 GIF 图，想想要实现的话，使用 JS + CSS 的方式该如何做：

sticky

按照常规做法，大概是监听页面 scroll 事件，判断每一区块距离视口顶部距离，超过了则设定该区块 position:fixed，反之去掉。

而使用 position:sticky ，则可以非常方便的实现（请在 SAFARI 或者 CHROME53+ 下观看）：
<iframe height='265' scrolling='no' title='positionSticky' src='//codepen.io/Chokcoco/embed/XpGjJg/?height=265&theme-id=0&default-tab=css,result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen positionSticky by Chokcoco (@Chokcoco) on CodePen. </iframe>

嗯，看看上面的 CSS 代码，只需要给每个内容区块加上

{
    position: -webkit-sticky;
    position: sticky;
    top: 0;
}

就可以轻松实现了。

简单描述下生效过程，因为设定的阈值是 top:0 ，这个值表示当元素距离页面视口（Viewport，也就是fixed定位的参照）顶部距离大于 0px 时，元素以 relative 定位表现，而当元素距离页面视口小于 0px 时，元素表现为 fixed 定位，也就会固定在顶部。

不理解可以再看看下面这两张示意图（top:20px 的情况，取自开源项目fixed-sticky）：
距离页面顶部大于20px，表现为 position:relative;

sticky-top-off
距离页面顶部小于20px，表现为 position:fixed;

sticky-top-on
运用 position:sticky 实现头部导航栏固定

运用 position:sticky 实现导航栏固定，也是最常见的用法：

stickynav

CodePen Demo（请在 SAFARI 或者 CHROME53+ 下观看）：
<iframe height='265' scrolling='no' title='stickyNav' src='//codepen.io/Chokcoco/embed/OWqpjJ/?height=265&theme-id=0&default-tab=css,result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen stickyNav by Chokcoco (@Chokcoco) on CodePen. </iframe>

同理，也可以实现侧边导航栏的超出固定。
生效规则

position:sticky 的生效是有一定的限制的，总结如下：

    须指定 top, right, bottom 或 left 四个阈值其中之一，才可使粘性定位生效。否则其行为与相对定位相同。
        并且 top 和 bottom 同时设置时，top 生效的优先级高，left 和 right 同时设置时，left 的优先级高。

    设定为 position:sticky 元素的任意父节点的 overflow 属性必须是 visible，否则 position:sticky 不会生效。这里需要解释一下：
        如果 position:sticky 元素的任意父节点定位设置为 position:overflow，则父容器无法进行滚动，所以 position:sticky 元素也不会有滚动然后固定的情况。
        如果 position:sticky 元素的任意父节点定位设置为 position:relative | absolute | fixed，则元素相对父元素进行定位，而不会相对 viewprot 定位。

    达到设定的阀值。这个还算好理解，也就是设定了 position:sticky 的元素表现为 relative 还是 fixed 是根据元素是否达到设定了的阈值决定的。

开始使用？

上面从兼容性也看到了，情况不容乐观，但是用于某些布局还是能省很多力的，如果真的希望用上这个属性，可以采用一些开源库来实现兼容。

推荐 fixed-sticky 。


什么是 CSS 特性检测？我们知道，前端技术日新月异的今天，各种新技术新属性层出不穷。在 CSS 层面亦不例外。

一些新属性能极大提升用户体验以及减少工程师的工作量，并且在当下的前端氛围下：

    很多实验性功能未成为标准却被大量使用；
    需要兼容多终端，多浏览器，而各浏览器对某一新功能的实现表现的天差地别；

所以有了优雅降级和渐进增强的说法，在这种背景下，又想使用新的技术给用户提供更好的体验，又想做好回退机制保证低版本终端用户的基本体验，CSS 特性检测就应运而生了。

CSS 特性检测就是针对不同浏览器终端，判断当前浏览器对某个特性是否支持。运用 CSS 特性检测，我们可以在支持当前特性的浏览器环境下使用新的技术，而不支持的则做出某些回退机制。

本文将主要介绍两种 CSS 特性检测的方式：

    @supports
    modernizr

CSS @supports

传统的 CSS 特性检测都是通过 javascript 实现的，但是未来，原生 CSS 即可实现。

CSS @supports 通过 CSS 语法来实现特性检测，并在内部 CSS 区块中写入如果特性检测通过希望实现的 CSS 语句。
语法：

@supports <supports_condition> {
    /* specific rules */
}

举个例子：

div {
	position: fixed;
}

@supports (position:sticky) {
    div {
        position:sticky;
    }
}

上面的例子中，position: sticky 是 position 的一个新属性，用于实现黏性布局，可以轻松实现一些以往需要 javascript 才能实现的布局（戳我了解详情），但是目前只有在 -webkit- 内核下才得到支持。

上面的写法，首先定义了 div 的 position: fixed ，紧接着下面一句 @supports (position:sticky) 则是特性检测括号内的内容，如果当前浏览器支持 @supports 语法，并且支持 position:sticky 语法，那么 div 的 则会被设置为 position:sticky 。

我们可以看到，@supports 语法的核心就在于这一句：@supports (...) { } ，括号内是一个 CSS 表达式，如果浏览器判断括号内的表达式合法，那么接下来就会去渲染括号内的 CSS 表达式。除了这种最常规的用法，还可以配合其他几个关键字：
@supports not && @supports and && @supports or
@supports not -- 非

not 操作符可以放在任何表达式的前面来产生一个新的表达式，新的表达式为原表达式的值的否定。看个例子：

@supports not (background: linear-gradient(90deg, red, yellow)) {
    div {
        background: red;
    }
}

因为添加了 not 关键字，所以与上面第一个例子相反，这里如果检测到浏览器不支持线性渐变 background: linear-gradient(90deg, red, yellow) 的语法，则将 div 的颜色设置为红色 background: red 。
@supports and -- 与

这个也好理解，多重判断，类似 javascript 的 && 运算符符。用 and 操作符连接两个原始的表达式。只有两个原始表达式的值都为真，生成的表达式才为真，反之为假。

当然，and 可以连接任意多个表达式看个例子：

p {
    overflow: hidden;
    text-overflow: ellipsis;
}
@supports (display:-webkit-box) and (-webkit-line-clamp:2) and (-webkit-box-orient:vertical) {
    p {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
}

上面同时，检测 @supports (display:-webkit-box) and (-webkit-line-clamp:2) and (-webkit-box-orient:vertical) 了三个语法，如果同时支持，则设定三个 CSS 规则。这三个语法必须同时得到浏览器的支持，如果表达式为真，则可以用于实现多行省略效果：

Demo戳我
@supports or -- 或

理解了 @supports and，就很好理解 @supports or 了，与 javascript 的 || 运算符类似，表达式中只要有一个为真，则生成表达式表达式为真。

看例子：

@supports (background:-webkit-linear-gradient(0deg, yellow, red)) or (background:linear-gradient(90deg, yellow, red)){
    div {
        background:-webkit-linear-gradient(0deg, yellow, red);
        background:linear-gradient(90deg, yellow, red)
    }
}

上面的例子中，只有检测到浏览器支持 background:-webkit-linear-gradient(0deg, yellow, red) 或者（or） background:linear-gradient(90deg, yellow, red) 其中一个，则给 div 元素添加渐变。

Demo戳我

当然，关键字 not 还可以和 and 或者 or 混合使用。感兴趣的可以尝试一下。
Can i use？

兼容性来看，先看看 Can i use 吧：

image

这仍是一个实验中的功能，虽然大部分浏览器都已经支持了，但是目前看来，即是在移动端想要全部兼容仍需要等待一段时间。

但是我们已经可以开始使用起来了，使用 @supports 实现渐进增强的效果。

    渐进增强（progressive enhancement）：针对低版本浏览器进行构建页面，保证最基本的功能，然后再针对高级浏览器进行效果、交互等改进和追加功能达到更好的用户体验：

CSS.supports()

谈到了 @supports，就有必要再说说 CSS.supports() 。

它是作为 @supports 的另一种形式出现的，我们可以使用 javascript 的方式来获得 CSS 属性的支持情况。

可以打开控制台，输入 CSS.supports 试试：

image

如果没有自己实现 CSS.supports 这个方法，输出上述信息，表示浏览器是支持 @supports 语法的，使用如下：

CSS.supports('display', 'flex')  // true
CSS.supports('position', 'sticky')  // true

image

那它有什么用呢？如果你的页面需要动态添加一些你不确定哪些浏览器支持的新的属性，那它也许会派上用场。以及，它可以配合我们下文即将要讲的 modernizr 。
modernizr

上面介绍了 CSS 方式的特性检测，在以前，通常是使用 javascript 来进行特性检测的，其中 modernizr 就是其中最为出色的佼佼者。

modernizr（戳我查看 Github ）是一个开源的 javascript 库。有着将近 2W 的 star ，其优秀程度可见一斑。

简单看看使用方法，假设页面已经引用了 modernizr ，语法如下：

// Listen to a test, give it a callback
Modernizr.on('testname', function( result ) {
  if (result) {
    console.log('The test passed!');
  }
  else {
    console.log('The test failed!');
  }
});

// 或者是类似 CSS.supports()
Modernizr.testAllProps('background', 'linear-gradient(90deg, #888, #ccc)');  // true

举个实际的例子，假设我们希望对是否支持渐变这个样式浏览器下的一个 div 区别对待，有如下 CSS：

div {
    background: #aaa;
}

.linear-gradient div{
    background: linear-gradient(90deg, #888, #ccc);
}

使用 Modernizr 进行判断，如果支持渐变，则在根元素添加一个 .linear-gradient 样式，方便示例，使用了 jquery 语法：

if (Modernizr.testAllProps('background', 'linear-gradient(90deg, #888, #ccc)')) {
    $('html').addClass('linear-gradient');
}

Demo戳我

当然，Modernizr 还有很多其他的功能，可以去翻翻它的 API 。
特性检测原理

如果嫌引入整一个 Modernizr 库太大，页面又不支持 @supports ，其实我们自己用简单的 javascript 实现也非常方便简单。

想要知道浏览器支持多少 CSS 属性，可以在调试窗口试试：

var root = document.documentElement; //HTML

for(var key in root.style) {
    console.log(key);
}

image

上面图片截取的只是打印出来的一小部分。如果我们要检测某个属性样式是否被支持，在任意的 element.style 检测它是否存在即可，即上面代码示例的 root 可以替换成任意元素。

当然，元素可能有 background 属性，但是不支持具体的 linear-gradinet() 属性值。这个时候该如何检测呢？只需要将具体的值赋值给某一元素，再查询这个属性值能否被读取。

var root = document.documentElement;

root.style.backgroundImage = 'linear-gradient(90deg, #888, #ccc)';

if(root.style.backgroundImage) {
  // 支持
} else {
  // 不支持
}

所以上面 Modernizr 的例子里，javascript 代码可以改成：

var root = document.documentElement;
root.style.backgroundImage = 'linear-gradient(90deg, #888, #ccc)';

if(root.style.backgroundImage) {
  $('html').addClass('linear-gradient');
}

当然，做这种特定属性值判断的时候由于有个 CSS 赋值操作，所以我们选取用于判断的元素应该是一个隐藏在页面上的元素。
各种方式间的优劣

    原生的 @supports 的性能肯定是最好的，而且无需引入外部 javascript ，首推这个，但是无奈兼容问题，目前来看不是最好的选择。

    Modernizr 功能强大，兼容性好，但是需要引入外部 javascript，多一个 http 请求，如果只是进行几个特性检测，有点杀鸡用牛刀的感觉。

    针对需要的特性检测，使用 javascript 实现一个简单的函数，再把上面用到的方法封装一下：

/**
 * 用于简单的 CSS 特性检测
 * @param [String] property 需要检测的 CSS 属性名
 * @param [String] value 样式的具体属性值
 * @return [Boolean] 是否通过检查
 */
function cssTest(property, value) {
	// 用于测试的元素，隐藏在页面上
	var ele = document.getElementById('test-display-none');

	// 只有一个参数的情况
	if(arguments.length === 1) {
		if(property in ele.style) {
			return true;
		}
	// 两个参数的情况
	}else if(arguments.length === 2){
		ele.style[property] = value;

		if(ele.style[property]) {
			return true;
		}
	}

	return false;
}

image

软件工程没有银弹，所以无论哪种方式，都有适合的场景，我们要做的就是掌握了解它们的原理，根据不同的场景灵活运用即可。

有的时候，嗯，应该说某些特定场合，我们可能需要下面这样的动画效果，渐变 + animation ：

lineargradient

假设我们渐变的写法如下：

div {
    background: linear-gradient(90deg,  #ffc700 0%, #e91e1e 100%);
}

按照常规想法，配合 animation ，我们首先会想到在 animation 的步骤中通过改变颜色实现颜色渐变动画，那么我们的 CSS 代码可能是：

div {
    background: linear-gradient(90deg,  #ffc700 0%, #e91e1e 100%);
    animation: gradientChange 2s infinite;
}

@keyframes gradientChange  {
    100% {
        background: linear-gradient(90deg,  #e91e1e 0%, #6f27b0 100%);
    }
}

上面我们用到了三种颜色：

    #ffc700 黄色
    #e91e1e 红色
    #6f27b0 紫色

最后，并没有我们预期的结果，而是这样的：

lineargradient2
CodePen Demo

我们预期的过渡动画，变成了逐帧动画。 wtf

也就是说，线性渐变是不支持动画 animation 的，那单纯的由一个颜色，变化到另外一个颜色呢？像下面这样：

div {
    background: #ffc700;
    animation: gradientChange 3s infinite alternate;
}

@keyframes gradientChange  {
    100% {
        background: #e91e1e;
    }
}

发现，单纯的单色值是可以发生渐变的：

CodePen-Demo
So

总结一下，线性渐变（径向渐变）是不支持 animation 的，单色的 background 是支持的。

查找了下文档，在 background 附近区域截图如下：

image

哪些 CSS 属性可以动画?，上面的截图是不完整的支持 CSS 动画的属性，完整的可以戳左边。

对于 background 相关的，文档里写的是支持 background 但是没有细说不支持 background: linear-gradient()/radial-gradient() 。

那么是否我们想要的背景色渐变动画就无法实现了呢？下面我们就发散下思维看看有没有其他方式可以达到我们的目标。
通过 background-position 模拟渐变动画

上面哪些 CSS 属性可以动画的截图中，列出了与 background 相关还有 background-position ，也就是 background-position 是支持动画的，通过改变 background-position 的方式，可以实现渐变动画：

div {
    background: linear-gradient(90deg,  #ffc700 0%, #e91e1e 50%, #6f27b0 100%);
    background-size: 200% 100%;
    background-position: 0 0;
    animation: bgposition 2s infinite linear alternate;
}

@keyframes bgposition {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: 100% 0;
    }
}

这里我们还配合了 background-size。首先了解下：

    background-position：指定图片的初始位置。这个初始位置是相对于以 background-origin 定义的背景位置图层来说的。

    background-size：设置背景图片大小。当取值为百分比时，表示指定背景图片相对背景区的百分比大小。当设置两个参数时，第一个值指定图片的宽度，第二个值指定图片的高度。

通过 background-size: 200% 100% 将图片的宽度设置为两倍背景区的宽度，再通过改变 background-position 的 x 轴初始位置来移动图片，由于背景图设置的大小是背景区的两倍，所以 background-position 的移动是由 0 0 -> 100% 0 。
通过 background-size 模拟渐变动画

既然 background-position 可以，那么另一个 background-size 当然也是不遑多让。与上面的方法类似，只是这次 background-position 辅助 background-size ，CSS 代码如下：

div {
    background: linear-gradient(90deg,  #ffc700 0%, #e91e1e 33%, #6f27b0 66%, #00ff88 100%);
    background-position: 100% 0;
    animation: bgSize 5s infinite ease-in-out alternate;

}

@keyframes bgSize {
    0% {
        background-size: 300% 100%;
    }
    100% {
        background-size: 100% 100%;
    }
}

CodePen--Demo--position-size 实现渐变动画

通过改变 background-size 的第一个值，我将背景图的大小由 3 倍背景区大小向 1 倍背景区大小过渡，在背景图变换的过程中，就有了一种动画的效果。

而至于为什么要配合 background-position: 100% 0 。是由于如果不设置 background-position ，默认情况下的值为 0% 0%，会导致动画最左侧的颜色不变，像下面这样，不大自然：

positionsizegradient
通过 transform 模拟渐变动画

上面两种方式虽然都可以实现，但是总感觉不够自由，或者随机性不够大。

不仅如此，上述两种方式，由于使用了 background-position 和 background-size，并且在渐变中改变这两个属性，导致页面不断地进行大量的重绘（repaint），对页面性能消耗非常严重，所以我们还可以试试 transfrom 的方法：

下面这种方式，使用伪元素配合 transform 进行渐变动画，通过元素的伪元素 before 或者 after ，在元素内部画出一个大背景，再通过 transform 对伪元素进行变换：

div {
    position: relative;
    overflow: hidden;
    width: 100px;
    height: 100px;
    margin: 100px auto;
    border: 2px solid #000;
    
    &::before {
        content: "";
        position: absolute;
        top: -100%;
        left: -100%;
        bottom: -100%;
        right: -100%;
        background: linear-gradient(45deg,  #ffc700 0%, #e91e1e 50%, #6f27b0 100%);
        background-size: 100% 100%;
        animation: bgposition 5s infinite linear alternate;
        z-index: -1;
    }
}


@keyframes bgposition {
    0% {
        transform: translate(30%, 30%);
    }
    25% {
        transform: translate(30%, -30%);
    }
    50% {
        transform: translate(-30%, -30%);
    }
    75% {
        transform: translate(-30%, 30%);
    }
    100% {
        transform: translate(30%, 30%);
    }
}

实现原理如下图所示：

pesodugradient

CodePen--Demo--伪元素配合transform实现背景渐变

上面列出来的只是部分方法，理论而言，伪元素配合能够产生位移或者形变的属性都可以完成上面的效果。我们甚至可以运用不同的缓动函数或者借鉴蝉原则，制作出随机性十分强的效果。

当然，本文罗列出来的都是纯 CSS 方法，使用 SVG 或者 Canvas 同样可以制作出来，而且性能更佳。感兴趣的读者可以自行往下研究。
运用背景色渐变动画

背景色渐变动画具体可以运用在什么地方呢，稍微举个例子。
背景色渐变过渡实现按钮的明暗变化

gradienthover

CodePen -- Demo -- 背景色渐变过渡实现按钮的明暗变化

除此之外，在背景板凸显文字，让一些静态底图动起来吸引眼球等地方都有用武之地。