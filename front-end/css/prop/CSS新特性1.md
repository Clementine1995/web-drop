# CSS 新特性 1

## text-rendering

text-rendering CSS 属性定义浏览器渲染引擎如何渲染字体。浏览器会在速度、清晰度、几何精度之间进行权衡。

注意：该属性是 SVG 的属性而不是标准的 CSS 属性。但是 Gecko（Firefox） 和 Webkit（Chrome、Safari） 内核的浏览器允许该属性在 Windows、Mac OS 和 Linux 操作系统中应用于 HTML 和 XML 内容。

一个视觉上很明显的效果是，optimizeLegibility 属性值会在某些字体（比如，微软的 Calibri，Candara，Constantia 和 Corbel 或者 DejaVu 系列字体）小于 20px 时把有些相邻字符连接起来。

语法：`text-rendering: auto | optimizeSpeed | optimizeLegibility | geometricPrecision`

- auto：浏览器依照某些根据去推测在绘制文本时，何时该优化速度，易读性或者几何精度。
- optimizeSpeed：浏览器在绘制文本时将着重考虑渲染速度，而不是易读性和几何精度. 它会使字间距和连字无效。
- optimizeLegibility：浏览器在绘制文本时将着重考虑易读性，而不是渲染速度和几何精度.它会使字间距和连字有效。该属性值在移动设备上会造成比较明显的性能问题，详细查看 [text-rendering](https://css-tricks.com/almanac/properties/t/text-rendering/)。
- geometricPrecision：浏览器在绘制文本时将着重考虑几何精度， 而不是渲染速度和易读性。字体的某些方面—比如字间距—不再线性缩放，所以该值可以使使用某些字体的文本看起来不错。

注意：这个 geometricPrecision 特性——当被渲染引擎完全支持时——会使文本缩放是流畅的。对于大比例的缩放，你可能看到并不太漂亮的文本渲染，但这个字体大小是你期望的，而不是被 Windows 或 Linux 系统四舍五入或向下取整的字体大小。 WebKit 准确地的实现了这个值, 但是 Gecko 把这个值按照 optimizeLegibility 处理。

## font-smooth

font-smooth CSS 属性用来控制字体渲染时的平滑效果。该特性是非标准的，请尽量不要在生产环境中使用它！属性已经在规范中被移除，而且已经不在标准跟踪之中。

语法：`font-smooth: auto | never | always | <value>`

注意：

- Webkit 实现了名为-webkit-font-smoothing 的相似属性。这个属性仅在 Mac OS X/macOS 下生效。
  - none - 关闭字体平滑；展示有锯齿边缘的文字。
  - antialiased - 平滑像素级别的字体，而不是子像素。
  - subpixel-antialiased - 在大多数非视网膜显示器上，这将会提供最清晰的文字。
- Firefox 实现了名为 -moz-osx-font-smoothing 的相似属性。这个属性仅在 Mac OS X / macOS 下生效。
  - auto - 允许浏览器选择字体平滑的优化方式，通常为 grayscale。
  - grayscale - 用灰度抗锯齿渲染文本，而不是子像素。从亚像素渲染切换到黑暗背景上的浅色文本的抗锯齿使其看起来更轻。

## will-change

CSS 属性 will-change 为 web 开发者提供了一种告知浏览器该元素会有哪些变化的方法，这样浏览器可以在元素属性真正发生变化之前提前做好对应的优化准备工作。 这种优化可以将一部分复杂的计算工作提前准备好，使页面的反应更为快速灵敏。

但是在使用这个属性的时候需要注意：

- **不要将 will-change 应用到太多元素上**：浏览器已经尽力尝试去优化一切可以优化的东西了。有一些更强力的优化，如果与 will-change 结合在一起的话，有可能会消耗很多机器资源，如果过度使用的话，可能导致页面响应缓慢或者消耗非常多的资源。
- **有节制地使用**：通常，当元素恢复到初始状态时，浏览器会丢弃掉之前做的优化工作。但是如果直接在样式表中显式声明了 will-change 属性，则表示目标元素可能会经常变化，浏览器会将优化工作保存得比之前更久。所以最佳实践是当元素变化之前和之后通过脚本来切换 will-change 的值。
- **不要过早应用 will-change 优化**：如果你的页面在性能方面没什么问题，则不要添加 will-change 属性来榨取一丁点的速度。 will-change 的设计初衷是作为最后的优化手段，用来尝试解决现有的性能问题。它不应该被用来预防性能问题。过度使用 will-change 会导致大量的内存占用，并会导致更复杂的渲染过程，因为浏览器会试图准备可能存在的变化过程。这会导致更严重的性能问题。
- **给它足够的工作时间**：这个属性是用来让页面开发者告知浏览器哪些属性可能会变化的。然后浏览器可以选择在变化发生前提前去做一些优化工作。所以给浏览器一点时间去真正做这些优化工作是非常重要的。使用时需要尝试去找到一些方法提前一定时间获知元素可能发生的变化，然后为它加上 will-change 属性。

语法：`will-change: auto | <animateable-feature>`

- auto：表示没有特别指定哪些属性会变化，浏览器需要自己去猜，然后使用浏览器经常使用的一些常规方法优化。
- `<animateable-feature>` 可以是以下值：
  - scroll-position：表示开发者希望在不久后改变滚动条的位置或者使之产生动画。
  - contents：表示开发者希望在不久后改变元素内容中的某些东西，或者使它们产生动画。
  - `<custom-ident>`：表示开发者希望在不久后改变指定的属性名或者使之产生动画。如果属性名是简写，则代表所有与之对应的简写或者全写的属性。

正确使用应该是通过 js 脚本来控制它

```js
var el = document.getElementById("element");

// 当鼠标移动到该元素上时给该元素设置 will-change 属性
el.addEventListener("mouseenter", hintBrowser);
// 当 CSS 动画结束后清除 will-change 属性
el.addEventListener("animationEnd", removeHint);

function hintBrowser() {
  // 填写上那些你知道的，会在 CSS 动画中发生改变的 CSS 属性名们
  this.style.willChange = "transform, opacity";
}

function removeHint() {
  this.style.willChange = "auto";
}
```

## contain

> 相关文章[CSS 新特性 contain，控制页面的重绘与重排](https://github.com/chokcoco/iCSS/issues/23)

contain 属性允许开发者声明当前元素和它的内容尽可能的独立于 DOM 树的其他部分。这使得浏览器在重新计算布局、样式、绘图或它们的组合的时候，只会影响到有限的 DOM 区域，而不是整个页面。

语法：`contain: none | strict | content | size | layout | style | paint`

- none：声明元素正常渲染，没有包含规则。
- strict：声明所有的包含规则应用于这个元素。这样写等价于 contain: size layout style paint。
- content：声明这个元素上有除了 size 外的所有包含规则。等价于 contain: layout style paint。
- size：声明这个元素的尺寸计算不依赖于它的子孙元素的尺寸。
- layout：声明没有外部元素可以影响它内部的布局，反之亦然。
- style：声明那些同时会影响这个元素和其子孙元素的属性，都在这个元素的包含范围内。
- paint：声明这个元素的子孙节点不会在它边缘外显示。如果一个元素在视窗外或因其他原因导致不可见，则同样保证它的子孙节点不会被显示。

### Paint

这个值打开该元素的绘制控制。这确保包含元素的后代节点不显示在其边界外，因此，如果一个元素在屏幕外或是不可见的，它的后代节点同样也被保证是不可见的。
不过它有几个副作用：

- 它充当绝对定位和固定定位元素的包含块。这意味着任何孩子节点都基于拥有 contain: paint 的元素下定位，没有其他父元素，比如-说-文档。
- 它成为层叠上下文。这意味着如 z-index 等属性将对元素起作用，孩子节点将根据新的上下文被堆叠。
- 它成为一个新的格式上下文。这意味着，举例来说，如果有一个 paint containment 的块级元素，它将被作为一个新的，独立的布局环境。这意味着元素的外布局不会影响包含元素的孩子节点。

### Style

这个值打开该元素的样式控制。这确保了，对于性能这会不仅仅作用于一个元素及其后代，这些效果也不忽视包含的元素。

它很难预测改变一个元素的样式会返回给 DOM 树什么影响。这方面的例子如 CSS counters，其中在一个孩子节点改变计数器，可以影响文档中其他地方使用到的相同名称的计数器值。若设置 contain: style，样式的改变不会传播回到过去包含的元素。

### Size

这个值打开该元素的尺寸控制。这确保包含元素可以无需检查其后代节点进行布局。

contain: size 意思是其子元素不影响父元素的大小，它被推断或声明的尺寸将会被使用。因此，如果你设置 contain: size 但没有指定元素尺寸（直接或通过 flex 属性），它将按 0 像素乘 0 像素渲染！

### Layout

这个值打开该元素的布局控制。这确保所包含元素对布局目的完全不透明；外部不能影响其内部布局，反之亦然。

布局通常是文档的范围，与 DOM 结构大小规模成比例，因此，如果你改变一个元素的 left 属性(作为示例)，那么 DOM 中的每个元素可能需要进行检查。这里使 containment 可能把元素数量减少到极少数，而不是整个文档，节省了浏览器大量的不必要工作和显著提高性能。

## object-fit

object-fit CSS 属性指定可替换元素的内容应该如何适应到其使用的高度和宽度确定的框。通过使用 object-position 属性来切换被替换元素的内容对象在元素框内的对齐方式。

语法：`object-fit: fill | contain | cover | none | scale-down`

- contain：被替换的内容将被缩放，以在填充元素的内容框时保持其宽高比。 整个对象在填充盒子的同时保留其长宽比，因此如果宽高比与框的宽高比不匹配，该对象将被添加“黑边”。
- cover：被替换的内容在保持其宽高比的同时填充元素的整个内容框。如果对象的宽高比与内容框不相匹配，该对象将被剪裁以适应内容框。
- fill：被替换的内容正好填充元素的内容框。整个对象将完全填充此框。如果对象的宽高比与内容框不相匹配，那么该对象将被拉伸以适应内容框。
- none：被替换的内容将保持其原有的尺寸。
- scale-down：内容的尺寸与 none 或 contain 中的一个相同，取决于它们两个之间谁得到的对象尺寸会更小一些。

## object-position

CSS 属性 object-position 规定了可替换元素的内容，在这里我们称其为对象，在其内容框中的位置。可替换元素的内容框中未被对象所覆盖的部分，则会显示该元素的背景（background）。

语法：

```css
/* <position> values */
/* <position>使用 1 到 4 个值来定义该元素在它所处的二维平面中的定位。可以使用相对或绝对偏移。 */
object-position: center top;
object-position: 100px 50px;

/* Global values */
object-position: inherit;
object-position: initial;
object-position: unset;
```

## text-align-last

CSS 属性 text-align-last 描述的是一段文本中最后一行在被强制换行之前的对齐规则。

语法：`text-align-last: auto | start | end | left | right | center | justify`

属性值：

- auto
  每一行的对齐规则由 text-align 的值来确定，当 text-align 的值是 justify，text-align-last 的表现和设置了 start 的表现是一样的，即如果文本的展示方向是从左到右，则最后一行左侧对齐与内容盒子。
  译者注：
  经测试，当 text-align 的值为 right，并且 text-align-last 设置为 auto 时，文本最后一行的对齐方式相当于 text-align-last 被设置为 right 时的效果。即 text-align-last 设置为 auto 后的表现跟 text-align 的设置有关。
- start
  与 direction 的设置有关。
  如果文本展示方向是从左到右，起点在左侧，则是左对齐；
  如果文本展示方向是从右到左，起点在右侧，则是右对齐。
  如果没有设置 direction ，则按照浏览器文本的默认显示方向来确定。
- end
  与 direction 的设置有关。
  如果文本展示方向是从左到右，末尾在右侧，则是右对齐；
  如果文本展示方向是从右到左，末尾在左侧，则是左对齐。
  如果没有设置 direction ，则按照浏览器文本的默认显示方向来确定。
- left
  最后一行文字与内容盒子的左侧对齐
- right
  最后一行文字与内容盒子的右侧对齐
- center
  最后一行文字与内容盒子居中对齐
- justify
  最后一行文字的开头与内容盒子的左侧对齐，末尾与右侧对齐。

## :placeholder-shown

:placeholder-shown CSS 伪类 在 `<input>` 或 `<textarea>` 元素显示 placeholder text 时生效.

```css
/* 选择所有显示占位符(placeholder)的元素 */
:placeholder-shown {
  border: 2px solid silver;
}
```

## resize

resize CSS 属性允许你控制一个元素的可调整大小性。注意：如果一个 block 元素的 overflow 属性被设置成了 visible，那么 resize 属性对该元素无效。

语法：`resize: none | both | horizontal | vertical | block | inline`

取值

- none：元素不能被用户缩放。
- both：允许用户在水平和垂直方向上调整元素的大小。
- horizontal：允许用户在水平方向上调整元素的大小。
- vertical：允许用户在垂直方向上调整元素的大小。
- block：依赖于 writing-mode 以及它的 direction 取值，元素显示一种机制，允许用户在块方向上水平或垂直地调整元素的大小。
- inline：依赖于 writing-mode 以及它的 direction 取值，元素显示一种机制，允许用户在行内方向上水平或垂直地调整元素的大小。

## ::selection

::selection CSS 伪元素应用于文档中被用户高亮的部分（比如使用鼠标或其他选择设备选中的部分）。

只有一小部分 CSS 属性可以用于::selection 选择器：

- color
- background-color
- cursor
- caret-color
- outline and its longhands
- text-decoration and its associated properties
- text-emphasis-color
- text-shadow

要特别注意的是，background-image 会如同其他属性一样被忽略。

## caret-color

caret-color 属性用来定义插入光标（caret）的颜色，这里说的插入光标，就是那个在网页的可编辑器区域内，用来指示用户的输入具体会插入到哪里的那个一闪一闪的形似竖杠 | 的东西。

语法：`caret-color: auto | <color>`

取值

- auto：默认颜色，此时浏览器应该用 currentcolor 来作为插入光标的颜色，但浏览器可能还会根据当前的背景色、阴影色等来对该颜色进行适当的调整以确保该插入光标具有良好的可见性。
- `<color>`：所指定的插入光标的颜色值.

## mask

[MDN Mask](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mask)

其下有很多属性 mask-image, mask-mode, mask-repeat, mask-border 等等。

## appearance

[MDN Appearance](https://developer.mozilla.org/zh-CN/docs/Web/CSS/appearance)

## :target

:target CSS 伪类 代表一个唯一的页面元素(目标元素)，其 id 与当前 URL 片段匹配.

```css
/* 选择一个ID与当前URL片段匹配的元素*/
:target {
  border: 2px solid black;
}
```

例如, 以下 URL 拥有一个片段 (以#标识的) ，该片段指向一个 ID 为 section2 的页面元素:

```html
http://www.example.com/index.html#section2
```

若当前 URL 等于上面的 URL，下面的元素可以通过 :target 选择器被选中：

```html
<section id="section2">Example</section>
```

## media="print"

利用 CSS3 媒体查询的能力，添加 media=print 的样式表，隐藏打印时不希望显示的部分，并调整需要打印部分的显示效果。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
    <style>
      .other,
      .main {
        height: 200px;
      }
      .other {
        background: red;
      }
      .main {
        background: yellow;
      }
    </style>
  </head>
  <body>
    <div class="other"></div>
    <div class="main"></div>
    <style media="print">
      * {
        -webkit-print-color-adjust: exact !important;
        /* 加入下面这段 CSS 使得打印时首选“背景图形” */
        color-adjust: exact !important;
      }
      .other {
        display: none;
      }
    </style>
  </body>
</html>
```

## overscroll-behavior

`overscroll-behavior` CSS 属性是 `overscroll-behavior-x` 和 `overscroll-behavior-y` 属性的合并写法, 让你可以控制浏览器过度滚动时的表现——也就是滚动到边界。

默认情况下，当触及页面顶部或者底部时（或者是其他可滚动区域），移动端浏览器倾向于提供一种“触底”效果，甚至进行页面刷新。或者当对话框中含有可滚动内容时，一旦滚动至对话框的边界，对话框下方的页面内容也开始滚动了——这被称为“滚动链”。在某些情况下不想要这些表现，就可以使用 overscroll-behavior 来去除不需要的滚动链，以及类似 QQ 一类的应用下拉刷新效果。

语法:

- auto:默认效果
- contain:设置这个值后，默认的滚动边界行为不变（“触底”效果或者刷新），但是临近的滚动区域不会被滚动链影响到，比如对话框后方的页面不会滚动。
- none:临近滚动区域不受到滚动链影响，而且默认的滚动到边界的表现也被阻止。

如果希望移除标准的滚动至顶部或底部的滚动特效，比如在移动端，滚动到顶部或者底部，在下滑头部会出现一块白色的空白区域，需要移除这个效果就可以设置为 none, 而一个对话框中有滚动条，在滚动到边界时再滚动，其后面的部分也会开始滚动（如果有滚动条的话），想要移除这个效果则可以使用 contain。

## box-decoration-break

> [有趣的 box-decoration-break](https://juejin.im/post/5c77457951882540447df818)

## color-adjust

color-adjust 这个属性是否允许浏览器自己调节颜色以便有更好的阅读体验。

例如，在打印时，浏览器可能会选择忽略所有背景图像并调整文本颜色，以确保针对在白纸上阅读而优化了对比度。这是默认值 economy 的效果。而想要精确显示色彩就需要使用 exact。

语法：

```css
color-adjust: economy;
color-adjust: exact;
```

## margin-inline 和 margin-block

margin-inline 定义元素的逻辑行内开始和结束边距，指的是水平方向的控制，margin-block 属性定义元素的逻辑块开始和结束边距，指的是垂直方向的控制，这两个属性都取决于元素的书写方式，方向性和文本方向而映射到物理边距。margin-inline 是 margin-inline-start， margin-inline-end 的简写，同理 margin-block。

关于取决于书写方式，在横板正向书写时，margin-inline-start 表现跟 margin-left 相同，但是调整为反向书写（direction）时，就表现跟 margin-right 相同。margin-block 同理。

### 逻辑属性

所谓 CSS 逻辑属性，指的是`*-start`，`*-end`以及`*-inline-start`，`*-inline-end`，`*-block-start`， `*-block-end`这类 CSS 属性，其最终渲染的方向是有逻辑性在里面的。

逻辑属性往往配合 direction 属性或者 writing-mode 使用，或者在多语言项目中。

## font-feature-settings

这个属性用于控制 OpenType 字体中的高级印刷功能。

## ::backdrop

::backdrop 伪元素可以用来设置所有全屏元素后面“幕布”的样式，是在任何处于全屏模式的元素下的即刻渲染的盒子。

可以设置`<video>`视频元素的全屏黑背景，可以设置`<dialog>`元素显示时候的背景，也可以设置处于全屏状态下的普通元素(借助[HTML5 fullscreen API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fullscreen_API))的黑背景。

## vector-effect

vector-effect 主要用在 SVG 元素上，可以让 SVG 元素的描边不随着 SVG 图形的尺寸变化而缩放

## :focus-visible

当元素匹配:focus 伪类并且客户端(UA)的启发式引擎决定焦点应当可见(在这种情况下很多浏览器默认显示“焦点框”)时，:focus-visible 伪类将生效。

:focus-visible 可以有效解决 Chrome 浏览器下部分元素的焦点轮廓问题。可以让`<button>`，`<summary>`元素或者设置了 tabindex 的元素在点击时候没有焦点轮廓，键盘访问时候出现。这个选择器可以有效地根据用户的输入方式(鼠标 vs 键盘)展示不同形式的焦点。

Firefox 通过较旧的前缀伪类 :-moz-focusring 支持类似的功能，而 Chrome 需要开启支持实现属性 css

## backdrop-filter

backdrop-filter CSS 属性可以让你为一个元素后面区域添加图形效果（如模糊或颜色偏移）。 因为它适用于元素背后的所有元素，为了看到效果，必须使元素或其背景至少部分透明。和 filter 属性的语法一模一样，只不过一个是作用于背后元素，一个是作用于自身。

## image-set()

image-set（）CSS 函数是一种让浏览器从给定集合中选择最合适的 CSS 图像的方法，主要用于高像素密度的屏幕。

```css
background-image: image-set(
  "cat.png" 1x,
  "cat-2x.png" 2x,
  "cat-print.png" 600dpi
);
```

表示：如果屏幕是一倍屏，也就是设备像素比是 1 的话，就使用 cat.png 作为背景图片；如果屏幕是 2 倍屏及其以上，则使用 cat-2x.png 这张图作为背景图；如果设备的分辨率大于 600dpi，则使用 cat-print.png 作为背景图。

## inset

inset 它具有与 margin 相同的多值语法。它是与 top，right，bottom 和/或 left 属性相对应的简写。`inset: 0` 也就等同于 `left: 0; top: 0; right: 0; bottom: 0;`。

## display: contents

> 相关文章[使用 display: contents 增强页面语义](https://github.com/chokcoco/iCSS/issues/79)

设置了 display: contents 的元素本身不会被渲染，但是其子元素能够正常被渲染。

总结来说，这个属性适用于那些充当遮罩（wrapper）的元素，这些元素本身没有什么作用，可以被忽略的一些布局场景。

应用：

1. 充当无语义的包裹框，React 中的 `<React.Fragment>`，Vue 中的 `<template>`，都是一层没有样式的包裹，并且不会渲染在 DOM 树中，但有时可以给该元素加上 display: contents 来达到这种效果，只不过它会出现在 DOM 树中
2. 让代码更加符合语义化，例如：因为`<button>`标签存在一些默认样式，使用`<p>、<div>、<a>` 等标签来模拟，但是这样又缺少了语义化，可以依旧使用 button 标签，但是让它 display: contents，通过外层的 p 或者 div 来控制具体样式

## display: flow-root 和 display: flow

## 可替换元素

> [可替换元素](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Replaced_element)

## 可变字体

> [突破限制，CSS font-variation 可变字体的魅力](https://github.com/chokcoco/iCSS/issues/164)

可变字体（Variable fonts）是 OpenType 字体规范上的演进，它允许将同一字体的多个变体统合进单独的字体文件中。从而无需再将不同字宽、字重或不同样式的字体分割成不同的字体文件。可以将它理解为 all in one，通过使用可变字体，所有字重、字宽、斜体等情况的排列组合都可以被装进一个文件中。

与可变字体对应的是标准字体，只代表字体的某一特定的宽度/字重/样式的组合的字体文件，通常在页面引入的字体文件都是这种。

可变字体可以提供像对 font-weight 和 font-stretch 等描述符的允许范围，而不是根据加载的字体文件来命名。

```css
@font-face {
  font-family: "Anybody";
  src: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/61488/ETCAnybodyPB.woff2")
    format("woff2-variations");
  font-display: block;
  font-style: normal italic;
  font-weight: 100 900;
  font-stretch: 10% 400%;
}
p {
  font-family: "Anybody", sans-serif;
  font-size: 48px;
}
p:nth-child(1) {
  font-weight: 100;
}
// ...
p:nth-child(6) {
  font-weight: 600;
}
```

### font-variation-settings

除了直接通过 font-weight 去控制可变字体的粗细，CSS 还提供了一个新的属性 font-variation-settings 去同时控制可变字体的多个属性。

可变字体新格式的核心是可变轴的概念，其描述了字体设计中某一特性的允许变化范围。

所有可变字体都有至少有 5 个可以通过 font-variation-settings 控制的属性轴，它们属于注册轴（registered），能够映射现有的 CSS 属性或者值。它们是：

- 字重轴 "wght"：对应 font-weight，控制字体的粗细
- 宽度轴 "wdth"：对应 font-stretch，控制字体的伸缩
- 斜度轴 "slnt" (slant)：对应字体的 font-style: oblique + angle，控制字体的倾斜
- 斜体轴 "ital"：对应字体的 font-style: italic，控制字体的倾斜（注意，和 font-style: oblique 是不一样的倾斜）
- 光学尺寸轴 "opsz"：对应字体的 font-optical-sizing，控制字体的光学尺寸

```css
/* 注册轴设定的多个样式属性变化 */
@keyframes fontWeightChange {
  0% {
    font-variation-settings: "wght" 100, "wdth" 60;
  }
  100% {
    font-variation-settings: "wght" 600, "wdth" 400;
  }
}
```

上面说可变字体新格式的核心是可变轴，可变轴分为注册轴（上面的 5 个）和自定义轴。注册轴最为常见，常见到制定规范的作者认为有必要进行标准化。自定义轴是无限的，字体设计师可以定义和界定他们喜欢的任何轴。

## CSS @layer

CSS @规则 中的 @layer 声明了一个级联层， 同一层内的规则将级联在一起，这给予了开发者对层叠机制的更多控制。

@layer 级联层最大的功能，就是用于控制不同样式之间的优先级。看下面这样一个例子，定义了两个 @layer 级联层 A 和 B：

```css
div {
  width: 200px;
  height: 200px;
}
@layer A {
  div {
    background: blue;
  }
}
@layer B {
  div {
    background: green;
  }
}
```

由于 @layer B 的顺序排在 @layer A 之后，所以 @layer B 内的所有样式优先级都会比 @layer A 高，最终 div 的颜色为 green。

当然，如果页面内的 @layer 太多，可能不太好记住所有 @layer 的顺序，因此，还有这样一种写法。

```css
/* 首先定义了 @layer B, C, A 三个 @layer 级联层。而后再后面的 CSS 代码中补充了每个级联层的 CSS 代码，但是样式的优先级为：A > C > B */
@layer B, C, A;
```

### @layer 级联层的三种定义引入方式

- 直接创建一个块级的 @layer 规则，其中包含作用于该层内部的 CSS 规则
- 一个级联层可以通过 @import 来创建，规则存在于被引入的样式表内
- 创建带命名的级联层，但不指定任何样式。样式随后可在 CSS 内任意位置添加

### 非 @layer 包裹层与 @layer 层内样式优先级

非 @layer 包裹的样式，拥有比 @layer 包裹样式更高的优先级

```css
@layer A {
  a {
    color: red;
  }
}
@layer B {
  a {
    color: orange;
  }
}
@layer C {
  a {
    color: yellow;
  }
}
a {
  color: green;
} /* 未被 @layer 包裹的样式 */
/* 最终显示为 green */
```

### 匿名层与嵌套层

还有两种层级关系，分别是匿名层和嵌套层。

## CSS @Property

> 原文：[CSS @property，让不可能变可能](https://github.com/chokcoco/iCSS/issues/109)

根据 [MDN -- CSS Property](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@property)，@Property CSS at-rule 是 CSS Houdini API 的一部分, 它允许开发者显式地定义他们的 CSS 自定义属性，允许进行属性类型检查、设定默认值以及定义该自定义属性是否可以被继承。

### @Property 示例

正常而言，定义和使用一个 CSS 自定义属性的方法是这样的：

```css
:root {
  --whiteColor: #fff;
}
p {
  color: var(--whiteColor);
}
```

而有了 @property 规则之后，还可以像下述代码这样去定义个 CSS 自定义属性：

```css
@property --property-name {
  syntax: "<color>";
  inherits: false;
  initial-value: #fff;
}
p {
  color: var(--property-name);
}
```

简单解读下：

- @property --property-name 中的 --property-name 就是自定义属性的名称，定义后可在 CSS 中通过 var(--property-name) 进行引用
- syntax：该自定义属性的语法规则，也可以理解为表示定义的自定义属性的类型
- inherits：是否允许继承
- initial-value：初始值

其中，@property 规则中的 syntax 和 inherits 描述符是必需的。

当然，在 JavaScript 内定义的写法也很简单，顺便一提：

```js
CSS.registerProperty({
  name: "--property-name",
  syntax: "<color>",
  inherits: false,
  initialValue: "#c0ffee",
});
```

### 支持的 syntax 语法类型

syntax 支持的语法类型非常丰富，基本涵盖了所有能想到的类型。

- length
- number
- percentage
- length-percentage
- color
- image
- url
- integer
- angle
- time
- resolution
- transform-list
- transform-function
- custom-ident (a custom identifier string)

#### syntax 中的 +、#、| 符号

定义的 CSS @property 变量的 syntax 语法接受一些特殊的类型定义。

- `syntax: '<color#>'` ：接受逗号分隔的颜色值列表
- `syntax: '<length+>'` ：接受以空格分隔的长度值列表
- `syntax: '<length | length+>'`：接受单个长度或者以空格分隔的长度值列表

### 使用 color syntax 语法类型作用于渐变

来看这样一个例子，有这样一个渐变的图案：

```css
div {
  background: linear-gradient(45deg, #fff, #000);
}
```

改造下上述代码，改为使用 CSS 自定义属性：

```css
:root {
  --colorA: #fff;
  --colorB: #000;
}
div {
  background: linear-gradient(45deg, var(--colorA), var(--colorB));
}
```

得到的还是同样的一个渐变图，再加上一个过渡效果：

```css
:root {
  --colorA: #fff;
  --colorB: #000;
}
div {
  background: linear-gradient(45deg, var(--colorA), var(--colorB));
  transition: 1s background;

  &:hover {
    --colorA: yellowgreen;
    --colorB: deeppink;
  }
}
```

看看鼠标 Hover 的时候，虽然设定了 1s 的过渡动画 transition: 1s background，但是很可惜，CSS 是不支持背景渐变色的直接过渡变化的，得到的只是两帧之间的直接变化。

#### 使用 CSS @Property 进行改造

简单进行改造一下，使用 color syntax 语法类型：

```css
@property --houdini-colorA {
  syntax: "<color>";
  inherits: false;
  initial-value: #fff;
}
@property --houdini-colorB {
  syntax: "<color>";
  inherits: false;
  initial-value: #000;
}
.property {
  background: linear-gradient(
    45deg,
    var(--houdini-colorA),
    var(--houdini-colorB)
  );
  transition: 1s --houdini-colorA, 1s --houdini-colorB;

  &:hover {
    --houdini-colorA: yellowgreen;
    --houdini-colorB: deeppink;
  }
}
```

使用了 @property 语法，定义了两个 CSS Houdini 自定义变量 --houdini-colorA 和 --houdini-colorB，在 hover 变化的时候，改变这两个颜色。

需要关注的是，设定的过渡语句 transition: 1s --houdini-colorA, 1s --houdini-colorB，在这里，是针对 CSS Houdini 自定义变量设定过渡，而不是针对 background 设定过渡动画。成功了，渐变色的变化从两帧的逐帧动画变成了补间动画，实现了从一个渐变色过渡到另外一个渐变色的效果

### conic-gradient 配合 CSS @Property 实现饼图动画

使用 percentage 百分比类型或者 angle 角度类型，实现一个饼图的 hover 动画。如果还是使用传统的写法，利用角向渐变实现不同角度的饼图：

```css
.normal {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    yellowgreen,
    yellowgreen 25%,
    transparent 25%,
    transparent 100%
  );
  transition: background 300ms;

  &:hover {
    background: conic-gradient(
      yellowgreen,
      yellowgreen 60%,
      transparent 60.1%,
      transparent 100%
    );
  }
}
```

由于 conic-gradient 也是不支持过渡动画的，得到的是一帧向另外一帧的直接变化，使用 CSS Houdini 自定义变量改造一下：

```css
@property --per {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 25%;
}

div {
  background: conic-gradient(
    yellowgreen,
    yellowgreen var(--per),
    transparent var(--per),
    transparent 100%
  );
  transition: --per 300ms linear;

  &:hover {
    --per: 60%;
  }
}
```

#### syntax 的 | 符号

在 conic-gradient 中，可以使用百分比也可以使用角度作为关键字，上述的 DEMO 也可以改造成这样：

```css
@property --per {
  syntax: '<percentage> | <angle>';
  inherits: false;
  initial-value: 25%;
}
...
```

表示，自定义属性即可以是一个百分比值，也可以是一个角度值。

### 使用 length 类型作用于一些长度变化

掌握了上述的技巧，就可以利用 Houdini 自定义变量的这个能力，去填补修复以前无法直接过渡动画的一些效果了。

想实现这样一个文字下划线的 Hover 效果：

```css
p {
  text-underline-offset: 1px;
  text-decoration-line: underline;
  text-decoration-color: #000;
  transition: all 0.3s;

  &:hover {
    text-decoration-color: orange;
    text-underline-offset: 10px;
    color: orange;
  }
}
```

text-underline-offset 不支持过渡动画，所以得不到想要的效果。使用 Houdini 自定义变量改造，化腐朽为神奇：

```css
@property --offset {
  syntax: "<length>";
  inherits: false;
  initial-value: 0;
}
div {
  text-underline-offset: var(--offset, 1px);
  text-decoration: underline;
  transition: --offset 400ms, text-decoration-color 400ms;

  &:hover {
    --offset: 10px;
    color: orange;
    text-decoration-color: orange;
  }
}
```
