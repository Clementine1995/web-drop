# CSS 属性选择器深入挖掘

> 原文地址[CSS 属性选择器的深入挖掘](https://github.com/chokcoco/iCSS/issues/65)

## 简单的语法介绍

- [attr]：该选择器选择包含 attr 属性的所有元素，不论 attr 的值为何。
- [attr=val]：该选择器仅选择 attr 属性被赋值为 val 的所有元素。
- [attr~=val]：该选择器仅选择具有 attr 属性的元素，而且要求 val 值是 attr 值包含的被空格分隔的取值列表里中的一个，而不是取值列表中某个值包含它就可以。
- [attr|=val] : 选择 attr 属性的值是 val 或值以 val- 开头的元素（注意，这里的 “-” 不是一个错误，这是用来处理语言编码的）。
- [attr^=val] : 选择 attr 属性的值以 val 开头（包括 val）的元素。
- [attr$=val] : 选择 attr 属性的值以 val 结尾（包括 val）的元素。
- [attr*=val] : 选择 attr 属性的值中包含子字符串 val 的元素（一个子字符串就是一个字符串的一部分而已，例如，”cat“ 是 字符串 ”caterpillar“ 的子字符串。

## 复杂一点的用法

层叠选择

```css
div [href] {
  ...;
}
```

多条件复合选择

选择一个 img 标签，它含有 title 属性，并且包含类名为 logo 的元素。

```css
img[title][class~="logo"] {
  ...;
}
```

伪正则写法

i 参数

忽略类名的大小写限制，选择包含 class 类名包含子字符串为 text，Text，TeXt... 等情况的 p 元素。
这里的 i 的含义就是正则里面参数 i 的含义，ignore，忽略大小写的意思。

```css
p[class*="text" i] {
  ...;
}
```

所以上面的选择器可以选中类似这样的目标元素：

```html
<p class="text"></p>
<p class="nameText"></p>
<p class="desc textarea"></p>
```

g 参数

与正则表达式不一样，参数 g 在这里表示大小写敏感（case-sensitively）。然而，这个属性当前仍未纳入标准，支持的浏览器不多。

配合 :not() 伪类

还有一种比较常用的场景就是搭配:not() 伪类，完成一些判断检测性的功能。譬如下面这个选择器，就可以选取所有没有 [href] 属性的 a 标签，添加一个红色边框。

```css
a:not([href]) {
  border: 1px solid red;
}
```

当然，复杂一点，我们可以搭配不仅仅一个 :not()伪类，像是这样，可以同时多个配合使用，选择一个 href, target, rel 属性都没有的 a 标签：

```css
a:not([href]):not([target]):not([rel]) {
  border: 1px solid blue;
}
```

## 搭配伪元素

配合上伪元素，我们可以实现很多有助提升用户体验的功能。

### 角标功能

这里有一个小知识点，伪元素的 content 属性，通过 attr(xxx)，可以读取到对应 DOM 元素标签名为 xxx 的属性的值。

所以，配合属性选择器，我们可以很容易的实现一些角标功能：

```css
<div count="5" > Message</div > div {
  position: relative;
  width: 200px;
  height: 64px;
}

div::before {
  content: attr(count);
  ...;
}
```

![image](https://user-images.githubusercontent.com/8554143/59601359-47595400-90f3-11e9-9315-03ca14c817b9.png)

这里右上角的数字 5 提示角标，就是使用属性选择器配合伪元素实现，可以适应各种长度，以及中英文，能够节省一些标签。

### 属性选择器配合伪元素实现类 title 功能

我们都知道，如果给一个图片添加一个 title 属性，当 hover 到图片上面的时，会展示 title 属性里面附加的内容，类似这样：

```html
<img src="xxxxxxxxx" title="风景图片" />
```

![attributeselector](https://user-images.githubusercontent.com/8554143/59601663-3a893000-90f4-11e9-9051-7187533d25fe.gif)

这里不一定是 img 标签，其他标签添加 title 属性都能有类似的效果。但是这里会有两个问题：

响应太慢，通常鼠标 hover 上去要隔 1s 左右才会出现这个 title 框
框体结构无法自定义，弹出框的样式无法自定义
所以这里，如果我们希望有一些自己能够控制样式的可快速响应的浮层，可以自定义一个类 title 属性，我们把它称作 popTitle，那么可以这样操作：

```html
<p class="title" popTitle="文字弹出">这是一段描述性文字</p>
<p class="title" popTitle="标题A">这是一段描述性文字</p>
<style>
  p[popTitle]:hover::before {
    content: attr(popTitle);
    position: absolute;
    color: red;
    border: 1px solid #000;
    ...;
  }
</style>
```

对比一下，第一个是原生自带的 title 属性，下面两个是使用属性选择器配合伪元素模拟的提示：

![attributeselector2](https://user-images.githubusercontent.com/8554143/59602153-96a08400-90f5-11e9-9e6d-50aa06c13b5d.gif)

> 浏览器自带的 title 属性延迟响应是添加一层防抖保护，避免频繁触发，这里也可以通过对伪元素添加一个 100 毫秒级的 transition-delay 实现延迟展示。

### 商品展示提示效果

好，上面的运用实例我们再拓展一下，考虑如何更好的运用到实际业务中，其实也是有很多用武之地的。譬如说，通过属性选择器给图片添加标签，类似一些电商网站会用到的一个效果。

我们希望给图片添加一些标签，在 hover 图片的时候展示出来。

当然，CSS 中，诸如 `<img>` 、`<input>`、`<iframe>`，这几个标签是不支持伪元素的。

所以这里我们输出 DOM 的时候，给 img 的父元素带上部分图片描述标签。通过 CSS 去控制这些标签的展示：

```html
<div class="g-wrap" desc1="商品描述AAA" desc2="商品描述BBB">
  <img src="https://xx.baidu.com/timg?xxx" />
</div>
<style>
  [desc1]::before,
  [desc2]::after {
    position: absolute;
    opacity: 0;
  }

  [desc1]::before {
    content: attr(desc1);
  }

  [desc2]::after {
    content: attr(desc2);
  }

  [desc1]:hover::before,
  [desc2]:hover::after {
    opacity: 1;
  }
</style>
```

看看效果：

![attributeselector4](https://user-images.githubusercontent.com/8554143/59602795-390d3700-90f7-11e9-9e23-b861ceffd5f2.gif)

### 属性选择器配合伪元素实现下载提示

我们知道，HTML5 对标签新增了一个 download 属性，此属性指示浏览器下载 URL 而不是导航到它。

那么，我们可以利用属性选择器对所有带此类标签的元素进行提示。像这样：

```html
<a href="https://www.xxx.com/logo.png" download="logo">logo</a>
<style>
  [download] {
    position: relative;
    color: hotpink;
  }

  [download]:hover::before {
    content: "点击可下载此资源！";
    position: absolute;
    ...;
  }
</style>
```

当我们 hover 到这个链接的时候，就会这样，提示用户，这是一个可以下载的按钮：

![attributeselector3](https://user-images.githubusercontent.com/8554143/59602534-7ae9ad80-90f6-11e9-9041-f527d5a44a8e.gif)

### 属性选择器对文件类型的处理

也可以对一些可下载资源进行视觉上 icon 的提示。

```html
<ul>
  <li><a href="xxx.doc">Word File</a></li>
  <li><a href="xxx.ppt">PPT File</a></li>
  <li><a href="xxx.PDF">PDF File</a></li>
  <li><a href="xxx.MP3">MP3 File</a></li>
  <li><a href="xxx.avi">AVI File</a></li>
</ul>
<style>
  a[href$=".doc" i]::before {
    content: "doc";
    background: #a9c4f5;
  }
  a[href$=".ppt" i]::before {
    content: "ppt";
    background: #f8e94f;
  }
  a[href$=".pdf" i]::before {
    content: "pdf";
    background: #fb807a;
  }
  a[href$=".mp3" i]::before {
    content: "mp3";
    background: #cb5cf5;
  }
  a[href$=".avi" i]::before {
    content: "avi";
    background: #5f8ffc;
  }
</style>
```

![image](https://user-images.githubusercontent.com/8554143/59603461-07956b00-90f9-11e9-99c2-dae460560fdb.png)

...
