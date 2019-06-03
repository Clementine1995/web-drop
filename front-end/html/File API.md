# H5 File API

## File

> 参考自MDN[File](https://developer.mozilla.org/zh-CN/docs/Web/API/File)

文件（File）接口提供有关文件的信息，并允许网页中的 JavaScript 访问其内容。File 对象是特殊类型的 Blob，且可以用在任意的 Blob 类型的 context 中。比如说， FileReader, URL.createObjectURL(), createImageBitmap(), 及 XMLHttpRequest.send() 都能处理 Blob 和 File。它的来源有以下几个：

+ 来自用户在一个 `<input>` 元素上选择文件后返回的 FileList 对象
+ 来自由拖放操作生成的 DataTransfer 对象
+ 自 HTMLCanvasElement 上的 mozGetAsFile() API

### File构造函数

语法：`var myFile = new File(bits, name[, options]);`

参数：

+ bits：ArrayBuffer，ArrayBufferView，Blob，或者 DOMString 对象的 **Array** — 或者任何这些对象的组合。这是 UTF-8 编码的文件内容。
+ name：USVString，表示文件名称，或者文件路径。
+ options（可选）：选项对象，包含文件的可选属性。可用的选项如下：
  + type: DOMString，表示将要放到文件中的内容的 MIME 类型。默认值为 "" 。
  + lastModified: 数值，表示文件最后修改时间的 Unix 时间戳（毫秒）。默认值为 Date.now()。

示例：

```js
var file = new File(["foo"], "foo.txt", {
  type: "text/plain",
});
```

### File属性

File 接口继承了 Blob 接口的属性：

+ File.lastModified（只读）：返回当前 File 对象所引用文件最后修改时间，自 UNIX 时间起始值（1970年1月1日 00:00:00 UTC）以来的毫秒数。
+ File.lastModifiedDate（只读）：返回当前 File 对象所引用文件最后修改时间的 Date 对象。
+ File.name（只读）：返回当前 File 对象所引用文件的名字。
+ File.size（只读）：返回文件的大小。
+ File.webkitRelativePath（只读）：返回 File 相关的 path 或 URL。
+ File.type（只读）：返回文件的 多用途互联网邮件扩展类型（MIME Type）

File 接口从 Blob 接口继承了以下方法，本身并无别的方法：

Blob.slice([start[, end[, contentType]]])：返回一个新的 Blob 对象，它包含有源 Blob 对象中指定范围内的数据。

## FileList

> 参考自MDN[File​List](https://developer.mozilla.org/zh-CN/docs/Web/API/FileList)

一个`FileList`对象通常来自于一个HTML `input`元素的`files`属性,你可以通过这个对象访问到用户所选择的文件.该类型的对象还有可能来自用户的拖放操作。

所有type属性(attribute)为file的 `<input>` 元素都有一个files属性(property)，用来存储用户所选择的文件。使用FileList例子，上传完文件后点击按钮即可在控制台看到上传文件的信息：

```html
<input id="fileItem" type="file" multiple >
<button id="chkbtn">点击查看上传的文件</button>
<script>
  var chkbtn = document.getElementById('chkbtn');
  chkbtn.onclick = function () {
    var file = document.getElementById('fileItem').files;
    // flieList有一个只读的整数值,用来返回该FileList对象中的文件数量
    console.log(file.length);
    console.log(file);
    if(file.length) {
      console.log(file.item(0)) // 查看第一个file信息
    }
  }
</script>
```

方法：item(index)，根据给定的索引值。返回FileList对象中对应的File对象。

## FileReader

> 参考自MDN[File​Reader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader)
>
> 参考自MDN[Using files from web applications](https://developer.mozilla.org/zh-CN/docs/Web/API/File/Using_files_from_web_applications)

FileReader 对象允许Web应用程序异步读取存储在**用户计算机上**的文件（或原始数据缓冲区）的内容，使用 File 或 Blob 对象指定要读取的文件或数据。

构造函数：`var reader = new FileReader();`，例子：

```js
function printFile(file) {
  var reader = new FileReader();
  reader.onload = function(evt) {
    console.log(evt.target.result);
  };
  reader.readAsText(file);
}
```

### FileReader属性

+ FileReader.error（只读）：一个DOMException，表示在读取文件时发生的错误 。
+ FileReader.readyState（只读）：表示FileReader状态的数字。取值如下：
  |常量名|值|描述|
  |-|-|-|
  |EMPTY|0|还没有加载任何数据|
  |LOADING|1|数据正在被加载|
  |DONE|2|已完成全部的读取请求|
+ FileReader.result（只读）：文件的内容。该属性仅在读取操作完成后才有效，数据的格式取决于使用哪个方法来启动读取操作。

### 事件处理

这些事件也可以通过addEventListener方法使用。

+ FileReader.onabort：处理abort事件。该事件在读取操作被中断时触发。
+ FileReader.onerror：处理error事件。该事件在读取操作发生错误时触发。
+ FileReader.onload：处理load事件。该事件在读取操作完成时触发。
+ FileReader.onloadstart：处理loadstart事件。该事件在读取操作开始时触发。
+ FileReader.onloadend：处理loadend事件。该事件在读取操作结束时（要么成功，要么失败）触发。
+ FileReader.onprogress：处理progress事件。该事件在读取Blob时触发。

### 方法

#### FileReader.abort()

该方法可以取消 FileReader 的读取操作，触发之后 readyState 为已完成（DONE）。

注意：对一个没有正在进行读取操作（readyState 不是LOADING）的 FileReader 进行 abort 操作，会抛出 DOM_FILE_ABORT_ERR 错误。

#### FileReader.readAsArrayBuffer()

FileReader 接口提供的 readAsArrayBuffer() 方法用于启动读取指定的 Blob 或 File 内容。当读取操作完成时，readyState 变成 DONE（已完成），并触发 loadend 事件，同时 result 属性中将包含一个 ArrayBuffer 对象以表示所读取文件的数据。

语法：`instanceOfFileReader.readAsArrayBuffer(blob);`

#### File​Reader​.read​AsDataURL()

readAsDataURL 方法会读取指定的 Blob 或 File 对象。读取操作完成的时候，readyState 会变成已完成DONE，并触发 loadend 事件，同时 result 属性将包含一个data:URL格式的字符串（base64编码）以表示所读取文件的内容。

语法：`instanceOfFileReader.readAsDataURL(blob);`

回显图片的简单例子：

```html
<input type="file" onchange="previewFile()"><br>
<img src="" height="200" alt="Image preview...">
<script>
function previewFile() {
  var preview = document.querySelector('img');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    preview.src = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}
</script>
```

#### FileReader.readAsText()

readAsText 方法可以将 Blob 或者 File 对象转根据特殊的编码格式转化为内容(字符串形式)

这个方法是异步的，只有当执行完成后才能够查看到结果，如果直接查看是无结果的，并返回undefined，也就是说必须要挂载实例下的 `onload` 或 `onloadend` 的方法处理转化后的结果，当转化完成后， readyState 这个参数就会转换 为 done 即完成态， event("loadend") 挂载的事件会被触发，并可以通过事件返回的形参得到中的 FileReader.result 属性得到转化后的结果

语法：`instance of FileReader.readAsText(blob[, encoding]);`，其第二个参数为编码类型，默认为'utf-8'

## FileReaderSync

FileReaderSync接口允许以同步的方式读取File或Blob对象中的内容。该接口只在workers里可用,因为在主线程里进行同步I/O操作可能会阻塞用户界面。其具有的方法与FileReader相同。

## Blob

> 参考自MDN[Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)

Blob 对象表示一个**不可变、原始数据的类文件对象**。Blob 表示的不一定是JavaScript原生格式的数据。File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。

Blob() 构造函数可以从其他非blob对象和数据构造一个Blob。如果要创建包含另一个blob数据的子集blob，请使用 slice()方法。要获取用户文件系统上的文件对应的Blob对象，请使用File。

### Blob构造函数

语法：`var aBlob = new Blob( array, options );`

参数：

+ array 是一个由ArrayBuffer, ArrayBufferView, Blob, DOMString 等对象构成的 Array ，或者其他类似对象的混合体，它将会被放进 Blob。DOMStrings会被编码为UTF-8。
+ options 是一个可选的BlobPropertyBag字典，它可能会指定如下两个属性：
  + type，默认值为 ""，它代表了将会被放入到blob中的数组内容的MIME类型。
  + endings，默认值为"transparent"，用于指定包含行结束符\n的字符串如何被写入。 它是以下两个值中的一个： "native"，代表行结束符会被更改为适合宿主操作系统文件系统的换行符，或者 "transparent"，代表会保持blob中保存的结束符不变

例子：

```js
var aFileParts = ['<a id="a"><b id="b">hey!</b></a>']; // 一个包含DOMString的数组
var oMyBlob = new Blob(aFileParts, {type : 'text/html'}); // 得到 blob
```

### Blob属性

Blob.size（只读）：Blob 对象中所包含数据的大小（字节）。
Blob.type（只读）：一个字符串，表明该Blob对象所包含数据的MIME类型。如果类型未知，则该值为空字符串。

### Blob方法

`Blob.slice([start,[ end ,[contentType]]])`：返回一个新的 Blob对象，包含了源 Blob对象中指定范围内的数据。

### Blob示例

```js
// Blob() 构造函数 允许用其它对象创建 Blob 对象。比如，用字符串构建一个 blob：

var debug = {hello: "world"};
var blob = new Blob([JSON.stringify(debug, null, 2)],
  {type : 'application/json'});

// 使用 Blob 创建一个指向类型化数组的URL

var typedArray = GetTheTypedArraySomehow();
var blob = new Blob([typedArray], {type: "application/octet-binary"});// 传入一个合适的MIME类型
var url = URL.createObjectURL(blob);
// 会产生一个类似blob:d3958f5c-0777-0845-9dcf-2cb28783acaf 这样的URL字符串
// 你可以像使用一个普通URL那样使用它，比如用在img.src上。

// 从 Blob 中提取数据

// 从Blob中读取内容的唯一方法是使用 FileReader
var reader = new FileReader();
reader.addEventListener("loadend", function() {
   // reader.result 包含转化为类型数组的blob
});
reader.readAsArrayBuffer(blob);
```

## URL.create​ObjectURL()

URL.createObjectURL() 静态方法会创建一个 DOMString，其中包含一个表示参数中给出的对象的URL。这个 URL 的生命周期和创建它的窗口中的 document 绑定。这个新的URL 对象表示指定的 File 对象或 Blob 对象。

+ 语法：`objectURL = URL.createObjectURL(object);`
  + 参数：
  object：用于创建 URL 的 File 对象、Blob 对象或者 MediaSource 对象。​
  + 返回值：包含可用于引用指定源对象内容的对象URL的 DOMString。

注意：在每次调用 createObjectURL() 方法时，都会创建一个新的 URL 对象，即使你已经用相同的对象作为参数创建过。当不再需要这些 URL 对象时，每个对象必须通过调用 `URL.revokeObjectURL()` 方法来释放。

## 如何使用web应用中的文件

### 通过click()方法使用隐藏的file input元素

```html
<input type="file" id="fileElem" multiple accept="image/*" style="display:none" onchange="handleFiles(this.files)">
<a href="#" id="fileSelect">Select some files</a>
<script>
var fileSelect = document.getElementById("fileSelect"),
  fileElem = document.getElementById("fileElem");

fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
  e.preventDefault(); // 避免导航到 "#"
}, false);
</script>
```

### 使用label元素来触发一个隐藏的file input元素

```html
<!-- 如果不想使用JavaScript (click() 方法)来打开文件选择器，可以使用 <label> 元素。 -->
<input type="file" id="fileElem" multiple accept="image/*" style="display:none" onchange="handleFiles(this.files)">
<label for="fileElem">Select some files</label>
```

### 显示用户选择的图片的缩略图

```js
function handleFiles(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var imageType = /^image\//;
    if (!imageType.test(file.type)) {
      continue;
    }

    var img = document.createElement("img");
    img.classList.add("obj");
    img.file = file;
    preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
  }
}
```

### 使用对象 URL

当你需要在HTML中通过URL来引用一个File对象时，你可以创建一个对象URL，就像这样：

```js
var objectURL = window.URL.createObjectURL(fileObj);
```

这个对象URL是一个标识File对象的字符串。每次你调用window.URL.createObjectURL()，就会产生一个唯一的对象URL，即使是你对一个已创建了对象URL的文件再次创建一个对象URL。

### 使用对象URL来显示图片

```html
<input type="file" id="fileElem" multiple accept="image/*" style="display:none" onchange="handleFiles(this.files)">
<a href="#" id="fileSelect">Select some files</a>
<div id="fileList">
  <p>No files selected!</p>
</div>
<script>
window.URL = window.URL || window.webkitURL;

var fileSelect = document.getElementById("fileSelect"),
    fileElem = document.getElementById("fileElem"),
    fileList = document.getElementById("fileList");

fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
  e.preventDefault(); // prevent navigation to "#"
}, false);

function handleFiles(files) {
  if (!files.length) {
    fileList.innerHTML = "<p>No files selected!</p>";
  } else {
    fileList.innerHTML = "";
    // 创建一个无序列表 (<ul>) 元素。
    var list = document.createElement("ul");
    // 通过调用列表的Node.appendChild()方法来将新的列表元素插入到 <div>块。
    fileList.appendChild(list);
    // 遍历文件集合 FileList（即files）中的每个 File：
    for (var i = 0; i < files.length; i++) {
      var li = document.createElement("li");
      // 创建一个新的列表项（<li>）元素并插入到列表中。
      list.appendChild(li);
      // 创建一个新的图片（<img>）元素。
      var img = document.createElement("img");
      // 设置图片的源为一个新的指代文件的对象URL，使用window.URL.createObjectURL()来创建blob URL。
      img.src = window.URL.createObjectURL(files[i]);
      // 设置图片的高度为60像素。
      img.height = 60;
      // 设置图片的load事件处理器来释放对象URL，当图片加载完成之后对象URL就不再需要了。
      img.onload = function() {
        window.URL.revokeObjectURL(this.src);
      }
      // 将新的列表项添加到列表中。
      li.appendChild(img);
      var info = document.createElement("span");
      info.innerHTML = files[i].name + ": " + files[i].size + " bytes";
      li.appendChild(info);
    }
  }
}
</script>
```

### 在axios中使用get方法导出excel

一般使用window.location.href的方法就可以很简单的实现excel的导出或者文件的下载，但是这种方法不好控制导出啥时候结束，如果导出逻辑复杂需要大量时间，用户频繁点击导出可能会出现问题，使用axios做的时候，需要设置`responseType: 'blob'`，但是这样设置后台返回的错误信息提示之类的又无法正常显示，所以可以使用下面的方法：

```js
if (res.data.type === 'application/json') {
  const blob = res.data
  const newblob = blob
  const reader = new FileReader()
  reader.readAsText(newblob)
  reader.onload = (evt) => {
    const data = JSON.parse(reader.result)
    if (data.status.message) {
      console.log(data.status.message)
    }
  }
} else {
  let url = window.URL.createObjectURL(res.data)
  let link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', 'xxxxxxx.xls')
  document.body.appendChild(link)
  link.click()
  window.URL.revokeObjectURL(url);
}
```
