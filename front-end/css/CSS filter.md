# CSS滤镜

CSS滤镜（filter）属提供的图形特效，像模糊，锐化或元素变色。过滤器通常被用于调整图片，背景和边界的渲染。

## 语法

```css
/* URL to SVG filter */
filter: url("filters.svg#filter-id");

/* <filter-function> values */
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

/* Multiple filters */
filter: contrast(175%) brightness(3%);

/* Global values */
filter: inherit;
filter: initial;
filter: unset;
```

设置一种函数，方法如下：

```css
filter: <filter-function> [<filter-function>]* | none
```

给SVG元素 `<filter>`引用滤镜, 如下：

```css
filter: url(svg-url#element-id)
```

## 函数

### url()

URL函数接受一个XML文件，该文件设置了 一个SVG滤镜，且可以包含一个锚点来指定一个具体的滤镜元素。

```css
filter: url(resources.svg#c1)
```

### blur()

给图像设置高斯模糊。“radius”一值设定高斯函数的标准差，或者是屏幕上以多少像素融在一起，所以值越大越模糊；如果没有设定值，则默认是0；这个参数可设置css长度值，但不接受百分比值。

```css
filter: blur(5px)
```

```html
<svg height="0" xmlns="http://www.w3.org/2000/svg">
  <filter id="svgBlur" x="-5%" y="-5%" width="110%" height="110%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
  </filter>
</svg>
```

### brightness()

给图片应用一种线性乘法，使其看起来更亮或更暗。如果值是0%，图像会全黑。值是100%，则图像无变化。其他的值对应线性乘数效果。值超过100%也是可以的，图像会比原来更亮。如果没有设定值，默认是1。

```css
filter: brightness(0.5)
```

```html
<svg height="0" xmlns="http://www.w3.org/2000/svg">
 <filter id="brightness">
    <feComponentTransfer>
        <feFuncR type="linear" slope="[amount]"/>
        <feFuncG type="linear" slope="[amount]"/>
        <feFuncB type="linear" slope="[amount]"/>
    </feComponentTransfer>
  </filter>
</svg>
```

### contrast()

调整图像的对比度。值是0%的话，图像会全黑。值是100%，图像不变。值可以超过100%，意味着会运用更低的对比。若没有设置值，默认是1。

```css
filter: contrast(200%)
```

```html
<svg height="0" xmlns="http://www.w3.org/2000/svg">
  <filter id="contrast">
    <feComponentTransfer>
      <feFuncR type="linear" slope="[amount]" intercept="-(0.5 * [amount]) + 0.5"/>
      <feFuncG type="linear" slope="[amount]" intercept="-(0.5 * [amount]) + 0.5"/>
      <feFuncB type="linear" slope="[amount]" intercept="-(0.5 * [amount]) + 0.5"/>
    </feComponentTransfer>
  </filter>
</svg>
```

### drop-shadow()

给图像设置一个阴影效果。阴影是合成在图像下面，可以有模糊度的，可以以特定颜色画出的遮罩图的偏移版本。 函数接受 `<shadow>`（在CSS3背景中定义）类型的值，除了“inset”关键字是不允许的。该函数与已有的`box-shadow` box-shadow属性很相似；不同之处在于，通过滤镜，一些浏览器为了更好的性能会提供硬件加速。 `<shadow>`参数如下：

+ `<offset-x>` `<offset-y>` (必须)
  这是设置阴影偏移量的两个 `<length>` 值. `<offset-x>` 设定水平方向距离. 负值会使阴影出现在元素左边. `<offset-y>`设定垂直距离.负值会使阴影出现在元素上方。.查看 [<length>](https://developer.mozilla.org/zh-CN/docs/Web/CSS/length)可能的单位.
  如果两个值都是0, 则阴影出现在元素正后面 (如果设置了 `<blur-radius>` and/or `<spread-radius>`，会有模糊效果).
+ `<blur-radius>` (可选)
  这是第三个 `<length>`值. 值越大，越模糊，则阴影会变得更大更淡.不允许负值 若未设定，默认是0 (则阴影的边界很锐利).
+ `<spread-radius>` (可选)
  这是第四个 `<length>` 值. 正值会使阴影扩张和变大，负值会是阴影缩小.若未设定，默认是0 (阴影会与元素一样大小). 
  注意: Webkit, 以及一些其他浏览器 不支持第四个长度，如果加了也不会渲染。
+ `<color>` (可选)
  查看 `<color>`该值可能的关键字和标记。若未设定，颜色值基于浏览器。在Gecko (Firefox), Presto (Opera)和Trident (Internet Explorer)中， 会应用color color属性的值。另外, 如果颜色值省略，WebKit中阴影是透明的。

```css
filter: drop-shadow(16px 16px 10px black)
```

```html
<svg height="0" xmlns="http://www.w3.org/2000/svg">
 <filter id="drop-shadow">
    <feGaussianBlur in="SourceAlpha" stdDeviation="[radius]"/>
    <feOffset dx="[offset-x]" dy="[offset-y]" result="offsetblur"/>
    <feFlood flood-color="[color]"/>
    <feComposite in2="offsetblur" operator="in"/>
    <feMerge>
      <feMergeNode/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</svg>
```

### grayscale()

将图像转换为灰度图像。值定义转换的比例。值为100%则完全转为灰度图像，值为0%图像无变化。值在0%到100%之间，则是效果的线性乘子。若未设置，值默认是0。

```css
filter: grayscale(100%)
```

### hue-rotate()

给图像应用色相旋转。“angle”一值设定图像会被调整的色环角度值。值为0deg，则图像无变化。若值未设置，默认值是0deg。该值虽然没有最大值，超过360deg的值相当于又绕一圈。

```css
filter: hue-rotate(90deg)
```

### invert()

反转输入图像。值定义转换的比例。100%的价值是完全反转。值为0%则图像无变化。值在0%和100%之间，则是效果的线性乘子。 若值未设置，值默认是0。

```css
filter: invert(100%)
```

### opacity()

转化图像的透明程度。值定义转换的比例。值为0%则是完全透明，值为100%则图像无变化。值在0%和100%之间，则是效果的线性乘子，也相当于图像样本乘以数量。 若值未设置，值默认是1。该函数与已有的opacity属性很相似，不同之处在于通过filter，一些浏览器为了提升性能会提供硬件加速。

```css
filter: opacity(50%)
```

### saturate()

转换图像饱和度。值定义转换的比例。值为0%则是完全不饱和，值为100%则图像无变化。其他值，则是效果的线性乘子。超过100%的值是允许的，则有更高的饱和度。 若值未设置，值默认是1。

```css
filter: saturate(200%)
```

### sepia()

将图像转换为深褐色。值定义转换的比例。值为100%则完全是深褐色的，值为0%图像无变化。值在0%到100%之间，则是效果的线性乘子。若未设置，值默认是0。

```css
filter: sepia(100%)
```

### 复合函数

你可以组合任意数量的函数来控制渲染。下面的例子可以增强图像的对比度和亮度。

```css
filter: contrast(175%) brightness(3%)
```

## 兼容性

对浏览器版本要求比较高，chrome需要53以上，火狐35，而IE不支持，部分版本还需要加上-webkit前缀才能使用。