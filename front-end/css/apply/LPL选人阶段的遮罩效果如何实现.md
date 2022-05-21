# LPL 选人阶段的遮罩效果如何实现

> 原文[LPL Ban/Pick 选人阶段的遮罩效果是如何实现的？](https://github.com/chokcoco/iCSS/issues/159)

## 实现烟雾化遮罩效果

假设没有模糊的边缘，及烟雾化的效果，它其实就是一个渐变：

```html
<div></div>
<style>
  div {
    width: 340px;
    height: 180px;
    border: 2px solid #5b595b;
    background: linear-gradient(
      30deg,
      rgba(229, 23, 49, 1),
      rgba(229, 23, 49, 0.9) 48%,
      transparent 55%
    );
  }
</style>
```

![img1](https://user-images.githubusercontent.com/8554143/150129539-04d02b7c-4021-4f5f-96d3-3ae8ac7f3121.png)

看着确实平平无奇，如何利用它，得到一个雾化的效果呢？提到烟雾，应该能想到滤镜，当然，是 SVG 的 `<feturbulence>` 滤镜。

`<feturbulence>` 的 type="fractalNoise" 在模拟云雾效果时非常好用。该滤镜利用 Perlin 噪声函数创建了一个图像，能够实现半透明的烟熏或波状图像，用于实现一些特殊的纹理。

这里，利用 `<feturbulence>` 滤镜简单处理一下上述图形：

```html
<svg id="blob" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <filter id="filter">
    <feTurbulence
      id="turbulence"
      type="fractalNoise"
      baseFrequency=".03"
      numOctaves="20"
    />
    <feDisplacementMap in="SourceGraphic" scale="30" />
  </filter>
</svg>
```

CSS 中，可以利用 filter: url() 对对应的元素引入该滤镜：

```css
div {
  /* ... */
  filter: url(#smoke);
}
```

作用了滤镜的元素的效果：

![img2](https://user-images.githubusercontent.com/8554143/150132778-62aaf4c6-10ed-4424-a58c-ae42f1840991.png)

由于给元素加了边框，整个边框也被雾化了，这不是我们想要的，可以使用伪元素改造一下，边框作用于容器，使用伪元素实现渐变，将滤镜作用于伪元素：

```css
div {
  position: relative;
  width: 340px;
  height: 180px;
  border: 2px solid #5b595b;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      30deg,
      rgba(229, 23, 49, 1),
      rgba(229, 23, 49, 0.9) 48%,
      transparent 55%
    );
    filter: url(#smoke);
  }
}
```

改造后的效果如下：

![img3](https://user-images.githubusercontent.com/8554143/150133226-4466466c-ca1d-4d80-8061-d4bd0abc4891.png)

好，又接近了一步，但是四周有很多瑕疵没有被填满。问题不大，改变一下定位的 top \ left \ right \ bottom，让伪元素超出父容器，父容器设置 overflow: hidden 即可：

```css
div {
  /* .... */
  overflow: hidden;

  &::before {
    /* .... */
    left: -20px;
    top: -10px;
    right: -20px;
    bottom: -20px;
    background: linear-gradient(
      30deg,
      rgba(229, 23, 49, 1),
      rgba(229, 23, 49, 0.9) 48%,
      transparent 55%
    );
    filter: url(#smoke);
  }
}
```

调整之后，看看效果：

![img4](https://user-images.githubusercontent.com/8554143/150134003-df5be0bf-96f9-48a6-8ad1-23896bf4e2d7.png)

下一步，只需要让烟雾元素动起来，为了让整个效果连贯（由于 SVG 动画本身不支持类似 animation-fill-mode: alternate 这种特性），还是需要写一点 JavaScript 代码，控制动画的整体循环。

```js
const filter = document.querySelector("#turbulence")
let frames = 1
let rad = Math.PI / 180
let bfx, bfy

function freqAnimation() {
  frames += 0.35

  bfx = 0.035
  bfy = 0.015

  bfx += 0.006 * Math.cos(frames * rad)
  bfy += 0.004 * Math.sin(frames * rad)

  bf = bfx.toString() + " " + bfy.toString()
  filter.setAttributeNS(null, "baseFrequency", bf)

  window.requestAnimationFrame(freqAnimation)
}

window.requestAnimationFrame(freqAnimation)
```

这段代码做的事情，其实只有一个，就是让 SVG 的 #turbulence 滤镜的 baseFrequency 属性，在一个区间内无限循环，仅此而已。通过改变 baseFrequency，让整个烟雾不断变化。

至此，就得到了一幅完整的，会动的烟雾遮罩：

![img5](https://user-images.githubusercontent.com/8554143/150134947-a0ec12c1-8dad-4802-a7ca-cf4bf045a772.gif)

## 实现呼吸状态的遮罩效果

在上述基础上，再加入呼吸的效果，其实就非常简单了。

只需要去改变渐变的一个位置即可，方法非常多，这里给一个较为优雅但是兼容性可能没那么好的方法 -- CSS @Property。

简单改造上述代码：

```css
@property --per {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 22%;
}
div::before {
  /* ... */
  background: linear-gradient(
    30deg,
    #ff0020,
    rgba(229, 23, 49, 0.9) var(--per),
    transparent calc(var(--per) + 8%)
  );
  filter: url(#smoke);
  animation: change 2s infinite ease-out;
}
@keyframes change {
  50% {
    --per: 18%;
  }
}
```

这样，呼吸效果就实现了：

![img6](https://user-images.githubusercontent.com/8554143/150136348-ea717988-9e1c-4503-b040-719dde193521.gif)
