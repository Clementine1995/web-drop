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
