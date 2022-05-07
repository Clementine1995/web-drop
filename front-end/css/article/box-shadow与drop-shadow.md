# box-shadow 与 filter:drop-shadow 详解和应用

## box-shadow

box-shadow 属性向框添加一个或多个阴影。

语法：`box-shadow: h-shadow v-shadow blur spread color inset;`

| 值 | 描述 |
| - | - |
|h-shadow | 必需。水平阴影的位置。允许负值。|
|v-shadow|必需。垂直阴影的位置。允许负值。|
|blur|可选。模糊距离（模糊半径）|
|spread|可选。阴影的尺寸（扩张半径）|
|color|可选。阴影的颜色。请参阅 CSS 颜色值。|
|inset|可选。将外部阴影 (outset) 改为内部阴影。|

注释：box-shadow 向框添加一个或多个阴影。该属性是由逗号分隔的阴影列表，每个阴影由 2-4 个长度值、可选的颜色值以及可选的 inset 关键词来规定。省略长度的值是 0。

我理解的模糊半径越大，阴影越模糊，而扩张半径，就相当于在原图形基础上四个方向都扩大了，所以阴影宽相当与2*扩张半径+原图形宽度，高度同理。

具体应用可以查看

>[你所不知道的 CSS 阴影技巧与细节](https://github.com/chokcoco/iCSS/issues/39)
>[box-shadow 与 filter:drop-shadow 详解及奇技淫巧](https://www.cnblogs.com/coco1s/p/5592136.html)
>[阴影(box-shadow、drop-shadow)](https://chokcoco.github.io/CSS-Inspiration/#/?id=阴影box-shadow、drop-shadow)

## filter:drop-shadow

filter中的drop-shadowIE13才开始支持，移动端Android4.4才开始支持

filter中的drop-shadow语法：`filter: drop-shadow(x偏移, y偏移, 模糊大小, 色值);`

同样参数值的box-shadow，box-shadow的阴影距离更小，色值要更深，drop-shadow没有内阴影效果，drop-shadow不能阴影叠加。但是box-shadow顾名思意“盒阴影”，只是盒子的阴影，而drop-shadow就符合真实世界的投影。drop-shadow不仅可以穿透代码构建的元素的透明部分，PNG图片的透明部分也是可以穿透的。

具体应用可以查看

>[CSS3 filter:drop-shadow滤镜与box-shadow区别应用](https://www.zhangxinxu.com/wordpress/2016/05/css3-filter-drop-shadow-vs-box-shadow/)