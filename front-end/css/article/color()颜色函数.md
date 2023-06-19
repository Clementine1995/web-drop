# color() 颜色函数

> color() [MDN 链接](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color)

color()是 CSS 中一个相对新的颜色函数,它提供了一种统一的方式来指定任何 RGB 颜色空间中的颜色值。与rgb()和hsl()等函数相比,color()函数的优点是:

- 统一的语法可以访问不同颜色空间,更简洁。
- 未来如果有新的标准色域,只需要在函数中加入新值,就可以兼容,无需新增函数。
- 有助于实现色彩管理,由浏览器根据设备色域进行颜色转换。

## color()语法

color()函数的语法如下:

```css
{
    color(colorspace p1 p2 p3[ / A]);
    color(display-p3 1 0.5 0);
    color(display-p3 1 0.5 0 / .5);
}
```

color()的值有下面几个

- colorspace 命名空间：比如：srgb, srgb-linear, display-p3, a98-rgb, prophoto-rgb, rec2020, xyz, xyz-d50, and xyz-d65.
- p1, p2, p3：数字或者百分比 供颜色空间所使用的参数值
- A 可选：alpha 值

其中color-space可以是:

- srgb:标准 RGB 色域
- display-p3:广色域,用于电影和电视
- a98-rgb:Adobe RGB 色域
- prophoto-rgb:ProPhoto RGB 色域
- rec2020:UHDTV 和其他广色域格式，例如:
  - color(srgb 0 0 1) // sRGB 色值为 0, 0, 1
  - color(display-p3 0 0 1) // Display P3 色域中的蓝色

## color()使用例子

color()函数可以用于 CSS 中的任何需要颜色值的地方。这里给出一些例子: 文本颜色:

```css
.text {
  color: color(display-p3 0 0 1);
}
```

背景颜色:

```css
.bg {
  background-color: color(prophoto-rgb 0 1 0);
}
```

渐变色:

```css
.gradient {
  background: linear-gradient(
    to right,
    color(display-p3 0 0 1),
    color(rec2020 0 1 0)
  );
}
```

## 什么网站或应用需要用到color()

color()函数主要适用于以下类型的网站和应用:

- 需要广色域和高清颜色的网站:视频网站、产品展示网站、高清显示网站等。
- 需要色彩管理的网站:色彩管理网站和需要跨设备色彩一致的网站。
- 创意和艺术类网站:设计师可以发挥更大创意,与其他 CSS 技术结合可以创作很美的视觉效果。
- 未来的 HDR 显示网站:color()为网站采用更宽色域和 HDR 做好了准备。 所以,总体来说,color()为色彩敏感和未来潮流的网站带来许多好处,是 CSS 中一个强大的颜色功能
