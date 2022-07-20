# 妙用 CSS 构建花式透视背景效果

> 原文[妙用 CSS 构建花式透视背景效果](https://github.com/chokcoco/iCSS/issues/194)

本文将介绍一种巧用 background 配合 backdrop- filter 来构建有趣的透视背景效果的方式

本技巧源自于如何构建如 ElementUI 文档的一种顶栏背景特效，看看效果：

![img1](https://user-images.githubusercontent.com/8554143/179509709-e60ac03f-5db6-41e7-ace7-2ac07f031777.gif)

仔细看，在页面的的滚动过程中，顶栏的背景不是白色的，也不是毛玻璃效果，而是能够将背景颗粒化，准确而言，是一种基于颗粒化的毛玻璃效果，元素首先是被颗粒化，其次，元素的边缘也是在一定程度上被虚化了。那么，该如何实现这个效果呢？

## 需求拆解

上述效果看似神奇，其实原理也非常简单。主要就是颗粒化的背景 background 加上 backdrop-filter: blur() 即可。

首先，需要实现颗粒背景。利用 background 实现这样一个背景：

```html
<style>
  div {
    background: radial-gradient(transparent, #000 20px);
    background-size: 40px 40px;
  }
</style>
<div></div>
```

从透明到黑色的径向渐变效果如下：

![img2](https://user-images.githubusercontent.com/8554143/179511399-4c3bd8f2-1666-4d24-b3a1-b5e31246c4b6.png)

需要注意的是，图里的白色部分其实透明的，可以透出背后的背景。此时，如果背景后面有元素，效果就会是这样：

![img3](https://user-images.githubusercontent.com/8554143/179511838-3679904c-b020-49b3-a454-1063a154c54d.png)

将 background: radial-gradient(transparent, #000 20px) 中的黑色替换成白色，效果如下：

![img4](https://user-images.githubusercontent.com/8554143/179511998-947d426f-7462-4a2a-9200-972099870268.png)

这里为了展示原理，每个径向渐变的圆设置的比较大，把它调整回正常大小：

```css
div {
  background: radial-gradient(transparent, rgba(255, 255, 255, 1) 2px);
  background-size: 4px 4px;
}
```

这样，就成功的将背景颗粒化：

![img5](https://user-images.githubusercontent.com/8554143/179512713-a67d3f0f-ece7-4997-b4ac-e30c17b83147.gif)

当然，此时透出的背景看上去非常生硬，也不美观，所以，还需要 backdrop-filter: blur()，加上一个试试看：

```css
div {
  background: radial-gradient(transparent, rgba(255, 255, 255, 1) 2px);
  background-size: 4px 4px;
  backdrop-filter: blur(10px);
}
```

这样，就实现了一开始所展示的效果：

![img6](https://user-images.githubusercontent.com/8554143/179513288-ab4d3863-42bb-48ee-a704-e90a94f8452d.png)

这里需要注意的是，background-size 的大小控制，和不同的 backdrop-filter: blur(10px) 值，都会影响效果。

![img7](https://user-images.githubusercontent.com/8554143/179514653-d9d0cd57-9c70-4b17-951c-c72ff8ffcdef.png)

当然，掌握了这个技巧之后，可以尝试替换掉 background: radial-gradient() 图形，及改变 background-size，尝试各种不同形状的透视背景。简单举几个例子：

```css
div {
  background: linear-gradient(45deg, transparent, #fff 4px);
  background-size: 6px 6px;
  backdrop-filter: saturate(50%) blur(4px);
}
```

这里使用了 linear-gradient() 替换了 radila-gradient()：

![img8](https://user-images.githubusercontent.com/8554143/179516537-b1bb2731-9f39-45ef-9b63-a33367db5bca.png)
