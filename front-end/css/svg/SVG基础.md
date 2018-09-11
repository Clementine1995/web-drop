# SVG基础

>文章参考自[SVG基础](https://github.com/junruchen/junruchen.github.io/wiki/SVG%E5%9F%BA%E7%A1%80)

内容

+ 概念
+ 特殊元素
+ 作用于SVG标签的属性
+ 作用于SVG内部元素的样式
+ SVG内部元素

## 一、概念

该部分主要说明SVG的一些基本概念，以便于对其他SVG基础元素的理解。

### 1. SVG (Scalable Vector Graphics 可伸缩矢量图形)

+ 使用XML格式定义图形；
+ 用来定义web上使用的矢量图；
+ 改变尺寸图形质量不受损；
+ 所有元素属性都可使用动画效果；
+ 继承了W3C标准(DOM XSL)； 在HTML中使用SVG有两种方式，可以在HTML文件中直接嵌入svg内容，也可以直接引入后缀名为.svg的文件 如：

```html
/* svg标签，这里的rect为矩形，在后面的图形元素中会详细说明  */
<svg width="200" height="200">
  <rect width="20" height="20" fill="red"></rect>
</svg>

/* 引入后缀名为.svg的文件 */
<img src="demo.svg" alt="测试svg图片">
```

注意：svg为inline水平元素。且需要绘制的所有图形都应被包含在`<svg></svg>`标签内

### 2. SVG中的坐标系

SVG中坐标系的特点：

+ y轴向下
+ 顺时针方向的角度为正值

![坐标系.png](https://camo.githubusercontent.com/fb278b83fc27b64d89c0f96e5796984119b85188/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d336361303932303734653166363930312e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f333030)

另外要注意：元素的所有操作都是相对自身坐标系进行的

### 3. 颜色 RGB和HSL

RGB: 三个分量：红色、绿色、蓝色，每个分量的取值范围[0, 255]，优点是显示器更容易解析。

HSL: 三个分量：颜色h、饱和度s%、亮度l%，每个分量的取值范围分别是[0, 359], [0, 100%], [0, 100%],，其中，h=0表示红色， h=0表示120绿色，h=0表示240 蓝色。

基于HSL的配色方案[http://paletton.com/](http://paletton.com/)

## 二、特殊元素

### 1. foreignObject

foreignObject元素通常被用来在svg代码中嵌入html节点。注意：该属性对IE不支持。

通常会与标签一起使用，在用户浏览器不支持时，告知用户。

如：常见的svg内部文字换行操作

```html
<svg>
  <switch>
    <foreignObject x="20" y="0" width="50">
      <p>测试换行文本，测试换行文本，测试换行文本</p>
    </foreignObject>
    <text x="20" y="20">Your SVG viewer cannot display html.</text>
  </switch>
<svg>
```

## 三、作用于SVG标签的属性

### 1. width，height

用来控制SVG视图的宽度和高度

### 2. viewBox

定义用户视野的位置以及大小，即定义用来观察SVG视图一个矩形区域，如：`viewBox ='20 20 100 100'`，前两个参数表示viewBox视野相对svg视图的x y坐标，后两个参数表示viewBox的大小。

与svg实际大小的关系如下：

![viewBox](https://camo.githubusercontent.com/7885f3bd1483b9e55113424aeed4579af8e38a7a/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d663130303035366439333861333866632e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f343030)

如上图所示，用户可以看到的部分是蓝色的星星，而星星的另一侧是看不到的。

viewBox的使用案例：

1.绘制矩形

  ```html
  <svg width="200" height="200" style="border: 2px solid #58a">
    <rect x="30" y="30" width="100" height="100" fill="#fb3" stroke="none"></rect>
  </svg>
  ```

  ![rectDemo1.png](https://camo.githubusercontent.com/9d12e5c53de8ae35e61faaebfd059da738f2d3f9/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d636538316535386166373063376631652e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f323030)

2.增加视野viewBox viewBox='0 0 100 100'，相当于用户只能看到SVG视图中viewBox定义的区域，即下图红色框内区域：

![rectDemo3.png](https://camo.githubusercontent.com/f66977b4e52e17650e6e636121d64296e77f1216/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d633964653238386561653164326461352e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f323030)

最终效果图：

![rectDemo2.png](https://camo.githubusercontent.com/b180d371a74a359f14a534c48fbaf12f3403a8d1/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d326465663163663837386339666438332e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f323030)

3.preserveaspectRatio

作用于viewBox，取值：[参数值 | none]有两个参数，第一个参数用来控制viewBox的对齐方式，第二个参数控制viewBox的缩放方式。另外：none 表示变形以充分适应svg

  1. 第一个参数有两个值组成，第一个值控制x轴的对齐方式，第二个轴控制y的对齐方式，如：xMinYMin 参数说明：

+ xMin：与x轴左边对齐
+ xMid：与x轴中心对齐
+ xMax：与x轴右边对齐
+ YMin：与y轴上边缘对齐
+ YMid：与y轴中心对齐
+ YMax：与y轴下边缘对齐

第二个参数取值：

+ meet：保持横纵比缩放
+ slice：保持横纵比缩放的同时以比例小的方向为准放大填满svg区域

示例图：

![preserveaspectRatio.png](https://camo.githubusercontent.com/95038480014cbb9a13b128dc8b567f482272697a/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d326639666461643637396136313834622e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f363030)

1. 图1：红色区域为不设置preserveaspectRatio时的可视区域；
2. 图2: 采用与x轴左边对齐、与y轴上边缘对齐的方式，保持纵横比缩放；
3. 图3：保持纵横比的同时，以比例小的方向即x轴等比放大，填充svg区域
4. 图4：preserveaspectRatio="none"，变形充分适应svg

## 四、作用于SVG内部元素的样式

SVG支持使用css选择器给元素添加样式，如：

```html
/* 定义样式 */
.rectStyle {
  fill: yellow;
}
<svg width="200" height="200">
  <rect class="rectStyle" width="20" height="20"></rect>
</svg>
```

也可以直接在元素中设置样式：

```html
<svg width="200" height="200">
  <rect width="20" height="20" fill="yellow"></rect>
</svg>
```

或者写在style中：

```html
<svg width="200" height="200">
  <rect style="fill: yellow;" width="20" height="20"></rect>
</svg>
```

常见样式说明：

### 1. 填充

+ fill：定义填充颜色以及文字颜色
+ fill-opacity：定义填充颜色的透明度
+ fill-rule：指定采用的填充规则，符合填充规则 [即位于图形内部的点] 的才可被填充，取值：`[nonzero | evenodd | inherit]`，默认值为`nonzero`。
  + nonzero： 该规则判断点任意方向的射线与图形路径的相交情况，默认为数值0，射线从左到右时，每穿过一条路径，数值加1；从右到左时，每穿过一条路径，数值减1，最后结果若为0，则表示点不在图形内部，不能填充。
  + evenodd：该规则判断点任意方向的射线与图形路径的相交情况，相交个数为奇数，则点在图形内部，可进行填充；反之在外部，不进行填充。

### 2. 边框

+ stroke：边框颜色
+ stroke-width：边框宽度
+ stroke-opacity：边框透明度，取值[ 0, 1 ]
+ stroke-linecap：单条线端点样式，一般应用于直线或者路径， 取值：[ butt | square | round ]，分别是对接、方形和圆形

![linecapDemo.png](https://camo.githubusercontent.com/29637ad46100f99ea948fc2731c0669ad1935fd1/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d633931666661626439373232343665392e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f323030)

+ stroke-dasharray：虚线边框，可设置每段虚线的长度和间隔，之间使用逗号分隔或者空格分隔，如：stroke-dasharray="10, 5, 5, 10"

![dasharrayDemo.png](https://camo.githubusercontent.com/c0470f1624b28024ed80075718dda6b5ef5b61db/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d323865303335313566336561663030312e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f323030)

+ stroke-dashoffset：设置虚线描边偏移量，使图案向前移动，如：

```html
<line x1="200" y1="200" x2="400" y2="200"
          stroke="red" stroke-width="5" stroke-linecap="butt"
          stroke-dasharray="20 5 5 10"></line>

<line x1="200" y1="220" x2="400" y2="220"
          stroke="red" stroke-width="5" stroke-linecap="butt"
          stroke-dasharray="20 5 5 10"
          stroke-dashoffset="10"></line>
```

虚线的样式为`20 5 5 10`，偏移量为`10`，根据下图可发现第二个虚线，整体向前移动了10个单位

![dashoffsetDemo.png](https://camo.githubusercontent.com/f25d69c1ef9f424c2d9416ce0a99b1e7549f0e76/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d653536316361313036396535666161622e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f333030)

+ stroke-linejoin：两条线段之间衔接点的样式，取值：[ miter | round | bevel ]，分别是尖角(图左一)、圆角(图左二)和斜角(图左三)

![linejoinDemo.png](https://camo.githubusercontent.com/25708fb13e0c3a96dde4cd906971e7c1b8e27c60/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d363336663936376664343933366138352e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f343030)

+ stroke-miterlimit：默认值4，当miterLength / stroke-width < stroke-miterlimit时，stroke-linejoin值会变成换成bevel斜角。如下图中，stroke-width为15，根据计算公式，miterLength ／ stroke-width 约等于5.2，即当stroke-miterlimit小于6时，stroke-linejoin值会变成bevel斜角。

![miterlimitdDemo1.png](https://camo.githubusercontent.com/a5e16503a07f335a0be2f943b351ae71e3322c7c/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d663436643732333765666237323236372e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f333030)![miterlimitdDemo2.png](https://camo.githubusercontent.com/3172793b475f4c8a7f88aab892efdeed759598db/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d646335353465363338313731623863312e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f333030)

示例代码：

```html
<polyline points="-20,500 60,60 140,500" 
              stroke="black" stroke-linejoin="miter"
              stroke-miterlimit="6"              
              stroke-width="15"
              fill="none" />

<polyline points="-20,700 60,260 140,700" 
              stroke="black" stroke-linejoin="miter"
              stroke-miterlimit="5"
              stroke-width="15"
              fill="none" />
```

### 3. 透明度

+ opacity：定义整个图形元素透明度

### 4. 字体

+ font-size：字体大小
+ font-family：字体系列的名称
+ font-weight : 字体粗细
+ font-style：字体样式，斜体或正常
+ text-decoration：下划线样式
+ text-anchor：设置文本的排列属性，属性值`[start | middle | end | inherit]`，如：middle表示，将文字定位原点移动至文字中心。

### 5. 变换

基本概念同css

+ transform：同css，默认以左上角为旋转中心，如：transform="rotate(30)"
+ transform-origin：同css，设置旋转等操作中心
+ rotate：设置文字元素的旋转角度，正值为顺时针旋转，注意区分rotate与transform中的rotate，如：rotate="30"

![rotateDemo.png](https://camo.githubusercontent.com/9e3882b07be8eb4722fab8690af7786705d5428b/687474703a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313530303331352d323037343934626430323961626533662e706e673f696d6167654d6f6772322f6175746f2d6f7269656e742f7374726970253743696d61676556696577322f322f772f333030)

而transform中的rotate是对整个元素进行旋转操作。

## 四、SVG内部元素

详情查看SVG内部元素
