# CSS 新特性 2

## 属性选择器

在 CSS 选择器家族中，新增这样一类比较新的选择器 -- 逻辑选择器，目前共有 4 名成员：

- :is
- :where
- :not
- :has

### :is 伪类选择器

:is() CSS 伪类函数将选择器列表作为参数，并选择该列表中任意一个选择器可以选择的元素。它更像是一种语法糖，简化了某些复杂代码的写法。

在之前，对于多个不同父容器的同个子元素的一些共性样式设置，可能会出现如下 CSS 代码：

```css
header p:hover,
main p:hover,
footer p:hover {
  color: red;
  cursor: pointer;
}
```

而如今有了 :is() 伪类，上述代码可以改写成：

```css
:is(header, main, footer) p:hover {
  color: red;
  cursor: pointer;
}
```

#### 支持多层层叠连用

再来看看这种情况，原本的 CSS 代码如下：

```html
<div><i>div i</i></div>
<p><i>p i</i></p>
<div><span>div span</span></div>
<p><span>p span</span></p>
<h1><span>h1 span</span></h1>
<h1><i>h1 i</i></h1>
```

如果要将上述 HTML 中，`<div>` 和 `<p>` 下的 `<span>` 和 `<i>` 的 color 设置为 red，正常的 CSS 可能是这样：

```css
div span,
div i,
p span,
p i {
  color: red;
}
```

有了 :is() 后，代码可以简化为：

```css
:is(div, p) :is(span, i) {
  color: red;
}
```

#### 不支持伪元素

有个特例，不能用 :is() 来选取 ::before 和 ::after 两个伪元素。

#### :is 选择器的优先级

:is() 的优先级是由它的选择器列表中优先级最高的选择器决定的。

对于 `div :is(p, #text-id)`，`is:()` 内部有一个 id 选择器，因此，被该条规则匹配中的元素，全部都会应用 `div #id` 这一级别的选择器优先级。对于 `:is()` 选择器的优先级，我们不能把它们割裂开来看，它们是一个整体，优先级取决于选择器列表中优先级最高的选择器。

#### :is 的别名

:is 的别名 :matches() 与 :any()，:is() 是最新的规范命名，在之前，有过有同样功能的选择，分别是：

```css
:is(div, p) span {
}
/* 下面 3 个都已经废弃，不建议再继续使用。 */
/* 等同于 */
:-webkit-any(div, p) span {
}
:-moz-any(div, p) span {
}
:matches(div, p) span {
}
```

### :where()

:where() CSS 伪类函数接受选择器列表作为它的参数，将会选择所有能被该选择器列表中任何一条规则选中的元素。

:where() 和 :is() 的不同之处在于，:where() 的优先级总是为 0 ，但是 :is() 的优先级是由它的选择器列表中优先级最高的选择器决定的。

```css
:is(div) p {
  color: red;
}
:where(#container) p {
  color: green;
}
```

由于 :where(#container) 的优先级为 0，因此文字的颜色，依旧为红色 red。

### :not()

CSS 伪类 :not() 用来匹配不符合一组选择器的元素。由于它的作用是防止特定的元素被选中，它也被称为反选伪类

- :not() 伪类不能被嵌套，:not(:not(...)) 是无效的。
- 由于伪元素不是简单的选择器，不能被当作 :not() 中的参数，如 :not(p::before) 这样的选择器将不会工作。
- 可以利用这个伪类提高规则的优先级。例如， #foo:not(#bar) 和 #foo 会匹配相同的元素，但是前者的优先级更高。
- 这个选择器只会应用在一个元素上，无法用它来排除所有父元素。比如， body :not(table) a 依旧会应用到表格元素 `<table>` 内部的 `<a>` 上, 因为 `<tr>` 将会被 :not(table) 这部分选择器匹配。

#### :not 的优先级问题

与 :is() 类似，:not() 选择器本身不会影响选择器的优先级，它的优先级是由它的选择器列表中优先级最高的选择器决定的。并且，在 CSS Selectors Level 3，`:not()` 内只支持单个选择器，而从 CSS Selectors Level 4 开始，`:not()` 内部支持多个选择器，像是这样：

```css
/* CSS Selectors Level 3，:not 内部如果有多个值需要分开 */
p:not(:first-of-type):not(.special) {
}
/* CSS Selectors Level 4 支持使用逗号分隔*/
p:not(:first-of-type, .special) {
}
```

#### MDN 的错误例子？一个有意思的现象

有趣的是，在 MDN 介绍 :not 的页面，有这样一个例子：

```css
/* Selects any element that is NOT a paragraph */
:not(p) {
  color: blue;
}
```

意思是，`:not(p)` 可以选择任何不是 `<p>` 标签的元素。然而，上面的 CSS 选择器，在如下的 HTML 结构，实测的结果不太对劲。

```html
<p>p</p>
<div>div</div>
<span>span</span>
<h1>h1</h1>
```

结果 `:not(p)` 仍然可以选中 `<p>` 元素。这是由于 `:not(p)` 同样能够选中 `<body>`，那么 `<body>` 的 color 即变成了 blue，由于 color 是一个可继承属性，`<p>` 标签继承了 `<body>` 的 color 属性，导致看到的 `<p>` 也是蓝色。

#### :not() 实战解析

在 W3 CSS selectors-4 规范 中，新增了一个非常有意思的 `:focus-visible` 伪类。

`:focus-visible` 这个选择器可以有效地根据用户的输入方式(鼠标 vs 键盘)展示不同形式的焦点。

有了这个伪类，就可以做到，当用户使用鼠标操作可聚焦元素时，不展示 :focus 样式或者让其表现较弱，而当用户使用键盘操作焦点时，利用 :focus-visible，让可获焦元素获得一个较强的表现样式。

看个简单的 Demo：

```html
<button>Test 1</button>
<button>Test 2</button>
<button>Test 3</button>
<style>
  button:active {
    background: #eee;
  }
  button:focus {
    outline: 2px solid red;
  }
</style>
```

使用鼠标点击可以看到，触发了元素的 `:active` 伪类，也触发了 `:focus` 伪类，不太美观。但是如果设置了 `outline: none` 又会使键盘用户的体验非常糟糕。因为当键盘用户使用 Tab 尝试切换焦点的时候，会因为 `outline: none` 而无所适从。可以使用 `:focus-visible` 伪类改造一下：

```css
button:active {
  background: #eee;
}
button:focus {
  outline: 2px solid red;
}
button:focus:not(:focus-visible) {
  outline: none;
}
```

可以看到，使用鼠标点击，不会触发 :foucs，只有当键盘操作聚焦元素，使用 Tab 切换焦点时，outline: 2px solid red 这段代码才会生效。这样，就既保证了正常用户的点击体验，也保证了无法使用鼠标的用户的焦点管理体验，在可访问性方面下了功夫。值得注意的是，这里为什么使用了 button:focus:not(:focus-visible) 这么绕的写法而不是直接这样写呢：

```css
button:focus {
  outline: unset;
}
button:focus-visible {
  outline: 2px solid red;
}
```

解释一下，`button:focus:not(:focus-visible)` 的意思是，button 元素触发 focus 状态，并且不是通过 focus-visible 触发，理解过来就是在支持 :focus-visible 的浏览器，通过鼠标激活 :focus 的 button 元素，这种情况下，不需要设置 outline。为的是兼容不支持 :focus-visible 的浏览器，当 :focus-visible 不兼容时，还是需要有 :focus 伪类的存在。因此，这里借助 :not() 伪类，巧妙的实现了一个实用效果的方案降级。

### :has()

:has() CSS 伪类代表一个元素，其给定的选择器参数（相对于该元素的 :scope）至少匹配一个元素。填补了在之前 CSS 选择器中，没有核心意义上真正的父选择器的空缺，比较可惜的是，:has() 在最近的 Selectors Level 4 规范中被确定，目前的兼容性还比较惨淡。实际看个例子：

```html
<div>
  <p>div -- p</p>
</div>
<div>
  <p class="g-test-has">div -- p.has</p>
</div>
<div>
  <p>div -- p</p>
</div>
<style>
  div:has(.g-test-has) {
    border: 1px solid #000;
  }
</style>
```

通过 `div:has(.g-test-has)` 选择器，意思是，选择 div 下存在 class 为 .g-test-has 的 div 元素。

注意，这里选择的不是 :has() 内包裹的选择器选中的元素，而是使用 :has() 伪类的宿主元素。上面例子中由于第二个 div 下存在 class 为 .g-test-has 的元素，因此第二个 div 被加上了 border。

#### :has() 父选择器 -- 同级结构的兄元素选择

有一种情况，在之前也比较难处理，同级结构的兄元素选择。看这个 DEMO：

```html
<div class="has-test">div + p</div>
<p>p</p>

<div class="has-test">div + h1</div>
<h1>h1</h1>

<div class="has-test">div + h2</div>
<h2>h2</h2>

<div class="has-test">div + ul</div>
<ul>
  ul
</ul>
<!-- 想找到兄弟层级关系中，后面接了 <h2> 元素的 .has-test 元素，可以这样写： -->
<style>
  .has-test:has(+ h2) {
    margin-left: 24px;
    border: 1px solid #000;
  }
</style>
```

这里体现的是兄弟结构，精确寻找对应的前置兄元素。

## aspect-ratio

aspect-ratio CSS 属性为 box 容器规定了一个期待的纵横比，这个纵横比可以用来计算自动尺寸以及为其他布局函数服务。当元素的宽高成一定比例时就可以使用该属性。

语法：`aspect-ratio: auto | <ratio>`

- auto：具有固有宽高比的替换元素将使用该宽高比，否则该内容框没有首选的宽高比
- ratio：内容框首选的宽高比是通过 width / height 定义的。当为内容框定义 box-sizing 之后，尺寸的计算就可以通过指定宽高比来实现。

```css
/* 子元素垂直居中，并且该正方形的长度/宽度为父容器宽度(width)一半的正方形 */
.container {
  display: grid;
  place-items: center;
}
.item {
  width: 50%;
  aspect-ratio: 1/1;
}
```

### 测试 viewport 的宽高比

aspect-ratio CSS 媒体属性 可以用来测试 viewport 的宽高比。可以使用 min-aspect-ratio 和 max-aspect-ratio 分别查询最小和最大的值。

下面的例子通过不同的 viewport 视口宽高比应用不同的样式

```html
<div id="inner">
  Watch this element as you resize your viewport's width and height.
</div>
<style>
  /* 最小宽高比 */
  @media (min-aspect-ratio: 8/5) {
    div {
      background: #9af; /* blue */
    }
  }

  /* 最大宽高比 */
  @media (max-aspect-ratio: 3/2) {
    div {
      background: #9ff; /* cyan */
    }
  }

  /* 明确的宽高比, 放在最下部防止同时满足条件时的覆盖*/
  @media (aspect-ratio: 1/1) {
    div {
      background: #f9a; /* red */
    }
  }
</style>
```

## content-visibility

> 相关文章[使用 content-visibility 优化渲染性能](https://github.com/chokcoco/iCSS/issues/185)

content-visibility 属性控制一个元素是否渲染其内容，允许用户代理潜在地省略大量布局和渲染工作，直到需要它为止。基本上，它使用户代理能够在需要之前跳过元素的渲染工作（包括布局和绘画）——这使得初始页面加载速度更快。

可取值：

- visible：无效果，元素内容像正常一样渲染显示
- hidden：跳过该元素内容（这里需要注意的是，跳过的是内容的渲染）。用户代理功能（例如在页面中查找、标签顺序导航等）不能访问跳过的内容，也不能选择或聚焦。这类似于给内容设置 display: none。
- auto：该元素会转为 layout,style,paint 容器，如果元素与用户无关，它也会跳过其内容，也就是不会渲染其后代元素。与隐藏不同的是，跳过的内容必须仍可正常用于用户代理功能，例如在页面中查找、标签顺序导航等，并且必须正常可聚焦和可选择。

### auto

如果一个元素离屏，它的后代不会被渲染，浏览器计算元素大小而无须考虑它的内容，大部分的渲染是无须考虑后代的 style 和 layout。当元素接近视口时，浏览器不再给容器添加 size，并开始绘制和点击测试元素的内容。渲染可以即时完成，让用户马上看到视图。

### hidden

如果想保持内容未呈现（不管它是否在屏幕上），同时利用缓存呈现状态的好处，那么使用 hidden。

content-visibility: hidden 属性对 带来的好处跟 content-visibilit: auto 对于离屏元素带来的好处是一样的，不同点是，它不会像 auto 一样自动的渲染到屏幕上。

与其他隐藏元素的方法进行比较：

- `display:none`：隐藏元素并且销毁渲染状态，意味着从隐藏到显示的成本与渲染一个新元素是一样的
- `visibility: hidden`：隐藏元素并且保存渲染状态，它并不是真的从文档中移除元素，因为它（和它的子树）仍然占据页面上的几何空间，仍然可以单击。
- `content-visibility: auto`：隐藏元素并且保存渲染状态，如果有变化发送，让元素显示出来的方法是移除 property content-visibility: atuo

### contain-intrinsic-size

contain-intrinsic-size 控制由 content-visibility 指定的元素的固有大小。

为了更好的从 content-visibility 收益，浏览器应用 size 来确保渲染的内容尺寸不受其他影响，意味着元素将 进行 layout 计算即使元素为空，如果元素没有高度，那么默认高度为 0 px。这可能并不理想，因为滚动条的大小会发生变化，这取决于每个故事的高度不为零。此时，CSS 提供了另外一个属性 contain-intrinsic-size ，它可以配置元素的占位大小

### 利用 content-visibility: hidden 优化展示切换性能

首先来看 content-visibility: hidden，它通常会拿来和 display: none 做比较，但是其实它们之间还是有很大的不同的。

首先，假设有两个 DIV 包裹框，设置两个 div 为 200x200 的黑色块：

```html
<style>
  .g-wrap > div {
    width: 200px;
    height: 200px;
    background: #000;
  }
</style>
<div class="g-wrap">
  <div>1111</div>
  <div class="hidden">2222</div>
</div>
```

效果如下：

![cv-img1](https://user-images.githubusercontent.com/8554143/171548077-5b71e915-e23d-47ba-9550-8847998ddacb.png)

给其中的 .hidden 设置 content-visibility: hidden，看看会发生什么，效果如下：

![cv-img2](https://user-images.githubusercontent.com/8554143/171548265-02636c5c-7688-4141-9375-54b667781777.png)

添加了 content-visibility: hidden 之后，消失的只是添加了该元素的 div 的子元素消失不见，而父元素本身及其样式，还是存在页面上的。

如果去掉设置了 content-visibility: hidden 的元素本身的 width、height、padding、margin 等属性，则元素看上去就如同设置了 display: none 一般，在页面上消失不见了。

那么，content-visibility: hidden 的作用是什么呢？

设置了 content-visibility: hidden 的元素，其元素的子元素将被隐藏，但是，它的渲染状态将会被缓存。所以，当 content-visibility: hidden 被移除时，用户代理无需重头开始渲染它和它的子元素。

因此，如果将这个属性应用在一些一开始需要被隐藏，但是其后在页面的某一时刻需要被渲染，或者是一些需要被频繁切换显示、隐藏状态的元素上，其渲染效率将会有一个非常大的提升。

### 利用 content-visibility: auto 实现懒加载或虚拟列表

content-visibility: auto 的作用是，如果该元素不在屏幕上，并且与用户无关，则不会渲染其后代元素。是不是与 LazyLoad 非常类似？

来看这样一个 DEMO ，了解其作用，假设存在这样一个 HTML 结构，含有大量的文本内容：

```html
<div class="g-wrap">
  <div class="paragraph">...</div>
  <!-- ... 包含了 N 个 paragraph -->
  <div class="paragraph">...</div>
</div>
```

整个的页面看起来是这样的：

![cv-img3](https://user-images.githubusercontent.com/8554143/171573411-2e21f296-ee02-4b55-bd36-e060433949e8.gif)

由于，没有对页面内容进行任何处理，因此，所有的 .paragraph 在页面刷新的一瞬间，都会进行渲染，看到的效果就如上所示。

现代浏览器愈加趋于智能，基于这种场景，其实希望对于仍未看到，仍旧未滚动到的区域，可以延迟加载，只有到需要展示、滚动到该处时，页面内容才进行渲染。

基于这种场景，`content-visibility: auto` 就应运而生了，它允许浏览器对于设置了该属性的元素进行判断，如果该元素当前不处于视口内，则不渲染该元素。

基于上述的代码，只需要最小化，添加这样一段代码：

```css
.paragraph {
  content-visibility: auto;
}
```

再看看效果，仔细观察右侧的滚动条：

![cv-img4](https://user-images.githubusercontent.com/8554143/171574445-a32c41c4-1f56-4b5d-b2c2-335df8a9c163.png)

对比下添加了 content-visibility: auto 和没有添加 content-visibility: auto 的两种效果下文本的整体高度：

![cv-img5](https://user-images.githubusercontent.com/8554143/171576296-42b82cbb-c1b3-4e4b-a881-1ad2ef049248.png)

设置了 content-visibility: auto 的元素，在非可视区域内，目前并没有被渲染，因此，右侧内容的高度其实是比正常状态下少了一大截的。实际开始进行滚动，看看会发生什么：

![cv-img6](https://user-images.githubusercontent.com/8554143/171604657-12940ccb-f57e-4985-be49-2839e1bb3a73.gif)

由于下方的元素在滚动的过程中，出现在视口范围内才被渲染，因此，滚动条出现了明显的飘忽不定的抖动现象。（当然这也是使用了 content-visibility: auto 的一个小问题之一），不过明显可以看出，这与使用 JavaScript 实现的懒加载或者延迟加载非常类似。

当然，与懒加载不同的是，在向下滚动的过程中，上方消失的已经被渲染过且消失在视口的元素，也会因为消失在视口中，重新被隐藏。因此，即便页面滚动到最下方，整体的滚动条高度还是没有什么变化的。

### content-visibility 是否能够优化渲染性能？

content-visibility: auto 对于长文本、长列表功能的优化是显而易见的。

### 利用 contain-intrinsic-size 解决滚动条抖动问题

当然，content-visibility 也存在一些小问题。在利用 content-visibility: auto 处理长文本、长列表的时候。在滚动页面的过程中，滚动条一直在抖动，这不是一个很好的体验。

这里可以使用另外一个 CSS 属性，也就是 contain-intrinsic-size，来解决这个问题。

还是上面的例子，如果不使用 contain-intrinsic-size，只对视口之外的元素使用 content-visibility: auto，那么视口外的元素高度通常就为 0。当然，如果直接给父元素设置固定的 height，也是会有高度的。

可以同时利用上 contain-intrinsic-size，如果能准确知道设置了 content-visibility: auto 的元素在渲染状态下的高度，就填写对应的高度。如果如法准确知道高度，也可以填写一个大概的值：

```css
.paragraph {
  content-visibility: auto;
  contain-intrinsic-size: 320px;
}
```

如此之后，浏览器会给未被实际渲染的视口之外的 .paragraph 元素一个高度，避免出现滚动条抖动的现象：

![cv-img7](https://user-images.githubusercontent.com/8554143/171690415-0feb7451-f751-4d98-8f6e-8de0b00847ff.gif)

## color-scheme

color-scheme CSS 属性允许元素指示它可以轻松呈现的配色方案。操作系统配色方案的常见选择是“亮”和“暗”，或者是“白天模式”和“夜间模式”。当用户选择其中一种配色方案时，操作系统会对用户界面进行调整。

语法：

```css
color-scheme: normal;
color-scheme: light;
color-scheme: dark;
color-scheme: light dark;
```

- normal：表示元素未指定任何配色方案，因此应使用浏览器的默认配色方案呈现。
- light：表示可以使用操作系统亮色配色方案渲染元素。
- dark：表示可以使用操作系统深色配色方案渲染元素。

## prefers-color-scheme

prefers-color-scheme CSS 媒体特性用于检测用户是否有将系统的主题色设置为亮色或者暗色。

语法：

- no-preference：表示系统未得知用户在这方面的选项。
- light：表示用户已告知系统他们选择使用浅色主题的界面。
- dark：表示用户已告知系统他们选择使用暗色主题的界面。

“未得知”可理解为：浏览器的宿主系统不支持设置主题色，或者支持主题色并默认为/被设为了未设置/无偏好。“已告知”为：浏览器的宿主系统支持设置主题色，且被设置为了亮色或者暗色。

## accent-color

CSS accent-color （强调色）属性可以在不改变浏览器默认表单组件基本样式的前提下重置组件的颜色。

目前支持下面这些 HTML 控件元素：

- 复选框：`<input type=”checkbox”>`
- 单选框：`<input type=”radio”>`
- 范围选择框：`<input type=”range”>`
- 进度条：`<progress>`

accent-color 属性具有继承性，只需要在对应表单控件元素的祖先元素上设置，响应的控件的颜色就会发生变化

## mask-composite

> 原文链接[高阶切图技巧！基于单张图片的任意颜色转换](https://github.com/chokcoco/iCSS/issues/189)

如何通过单张 PNG/SVG 得到它的反向切图

在运用 mask 对图片进行遮罩切割处理的同时，我们可以同时再运用到 mask-composite 属性。这个是非常有意思的元素。

`-webkit-mask-composite`: 属性指定了将应用于同一元素的多个蒙版图像相互合成的方式。

通俗点来说它的作用就是，当一个元素存在多重 mask 时，就可以运用 `-webkit-mask-composite` 进行效果叠加。

可选取值：

```css
-webkit-mask-composite: clear; /*清除，不显示任何遮罩*/
-webkit-mask-composite: copy; /*只显示上方遮罩，不显示下方遮罩*/
-webkit-mask-composite: source-over;
-webkit-mask-composite: source-in; /*只显示重合的地方*/
-webkit-mask-composite: source-out; /*只显示上方遮罩，重合的地方不显示*/
-webkit-mask-composite: source-atop;
-webkit-mask-composite: destination-over;
-webkit-mask-composite: destination-in; /*只显示重合的地方*/
-webkit-mask-composite: destination-out; /*只显示下方遮罩，重合的地方不显示*/
-webkit-mask-composite: destination-atop;
-webkit-mask-composite: xor; /*只显示不重合的地方*/
```
