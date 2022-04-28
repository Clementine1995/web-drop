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

### :not()

CSS 伪类 :not() 用来匹配不符合一组选择器的元素。由于它的作用是防止特定的元素被选中，它也被称为反选伪类

- :not() 伪类不能被嵌套，:not(:not(...)) 是无效的。
- 由于伪元素不是简单的选择器，不能被当作 :not() 中的参数，如 :not(p::before) 这样的选择器将不会工作。
- 可以利用这个伪类提高规则的优先级。例如， #foo:not(#bar) 和 #foo 会匹配相同的元素，但是前者的优先级更高。
- 这个选择器只会应用在一个元素上，无法用它来排除所有父元素。比如， body :not(table) a 依旧会应用到表格元素 `<table>` 内部的 `<a>` 上, 因为 `<tr>` 将会被 :not(table) 这部分选择器匹配。

### :has()

:has() CSS 伪类代表一个元素，其给定的选择器参数（相对于该元素的 :scope）至少匹配一个元素。
