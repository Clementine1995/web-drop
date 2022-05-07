# px有关问题

## 画0.5px的边

>参考自[怎么画一条0.5px的边（更新）](https://juejin.im/post/5ab65f40f265da2384408a95)

### 直接设置0.5px

如果直接设置0.5px，在不同的浏览器会有不同的表现，在PC上测试结果如下所示：

![0.5px不同浏览器](https://user-gold-cdn.xitu.io/2018/3/24/1625864327200502?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

其中Chrome把0.5px四舍五入变成了1px，而firefox/safari能够画出半个像素的边，并且Chrome会把小于0.5px的当成0，而Firefox会把不小于0.55px当成1px，Safari是把不小于0.75px当成1px，进一步在手机上观察IOS的Chrome会画出0.5px的边，而安卓(5.0)原生浏览器是不行的。所以直接设置0.5px不同浏览器的差异比较大，并且我们看到不同系统的不同浏览器对小数点的px有不同的处理。

### 缩放

第二种方法是缩放，设置1px，然后scale 0.5，如下代码所示：

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

发现Chrome/Safari都变虚了，只有Firefox比较完美看起来是实的而且还很细，效果和直接设置0.5px一样。加上`transform-origin: 50% 100%` 可以解决变虚的问题，但是firefox下设置变换原点后，会出现不显示的情况。

```css
.hr.scale-half {
  height: 1px;
  transform: scaleY(0.5);
  transform-origin: 50% 100%;
}
```

### 线性渐变

第三种方法是用线性渐变linear-gradient

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

linear-gradient(0deg, #fff, #000)的意思是：渐变的角度从下往上，从白色#fff渐变到黑色#000，而且是线性的，在高清屏上，1px的逻辑像素代表的物理（设备）像素有2px，由于是线性渐变，所以第1个px只能是#fff，而剩下的那个像素只能是#000，这样就达到了画一半的目的。

实际效果如下图所示：

![0.5linear-gradient](https://user-gold-cdn.xitu.io/2018/3/24/16258643270b68c9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这种方法在各个流览器上面都不完美，效果都是虚的，和完美的0.5px还是有差距。

改进：`linear-gradient(0deg, #fff 50%, #000 50%);`，chrome下变现完美，但是firefox不显示了，这个结果只是在浏览器中模拟的，具体还需要在真机下再看一下。

### box-shadow

第四种方法是使用使用boxshadow

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

设置box-shadow的第二个参数为0.5px，表示阴影垂直方向的偏移为0.5px，效果如下：

![0.5box-shadow](https://user-gold-cdn.xitu.io/2018/3/24/162586432778270c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这个方法在Chrome和Firefox都非常完美，但是Safari不支持小于1px的boxshadow，所以完全没显示出来了。

### svg

第五种方法是使用svg或者把svg转换成base64的形式，利用SVG的描边等属性的1px还是物理像素的1px，而不是高清屏的1px。

直接使用svg的时候，使用background: url的方式内联，浏览器识别不了应该以引用本地文件的方式引用；而使用base64的时候可以内联

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
<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='1px'>
  <line x1='0' y1='0' x2='100%' y2='0' stroke='#000'></line>
</svg>
```

使用svg的line元素画线，stroke表示描边颜色，默认描边宽度stroke-width="1"，由于svg的描边等属性的1px是物理像素的1px，相当于高清屏的0.5px，另外还可以使用svg的rect等元素进行绘制。在Chrome和Safari的效果如下：

![0.5svg](https://user-gold-cdn.xitu.io/2018/3/25/1625b85c5fb759f6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这个方案在firefox下也是可以的了，不过表现都不够完美。

### 控制viewport

第六种方法那就是通过控制viewport，在移端开发里面一般会把viewport的scale设置成1：`<meta name="viewport" content="width=device-width,initial-sacle=1">`，其中width=device-width表示将viewport视窗的宽度调整为设备的宽度，这个宽度通常是指物理上宽度。默认的缩放比例为1，如iphone 6竖屏的宽度为750px，它的dpr=2，用2px表示1px，这样设置之后viewport的宽度就变成375px。这时候0.5px的边就使用我们上面讨论的方法。

但是你可以把scale改成0.5，这样的话，viewport的宽度就是原本的750px，所以1个px还是1px，正常画就行，但这样也意味着UI需要按2倍图的出，整体面面的单位都会放大一倍。在iPone X和一些安卓手机等dpr = 3的设备上，需要设置scale为0.333333，这个时候就是3倍地画了。

## retina屏下的1px线的实现

>可以参考[retina屏下的1px线的实现](https://chokcoco.github.io/CSS-Inspiration/#/./others/1px-line)

## 10px字体

字体大小限制在有些浏览器（Chrome）上需要做设置的，例如：Chrome 默认最小字体大小为12px，小于12px的字体都显示12px大小，不过你可以设置最小到6px。而火狐与safari下则没有限制。

### 使用缩放

```css
.font10px {
  font-size: 12px;
  transform : scale(0.83,0.83);
  /* font-size: 10px; */
}
```

### Mobile浏览器中

Mobile 端绝大多数浏览器采用的是 Webkit 内核，只需要设置`-webkit-text-size-adjust: 100%;`，便可以调节字体大小了。
