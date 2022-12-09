# 除了 filter 还有什么置灰网站的方式

> 原文[除了 filter 还有什么置灰网站的方式](https://github.com/chokcoco/iCSS/issues/212)

大家都知道，当一些重大事件发生的时候，我们的网站，可能需要置灰，像是这样：

![img1](https://user-images.githubusercontent.com/8554143/204991547-670604a8-e204-4081-a9d7-0f895a66a948.png)

通常而言，全站置灰是非常简单的事情，大部分前端同学都知道，仅仅需要使用一行 CSS，就能实现全站置灰的方式。

像是这样，仅仅需要给 HTML 添加一个统一的滤镜即可：

```css
html {
  filter: grayscale(.95);
  -webkit-filter: grayscale(.95);
}
```

又或者，使用 SVG 滤镜，也可以快速实现网站的置灰：

```html
<style>
  html {
    filter: url(#grayscale);
  }
</style>
<div>
// ...
</div>

<svg xmlns="https://www.w3.org/2000/svg">
  <filter id="grayscale">
    <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"/>
    </filter>
</svg>
```

大部分时候，这样都可以解决大部分问题。不过，也有一些例外。譬如，如果我们仅仅需要置灰网站的首屏，而当用户开始滚动页面的时候，非首屏部分不需要置灰，该怎么办呢？

## 使用 backdrop-filter 实现滤镜遮罩

可以快速的借助 backdrop-filter 实现首屏的置灰遮罩效果：

```css
html {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: scroll;
}
html::before {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: grayscale(95%);
  z-index: 10;
}
```

仅仅只是这样而已，就在整个页面上方叠加了一层滤镜蒙版，实现了只对首屏页面的置灰

## 借助 pointer-events: none 保证页面交互

当然，这里有个很严重的问题，页面是存在大量交互效果的，如果叠加了一层遮罩效果在其上，那这层遮罩下方的所有交互事件都将失效，譬如 hover、click 等。

那该如何解决呢？这个也好办，可以通过给这层遮罩添加上 pointer-events: none，让这层遮罩不阻挡事件的点击交互。

代码如下：

```css
html::before {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: grayscale(95%);
  z-index: 10;
  pointer-events: none;
}
```

backdrop-filter 虽好，但是它的兼容性，很多旧版 firefox 不支持啊。那么多火狐的用户咋办？

> 截至 2022/12/01，Firefox 的最新版本为 109，但是在 Firefox 103 之前，都是不支持 backdrop-filter 的。

## 借助混合模式实现网站置灰

除了 filter 和 backdrop-filter 外，CSS 中另外一个能对颜色进行一些干预及操作的属性就是 mix-blend-mode 和 background-blend-mode 了，翻译过来就是混合模式。

这里，backdrop-filter 的替代方案是使用 mix-blend-mode。

```css
html {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: scroll;
  background: #fff;
}
html::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 1);
  mix-blend-mode: color;
  pointer-events: none;
  z-index: 10;
}
```

还是叠加了一层额外的元素在整个页面的首屏，并且把它的背景色设置成了黑色 background: rgba(0, 0, 0, 1)，正常而言，网站应该是一片黑色的。

但是，神奇的地方在于，通过混合模式的叠加，也能够实现网站元素的置灰。

经过实测：

```css
{
  mix-blend-mode: hue;            // 色相
  mix-blend-mode: saturation;     // 饱和度
  mix-blend-mode: color;          // 颜色
}
```

上述 3 个混合模式，叠加黑色背景，都是可以实现内容的置灰的。

值得注意的是，上述方法，需要给 HTML 设置一个白色的背景色，同时，不要忘记了给遮罩层添加一个 pointer-events: none。

## 总结

+ 如果需要全站置灰，使用 CSS 的 filter: grayscale()
+ 对于一些低版本的浏览器，使用 SVG 滤镜通过 filter 引入
+ 对于仅仅需要首屏置灰的，可以使用 backdrop-filter: grayscale() 配合 pointer-events: none
+ 对于需要更好兼容性的，使用混合模式的 mix-blend-mode: hue、mix-blend-mode: saturation、mix-blend-mode: color 也都是非常好的方式
