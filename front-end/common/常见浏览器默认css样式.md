# 常见的css默认样式

>部分来自[css容易使人蒙圈的几个经典问题](https://juejin.im/post/5e0abd926fb9a04825712e3f)
>
>一些常见问题[【建议收藏】90%的前端都会踩的坑，你中了吗？](https://juejin.im/post/5dfb3e73f265da33b12ea9d3)

在页面开发中，如果没有使用一些UI框架，自己使用原生的标签，在不同浏览器里可能表现会不符合自己的预期。

+ chrome下button，input等focus默认边框。默认情况下Chrome会给他们加一个蓝色的边框，这一点可以在控制台勾选上:focus看到`outline: -webkit-focus-ring-color auto 5px;`这么一条样式，如果不想要可以直接设置`outline:none`来解决。
+ ios下nput 和textarea表单默认会有个内阴影，一定程度上影响视觉一致，可以通过`-webkit-appearance: none;`来去掉它。
+ a标签的:visited伪类，是否访问过某网站是由浏览器记住的，:link、:visited、:hover、:actived的顺序可以让着四个效果都显示出来，想要去掉a标签的下划线使用`text-decoration:none`
+ ul无序列表标签，默认会在li项的前面加上圆点，如果需要去掉的话需要使用`list-style:none`来清除。

## Safari浏览器，对于显示不全的内容鼠标经过会自动加上了title显示了内容，怎么去掉

```css
.ellipsis {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ellipsis::before{
  content: '';
  display: block;
}
```

## opacity子元素会继承透明度

opacity来做背景的透明化处理，该属性被所有浏览器支持，可以大胆使用，透明度从0.0（完全透明）到1.0（完全不透明），但该方法会使其所有子元素都透明，此时若只想让背景透明，其他不透明，则可以使用rgba处理背景：

```css
background-color: rgba(red, green, blue, alpha)
```

其中这个alpha 即设置透明度，取值在0~1之间。

## div内置img元素，底部总有间距

用一个div包裹一个img，会出现img不能完全覆盖div空间，总会在底边留下一点空隙。

这种现象产生的原因是img是行内元素，浏览器为下行字符（如：g、y、j、p、q）留下的一些空间，这些字符是会比其他字符多占据底部一些空间（具体以当前字体大小有关），这种规则会影响行内元素img标签（其默认垂直对齐方式是依照基线来的，即vertical-align: baseline），同样行内元素都会和外部元素留这么一丢丢安全距离。

解决方案就从这两处入手，整理如下：

+ div设置font-size: 0或line-height: 0，进而行高为0；
+ img设置 vertical-align: top 或者 middle/，使其不再以默认基线为对齐方式；
+ img设置 display:block，使其变成块级元素。

## 元素自动填充上背景色

该现场多在表单输入等场景上会出现，初次看到确实很怪异：

即当浏览器（chrome）给输入框自动填充内容后，也会自动给输入框带上背景（黄或灰蓝），该问题是由于chrome会默认给自动填充的input、select、textarea等加上:-webkit-autofill私有伪属性造成的，比较好的解决方案就是做样式覆盖

```css
input:-webkit-autofill{
  box-shadow: 0 0 0px 1000px white inset !important;
}
select:-webkit-autofill{
  box-shadow: 0 0 0px 1000px white inset !important;
}
textarea:-webkit-autofill{
  box-shadow: 0 0 0px 1000px white inset !important;
}
```

## transform 基数值导致字体模糊

transform作为CSS3最为自豪的属性，已经成为了当前前端开发中不可或缺的方法，但它有个渲染的问题，即当元素设置有transform，且其值为奇数或小数，同时其整体高度也有奇数时，其内部文字会变模糊。

解决方案即：

+ 不要给transform属性值设置奇数和小数值
+ 调整整体元素高度不要为基数
