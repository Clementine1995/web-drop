# background 渐变色

> 内容参考自[CSS Background 神奇的渐变色](https://github.com/junruchen/junruchen.github.io/wiki/CSS-Background%E7%A5%9E%E5%A5%87%E7%9A%84%E6%B8%90%E5%8F%98%E8%89%B2)

![渐变效果图](https://camo.githubusercontent.com/c165782863faeab963d5e7da165fbb6b585144ae/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938346437303030313237316630373534303137312e706e67)

`Background`属性的用法不仅仅停留在引入背景图片，设置背景颜色，还可以创造出更多神奇的渐变效果。

利用 CSS3 新增的 `linear-gradient()` `repeating-linear-gradient()` `radial-gradient()` `repeating-radial-gradient()` 渐变属性, 可实现各种意想不到的渐变图像。

内容

- 线性渐变
  - linear-gradient 简单用法
  - linear-gradient 实现条纹背景
  - repeating-linear-gradient 实现多种角度渐变
- 径向渐变
  - radial-gradient 简单用法
  - repeating-radial-gradient 实现特殊效果

## 线性渐变

### linear-gradient 简单用法

可实现各种角度的线性渐变

参数说明(参数之间只用逗号分隔)：

- 角度，即渐变的方向，默认值为 to bottom，可省略
  - 支持具体的角度值
  - 支持方位值 to left/ to right/ to top/ to bottom
- 颜色节点组，至少需要两组才可以构成渐变
  - 每组颜色节点可由两个参数组成： 颜色值 位置值, 颜色值 位置值, ...
  - 颜色值为必填项
  - 位置值可为长度, 也可以是百分比, 非必填项

示例说明: `linear-gradient(red 30%, blue 80%)`;

- 容器顶部 30%的区域被填充为红色实色;
- 容器中间 50%的高度区域被填充为从红色到蓝色的渐变色;
- 容器底部 20%区域被填充为蓝色实色。

实现简单的渐变背景

![简单渐变效果](https://camo.githubusercontent.com/c66faea4663051c4bf26acee58e58200f7d6c6a2/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938353338303030313933376330363835303234372e706e67)

```css
/* 图一:  */
background: linear-gradient(#58a, #fb3);
/* 图二:  */
background: linear-gradient(45deg, #58a, #fb3);
/* 图三:  */
background: linear-gradient(to right, #58a 20%, #fb3 60%);
/* 渐变填充区域为容器中间40%的高度区域, 其他区域填充的颜色为实色。 */
```

### linear-gradient 实现条纹背景

原理：当`相邻`两个颜色的位置值相同时, 颜色之间会产生无限小的过渡区域。其产生的效果和条纹一样。

#### 实现简单的条纹图案

![大条纹](https://camo.githubusercontent.com/10729ba8ab45f71df23540c9a11eb9e25b305117/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938353931303030316437663330363739303235312e706e67)

```css
图一: background: linear-gradient(#58a 50%, #fb3 50%);
图二: background: linear-gradient(#58a 33%, #fb3 33%, #fb3 66%, #e45b5a 66%);
图三: background: linear-gradient(#58a 40%, #fb3 0);
```

> CSS 图像(第三版)规范: 如果某个色标的位置值比整个列表中在它之前的色标的位置值都要小, 则该色标的位置值会被设置为它前面所有色标位置值的最大值。

根据 CSS 图像(第三版)规范，在上述示例中:

- 图三第二个颜色的位置值 0 即表示 40%;
- 图二中代码也可以替换为: `linear-gradient(#58a 33%, #fb3 0, #fb3 66%, #e45b5a 0)`;

#### 实现条纹背景

实现条纹背景的条件：

- 使用 `background-size` 来控制每一块条纹背景的大小
- `background-repeat` 设置为 `repeat`

![条纹背景](https://camo.githubusercontent.com/ed571ff94575ef49f195ba0f931767441453be47/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938356437303030316265663430353037303234352e706e67)

代码示例:

```css
/* 图一: */
background: linear-gradient(#58a 50%, #fb3 0);
background-size: 100% 40px;
/* 图二: */
background: linear-gradient(to right, #58a 33%, #fb3 0, #fb3 66%, #e45b5a 0);
background-size: 50px 100%;
```

#### 斜向条纹背景的尝试

如果只是简单的设置一个角度, 是不能实现斜向条纹背景的, 如下图所示:

![斜向条纹1](https://camo.githubusercontent.com/766d4ae87ff894b92569b6300c5817253ed1f829/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938363130303030313133653130343539303235342e706e67)

图一将渐变条纹旋转了 45 度, 图二设置切片大小后进行重复, 并不能实现斜向条纹背景。

代码示例:

```css
/* 图一: */
background: linear-gradient(45deg, #58a 50%, #fb3 0);
/* 图二: */
background: linear-gradient(45deg, #58a 50%, #fb3 0);
background-size: 50px 50px;
```

为了实现斜向条纹背景, 联想使用位图生成条纹的方法, 将切片设置称为四条条纹, 如下图所示:

![斜向条纹2](https://camo.githubusercontent.com/41972b8e80a78ee64852fa097cde3e80f7d90827/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938363435303030316436633830343633303235332e706e67)

代码示例:

```css
/* 图一: */
background: linear-gradient(
  45deg,
  #58a 25%,
  #fb3 0,
  #fb3 50%,
  #58a 0,
  #58a 75% #fb3 0
);
/* 图二: */
background: linear-gradient(
  45deg,
  #58a 25%,
  #fb3 0,
  #fb3 50%,
  #58a 0,
  #58a 75% #fb3 0
);
background-size: 50px 50px;
```

上述的方法有局限性, 如果想实现 30 度或者其他角度的斜向条纹, 使用刚刚的方法效果则会很糟糕, 如下图:

![斜向条纹3](https://camo.githubusercontent.com/3f8f17971662054d7ab6c378a69952a0e15216a3/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938363731303030316438376530323331303233342e706e67)

```css
background: linear-gradient(
  30deg,
  #58a 25%,
  #fb3 0,
  #fb3 50%,
  #58a 0,
  #58a 75% #fb3 0
);
```

#### 各种角度的斜向条纹

如果想实现各种角度的斜向条纹, CSS3 提供了很好的方法, linear-gradient() 的超级版 `repeating-linear-gradient()` 。

### repeating-linear-gradient 实现多种角度渐变

用重复的线性渐变创建图像, 语法与 linear-gradient() 相同。

![斜向条纹4](https://camo.githubusercontent.com/ac426e72d848ee7b82697d334e08f99946b1034c/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938366465303030316433306530363730303234362e706e67)

代码示例:

```css
/* 图一: */
background: repeating-linear-gradient(
  45deg,
  #58a,
  #58a 10px,
  #fb3 0,
  #fb3 20px
);
/* 图二: */
background: repeating-linear-gradient(
  70deg,
  #58a,
  #58a 15px,
  #fb3 0,
  #fb3 30px,
  #e45b5a 0,
  #e45b5a 45px
);
/* 图三: */
background: repeating-linear-gradient(
  30deg,
  #58a,
  #58a 20px,
  #fb3 0,
  #fb3 40px
);
```

使用 `repeating-linear-gradient()` 的好处是, 不需要借助 `background-size` 控制大小, 而且角度可以随意设置。

注意: 使用 repeating-linear-gradient() 实现渐变时, 用法与 linear-gradient() 有一点点不同。repeating-linear-gradient() 必须明确指定每一个颜色的范围值, 而 linear-gradient() 可以适当省略, 详解如下:

如: 实现一个简单的黄蓝渐变, 渐变范围为容器中间 60%区域。

![简单渐变效果图](https://camo.githubusercontent.com/006d3c52eb78bb6e443e3779ca2e8bd9a7816217/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938373239303030316135366230323337303233332e706e67)

```css
/* 使用 linear-gradient() 实现(可简写): */
background: linear-gradient(#fb3 20%, #58a 80%);
/* 或者: */
background: linear-gradient(#fb3, #fb3 20%, #58a 80%);
/* 或者: */
background: linear-gradient(#fb3, #fb3 20%, #58a 80%, #58a 100%);

/* 使用 repeating-linear-gradient() 实现(必须写明每一个颜色范围值): */
background: repeating-linear-gradient(#fb3, #fb3 20%, #58a 80%, #58a 100%);
```

#### 其他条纹背景以及缺角背景的实现

![效果图](https://camo.githubusercontent.com/68a8af28bb8a3ed64a074cef5894c1671c68b45a/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938373734303030313264316130363837303530312e706e67)

```css
/* 图一: */
background: linear-gradient(0, rgba(200, 0, 0, 0.5) 50%, transparent 0),
  linear-gradient(90deg, rgba(200, 0, 0, 0.5) 50%, transparent 0);
background-size: 20px;

/* 图二: */
background: linear-gradient(0, rgba(200, 0, 0, 0.5) 1px, transparent 0),
  linear-gradient(90deg, rgba(200, 0, 0, 0.5) 1px, transparent 0);
background-size: 20px;

/* 图三: */
background: linear-gradient(0, #fff 1px, transparent 0), linear-gradient(
    90deg,
    #fff 1px,
    transparent 0
  ), linear-gradient(0, #fff 4px, transparent 0), linear-gradient(
    90deg,
    #fff 4px,
    transparent 0
  ), #58a;
background-size: 20px, 20px, 40px, 40px;

/* 图四: */
background: linear-gradient(-125deg, #fff 15px, #58a 0);

/* 图五: */
background: linear-gradient(125deg, #fff 15px, #58a 0), linear-gradient(-125deg, #fff
      15px, #58a 0);
background-size: 50% 100%;
background-position: left, right;
background-repeat: no-repeat;

/* 图六: */
background: linear-gradient(125deg, #fff 15px, #58a 0), linear-gradient(
    -125deg,
    #fff 15px,
    #58a 0
  ), linear-gradient(45deg, #fff 15px, #58a 0), linear-gradient(-45deg, #fff
      15px, #58a 0);
background-size: 50% 50%;
background-position: top left, top right, bottom left, bottom right;
background-repeat: no-repeat;
```

## 径向渐变

### radial-gradient 简单用法

参数说明(参数之间只用逗号分隔)：

- 方位，包括渐变的类型、半径以及圆心的位置
  - shape，渐变的类型，支持 circle | ellopse，默认值 circle
  - size，渐变半径，使用长度值，其中椭圆形渐变的半径长度可以用百分比，也可以用以下四个值指定半径长度
    - closest-side：半径长度为从圆心到离圆心最近的边
    - closest-corner：半径长度为从圆心到离圆心最近的角
    - farthest-side：半径长度为从圆心到离圆心最远的边
    - farthest-corner：半径长度为从圆心到离圆心最远的角
  - position，圆心的位置，值必须在 at 后
    - 提供 2 个参数，第一个表示横坐标，第二个表示纵坐标
    - 只提供一个参数，则第二值默认为 50%，即 center
    - 位置可以是具体的长度也可以是百分比。
    - 也可以用方位表示，横坐标可取的方位值有 `left、center、right`，纵坐标可取的方位值有 `top、center、bottom`
- 颜色节点组，至少需要两组才可以构成渐变
  - 每组颜色节点可由两个参数组成： `颜色值 位置值, 颜色值 位置值, ...`
  - 颜色值为必填项
  - 位置值可为长度, 也可以是百分比, 非必填项

注意:

- 当渐变类型为 circle 时, 只能指定一个 size 值, 即直径;
- 当渐变类型为 ellopse 时, 需要指定两个个 size 值, 即水平半径, 垂直半径。

如: `radial-gradient(circle at center, red 30%, blue 80%)`;

#### 简单的径向渐变

![径向渐变](https://camo.githubusercontent.com/1c6d74460e4378276a9cb21dd5e77e6d42da13f6/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938383532303030316437303230363837303531302e706e67)

代码示例:

```css
/* 图一: */
background: radial-gradient(#58A, #FB3)
/* 图二: */
background: radial-gradient(50px, #58A, #FB3)
/* 图三: */
background: radial-gradient(70px, #58A, #FB3, #e45b5a);

/* 图四: */
background: radial-gradient(ellipse 50px 70px, #58A, #FB3);
/* 图五: */
background: radial-gradient(ellipse 50px 70px at left top, #58A, #FB3);
/* 图六: */
background: radial-gradient(ellipse 50px 70px at 60px bottom, #58A, #FB3);
```

#### 实现波点背景

![波点背景](https://camo.githubusercontent.com/fb6e168780a4d23a6377786cdbd867ba6f6b9973/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938393035303030316531363030343530303235362e706e67)

代码示例:

```css
/* 图一: */
background: radial-gradient(rgba(200, 0, 0, 0.5) 30%, transparent 0);
background-size: 40px;
/* 图二: */
background: radial-gradient(rgba(200, 0, 0, 0.5) 30%, transparent 0),
  radial-gradient(rgba(200, 0, 0, 0.5) 30%, transparent 0);
background-size: 40px;
background-position: 0 0, 20px 20px;
```

### repeating-radial-gradient 实现特殊效果

用重复的径向渐变创建图像。语法与 radial-gradient()相同, 也可以实现一些有意思的效果, 如下图:

![环形背景](https://camo.githubusercontent.com/8d2dd851ac03ca860b0e8adb219b90669cb1598b/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938616238303030316132623330323333303232332e706e67)

```css
background: repeating-radial-gradient(
  rgba(200, 0, 0, 0.5) 0,
  rgba(200, 0, 0, 0.5) 20px,
  transparent 0,
  transparent 40px
);
```

## 圆锥渐变

> 参考自[神奇的 conic-gradient 圆锥渐变](https://www.cnblogs.com/coco1s/p/7079529.html)
> 跟上面的两种渐变相似，conic-gradient 称为圆锥渐变，给 CSS 世界带来了更多可能。

### 基本用法

```css
 {
  /* Basic example */
  background: conic-gradient(deeppink, yellowgreen);
}
```

![圆锥渐变基本用法](https://user-images.githubusercontent.com/8554143/27376034-8db14a3e-56a3-11e7-8c8a-a0effd547f85.png)

## 与线性渐变及圆锥渐变的异同

那么它和另外两个渐变的区别在哪里呢？

- linear-gradient 线性渐变的方向是一条直线，可以是任何角度
- radial-gradient 径向渐变是从圆心点以椭圆形状向外扩散

而从方向上来说，圆锥渐变的方向是这样的：

![conic-gradient渐变方向](https://user-images.githubusercontent.com/8554143/27382897-516784c2-56bb-11e7-995d-b3ca16340acc.gif)

划重点：

从图中可以看到，圆锥渐变的渐变方向和起始点。**起始点是图形中心，然后以顺时针方向绕中心实现渐变效果**。

## 使用 conic-gradient 实现颜色表盘

从上面了解了 `conic-gradient` 最简单的用法，我们使用它实现一个最简单的颜色表盘。

`conic-gradient` 不仅仅只是从一种颜色渐变到另一种颜色，与另外两个渐变一样，可以实现多颜色的过渡渐变。

由此，想到了彩虹，我们可以依次列出 `赤橙黄绿青蓝紫` 七种颜色：

`conic-gradient: (red, orange, yellow, green, teal, blue, purple)`
上面表示，在圆锥渐变的过程中，颜色从设定的第一个 `red` 开始，渐变到 `orange` ，再到 `yellow` ，一直到最后设定的 `purple` 。并且每一个区间是等分的。

我们再给加上 `border-radius: 50%` ，假设我们的 CSS 如下，

```css
 {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(red, orange, yellow, green, teal, blue, purple);
}
```

看看效果：

![image](https://user-images.githubusercontent.com/8554143/27414889-87f07334-5736-11e7-9722-5d4899b6b363.png)

wow，已经有了初步形状了。但是，总感觉哪里不大自然。

嗯？问题出在哪里呢？一是颜色不够丰富不够明亮，二是起始处与结尾处衔接不够自然。让我再稍微调整一下。

我们知道，表示颜色的方法，除了 `rgb()` 颜色表示法之外，还有 `hsl()` 表示法。

> hsl() 被定义为色相-饱和度-明度（Hue-saturation-lightness）

- 色相（H）是色彩的基本属性，就是平常所说的颜色名称，如红色、黄色等。
- 饱和度（S）是指色彩的纯度，越高色彩越纯，低则逐渐变灰，取 0-100%的数值。
- 明度（V），亮度（L），取 0-100%。

这里，我们通过改变色相得到一个较为明亮完整的颜色色系。

也就是采用这样一个过渡 `hsl(0%, 100%, 50%) --> hsl(100%, 100%, 50%)`，中间只改变色相，生成 20 个过渡状态。借助 SCSS ，CSS 语法如下:

```scss
$colors: ();
$totalStops:20;

@for $i from 0 through $totalStops{
    $colors: append($colors, hsl($i *(360deg/$totalStops), 100%, 50%), comma);
}
.colors {
    width: 200px;
    height: 200px;
    background: conic-gradient($colors);
    border-radius: 50%;
}
```

得到如下效果图，这次的效果很好：
![image](https://user-images.githubusercontent.com/8554143/27417984-c6966530-574a-11e7-8402-2acaaea8137b.png)

## 配合百分比使用

当然，我们可以更加具体的指定圆锥渐变每一段的比例，配合百分比，可以很轻松的实现饼图。

假设我们有如下 CSS：

```css
 {
  width: 200px;
  height: 200px;
  background: conic-gradient(
    deeppink 0,
    deeppink 30%,
    yellowgreen 30%,
    yellowgreen 70%,
    teal 70%,
    teal 100%
  );
  border-radius: 50%;
}
```

上图，我们分别指定了 0~30%，30%~70%，70%~100% 三个区间的颜色分别为 deeppink(深红)，yellowgreen(黄绿) 以及 teal(青) ，可以得到如下饼图：

![image](https://user-images.githubusercontent.com/8554143/27433045-70cb75b0-5785-11e7-8627-3a6122464d42.png)

当然，上面只是百分比的第一种写法，还有另一种写法也能实现：

```css
 {
  background: conic-gradient(deeppink 0 30%, yellowgreen 0 70%, teal 0 100%);
}
```

这里表示 ：

1. 0-30% 的区间使用 deeppink
2. 0-70% 的区间使用 yellowgreen
3. 0-100% 的区间使用 teal

而且，先定义的颜色的层叠在后定义的颜色之上。

## 配合 background-size 使用

使用了百分比控制了区间，再配合使用 `background-size` 就可以实现各种贴图啦。

我们首先实现一个基础圆锥渐变图形如下：

```css
 {
  width: 250px;
  height: 250px;
  margin: 50px auto;
  background: conic-gradient(
    #000 12.5%,
    #fff 0 37.5%,
    #000 0 62.5%,
    #fff 0 87.5%,
    #000 0
  );
}
```

效果图：

![image](https://user-images.githubusercontent.com/8554143/27434355-0bf875e2-578b-11e7-8eff-f32df7e9ed3b.png)

再加上 `background-size: 50px 50px;`，也就是：

```css
 {
  width: 250px;
  height: 250px;
  margin: 50px auto;
  background: conic-gradient(
    #000 12.5%,
    #fff 0 37.5%,
    #000 0 62.5%,
    #fff 0 87.5%,
    #000 0
  );
  background-size: 50px 50px;
}
```

得到：

![image](https://user-images.githubusercontent.com/8554143/27434369-19407d08-578b-11e7-91e2-f8af5a8a9687.png)

## 重复圆锥渐变 repaeting-conic-gradient

与线性渐变及径向渐变一样，圆锥渐变也是存在重复圆锥渐变 `repaet-conic-gradient` 的。

我们假设希望不断重复的片段是 0~30° 的一个片段，它的 CSS 代码是 `conic-gradient(deeppink 0 15deg, yellowgreen 0 30deg)` 。

![image](https://user-images.githubusercontent.com/8554143/27437316-739f5c66-5794-11e7-9547-6a50509cc5f5.png)

那么，使用了 `repaeting-conic-gradient` 之后，会自动填充满整个区域，CSS 代码如下：

```css
 {
  width: 200px;
  height: 200px;
  background: repeating-conic-gradient(deeppink 0 15deg, yellowgreen 0 30deg);
  border: 1px solid #000;
}
```

![image](https://user-images.githubusercontent.com/8554143/27437279-590b69bc-5794-11e7-8c78-f50f8bca9557.png)
