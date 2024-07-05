# CSS 新特性3

## object-view-box

该CSS属性裁剪或调整 img 或者 video，该属性目前在 Chrome104 中有所支持

## CSS嵌套

如果你熟悉 Sass，就会知道嵌套选择器的便利性。本质上，就是在父级中编写子级规则。嵌套可以使编写CSS代码更加方便，现在嵌套终于来到了原生 CSS！

使用方法

```css
.card {
	color: red;
	& h2 {
		color: blue;
	}
}
```

当然，这里有个值得注意的点。如果我们不使用具体的 ClassName，而是使用标签名称选择器，像是这样：

```css
div {
	border: 1px solid #000;
	h3 {
		color: red;
		span {
			color: blue;
		}
	}
}
/*嵌套规则是不会生效的，此时，我们需要在标签名称选择器前，加上 & 符合：*/

div {
	border: 1px solid #000;
	& h3 {
		color: red;
	
		& span {
			color: blue;
		}
	}
}
```

## inset 属性

CSS 属性 inset 为简写属性，对应于 top、right、bottom 和 left 属性。其与 margin 简写属性具有相同的多值语法。

```css
div {
	inset: 20px 40px 30px 10px;
}
/* 相当于 */
div {
	top: 20px;
	right: 40px;
	bottom: 30px;
	left: 10px;
}
```

## -webkit-text-stroke

CSS 属性 `-webkit-text-stroke` 指定了文本字符的笔触宽度和笔触颜色。此属性为全称属性 `-webkit-text-stroke-width` 和 `-webkit-text-stroke-color` 的简写属性。

语法：`-webkit-text-stroke: <length> <color>;`

- length：笔触宽度。
- color：笔触颜色。

## text-wrap

text-wrap 属性控制元素内文本的换行方式