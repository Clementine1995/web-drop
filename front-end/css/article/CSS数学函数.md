# CSS 数学函数

> 原文地址[现代 CSS 解决方案：CSS 数学函数](https://github.com/chokcoco/iCSS/issues/177)

## Calc()

此 CSS 函数允许在声明 CSS 属性值时执行一些计算。

语法类似于

```css
 {
  width: calc(100% - 80px);
}
```

一些需要注意的点：

- `+` 和 `-` 运算符的两边必须要有空白字符。比如，calc(50% -8px) 会被解析成为一个无效的表达式，必须写成 calc(8px + -50%)
- `*` 和 `/` 这两个运算符前后不需要空白字符，但如果考虑到统一性，仍然推荐加上空白符
- 用 0 作除数会使 HTML 解析器抛出异常
- 涉及自动布局和固定布局的表格中的表列、表列组、表行、表行组和表单元格的宽度和高度百分比的数学表达式，auto 可视为已指定。
- calc() 函数支持嵌套，但支持的方式是：把被嵌套的 calc() 函数全当成普通的括号。（所以，函数内直接用括号就好了。）
- calc() 支持与 CSS 变量混合使用

### Calc 中的加减法与乘除法的差异

加减法两边的操作数都是需要单位的，而乘除法，需要一个无单位数，仅仅表示一个倍率：

```css
 {
  font-size: calc(1rem + 10px);
  width: calc(100px + 10%);
  width: calc(100% / 7);
  animation-delay: calc(1s * 3);
}
```

### Calc 的嵌套

calc() 函数是可以嵌套使用的，像是这样：

```css
 {
  width: calc(100vw - calc(100% - 64px));
  /* 内部的 calc() 函数也可以退化写成一个括号 () */
  width: calc(100vw - (100% - 64px));
}
```

### Calc 内不同单位的混合运算

calc() 支持不同单位的混合运算，对于长度，只要是属于长度相关的单位都可以进行混合运算，包含这些：

- px
- %
- em
- rem
- in
- mm
- cm
- pt
- pc
- ex
- ch
- vh
- vw
- vmin
- vmax

### Calc 搭配 CSS 自定义变量使用

假设我们要实现这样 loading 动画效果，一开始只有 3 个球，可能的写法是这样，给 3 个球都添加同一个旋转动画，然后分别控制他们的 animation-delay：

```html
<div class="g-container">
  <div class="g-item"></div>
  <div class="g-item"></div>
  <div class="g-item"></div>
</div>
<style>
  .item:nth-child(1) {
    animation: rotate 3s infinite linear;
  }
  .item:nth-child(2) {
    animation: rotate 3s infinite -1s linear;
  }
  .item:nth-child(3) {
    animation: rotate 3s infinite -2s linear;
  }
</style>
```

如果有一天，这个动画需要扩展成 5 个球的话，就不得已，得去既添加 HTML，又修改 CSS。而如果借助 Calc 和 CSS 变量，这个场景就可以稍微简化一下。

```html
<div class="g-container">
  <div class="g-item" style="--delay: 0"></div>
  <div class="g-item" style="--delay: 0.6"></div>
  <div class="g-item" style="--delay: 1.2"></div>
  <div class="g-item" style="--delay: 1.8"></div>
  <div class="g-item" style="--delay: 2.4"></div>
</div>
<style>
  .g-item {
    animation: rotate 3s infinite linear;
    /* 核心的 CSS 还是这一句，不需要做任何修改： */
    animation-delay: calc(var(--delay) * -1s);
  }
  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
</style>
```

### calc 搭配自定义变量时候的默认值

```css
 {
  /* (--delay, 1) 中的 1 是个容错机制 */
  animation-delay: calc(var(--delay, 1) * -1s);
}
```

### Calc 字符串拼接

calc 的没有字符串拼接的能力，如下的使用方式都是无法被识别的错误语法：

```css
.el::before {
  /* 不支持字符串拼接 */
  content: calc("My " + "counter");
}
.el::before {
  /* 更不支持字符串乘法 */
  content: calc("String Repeat 3 times" * 3);
}
```

## min()、max()、clamp()

min()、max()、clamp() 适合放在一起讲。它们的作用彼此之间有所关联。

- max()：从一个逗号分隔的表达式列表中选择最大（正方向）的值作为属性的值
- min()：从一个逗号分隔的表达式列表中选择最小的值作为属性的值
- clamp()：把一个值限制在一个上限和下限之间，当这个值超过最小值和最大值的范围时，在最小值和最大值之间选择一个值使用

由于在现实中，有非常多元素的的属性不是一成不变的，而是会根据上下文、环境的变化而变化。譬如这样一个布局：

```html
<div class="container"></div>
<style>
  .container {
    height: 100px;
    background: #000;
  }
</style>
```

`.container` 块它会随着屏幕的增大而增大，始终占据整个屏幕：

对于一个响应式的项目，肯定不希望它的宽度会一直变大，而是当达到一定的阈值时，宽度从相对单位变成了绝对单位，这种情况就适用于 min()，简单改造下代码：

```css
.container {
  width: min(100%, 500px);
  height: 100px;
  background: #000;
}
```

容器的宽度值会在 width: 100% 与 width: 500px 之间做选择，选取相对小的那个。

### 基于 max、min 模拟 clamp

如果，需要限制最大值，也需要限制最小值，怎么办呢？

像是这样一个场景，字体的大小，最小是 12px，随着屏幕的变大，逐渐变大，但是为了避免老人机现象（随着屏幕变大，无限制变大），还需要限制一个最大值 20px。

可以利用 vw 来实现给字体赋动态值，假设在移动端，设备宽度的 CSS 像素为 320px 时，页面的字体宽度最小为 12px，换算成 vw 即是 320 / 100 = 3.2，也就是 1vw 在 屏幕宽度为 320px 时候，表现为 3.2px，12px 约等于 3.75 vw。

同时，需要限制最大字体值为 20px，对应的 CSS 如下：

```css
p {
  font-size: max(12px, min(3.75vw, 20px));
  /* max(12px, min(3.75vw, 20px)) 看上去有点绕，因此，CSS 推出了 clamp() 简化这个语法，下面两个写法是等价的： */
  font-size: clamp(12px, 3.75vw, 20px);
}
```

### clamp()

clamp() 函数的作用是把一个值限制在一个上限和下限之间，当这个值超过最小值和最大值的范围时，在最小值和最大值之间选择一个值使用。它接收三个参数：最小值、首选值、最大值。

clamp(MIN, VAL, MAX) 其实就是表示 max(MIN, min(VAL, MAX))。

#### 使用 vw 配合 clamp 实现响应式布局

在现在，在移动端适配，我们更为推崇的是 vw 纯 CSS 方案，与 rem 方案类似，它的本质也是页面的等比例缩放。它的一个问题在于，如果仅仅使用 vw，随着屏幕的不断变大或者缩小，内容元素将会一直变大变小下去，这也导致了在大屏幕下，许多元素看着实在太大了

clamp 就能非常好的派上用场，还是上述的例子，这一段代码 font-size: clamp(12px, 3.75vw, 20px)，就能将字体限制在 12px - 20px 的范围内。

因此，对于移动端页面而言，所有涉及长度的单位，我们都可以使用 vw 进行设置。而诸如字体、内外边距、宽度等不应该完全等比例缩放的，采用 clamp() 控制最大最小阈值。

对于移动端页面，可以以 vw 配合 clamp() 的方式，​ 完成整个移动端布局的适配。它的优势在于：

- 没有额外 JavaScript 代码的引入，纯 CSS 解决方案
- 能够很好地控制边界阈值，合理的进行缩放展示

#### 反向响应式变化

还有一个技巧，利用 clamp() 配合负值，也可以反向操作，得到一种屏幕越大，字体越小的反向响应式效果：

```css
p {
  font-size: clamp(20px, -5vw + 96px, 60px);
}
```
