# px 有关问题

## 画 0.5px 的边

> 参考自[怎么画一条 0.5px 的边（更新）](https://juejin.im/post/5ab65f40f265da2384408a95)

### 直接设置 0.5px

如果直接设置 0.5px，在不同的浏览器会有不同的表现，在 PC 上测试结果如下所示：

![0.5px不同浏览器](https://user-gold-cdn.xitu.io/2018/3/24/1625864327200502?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

其中 Chrome 把 0.5px 四舍五入变成了 1px，而 firefox/safari 能够画出半个像素的边，并且 Chrome 会把小于 0.5px 的当成 0，而 Firefox 会把不小于 0.55px 当成 1px，Safari 是把不小于 0.75px 当成 1px，进一步在手机上观察 IOS 的 Chrome 会画出 0.5px 的边，而安卓(5.0)原生浏览器是不行的。所以直接设置 0.5px 不同浏览器的差异比较大，并且我们看到不同系统的不同浏览器对小数点的 px 有不同的处理。

### 缩放

第二种方法是缩放，设置 1px，然后 scale 0.5，如下代码所示：

```html
<style>
  .hr.scale-half {
    height: 1px;
    transform: scaleY(0.5);
  }
</style>
<p>1px + scaleY(0.5)</p>
<div class="hr scale-half"></div>
```

效果图如下：

![0.5px缩放](https://user-gold-cdn.xitu.io/2018/3/24/1625864327456f47?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

发现 Chrome/Safari 都变虚了，只有 Firefox 比较完美看起来是实的而且还很细，效果和直接设置 0.5px 一样。加上`transform-origin: 50% 100%` 可以解决变虚的问题，但是 firefox 下设置变换原点后，会出现不显示的情况。

```css
.hr.scale-half {
  height: 1px;
  transform: scaleY(0.5);
  transform-origin: 50% 100%;
}
```

### 线性渐变

第三种方法是用线性渐变 linear-gradient

```html
<style>
  .hr.gradient {
    height: 1px;
    background: linear-gradient(0deg, #fff, #000);
  }
</style>
<p>linear-gradient(0deg, #fff, #000)</p>
<div class="hr gradient"></div>
```

linear-gradient(0deg, #fff, #000)的意思是：渐变的角度从下往上，从白色#fff 渐变到黑色#000，而且是线性的，在高清屏上，1px 的逻辑像素代表的物理（设备）像素有 2px，由于是线性渐变，所以第 1 个 px 只能是#fff，而剩下的那个像素只能是#000，这样就达到了画一半的目的。

实际效果如下图所示：

![0.5linear-gradient](https://user-gold-cdn.xitu.io/2018/3/24/16258643270b68c9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这种方法在各个流览器上面都不完美，效果都是虚的，和完美的 0.5px 还是有差距。

改进：`linear-gradient(0deg, #fff 50%, #000 50%);`，chrome 下变现完美，但是 firefox 不显示了，这个结果只是在浏览器中模拟的，具体还需要在真机下再看一下。

### box-shadow

第四种方法是使用使用 boxshadow

```html
<style>
  .hr.boxshadow {
    height: 1px;
    background: none;
    box-shadow: 0 0.5px 0 #000;
  }
</style>
<p>box-shadow: 0 0.5px 0 #000</p>
<div class="hr boxshadow"></div>
```

设置 box-shadow 的第二个参数为 0.5px，表示阴影垂直方向的偏移为 0.5px，效果如下：

![0.5box-shadow](https://user-gold-cdn.xitu.io/2018/3/24/162586432778270c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这个方法在 Chrome 和 Firefox 都非常完美，但是 Safari 不支持小于 1px 的 boxshadow，所以完全没显示出来了。

### svg

第五种方法是使用 svg 或者把 svg 转换成 base64 的形式，利用 SVG 的描边等属性的 1px 还是物理像素的 1px，而不是高清屏的 1px。

直接使用 svg 的时候，使用 background: url 的方式内联，浏览器识别不了应该以引用本地文件的方式引用；而使用 base64 的时候可以内联

```css
<style>
.hr.svg {
  background: none;
  height: 1px;
  background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzFweCc+PGxpbmUgeDE9JzAnIHkxPScwJyB4Mj0nMTAwJScgeTI9JzAnIHN0cm9rZT0nIzAwMCc+PC9saW5lPjwvc3ZnPg==");
}
</style>
<p>svg</p>
<div class="hr svg"></div>
```

```html
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="1px">
  <line x1="0" y1="0" x2="100%" y2="0" stroke="#000"></line>
</svg>
```

使用 svg 的 line 元素画线，stroke 表示描边颜色，默认描边宽度 stroke-width="1"，由于 svg 的描边等属性的 1px 是物理像素的 1px，相当于高清屏的 0.5px，另外还可以使用 svg 的 rect 等元素进行绘制。在 Chrome 和 Safari 的效果如下：

![0.5svg](https://user-gold-cdn.xitu.io/2018/3/25/1625b85c5fb759f6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这个方案在 firefox 下也是可以的了，不过表现都不够完美。

### 控制 viewport

第六种方法那就是通过控制 viewport，在移端开发里面一般会把 viewport 的 scale 设置成 1：`<meta name="viewport" content="width=device-width,initial-sacle=1">`，其中 width=device-width 表示将 viewport 视窗的宽度调整为设备的宽度，这个宽度通常是指物理上宽度。默认的缩放比例为 1，如 iphone 6 竖屏的宽度为 750px，它的 dpr=2，用 2px 表示 1px，这样设置之后 viewport 的宽度就变成 375px。这时候 0.5px 的边就使用我们上面讨论的方法。

但是你可以把 scale 改成 0.5，这样的话，viewport 的宽度就是原本的 750px，所以 1 个 px 还是 1px，正常画就行，但这样也意味着 UI 需要按 2 倍图的出，整体面面的单位都会放大一倍。在 iPone X 和一些安卓手机等 dpr = 3 的设备上，需要设置 scale 为 0.333333，这个时候就是 3 倍地画了。

## retina 屏下的 1px 线的实现

> 可以参考[retina 屏下的 1px 线的实现](https://chokcoco.github.io/CSS-Inspiration/#/./others/1px-line)

## 10px 字体

字体大小限制在有些浏览器（Chrome）上需要做设置的，例如：Chrome 默认最小字体大小为 12px，小于 12px 的字体都显示 12px 大小，不过你可以设置最小到 6px。而火狐与 safari 下则没有限制。

### 使用缩放

```css
.font10px {
  font-size: 12px;
  transform: scale(0.83, 0.83);
  /* font-size: 10px; */
}
```

### Mobile 浏览器中

Mobile 端绝大多数浏览器采用的是 Webkit 内核，只需要设置`-webkit-text-size-adjust: 100%;`，便可以调节字体大小了。
