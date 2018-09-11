# background介绍

>内容转载自[CSS Background属性详解](https://github.com/junruchen/junruchen.github.io/wiki/CSS-Background%E5%B1%9E%E6%80%A7%E8%AF%A6%E8%A7%A3)

内容

+ 常见背景属性的理解
  + background-repeat
  + background-attachment
  + background-position
  + background-origin
  + background-clip
  + background-size
+ 简写用法
+ 神奇的渐变色

## 背景属性详解

### background-repeat

`background-repeat` 属性用来设置背景图像的铺排填充方式, 默认值: `repeat` 。

取值说明:

+ `repeat-x` 表示横向上平铺, 相当于设置两个值 repeat no-reapeat;
+ `repeat-y` 表示纵向上平铺, 相当于设置两个值 no-repeat repeat;
+ `repeat` 表示横向纵向上均平铺;
+ `no-repeat` 表示不平铺;
+ `round` 表示背景图像自动缩放直到适应且填充满整个容器。 注意: 当设置为 round 时, background-size 的 cover 和 contain 属性失效。
+ `space` 表示背景图像以相同的间距平铺且填充满整个容器或某个方向. 注意: 当 background-size 设置为 cover 和 contain 时, background-rapeat 的 space 属性失效。

注意：

+ `background-repeat` 的 round/space 属性, 部分Firefox版本不支持。
+ 提供一个参数，则表明作用于两个方向；提供两个参数时，第一个作用于x轴，第二个作用于y轴

示例图:

![background-repeat效果图](https://camo.githubusercontent.com/d7d6f324b51bebe30b05c55aba0d1de75b2b94ee/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938343033303030316661343830343935303236372e706e67)

### background-attachment

`background-attachment` 属性用来设置背景图像是随对象内容滚动还是固定的，默认值 `scroll`。

取值说明:

+ fixed 背景图像相对窗体固定，即内容滚动时，图片不动;
+ scroll 相对元素固定，背景图像跟随元素本身，元素内容滚动时背景图像不动;
+ local 相对元素内容固定，背景图像跟随元素内容。

scroll与local区别的体现：

当元素设置overflow: auto 时，滚动的是元素的内容

+ scroll属性值：背景图像跟随元素本身，元素本身没有滚动，所以背景图像不动;
+ local属性值：背景图像相对元素内容固定，跟随元素的内容一起滚动。

### background-position

`background-position` 属性用来设置背景图像的位置, 默认值: `0% 0%`, 效果等同于 `left top`。

取值说明:

+ 如果设置一个值, 则该值作用在横坐标上, 纵坐标默认为50%(即center) ;
+ 如果设置两个值, 则第一个值作用于横坐标, 第二个值作用于纵坐标, 取值可以是方位关键字[left\top\center\right\bottom], 如 background-position: left center ; 也可以是百分比或长度, 百分比和长度可为设置为负值, 如: background-position: 10% 30px ;
+ css3支持3个值或者4个值, 注意如果设置3个或4个值, 偏移量前必须有关键字, 如: background-position: right 20px bottom 30px;

示例图如下:

![background-position的超级用法](https://camo.githubusercontent.com/9f286bde1cc4278af2e7da303c7ba20eed143758/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938326364303030313831636130353333303235352e706e67)

可使用 `background-position-x` 或 `background-position-y` 来分别设置横坐标或纵坐标的偏移量。

注意: 当使用 background-position-x 以及 background-position-y 时, 需考虑Firefox兼容性的问题。

### background-origin

用于设置 `background-position` 定位时参考的原点, 默认值 `padding-box` , 另外还有两个值: `border-box` 和 `content-box`。

代码示例:

```css
border: 10px solid #58A;
padding: 20px;
background-position: 10px 20px;
background-origin: padding-box; // border-box, content-box
```

示例图(红色框内为content区域):

![background-origin不同取值的效果图](https://camo.githubusercontent.com/c21ea0f474aad59ab8659005f00a46215ea3d841/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031382f332f33302f313632373630323365646433333239303f773d37323826683d33313826663d706e6726733d313837363336)

### background-clip

用于指定背景图像向外裁剪的区域, 默认值 `border-box` , 另外还有两个值: `padding-box` 和 `content-box`。

注意:

+ background-origin 的默认值为 padding-box;
+ 即背景图像background-position的默认定位原点为padding区域;
+ 为更好的了解 background-clip 属性值的特性, 可将 background-origin 设置为 border-box 。

代码示例:

```css
background-color: #58a;
background-image: url("image.png");
background-repeat: no-repeat;
background-size: 120px 100px;
border: 10px dashed #fb3;
padding: 30px;
background-origin: border-box;
```

示例图:

![background-clip不同取值的效果图](https://camo.githubusercontent.com/b5088335291d181563c962bb6a4b74a35cffaf57/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938343931303030316530616230373136303239302e706e67)

### background-size

`background-size` 属性用来指定背景图像的大小。默认值: `auto`

取值说明:

+ 可使用 长度值 或 百分比 指定背景图像的大小, 值不能为负值
  + 设置一个值, 则用于定义图像的宽度, 图像的高度为默认值 auto, 且根据宽度进行等比例缩放;
  + 设置两个值, 则分别作用于图像的宽和高。
+ auto 默认值, 即图像真实大小。
+ cover 将背景图像等比缩放到完全覆盖容器, 背景图像有可能超出容器。(即当较短的边等于容器的边时, 停止缩放)
+ contain 将背景图像等比缩放到宽度或高度与容器的宽度或高度相等, 背景图像始终被包含在容器内。(即当较长的边等于容器的边时, 停止缩放)

示例图如下:

图片: 宽640px 高448px, 容器: 宽200px 高200px

[background-size取值比较](https://camo.githubusercontent.com/cdb46ed1f8ccc7304396626839d216b5cb6abf0b/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938333965303030313339393030343837303236342e706e67)

## background属性的简写用法

`background` 提供简写用法，即在一个声明中可设置所有的背景属性。

### 所有属性如下

+ `background-image`: 设置背景图像, 可以是真实的图片路径, 也可以是创建的渐变背景;
+ `background-position`: 设置背景图像的位置;
+ `background-size`: 设置背景图像的大小;
+ `background-repeat`: 指定背景图像的铺排方式;
+ `background-attachment`: 指定背景图像是滚动还是固定;
+ `background-origin`: 设置背景图像显示的原点[background-position相对定位的原点];
+ `background-clip`: 设置背景图像向外剪裁的区域;
+ `background-color`: 指定背景颜色。

建议顺序如下: `bg-color || bg-image || bg-position [ / bg-size]? || bg-repeat || bg-attachment || bg-origin || bg-clip`

注意:

+ 顺序并非固定
+ `background-position` 和 `background-size` 属性, 之间需使用/分隔, 且position值在前, size值在后。
+ 如果同时使用 `background-origin` 和 `background-clip` 属性, origin属性值需在clip属性值之前, 如果origin与clip属性值相同, 则可只设置一个值。

代码示例:

```css
background: url("image.png") 10px 20px/100px no-repeat content-box;
```

### 设置多组复合属性

background是一个复合属性, 可设置多组属性, 每组属性间使用逗号分隔, 其中背景颜色不能设置多个且只能放在最后一组。

如设置的多组属性的背景图像之间存在重叠, 则前面的背景图像会覆盖在后面的背景图像上。

代码示例:

```css
padding: 10px;
background: url("image.png") 0% 0%/60px 60px no-repeat padding-box,
            url("image.png") 40px 10px/110px 110px no-repeat content-box,
            url("image.png") 140px 40px/200px 100px no-repeat content-box #58a;
```

效果图如下:

![多层背景图像效果图](https://camo.githubusercontent.com/67d9adf8311881e921e2dbe40e4fbfeea05f9193/687474703a2f2f696d672e6d756b6577616e672e636f6d2f3538393938316361303030313331316630353037303231312e706e67)