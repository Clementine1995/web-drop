# HTML5的新特性概述

## 语义化标签

### article标签

用于表示内容与当前文档或网页关联不大的外部资讯，如杂志、报纸或博客等的外部内容。块级标签

### aside标签

表示与正文内容关系不大的内容。如侧栏内容、注解或页脚等内容。块级标签

### time标签

表示内容日期/时间，或者通过datetime特性标识出内容关联的日期/时间。内联标签

### mark标签

突出与特定主题（上下文）关联的内容。内联标签

### section标签

定义文档中的节（section、区段），一般包含标题或页眉。块级标签

### header标签

定义section或document的页眉，包含一些内容介绍等信息。块级标签

### footer标签

定义 section 或 document 的页脚。典型地，它会包含创作者的姓名、文档的创作日期以及/或者联系信息。块级标签

### hgroup标签

对h1-h6标签进行分组。内含一个或多个h1-h6标签。示例：文章主标题和副标题。块级标签

### progress标签

表示某项任务的执行进度，通过max特性设置任务完成时的值，通过value特性设置任务当前的执行进度。样式效果为进度条。

### figure标签

表示一个自包含内容单元（含可选的标题），重点是即使将该内容移除也不会影响文档整体的含义。

### figcaption标签

表示figure元素的标题，作为figure元素的子元素。

### nav标签

表示导航栏。

### meter标签

定义已知范围或分数值内的标量测量，也被称为 gauge（尺度）。如磁盘使用量等，而不是定义任务执行进度，虽然样式上也是进度条的形式。

该标签含如下特性：

form    form_id    规定 `<meter>` 元素所属的一个或多个表单。
high    number    规定被视作高的值的范围。
low    number    规定被视作低的值的范围。
max    number    规定范围的最大值。
min    number    规定范围的最小值。
optimum    number    规定度量的优化值。
value    number    必需。规定度量的当前值。

### output标签

定义内容为计算结果，可在form元素提交时向服务端发送其内容。for特性用于设置与计算结果相关的表单元素id，多个id时使用空格分隔。

### details标签

标签用于描述文档或文档某个部分的细节。默认不显示详细信息，通过open特性可修改为显示详细信息。通过点击标题可实现展开/收缩详细信息的效果。结合`<summary>`元素可自定义标题的内容。块级标签

### summary标签

作为details标签的概要、标题。块级标签

### ruby标签

显示的是东亚字符的发音。需要结合rt元素和可选的rp元素使用。

### main标签

表示文档的主要内容，一个文档仅能出现一个main元素，并且不能作为以下元素的后代：article、aside、footer、header 或 nav。

## 新表单类型

我这里描述的表单，主要指的input，input表单标签本身已经有不少类型了，但是h5为了满足开发需求，同样还新增了不少的类型：

+ `<input type="email" />`  e-mail 地址的输入域
+ `<input type="number" />` 数字输入域
+ `<input type="url" />` URL 地址的输入域
+ `<input type="range" />` range 类型显示为滑动条，默认value值是1~100的限定范围，可以通过min属性和max属性自定义范围`<input type="range" name="points" min="1" max="10" />`
+ `<input type="search" />` 用于搜索域
+ `<input type="color" />` 用于定义选择颜色
+ `<input type="tel" />` 电话号码输入域
+ `<input type="date" />` date类型为时间选择器

HTML5 新增的表单属性

+ placehoder 属性，简短的提示在用户输入值前会显示在输入域上。即我们常见的输入框默认提示，在用户输入后消失。
+ required  属性，是一个 boolean 属性。要求填写的输入域不能为空
+ pattern 属性，描述了一个正则表达式用于验证`<input>` 元素的值。
+ min 和 max 属性，设置元素最小值与最大值。
+ step 属性，为输入域规定合法的数字间隔。
+ height 和 width 属性，用于 image 类型的 `<input>` 标签的图像高度和宽度。
+ autofocus 属性，是一个 boolean 属性。规定在页面加载时，域自动地获得焦点。
+ multiple 属性 ，是一个 boolean 属性。规定`<input>` 元素中可选择多个值。

## 视频和音频

视频`<video>`和音频`<audio>`，也是html提供的新的标签，它们的功能类似于`<img>`标签，`<img>`标签引用的是图片，它们引用的是视频文件和音频文件。不仅如此，html5针对视频文件和音频文件的特殊性，给
`<video>`和`<audio>`提供了非常丰富的方法,属性和事件，用于操控这俩元素。

```()
<audio src="audio/putclub.com_Googlewasjusta.mp3" id="audio"></audio>
<button id="start-music">开始播放</button>
<button id="stop-music">暂停播放</button>

var startMusic = document.getElementById('start-music');
var stopMusic = document.getElementById('stop-music');

startMusic.onclick = function () {  //开始播放
  var audioEl = document.getElementById('audio');
  audioEl.play()
}

stopMusic. onclick = function () {  // 暂停播放
  var audioEl = document.getElementById('audio');
  audioEl.pause()
}

```

`<audio>`目前支持的音频格式有: MP3, Wav, 和 Ogg。

```()
<video width="600" height="400" id="video" controls="controls">
  <source src="video/jieda2.mp4" type="audio/mp4"></source>
</video>
<button id="start-tv">视频开始播放</button>
<button id="stop-tv">暂停视频播放</button>

var startTv = document.getElementById('start-tv');
var stopTv = document.getElementById('stop-tv');

startTv.onclick = function () {
  var video = document.getElementById('video');
  video.play();
}

stopTv.onclick = function () {
  var video = document.getElementById('video');
  video.pause();
}
```

注意：video播放视频时请注意转换一下视频的格式，转换为AVC(H264)，不转换的话容易出现有声音而没有视频的现象，浏览器将支持第一个识别的文件类型：( MP4, WebM, 和 Ogg)。

视频`<video>`和音频`<audio>`常用的几个方法有：

play() 开始播放音频/视频
pause() 暂停当前播放的音频/视频
load() 重新加载音频/视频元素

视频`<video>`和音频`<audio>`常用的属性有：

controls 属性设置或返回音频/视频是否显示控件（比如播放/暂停等）
defaultPlaybackRate 属性设置或返回音频/视频的默认播放速度
duration 属性返回当前音频/视频的长度（以秒计）
ended 属性返回音频/视频的播放是否已结束
loop 属性设置或返回音频/视频是否应在结束时重新播放
muted 属性设置或返回音频/视频是否静音
networkState 属性返回音频/视频的当前网络状态
src 属性设置或返回音频/视频元素的当前来源
volume 属性设置或返回音频/视频的音量
readyState 属性返回音频/视频当前的就绪状态
played 返回表示音频/视频已播放部分的 TimeRanges 对象

视频`<video>`和音频`<audio>`还拥有非常多自己特定的事件，不过本文将不在罗列，上面的方法和属性也并不是全部，需要详细了解的同学可以去[HTML 5 视频/音频](http://www.w3school.com.cn/html5/html5_ref_audio_video_dom.asp)参考手册查看。

## Canvas绘图

canvas 元素用于在网页上绘制图形,canvas标签本身只是个图型容器，需要使用javaScript脚本来绘制图形。

## SVG

SVG是指可伸缩的矢量图形，SVG 也是一种使用 XML 描述 2D 图形的语言。由于SVG 基于 XML，这意味着 SVG DOM 中的每个元素都是可用的。我们可以为某个元素附加 JavaScript 事件处理器。在 SVG 中，每个被绘制的图形均被视为对象。如果 SVG 对象的属性发生变化，那么浏览器能够自动重现图形。

更多详细的svg知识点，可以去[SVG 参考手册](http://www.w3school.com.cn/svg/svg_reference.asp)和阮一峰老师的[svg图像](http://javascript.ruanyifeng.com/htmlapi/svg.html)学习了解。

## 拖放（Drag 和 drop）

拖放是html5提供一个新的特性，这个特性增加了拖拽事件的api,和定义可以拖拽的属性。举个例子，在h5之前实现拖拽功能，其实用的是一种模拟方式，鼠标onmousedown时，获取当前的一些信息，然后在onmousemove时不断更新推拽对象的left和top值，最后在onmouseup时对推拽对象彻底赋值，并进行释放后一系列的程序操作。现在h5出来后呢，不在需要模拟了，因为它已经有标准的事件api了。

拖拽对象必须把draggable属性设置为true，其他开发思维其实和以前一样的，没有多大差别，只是多了更多的监听事件而已。[相关文档](https://wangdoc.com/javascript/events/drag.html)

## 地理定位

地理定位这个特性，故名思意，就是获取用户位置信息的。通过getCurrentPosition()获取一系列定位信息，getCurrentPosition()有两个回调函数参数，获取地理位置成功的回调和失败的回调。

## 离线存储

HTML5，通过创建 cache manifest 文件，可以创建 web 应用的离线版本。如果要启用应用程序缓存，必须在文档的`<html>` 标签中包含 manifest 属性：每个指定了 manifest 的页面在用户对其访问时都会被缓存。如果未指定 manifest 属性，则页面不会被缓存（除非在 manifest 文件中直接指定了该页面）。
manifest 文件的建议的文件扩展名是：".appcache".请注意，manifest 文件需要配置正确的 MIME-type，即 "text/cache-manifest"。必须在 web 服务器上进行配置。可以查看[HTML 5 应用程序缓存](http://www.w3school.com.cn/html5/html_5_app_cache.asp)

## Web 存储

如果说离线存储是对web的资源文件存储，那么web 存储就是对应用程序里的数据做存储了。web存储提供了两个存储方式:

+ localStorage,没有时间限制的数据存储
+ sessionStorage,就是网页还没有关闭的情况下的存储，网页窗口关闭，则数据销毁。

在之前，这些都是由 cookie 完成的。但是 cookie 不适合大量数据的存储，因为它们由每个对服务器的请求来传递，这使得 cookie 速度很慢而且效率也不高。
在 HTML5 中，数据不是由每个服务器请求传递的，而是只有在请求时使用数据。它使在不影响网站性能的情况下存储大量数据成为可能。对于不同的网站，数据存储于不同的区域，并且一个网站只能访问其自身的数据。

注意：localStorage和sessionStorage存储的数据都是字符串类型的数据，取出来的数据也是字符串类型，因此如果存储的对象不是字符串，则要转换成字符串数据类型

## WebSocket

WebSocket 是 HTML5 开始提供的一种在单个 TCP 连接上进行全双工通讯的协议。
WebSocket 使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在 WebSocket API 中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。
在 WebSocket API 中，浏览器和服务器只需要做一个握手的动作，然后，浏览器和服务器之间就形成了一条快速通道。两者之间就直接可以数据互相传送。
WebSocket 属性

+ Socket.readyState 只读属性,表示连接状态：0 - 表示连接尚未建立，1 - 表示连接已建立，可以进行通信，2 - 表示连接正在进行关闭，3 - 表示连接已经关闭或者连接不能打开。
+ Socket.bufferedAmount 只读属性,已被 send() 放入正在队列中等待传输，但是还没有发出的 UTF-8 文本字节数。

WebSocket 事件

+ Socket.onopen 连接建立时触发
+ Socket.onmessage 客户端接收服务端数据时触发
+ Socket.onerror 通信发生错误时触发
+ Socket.onclose 连接关闭时触发

[HTML5 WebSocket](http://www.runoob.com/html/html5-websocket.html)

## Web Workers

web worker 是运行在后台的 JavaScript，独立于其他脚本，不会影响页面的性能。您可以继续做任何愿意做的事情：点击、选取内容等等，而此时 web worker 在后台运行。
关于web worker的应用大概分为三个部分：

+ 一. 创建 web worker 文件，worker文件是一个单独的js文件，写好逻辑后，通过postMessage()方法吧数据发送出去
+ 二. 调用页面创建worker对象，var w = new Worker("worker文件路径").然后通过实例对象调用onmessage事件进行监听，并获取worker文件里返回的数据
+ 三.终止web worker，当我们的web worker创建后会持续的监听它，需要中止的时候则使用实例上的方法w.terminate()。

由于Worker属于外部文件，因此它不能获取javascript这些对象： window 对象，document 对象，parent 对象。

## 桌面通知：Notification

## requestAnimationFrame

## History API

## postMessage 和 onmessage API

## File API
