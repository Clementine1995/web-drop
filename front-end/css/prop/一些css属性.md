# 一些css属性

## text-rendering

text-rendering CSS 属性定义浏览器渲染引擎如何渲染字体。浏览器会在速度、清晰度、几何精度之间进行权衡。

注意：该属性是 SVG 的属性而不是标准的 CSS 属性。但是 Gecko（Firefox） 和 Webkit（Chrome、Safari） 内核的浏览器允许该属性在 Windows、Mac OS 和 Linux 操作系统中应用于 HTML 和 XML 内容。

一个视觉上很明显的效果是，optimizeLegibility 属性值会在某些字体（比如，微软的 Calibri，Candara，Constantia 和 Corbel 或者 DejaVu 系列字体）小于20px 时把有些相邻字符连接起来。

语法：`text-rendering: auto | optimizeSpeed | optimizeLegibility | geometricPrecision`

+ auto：浏览器依照某些根据去推测在绘制文本时，何时该优化速度，易读性或者几何精度。
+ optimizeSpeed：浏览器在绘制文本时将着重考虑渲染速度，而不是易读性和几何精度. 它会使字间距和连字无效。
+ optimizeLegibility：浏览器在绘制文本时将着重考虑易读性，而不是渲染速度和几何精度.它会使字间距和连字有效。该属性值在移动设备上会造成比较明显的性能问题，详细查看 [text-rendering](https://css-tricks.com/almanac/properties/t/text-rendering/)。
+ geometricPrecision：浏览器在绘制文本时将着重考虑几何精度， 而不是渲染速度和易读性。字体的某些方面—比如字间距—不再线性缩放，所以该值可以使使用某些字体的文本看起来不错。

注意：这个 geometricPrecision 特性——当被渲染引擎完全支持时——会使文本缩放是流畅的。对于大比例的缩放，你可能看到并不太漂亮的文本渲染，但这个字体大小是你期望的，而不是被 Windows 或 Linux 系统四舍五入或向下取整的字体大小。 WebKit 准确地的实现了这个值, 但是 Gecko 把这个值按照 optimizeLegibility 处理。

## font-smoothing

font-smooth CSS 属性用来控制字体渲染时的平滑效果。该特性是非标准的，请尽量不要在生产环境中使用它！属性已经在规范中被移除，而且已经不在标准跟踪之中。

语法：`font-smoothing: auto | never | always | <value>`

注意：

+ Webkit实现了名为-webkit-font-smoothing的相似属性。这个属性仅在 Mac OS X/macOS 下生效。
  + none - 关闭字体平滑；展示有锯齿边缘的文字。
  + antialiased - 平滑像素级别的字体，而不是子像素。
  + subpixel-antialiased - 在大多数非视网膜显示器上，这将会提供最清晰的文字。
+ Firefox 实现了名为 -moz-osx-font-smoothing 的相似属性。这个属性仅在 Mac OS X / macOS 下生效。
  + auto - 允许浏览器选择字体平滑的优化方式，通常为grayscale。
  + grayscale - 用灰度抗锯齿渲染文本，而不是子像素。从亚像素渲染切换到黑暗背景上的浅色文本的抗锯齿使其看起来更轻。
