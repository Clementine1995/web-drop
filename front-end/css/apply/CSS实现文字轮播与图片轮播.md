# CSS 实现文字轮播与图片轮播

> 原文[文字轮播与图片轮播？CSS 不在话下](https://github.com/chokcoco/iCSS/issues/184)

巧用逐帧动画，配合补间动画实现一个无限循环的轮播效果，像是这样：

![img1](https://user-images.githubusercontent.com/8554143/169294742-34a2bb8f-9129-4a7b-a11b-8d60fe6b1d26.gif)

看到上述示意图，这不是个非常简单的位移动画么？

来简单分析分析，从表面上看，确实好像只有元素的 transform: translate() 在位移，但是注意，这里有两个难点：

1. 这是个无限轮播的效果，我们的动画需要支持任意多个元素的无限轮播切换
2. 因为是轮播，所以，运行到最后一个的时候，需要动画切到第一个元素

到这里，可以暂停思考一下，如果有 20 个元素，需要进行类似的无限轮播播报，使用 CSS 实现，怎么去做呢？

## 逐帧动画控制整体切换

首先，需要利用到逐帧动画效果，也被称为步骤缓动函数，利用的是 animation-timing-function 中的 steps。

以开头的例子，假设存在这样 HTML 结构：

```html
<div class="g-container">
  <ul>
    <li>Lorem ipsum 1111111</li>
    <li>Lorem ipsum 2222222</li>
    <li>Lorem ipsum 3333333</li>
    <li>Lorem ipsum 4444444</li>
    <li>Lorem ipsum 5555555</li>
    <li>Lorem ipsum 6666666</li>
  </ul>
</div>
```

实现这样一个简单的布局：

![img2](https://user-images.githubusercontent.com/8554143/169681177-3bcc9a3e-f32f-4892-9156-8ab38d515db9.png)

要实现轮播效果，并且是任意个数，可以借助 animation-timing-function: steps()：

```css
:root {
  /* 轮播的个数 */
  --s: 6;
  /* 单个 li 容器的高度 */
  --h: 36;
  /* 单次动画的时长 */
  --speed: 1.5s;
}
.g-container {
  width: 300px;
  height: calc(var(--h) * 1px);
}
ul {
  display: flex;
  flex-direction: column;
  animation: move calc(var(--speed) * var(--s)) steps(var(--s)) infinite;
}
ul li {
  width: 100%;
}
@keyframes move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(0, calc(var(--s) * var(--h) * -1px));
  }
}
```

别看到上述有几个 CSS 变量就慌了，其实很好理解：

- `calc(var(--speed) * var(--s))`：单次动画的耗时 乘以 轮播的个数，也就是总动画时长
- `steps(var(--s))` 就是逐帧动画的帧数，这里也就是 steps(6)，很好理解
- `calc(var(--s) * var(--h) * -1px))` 单个 li 容器的高度 乘以 轮播的个数，其实就是 ul 的总体高度，用于设置逐帧动画的终点值

上述的效果，实际如下：

![img3](https://user-images.githubusercontent.com/8554143/169681483-f4ccced1-0d2e-475e-af60-2ca54e9402f5.gif)

如果给容器添加上 overflow: hidden，就是这样的效果：

![img4](https://user-images.githubusercontent.com/8554143/169681559-3aae3e2c-6f7e-4eac-84cc-f014d74a05c9.gif)

这样，我们就得到了整体的结构，至少，整个效果是循环的。

但是由于只是逐帧动画，所以只能看到切换，但是每一帧之间，没有过渡动画效果。所以，接下来，我们还得引入补间动画。

## 利用补间动画实现两组数据间的切换

需要利用补间动画，实现动态的切换效果。

这一步，其实也非常简单，我们要做的，就是将一组数据，利用 transform，从状态 A 位移到 状态 B。单独拿出一个来演示的话，大致的代码如下：

```html
<style>
  :root {
    --h: 36;
    --speed: 1.2s;
  }
  ul li {
    height: 36px;
    animation: liMove calc(var(--speed)) infinite;
  }
  @keyframes liMove {
    0% {
      transform: translate(0, 0);
    }
    80%,
    100% {
      transform: translate(0, -36px);
    }
  }
</style>
<div class="g-container">
  <ul style="--s: 6">
    <li>Lorem ipsum 1111111</li>
    <li>Lorem ipsum 2222222</li>
    <li>Lorem ipsum 3333333</li>
    <li>Lorem ipsum 4444444</li>
    <li>Lorem ipsum 5555555</li>
    <li>Lorem ipsum 6666666</li>
  </ul>
</div>
```

非常简单的一个动画：

![img5](https://user-images.githubusercontent.com/8554143/169817246-ead74236-d1a4-4629-b5a4-ca6a03ca5e68.gif)

基于上述效果，如果把一开始提到的 逐帧动画 和这里这个 补间动画 结合一下，ul 的整体移动，和 li 的 单个移动叠在一起：

```css
:root {
  // 轮播的个数
  --s: 6;
  // 单个 li 容器的高度
  --h: 36;
  // 单次动画的时长
  --speed: 1.5s;
}
.g-container {
  width: 300px;
  height: calc(var(--h) * 1px);
}
ul {
  display: flex;
  flex-direction: column;
  animation: move calc(var(--speed) * var(--s)) steps(var(--s)) infinite;
}
ul li {
  width: 100%;
  animation: liMove calc(var(--speed)) infinite;
}
@keyframes move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(0, calc(var(--s) * var(--h) * -1px));
  }
}
@keyframes liMove {
  0% {
    transform: translate(0, 0);
  }
  80%,
  100% {
    transform: translate(0, calc(var(--h) * -1px));
  }
}
```

就能得到这样一个效果：

![img6](https://user-images.githubusercontent.com/8554143/169817863-a4fd2e15-aeb4-4e20-85db-1be2d0d7926a.gif)

基于 逐帧动画 和 补间动画 的结合，几乎实现了一个轮播效果。当然，有一点瑕疵，可以看到，最后一组数据，是从第六组数据 transform 移动向了一组空数据：

## 末尾填充头部第一组数据

只需要在末尾，补一组头部的第一个数据即可：

改造下 HTML：

```html
<div class="g-container">
  <ul>
    <li>Lorem ipsum 1111111</li>
    <li>Lorem ipsum 2222222</li>
    <li>Lorem ipsum 3333333</li>
    <li>Lorem ipsum 4444444</li>
    <li>Lorem ipsum 5555555</li>
    <li>Lorem ipsum 6666666</li>
    <!--末尾补一个首条数据-->
    <li>Lorem ipsum 1111111</li>
  </ul>
</div>
```

这样，再看看效果：

![img7](https://user-images.githubusercontent.com/8554143/169818781-4a1aab0f-2f69-4d79-b89c-57257f3cc9c2.gif)

给容器加上 overflow: hidden，实际效果如下，通过额外添加的最后一组数据，我们的整个动画刚好完美的衔接上，一个完美的轮播效果：

![img8](https://user-images.githubusercontent.com/8554143/169294742-34a2bb8f-9129-4a7b-a11b-8d60fe6b1d26.gif)

## 横向无限轮播

实现了竖直方向的轮播，横向的效果也是一样的。

并且，可以通过在 HTML 结构中，通过 style 内填写 CSS 变量值，传入实际的 li 个数，以达到根据不同 li 个数适配不同动画：

```html
<div class="g-container">
  <ul style="--s: 6">
    <li>Lorem ipsum 1111111</li>
    <li>Lorem ipsum 2222222</li>
    <li>Lorem ipsum 3333333</li>
    <li>Lorem ipsum 4444444</li>
    <li>Lorem ipsum 5555555</li>
    <li>Lorem ipsum 6666666</li>
    <!--末尾补一个首尾数据-->
    <li>Lorem ipsum 1111111</li>
  </ul>
</div>
```

整个动画的 CSS 代码基本是一致的，只需要改变两个动画的 transform 值，从竖直位移，改成水平位移即可：

```css
:root {
  --w: 300;
  --speed: 1.5s;
}
.g-container {
  width: calc(--w * 1px);
  overflow: hidden;
}
ul {
  display: flex;
  flex-wrap: nowrap;
  animation: move calc(var(--speed) * var(--s)) steps(var(--s)) infinite;
}
ul li {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  animation: liMove calc(var(--speed)) infinite;
}
@keyframes move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(calc(var(--s) * var(--w) * -1px), 0);
  }
}
@keyframes liMove {
  0% {
    transform: translate(0, 0);
  }
  80%,
  100% {
    transform: translate(calc(var(--w) * -1px), 0);
  }
}
```

这样，就轻松的转化为了横向的效果：

![img9](https://user-images.githubusercontent.com/8554143/169820749-5065394e-3cfe-4dcd-8852-416988b20eb6.gif)
