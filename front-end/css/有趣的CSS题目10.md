# 有趣的CSS题目10

>文章参考自[两行 CSS 代码实现图片任意颜色赋色技术](https://github.com/chokcoco/iCSS/issues/32)
>
>文章参考自[不可思议的CSS导航栏下划线跟随效果](https://github.com/chokcoco/iCSS/issues/33)
>
>文章参考自[妙用 scale 与 transfrom-origin，精准控制动画方向](https://github.com/chokcoco/iCSS/issues/34)
>
>文章参考自[神奇的选择器 :focus-within](https://github.com/chokcoco/iCSS/issues/36)

很久之前在张鑫旭大大的博客看到过一篇 PNG格式小图标的CSS任意颜色赋色技术，当时惊为天人，感慨还可以这样玩，私底下也曾多次想过有没有其他方法可以实现，又或者不仅仅局限于 PNG 图片。

本方法与上面 ZXX 的方法及流传的使用 filter 滤镜 drop-shadow 不同。发现这个方法也是在写另外一篇文章的过程中。
mix-blend-mode 与 background-blend-mode

mix-blend-mode 在我之前的一篇文章初略介绍过 -- 不可思议的混合模式 mix-blend-mode，与本文的主角 background-blend-mode 一样，都是实现混合模式的。

混合模式最常见于 photoshop 中，是 PS 中十分强大的功能之一。当然，瞎用乱用混合模式谁都会，利用混合模式将多个图层混合得到一个新的效果，只是要用到恰到好处，或者说在 CSS 中利用混合模式制作出一些效果则需要对混合模式很深的理解及不断的尝试。

简单区分一下这两个属性：

    mix-blend-mode 用于多个不同标签间的混合模式
    background-blend-mode 用于单个标签间内背景图与渐变背景间的混合模式。

background-blend-mode 的可用取值与 mix-blend-mode一样，不重复介绍，下面直接进入应用阶段。
使用 background-blend-mode: lighten 实现任意图片颜色赋色技术

OK，下面进入正文。如何通过纯 CSS 技术实现任意图片的任意颜色赋色技术呢？

假设我们有这样一张图片，JPG、PNG、GIF 都可以，但是有一个前提要求，就是黑色纯色，背景白色：

iconmonstr-binoculars-10

利用 background-blend-mode ，我们可以在图片下叠加多一层其他颜色，通过 background-blend-mode: lighten 这个混合模式实现改变图片主体颜色黑色为其它颜色的目的。

简单的 CSS 代码示意如下：

.pic {
    width: 200px;
    height: 200px;
    background-image: url($img);
    background-size: cover;
}

.pic1 {
    background-image: url($img), linear-gradient(#f00, #f00);
    background-blend-mode: lighten;
    background-size: cover;
}

效果如下：

image

注意，上面 CSS 这一句是关键 background-image: url($img), linear-gradient(#f00, #f00); ，这里我叠加了一层渐变层 linear-gradient(#f00, #f00) ，实现了一个纯红色背景，而不是直接使用 #f00 实现红色背景。
使用 background-blend-mode: lighten 实现主色改为渐变色

这个方法更厉害的地方在于，不单单可以将纯色图片由一种颜色改为另一种颜色，而且可以将图片内的黑色部分由单色，改为渐变颜色！

简单的 CSS 代码如下：

.pic {
    background-image: url($img), linear-gradient(#f00, #00f);
    background-blend-mode: lighten;
    background-size: cover;
}

可以得到这样的效果：

image

OK，看到这里，大家伙肯定会有疑问了，这是怎么实现的呢？

这里就有必要解释一下 lighten 这个混合模式了。变亮，变亮模式与变暗模式产生的效果相反：

    用黑色合成图像时无作用，用白色时则仍为白色
    黑色比任何颜色都要暗，所以黑色会被任何色替换掉。反之，如果素材的底色是黑色，主色是白色。那就应该用变暗（darken）的混合模式

CodePen Demo -- 纯色图片赋色技术尝试
局限性尝试 -- 使用透明底色图片

上述方法要求了图片本身内容为纯色黑色，底色为白色。那么如果像 PNG 图片一样，只存在主色，而底色是透明的，是否能够同样实现效果呢？

假设我们有一张这样的 PNG 图片（灰色主色，透明底色）：

按照上面的方式实现一遍，结果如下：

image

任意颜色赋色技术尝试 -- PNG图片

很遗憾，当底色是透明的时候，会被混合模式混合上叠加层的颜色，无法使用。所有，这个技术也就存在了一个使用前提：

    图片的底色为白色，主色为黑色

当然主色也可以是其他颜色，只是这个时候叠加需要考虑颜色的融合，没有使用黑色直观。
background-blend-mode 实现图片任意颜色赋色技术总结

综上，我们确实只需要两行代码就可以实现白色底色黑色主色图片的任意颜色赋色技术。

{
    background-image: url($img), linear-gradient(#f00, #00f);
    background-blend-mode: lighten;
}

其中，background-image 的第二值就是你希望赋值给的渐变色（当然，渐变色可以生成纯色）。

我们同时给一个标签设置了背景图片和渐变色，然后利用了 background-blend-mode:lighten 这个关键属性，达到了类似 PS 里的混合模式效果。

看起来 background-blend-mode 名为混合模式，但似乎表现上更像是 PS 当中的一种的剪切蒙板，混合模式是修改图片本身，蒙版跟遮罩都是在图片上一层通过叠加其他层对图像进行调整。

那么由此方法本身可以想到，一些能对图形进行色彩调整的 CSS 属性是否也能达到同样的功能呢？诸如：

    filter 滤镜
    mask-image
    mask-clip

感兴趣的读者可以自行尝试，在接下来的文章我也会继续进行探讨。

黑色纯色，背景白色可能局限了这个技巧的使用场景，但是在很多白色底色的页面中，这个方法还是可以很好的发挥作用，许多 ICON 图片不再需要两个或者更多个颜色的版本！
background-blend-mode 兼容性

相较于 mix-blend-mode，background-blend-mode 的兼容性会更好一点。所以本文所介绍的技术在移动端是存在用武之地的：

image

-----

先上张图，如何使用纯 CSS 制作如下效果？

underline

在继续阅读下文之前，你可以先缓一缓。尝试思考一下上面的效果或者动手尝试一下，不借助 JS ，能否巧妙的实现上述效果。

OK，继续。这个效果是我在业务开发的过程中遇到的一个类似的小问题。其实即便让我借助 Javascript ，我的第一反应也是，感觉很麻烦啊。所以我一直在想，有没有可能只使用 CSS 完成这个效果呢？
定义需求

我们定义一下简单的规则，要求如下：

    假设 HTML 结构如下：

<ul>
  <li>不可思议的CSS</li>
  <li>导航栏</li>
  <li>光标小下划线跟随</li>
  <li>PURE CSS</li>
  <li>Nav Underline</li>
</ul>

    导航栏目的 li 的宽度是不固定的
    当从导航的左侧 li 移向右侧 li，下划线从左往右移动。同理，当从导航的右侧 li 移向左侧 li，下划线从右往左移动。

实现需求

第一眼看到这个效果，感觉这个跟随动画，仅靠 CSS 是不可能完成的。

如果想只用 CSS 实现，只能另辟蹊径，使用一些讨巧的方法。

好，下面就借助一些奇技淫巧，使用 CSS 一步一步完成这个效果。分析一下难点：
宽度不固定

第一个难点， li 的宽度是不固定的。所以，我们可能需要从 li 本身的宽度上做文章。

既然每个 li 的宽度不一定，那么它对应的下划线的长度，肯定是是要和他本身相适应的。自然而然，我们就会想到使用它的 border-bottom 。

li {
    border-bottom: 2px solid #000;
}

那么，可能现在是这样子的（li 之间是相连在一起的，li 间的间隙使用 padding 产生）：

image
默认隐藏，动画效果

当然，这里一开始都是没有下划线的，所以我们可能需要把他们给隐藏起来。

li {
    border-bottom: 0px solid #000;
}

推翻重来，借助伪元素

这样好像不行，因为隐藏之后，hover li 的时候，需要下划线动画，而 li 本身肯定是不能移动的。所以，我们考虑借助伪元素。将下划线作用到每个 li 的伪元素之上。

li::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-bottom: 2px solid #000;
}

下面考虑第一步的动画，hover 的时候，下划线要从一侧运动展开。所以，我们利用绝对定位，将 li 的伪元素的宽度设置为0，在 hover 的时候，宽度从 width: 0 -> width: 100%，CSS 如下：

li::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    border-bottom: 2px solid #000;
}

li:hover::before {
    width: 100%;
}

得到，如下效果：

navunderline
左移左出，右移右出

OK，感觉离成功近了一步。现在还剩下一个最难的问题：

如何让线条跟随光标的移动动作，实现当从导航的左侧 li 移向右侧 li，下划线从左往右移动。同理，当从导航的右侧 li 移向左侧 li，下划线从右往左移动。

我们仔细看看，现在的效果：

twounderline

当从第一个 li 切换到第二个 li 的时候，第一个 li 下划线收回的方向不正确。所以，可以能我们需要将下划线的初始位置位移一下，设置为 left: 100%，这样每次下划线收回的时候，第一个 li 就正确了：

li::before {
    content: "";
    position: absolute;
    top: 0;
    left: 100%;
    width: 0;
    height: 100%;
    border-bottom: 2px solid #000;
}

li:hover::before {
    left: 0;
    width: 100%;
}

看看效果：
twounderline11

额，仔细对比两张图，第二种效果其实是捡了芝麻丢了西瓜。第一个 li 的方向是正确了，但是第二个 li 下划线的移动方向又错误了。fxxk
神奇的 ~ 选择符

所以，我们迫切需要一种方法，能够不改变当前 hover 的 li 的下划线移动方式却能改变它下一个 li 的下划线的移动方式（好绕口）。

没错了，这里我们可以借助 ~ 选择符，完成这个艰难的使命，也是这个例子中，最最重要的一环。

对于当前 hover 的 li ，其对应伪元素的下划线的定位是 left: 100%，而对于 li:hover ~ li::before，它们的定位是 left: 0。CSS 代码大致如下：

li::before {
    content: "";
    position: absolute;
    top: 0;
    left: 100%;
    width: 0;
    height: 100%;
    border-bottom: 2px solid #000;
    transition: 0.2s all linear;
}

li:hover::before {
    width: 100%;
    left: 0;
}

li:hover ~ li::before {
    left: 0;
}

至此，我们想要的效果就实现拉！撒花。看看：

underlineawhere

效果不错，就是有点僵硬，我们可以适当改变缓动函数以及加上一个动画延迟，就可以实现上述开头里的那个效果了。当然，这些都是锦上添花的点缀。

完整的DEMO可以戳这里: CodePen --Demo

-----

上次发完 不可思议的纯 CSS 导航栏下划线跟随效果 这篇文章之后，很多朋友找我讨论，感叹 CSS 的奇妙。

然后昨天，群里一位朋友问到了一个和这个效果比较类似的效果，问如何

将下面这个动画的下划线效果，从左进入，右边离开修改为从上方进入，下方离开。

描述很难理解，看看原本的效果：

tsorigin
难点所在

第一眼看到这个效果，我的内心毫无波澜。以为只是简单的一个下划线 hover 效果，经过友人提醒，才发现，这个动画效果中，下划线是从一端进入，从另外一端离开的。而且，这个 hover 动画是纯 CSS 实现的。

youqu

先不考虑上面说的修改需求，先想一想，如果就是还原上述效果，仅仅使用 CSS，该如何做呢？
还原效果

嗯，正常而言，我们一个 hover 效果，可能就是从哪里来，回哪里去，大部分的应该是这样的：

xxx

CodePen Demo -- 从哪里来，回哪里去

现在，难点就在于如何在 hover 离开的时候，改变动画行进的方向。

下面我们将一个 hover 动画分解为 3 个部分：

    hover 进入状态
    hover 停留状态
    hover 离开状态

但是，对于一个 hover 效果而言，正常来说，只有初始状态，和hover状态两种。可能我们的代码是这样：

div {
    xxxx...
}

div:hover {
    xxxx...
}

对于一个 hover transition 动画，它应该是从：

    正常状态 -> hover状态 -> 正常状态 （三个步骤，两种状态）

所以，必须要有一种方法，能够使得 hover 动画的进入与离开产生两种不一样的效果，实现：

    状态1 -> hover状态 -> 状态2 （三个步骤，三种状态）

实现控制动画方向的关键点

所以，这里的关键点就在于（划重点）：

使得 hover 动画的进入与离开产生两种不一样的效果 。

接下来，也就是本文的关键所在，使用 transform: scale() 以及 transform-origin 实现这个效果。
transform: scale() 实现线条运动

transform: scale 大家应该都很熟悉了，通俗来说是用于缩放，用官方的话说，就是：

    CSS 函数 scale() 用于修改元素的大小。可以通过向量形式定义的缩放值来放大或缩小元素，同时可以在不同的方向设置不同的缩放值。

这里我们使用 transform: scaleX(0) 与 transform: scaleX(1) 来改变线条的显示与隐藏，它的 CSS 代码简单来看，可能是这样：

div {
    position: absolute;
    width: 200px;
    height: 60px;
}

div::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 200px;
    height: 2px;
    background: deeppink;
    transition: transform .5s;
    transform: scaleX(0);
}

div:hover::before {
    transform: scaleX(1);
}

scale

CodePen Demo -- transform: scaleX(0) 与 transform: scaleX(1)

嗯？为什么是要用 transform: scale() 来实现线条的动画？因为它可以配合 transform-origin 实现动画的不同运动方向：
transform-origin 实现线条运动方向

transform-origin 让我们可以更改一个元素变形（transform）的原点，transform-origin 属性可以使用一个，两个或三个值来指定，其中每个值都表示一个偏移量。 没有明确定义的偏移将重置为其对应的初始值。

本效果最最最重要的地方就在于这里，我们使用 transform-origin 去改变 transform: scale() 的原点实现线条运动的方向。

    我们给线条设置一个默认的 transform-origin 记为状态1
    hover 的时候，设置另外一个不同的 transform-origin, 记为状态2

所以，当然我们 hover 的时候，会读取状态2的transform-origin，从该原点开始放大至 scaleX(1)，hover 离开的时候，会读取状态1的transform-origin，从scaleX(1)状态缩小至该原点。

嗯，CSS代码大概是这样：

div {
    position: absolute;
    width: 200px;
    height: 60px;
}

div::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 200px;
    height: 2px;
    background: deeppink;
    transition: transform .5s;
    transform: scaleX(0);
    transform-origin: 100% 0;
}

div:hover::before {
    transform: scaleX(1);
    transform-origin: 0 0;
}

这里，我们巧妙的通过 hover 状态施加了一层新的 transform-origin ，让动画的进入与离开产生了两种不同的效果，两个不同的方向。

如此一来，也就顺利实现了我们想要的效果，撒花：

torigin

CodePen Demo -- transform-origin妙用

注意，这里使用了 transform-origin 去改变 transform: scale() 的原点实现线条运动的方向，而没有借助诸如 position 位移，transform: translate()，或者 margin 等位置属性去改变线条所在的位置。

所以，有趣的是，线条其实没有产生过任何位移，这里其实也是障眼法，让它看上去，它好像在移动。
拓展延伸

嗯，有了上述方法，也就是 transform: scale() 配合 transform-origin ，我们可以开始随意改变动画的初始与结束状态了。把他们运用到其他效果之上，简单的几个示意效果：

othertraorigin

CodePen Demo -- transform:scale 配合 transfrom-origin 控制动画方向
值得注意的点

还有几个点是比较有意思的，大家可以尝试尝试，思考思考：

    尝试改变两种状态的 transition-timing-function 缓动函数，可以让动画更加流畅具有美感；
    注意一下，线条的 transition 设置的是 transition: transform .5s 而不是 transition: all .5s，体验一下两种写法所产生的不同效果。

补充

    补充修改于 2018/4/23

一开始看到这个问题，陷入了一些思考误区。评论中 @w5240 指出其实直接使用定位就可以实现：

div {
position: absolute;
width: 200px;
height: 60px;
}

div:before {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: deeppink;
    transition: width .5s;
}

div:hover:before {
    width: 200px;
    left:0;
    right:unset;
}

这种方法无异更加便捷。关键点还是 hover 的时候修改起始动画的点位。

-----

CSS 的伪类选择器和伪元素选择器，让 CSS 有了更为强大的功能。

    伪类大家听的多了，伪元素可能听到的不是那么频繁，其实 CSS 对这两个是有区分的。

有个错误有必要每次讲到伪类都提一下，有时你会发现伪类元素使用了两个冒号 (::) 而不是一个冒号 (:)，这是 CSS3 规范中的一部分要求，目的是为了区分伪类和伪元素，大多数浏览器都支持下面这两种表示方式。

通常而言，

#id:after{
 ...
}

#id::after{
...
}

符合标准而言，单冒号(:)用于 CSS3 伪类，双冒号(::)用于 CSS3 伪元素。

当然，也有例外，对于 CSS2 中已经有的伪元素，例如 :before，单冒号和双冒号的写法 ::before 作用是一样的。

所以，如果你的网站只需要兼容 webkit、firefox、opera 等浏览器或者是移动端页面，建议对于伪元素采用双冒号的写法，如果不得不兼容低版本 IE 浏览器，还是用 CSS2 的单冒号写法比较安全。
伪类选择器 :focus-within

言归正传，今天要说的就是:focus-within 伪类选择器。

它表示一个元素获得焦点，或，该元素的后代元素获得焦点。划重点，它或它的后代获得焦点。

这也就意味着，它或它的后代获得焦点，都可以触发 :focus-within。
:focus-within 的冒泡性

这个属性有点类似 Javascript 的事件冒泡，从可获焦元素开始一直冒泡到根元素 html，都可以接收触发 :focus-within 事件，类似下面这个简单的例子这样：

<div class="g-father">
    <div class="g-children">
        <input type="button" value="Button">
    </div>
</div>

html,
body,
.g-father,
.g-children {
    padding: 30px;
    border:1px solid #999;
}

input {
    ...
    &:focus {
        background: #00bcd4;
    }
}

html:focus-within {
    background: #e91e63;
}
body:focus-within {
    background: #ff5722;
}
.g-father:focus-within {
    background: #ffeb3b;
}
.g-children:focus-within {
    background: #4caf50;
}

就是这样：

focuswithinmaopao

CodePen Demo -- :focus-within 冒泡触发

这个选择器的存在，让 CSS 有了进一步的让元素持久停留在一种新状态的的能力。

下面几个例子，看看 :focus-within 可以提供什么能力，做些什么事情。
感应用户聚焦区域

它或它的后代获得焦点，这一点使得让感知获焦区域变得更大，所以，最常规的用法就是使用 :focus-within 感应用户操作聚焦区域，高亮提醒。

下面的效果没有任何 JS 代码：

cssfocuswithinpesudo

这里是什么意思呢？:focus-within 做了什么呢？

    我们无须去给获焦的元素设置 :focus 伪类，而是可以给需要的父元素设置，这样当元素获焦时，我可以一并控制它的父元素的样式

核心思想用 CSS 代码表达出来大概是这样：

<div class="g-container">
    <div class="g-username">
        <input type="text" placeholder="user name" class="g_input" >
    </div>
    <div class="g-username">
        <input type="text" placeholder="code" class="g_input" >
    </div>
</div>

.g-container:focus-within {
    ...

    input {
        ....
    }
}

DEMO -- CSS focus-within INPUT

运用上面思想，我们可以把效果做的更炫一点点，在某些场景制作一些增强用户体验的效果：

purecssfocus

DEMO -- PURE CSS FOCUS By :focus-within
TAB导航切换

在之前的一篇文章里，介绍了两种纯 CSS 实现的 TAB 导航栏切换方法：

纯CSS的导航栏Tab切换方案

现在又多了一种方式，利用了 :focus-within 可以在父节点获取元素获得焦点的特性，实现的TAB导航切换：

focuswithintab

DEMO -- focus-within switch tab

主要的思路就是通过获焦态来控制其他选择器，以及最重要的是利用了父级的 :not(:focus-within) 来设置默认样式：

.nav-box:not(:focus-within) {
    // 默认样式
}

.nav-A:focus-within ~ .content-box .content-A {
    display: block;
}

.nav-B:focus-within ~ .content-box .content-B {
    display: block;
}

配合 :placeholder-shown 伪类实现表单效果

:focus-within 一个人能力有限，通常也会配合其他伪类实现一些不错的效果。这里要再简单介绍的是另外一个有意思的伪类 :placeholder-shown。

    :placeholder-shown：The :placeholder-shown CSS pseudo-class represents any <input> or <textarea> element that is currently displaying placeholder text.

    另外，划重点，这个伪类是仍处于实验室的方案。也就是未纳入标准，当然我们的目的是探寻有意思的 CSS 。

意思大概就是，当 input 类型标签使用了 placeholder 属性有了默认占位的文字，会触发此伪类样式。配合:not()伪类，可以再改变当默认文字消失后的样式，再配合本文的主角，我们可以实现表单的一系列效果。

CSS 代码大概呈现成这样：

.g-container {
    width: 500px;
    height: 60px;

    input {
        height: 100%;
        width: 100%;

        &:not(:placeholder-shown) {
            ...
        }

        &:placeholder-shown {
            ...
        }
    }

    &:focus-within {
        ...
    }
}

实际效果如下：

placeholder

可以看到，上面的效果没有用到任何 JS，可以实现：

    整个 input（包括父元素所在区域）获焦与非获焦样式控制
    placeholder 属性设置的文字出现与消失后样式控制

CodePen Demo -- :placeholder-shown && :focus-within
实现离屏导航

这个是其他很多文章都有提到过的一个功能，利用 focus-within 便捷的实现离屏导航，可以说将这个属性的功能发挥的淋漓尽致，这里我直接贴一个 codepen 上 Dannie Vinther 对这个效果的实现方案：

offscreennav

CodePen Demo -- Off-screen nav with :focus-within [PURE CSS]
实现掘金登录动效切换

juejin.im是我很喜欢的一个博客网站，它的登录有一个小彩蛋，最上面的熊猫在你输入帐号密码的时候会有不同的状态，效果如下：

juejin

利用本文所讲的 focus-within ，可以不借助任何 Javascript，实现这个动效：

juejinfocuswithin

感兴趣的可以戳这里看看完整的Demo代码：

CodePen Demo -- 掘金登录效果纯CSS实现
兼容性

好了，例子举例的也差不多了，下面到了杀人诛心的兼容性时刻，按照惯例，这种属性大概率是一片红色，看看 CANIUSE，截图日期（2018/08/02），其实也还不算特别惨淡。

image

-----

