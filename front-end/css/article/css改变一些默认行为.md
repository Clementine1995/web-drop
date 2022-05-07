# CSS改变一些默认行为

## user-select

user-select CSS属性，控制着用户能否选中文本。除了在文本框里，它在chrome浏览器中对已加载的文本没有影响。这个属性与JavaScript中的 **Selection** 对象相关。

语法：`user-select: auto | text | none | contain | all`，默认值text

可取值：

+ none：元素及其子元素的文本不可选中。 请注意这个Selection 对象可以包含这些元素。 从Firefox 21开始， none 表现的像 -moz-none，因此可以使用 -moz-user-select: text 在**子元素**上重新启用选择。
+ auto：auto的计算值确定如下
  + 在 ::before 和 ::after 伪元素上，计算属性是 none
  + 如果元素是可编辑元素，则计算值是 contain
  + 否则，如果此元素的父元素的 user-select 的计算值为 all, 计算值则为 all
  + 否则，如果此元素的父级上的 user-select 的计算值为 none, 计算值则为 none
  + 否则，计算值则为 text
+ text：用户可以选择文本。
+ -moz-none：元素和子元素的文本将显示为无法选择它们。 请注意， Selection 对象可以包含这些元素。 可以使用 -moz-user-select: text. 在子元素上重新启用选择。 从Firefox 21开始，none 表现得像 -moz-none.
+ all：在一个HTML编辑器中，当双击子元素或者上下文时，那么包含该子元素的最顶层元素也会被选中。
+ contain(可以是element，他是IE中的特有的别名))：允许选择在元素内开始; 但是，选择将包含在该元素的边界内。 仅在Internet Explorer中受支持。

注意：在不同浏览器之间实现的一个区别是继承。 在Firefox中，-moz-user-select不会被绝对定位的元素继承，但在Safari和Chrome中，-webkit-user-select由这些元素继承。IE6-9不支持该属性，但支持使用标签属性 onselectstart="return false;" 来达到 user-select:none 的效果。

这个属性在不希望选中文本时非常有用，有时双击鼠标，会出现某些文字或者段落被选中的情况，如果不希望选中，就可以使用这个属性。

## pointer-events

pointer-events CSS 属性指定在什么情况下 (如果有) 某个特定的**图形元素**可以成为鼠标事件的 target。

注意：除了指示该元素不是鼠标事件的目标之外，值**none**表示鼠标事件“**穿透**”该元素并且指定该元素“下面”的任何东西。

语法：

```css
/* Keyword values */
pointer-events: auto;           /*  默认    */
pointer-events: none;
pointer-events: visiblePainted; /* SVG only */
pointer-events: visibleFill;    /* SVG only */
pointer-events: visibleStroke;  /* SVG only */
pointer-events: visible;        /* SVG only */
pointer-events: painted;        /* SVG only */
pointer-events: fill;           /* SVG only */
pointer-events: stroke;         /* SVG only */
pointer-events: all;            /* SVG only */

/* Global values */
pointer-events: inherit;
pointer-events: initial;
pointer-events: unset;
```

+ auto：与pointer-events属性未指定时的表现效果相同，对于SVG内容，该值与visiblePainted效果相同
+ none：元素永远不会成为鼠标事件的target。但是，当其后代元素的pointer-events属性指定其他值时，鼠标事件可以指向后代元素，在这种情况下，鼠标事件将在捕获或冒泡阶段触发父元素的事件侦听器。
+ visiblePainted：只适用于SVG。元素只有在以下情况才会成为鼠标事件的目标：
  + visibility属性值为visible，且鼠标指针在元素内部，且fill属性指定了none之外的值
  + visibility属性值为visible，鼠标指针在元素边界上，且stroke属性指定了none之外的值
+ visibleFill:只适用于SVG。只有在元素visibility属性值为visible，且鼠标指针在元素内部时,元素才会成为鼠标事件的目标，fill属性的值不影响事件处理。
+ visibleStroke：只适用于SVG。只有在元素visibility属性值为visible，且鼠标指针在元素边界时,元素才会成为鼠标事件的目标，stroke属性的值不影响事件处理。
+ visible：只适用于SVG。只有在元素visibility属性值为visible，且鼠标指针在元素内部或边界时,元素才会成为鼠标事件的目标，fill和stroke属性的值不影响事件处理。
+ painted：只适用于SVG。元素只有在以下情况才会成为鼠标事件的目标：
  + 鼠标指针在元素内部，且fill属性指定了none之外的值
  + 鼠标指针在元素边界上，且stroke属性指定了none之外的值
  visibility属性的值不影响事件处理。
fill：只适用于SVG。只有鼠标指针在元素内部时,元素才会成为鼠标事件的目标，fill和visibility属性的值不影响事件处理。
stroke：只适用于SVG。只有鼠标指针在元素边界上时,元素才会成为鼠标事件的目标，stroke和visibility属性的值不影响事件处理。
all：只适用于SVG。只有鼠标指针在元素内部或边界时,元素才会成为鼠标事件的目标，fill、stroke和visibility属性的值不影响事件处理。

注意：使用pointer-events来阻止元素成为鼠标事件目标不一定意味着元素上的事件侦听器永远不会触发。如果元素后代明确指定了pointer-events属性并允许其成为鼠标事件的目标，那么指向该元素的任何事件在事件传播过程中都将通过父元素，并以适当的方式触发其上的事件侦听器。当然，位于父元素但不在后代元素上的鼠标活动都不会被父元素和后代元素捕获

这个属性在做水印时十分有效，给页面整体盖上一个有透明度的水印，同时不影响下面元素的点击。
