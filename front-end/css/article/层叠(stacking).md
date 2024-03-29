# 层叠

- 层叠上下文
- 层叠水平
- z-index
- 层叠顺序

## 层叠上下文

什么是层叠上下文？MDN 给出的定义是：层叠上下文是 HTML 元素的三维概念，这些 HTML 元素在一条假想的相对于面向（电脑屏幕的）视窗或者网页的用户的 z 轴上延伸，HTML 元素依据其自身属性按照优先级顺序占用层叠上下文的空间。

那么，如何触发一个元素形成 `堆叠上下文` ？方法如下，摘自 MDN：

- 根元素 (HTML),
- position 值为 absolute | relative，且 z-index 值不为 auto
- position 值为 fixed | sticky
- 一个 z-index 值不为 `auto`的 flex 项目 (flex item)，即：父元素 display: flex|inline-flex
- opacity 属性值小于 1 的元素（参考 the specification for opacity）
- transform 属性值不为 `none` 的元素
- mix-blend-mode 属性值不为`normal`的元素
- filter 值不为“none”的元素
- perspective 值不为“none”的元素
- isolation 属性被设置为 `isolate`的元素
- 在 will-change 中指定了任意 CSS 属性，即便你没有直接指定这些属性的值
- -webkit-overflow-scrolling 属性被设置 `touch`的元素
- backdrop-filter 值不为“none”的元素
- 设置了 contain: paint

总结：

- 层叠上下文可以包含在其他层叠上下文中，并且一起组建了一个有层级的层叠上下文
- 每个层叠上下文完全独立于它的兄弟元素，当处理层叠时只考虑子元素
- 每个层叠上下文是自包含的：当元素的内容发生层叠后，整个该元素将会在父级叠上下文中按顺序进行层叠
- 在层叠上下文中，其子元素同样也按照上面解释的规则进行层叠。

## 层叠水平

层叠水平决定了同一个层叠上下文中元素在 z 轴上的显示顺序的概念；

- 普通元素的层叠等级优先由其所在的层叠上下文决定
- 层叠等级的比较只有在同一个层叠上下文元素中才有意义
- 在同一个层叠上下文中，层叠等级描述定义的是该层叠上下文中的元素在 Z 轴上的上下顺序

注意，层叠等级并不一定由 z-index 决定，只有定位元素的层叠等级才由 z-index 决定，其他类型元素的层叠等级由层叠顺序、他们在 HTML 中出现的顺序、他们的父级以上元素的层叠等级一同决定，详细的规则见下面层叠顺序的介绍。

## z-index

z-index 只适用于定位的元素，对非定位元素无效，它可以被设置为正整数、负整数、0、auto，如果一个定位元素没有设置 z-index，那么默认为 auto。

元素的 z-index 值只在同一个层叠上下文中有意义。如果父级层叠上下文的层叠等级低于另一个层叠上下文的，那么它 z-index 设的再高也没用。所以如果你遇到 z-index 值设了很大，但是不起作用的话，就去看看它的父级层叠上下文是否被其他层叠上下文盖住了。

## 层叠顺序

层叠顺序 (层叠次序, 堆叠顺序, Stacking Order) 描述的是元素在同一个层叠上下文中的顺序规则

1. 形成堆叠上下文环境的元素的背景与边框
2. 拥有负 z-index 的子堆叠上下文元素 （负的越高越堆叠层级越低）
3. 正常流式布局，非 inline-block，无 position 定位（static 除外）的块级子元素
4. 无 position 定位（static 除外）的 float 浮动元素
5. 正常流式布局， inline-block/inline 元素，无 position 定位（static 除外）的子元素（包括 display:table 和 display:inline ）
6. 拥有 z-index:0 的子堆叠上下文元素或 z-index:auto 的相对或者绝对定位元素
7. 拥有正 z-index: 的子堆叠上下文元素（正的越低越堆叠层级越低）

注意：

- 如果父元素没有创建层叠上下文的时候，子元素没有受父元素的限制，父子元素是处于同一层叠水平，比较时需要按上面的 7 层进行比较。
- 只设置了 position:absolute/relative 是不会创建层叠上下文的，此时的 div 是一个普通元素。
- 层叠上下文的水平比普通元素高。
- 层叠上下文内部嵌套的子元素均受父元素影响。
- 层叠上下文不会影响兄弟元素，只会影响后代元素。
- 当元素的层叠水平一致、层叠顺序相同的时候，在 DOM 流中处于后面的元素会覆盖前面的元素。
- 在同一层叠水平上时，有明显的 z-index 值，则值越大，谁在上。

## 关于 fixed 定位失效

> 相关文章 [fixed 定位失效 | 不受控制的 position:fixed](https://github.com/chokcoco/iCSS/issues/24)

并不是所有能够生成层叠上下文的元素都会使得 position:fixed 失效，但也不止 transform 会使 position:fixed 失效。

下述 7 种方式目前都会使得 position:fixed 定位的基准元素改变：

- transform 属性值不为 none 的元素
- 设置了 transform-style: preserve-3d 的元素
- perspective 值不为 none 的元素
- 在 will-change 中指定了任意 CSS 属性
- 设置了 contain: paint
- filter 值不为 none 的元素
- backdrop-filter 值不为 none 的元素
