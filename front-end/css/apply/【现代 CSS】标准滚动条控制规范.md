# 【现代 CSS】标准滚动条控制规范

> 原文[【现代 CSS】标准滚动条控制规范 scrollbar-color 和 scrollbar-width](https://github.com/chokcoco/iCSS/issues/259)

## scrollbar-color

scrollbar-color CSS 属性设置滚动条轨道和滑块的颜色

- 轨道（track）是指滚动条，其一般是固定的而不管滚动位置的背景。
- 滑块（thumb）是指滚动条通常漂浮在轨道的顶部上的移动部分。

语法：

```css
/* Keyword values */
scrollbar-color: auto;

/* <color> values */
scrollbar-color: rebeccapurple green; /* 滑块颜色 轨道颜色.
```

## scrollbar-width

scrollbar-width 属性允许开发者在元素显示滚动条时设置滚动条的最大宽度。

遗憾的是，在 CSS Scrollbars Styling Module Level 1 一期滚动条规范中，这个属性的功能被设置的非常弱。

不要说分别设置滑块和轨道的宽度，scrollbar-width 目前甚至不支持接受一个宽度数值。

```css
/* 关键字值 */
scrollbar-width: auto;
scrollbar-width: thin; /* 系统提供的瘦滚动条宽度，或者比默认滚动条宽度更窄的宽度。*/
scrollbar-width: none; /* 不显示滚动条，但是该元素依然可以滚动。*/
```