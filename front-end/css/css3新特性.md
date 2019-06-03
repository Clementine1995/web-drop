# CSS3新特性

## 过渡

语法
transition： CSS属性，花费时间，效果曲线(默认ease)，延迟时间(默认0)

## 动画

### 语法

animation：动画名称，一个周期花费时间，运动曲线（默认ease），动画延迟（默认0），播放次数（默认1），是否反向播放动画（默认normal），是否暂停动画（默认running）

## 形状转换

语法
transform:rotate/translate/scale/skew/rotate

## 选择器

![CSS3选择器](https://user-gold-cdn.xitu.io/2017/11/15/15fbf40815f2e26b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## 阴影

语法
box-shadow: 水平阴影的位置 垂直阴影的位置 模糊距离 阴影的大小 阴影的颜色 阴影开始方向（默认是从里往外，设置inset就是从外往里）;

## 边框

### 边框图片

border-image: 图片url 图像边界向内偏移 图像边界的宽度(默认为边框的宽度) 用于指定在边框外部绘制偏移的量（默认0） 铺满方式--重复（repeat）、拉伸（stretch）或铺满（round）（默认：拉伸（stretch））;

### 边框圆角

border-radius: n1,n2,n3,n4;
border-radius: n1,n2,n3,n4/n1,n2,n3,n4;
n1-n4四个值的顺序是：左上角，右上角，右下角，左下角。

## 背景

### background-clip

制定背景绘制（显示）区域，默认情况（从边框开始绘制）

### background-origin

background-Origin属性指定background-position属性应该是相对位置

### background-size

就是制定背景的大小

### 多张背景图

background:url('test.jpg') no-repeat left,url(logo.png) no-repeat right;

## 反射

语法
-webkit-box-reflect:方向[ above-上 | below-下 | right-右 | left-左 ]，偏移量，遮罩图片

## 文字

### 换行

语法：word-break: normal|break-all|keep-all;

语法：word-wrap(overflow-wrap): normal|break-word;

语法：text-overflow: clip|ellipsis|string

### text-overflow

### writing-mode

### 文字阴影

语法：text-shadow:水平阴影，垂直阴影，模糊的距离，以及阴影的颜色。

## 颜色

### rgba

rgba（rgb为颜色值，a为透明度），使用这个不会影响后代的透明度

### hsla

h:色相”，“s：饱和度”，“l：亮度”，“a：透明度”，使用这个不会影响后代的透明度

## 渐变

线性渐变，径向渐变，圆锥渐变

## Filter（滤镜）

## 弹性布局Flex

## 栅格布局Grid

## 多列布局column-count

column-count
column-gap
column-rule

## 盒模型定义

box-sizing:border-box的时候，边框和padding包含在元素的宽高之内
box-sizing:content-box的时候，边框和padding不包含在元素的宽高之内

## 媒体查询

## 混合模式

background-blend-mode和mix-blend-mode

## clip-path

## shapes

## 新增长度单位（vh、vw、rem）

## 新增宽高取值

fill-available、fit-content、max-content、min-content

## CSS变量

```()
// 声明一个变量：
:root{
  --bgColor:#000;
}
// 使用变量
.main{
  background:var(--bgColor);
}
```

### text-decoration

CSS3里面开始支持对文字的更深层次的渲染，具体有三个属性可供设置：

text-fill-color: 设置文字内部填充颜色
text-stroke-color: 设置文字边界填充颜色
text-stroke-width: 设置文字边界宽度
