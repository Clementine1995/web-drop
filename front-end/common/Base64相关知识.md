# Base64 相关知识

> [前端 Base64 编码知识，一文打尽，探索起源，追求真相。](https://juejin.cn/post/6989391487200919566)

## Base64 在前端的应用

Base64 编码在前端的一些常见应用，绝大部分场景都是基于 Data URLs

### Data URLs

Data URLs，即前缀为 data: 协议的 URL，其允许内容创建者向文档中嵌入小文件。

#### Data URLs 语法

Data URLs 由四个部分组成：前缀(data:)、指示数据类型的 MIME 类型、如果非文本则为可选的 base64 标记、数据本身：`data:[<mediatype>][;base64],<data>`

mediatype 是个 MIME 类型的字符串，例如 "image/jpeg" 表示 JPEG 图像文件。如果被省略，则默认值为 `text/plain;charset=US-ASCII`。如果数据是文本类型，你可以直接将文本嵌入 (根据文档类型，使用合适的实体字符或转义字符)。如果是二进制数据，你可以将数据进行 base64 编码之后再进行嵌入。

#### 给数据作 base64 编码

在 Linux 或者 Mac OS 系统上，可以使用 uuencode 命令行工具来简单实现编码。Web APIs 已经有对 base64 进行编码解码的方法：`window.atob()` 和 `window.btoa()`

### Canvas 图片生成

canvas 的 `toDataURL` 可以把 canvas 的画布内容转 base64 编码格式包含图片展示的 data URI。

```js
const ctx = canvasEl.getContext("2d");
// ...... other code
const dataUrl = canvasEl.toDataURL();
// data:image/png;base64,iVBORw0KGgoAAAANSUhE.........
```

### 文件读取

FileReader 的 readAsDataURL 可以把上传的文件转为 base64 格式的 data URI，比较常见的场景是用户头像的剪裁和上传。

```js
function readAsDataURL() {
  const fileEl = document.getElementById("inputFile");
  return new Promise((resolve, reject) => {
    const fd = new FileReader();
    fd.readAsDataURL(fileEl.files[0]);
    fd.onload = function () {
      resolve(fd.result);
      // data:image/png;base64,iVBORw0KGgoAAAA.......
    };
    fd.onerror = reject;
  });
}
```

### jwt

jwt 由 header, payload,signature 三部分组成，前两个解码后，都是可以明文看见的。

### 网站图片和小图片

#### 移动端网站图标优化

```html
<link rel="icon" href="data:," /> <link rel="icon" href="data:;base64,=" />
```

#### 小图片

这个就有很多场景了，比如 img 标签，背景图等

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAA......." />
```

```css
.bg {
  background: url(data:image/png;base64,iVBORw0KGgoAAAA.......);
}
```

### 简单的数据加密

```js
const username = document.getElementById("username").vlaue;
const password = document.getElementById("password").vlaue;
const secureKey = "%%S%$%DS)_sdsdj_66";
const sPass = utf8_to_base64(password + secureKey);

doLogin({
  username,
  password: sPass,
});
```

## Base64 数据编码起源

早期邮件传输协议基于 ASCII 文本，对于诸如图片、视频等二进制文件处理并不好。 ASCII 主要用于显示现代英文，到目前为止只定义了 128 个字符，包含控制字符和可显示字符。 为了解决上述问题，Base64 编码顺势而生。Base64 是编解码，主要的作用不在于安全性，而在于让内容能在各个网关间无错的传输

## Base64 编码 64 的含义

64 就是 64 个字符的意思。

1. A-Z
2. a-z
3. 0-9
4. \+ /

一共 64 个，还有一个 =

## Base64 编码优缺点

优点：

- 可以将二进制数据（比如图片）转化为可打印字符，方便传输数据
- 对数据进行简单的加密，肉眼是安全的
- 如果是在 html 或者 css 处理图片，可以减少 http 请求

缺点：

- 内容编码后体积变大， 至少 1/3，因为是三字节变成四个字节，当只有一个字节的时候，也至少会变成三个字节。
- 编码和解码需要额外工作量

## ASCII 码, Unicode, UTF-8

### ASCII 码

ASCII 码第一位始终是 0, 那么实际可以表示的状态是 2^7 = 128 种状态。ASCII 主要用于显示现代英文，到目前为止只定义了 128 个字符，包含控制字符和可显示字符。

- 0~31 之间的 ASCII 码常用于控制像打印机一样的外围设备
- 32~127 之间的 ASCII 码表示的符号，在我们的键盘上都可以被找到

### Unicode

Unicode 为世界上所有字符都分配了一个唯一的编号(码点)，这个编号范围从  0x000000 到 0x10FFFF (十六进制)，有 100 多万，每个字符都有一个唯一的 Unicode 编号，这个编号一般写成 16 进制，在前面加上 U+。它是字符集。例如：掘的 Unicode 是 U+6398。

- U+0000 到 U+FFFF：最前面的 65536 个字符位，它的码点范围是从 0 一直到 216-1。所有最常见的字符都放在这里。
- U+010000 一直到 U+10FFFF：剩下的字符都放着这里，码点范围从 U+010000 一直到 U+10FFFF。

Unicode 只规定了每个字符的码点，到底用什么样的字节序表示这个码点，就涉及到编码方法。

### UTF-8

UTF-8 是互联网使用最多的一种 Unicode 的实现方式。还有 UTF-16（字符用两个字节或四个字节表示）和 UTF-32（字符用四个字节表示）等实现方式。

UTF-8 是它是一种变长的编码方式, 使用的字节个数从 1 到 4 个不等，最新的应该不止 4 个， 这个 1-4 不等，是后面编码和解码的关键。

UTF-8 的编码规则：

- 对于只有一个字节的符号，字节的第一位设为 0，后面 7 位为这个符号的 Unicode 码。此时，对于英语字母 UTF-8 编码和 ASCII 码是相同的。
- 对于 n 字节的符号（n > 1），第一个字节的前 n 位都设为 1，第 n + 1 位设为 0，后面字节的前两位一律设为 10。剩下的没有提及的二进制位，全部为这个符号的 Unicode 码，如下表所示：

| Unicode 码点范围（十六进制） | 十进制范围      | UTF-8 编码方式（二进制）            | 字节数 |
| ---------------------------- | --------------- | ----------------------------------- | ------ |
| 0000 0000 ~ 0000 007F        | 0 ~ 127         | 0xxxxxxx                            | 1      |
| 0000 0080 ~ 0000 07FF        | 128 ~ 2047      | 110xxxxx 10xxxxxx                   | 2      |
| 0000 0800 ~ 0000 FFFF        | 2048 ~ 65535    | 1110xxxx 10xxxxxx 10xxxxxx          | 3      |
| 0001 0000 ~ 0010 FFFF        | 65536 ~ 1114111 | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx | 4      |

#### 中文字符掘

- 先获得其码点，"掘".charCodeAt(0) 等于 25496
- 对照表格，2048 ~ 65535 需 3 个字节
- 25496..toString(2) 得到编码 110 001110 011000
- 根据格式 1110xxxx 10xxxxxx 10xxxxxx 进行填充, 最终结果如下
- 11100110 10001110 10011000

#### 字符与 utf-8 相互转换

编码：

- encodeURIComponent() ：函数通过将一个，两个，三个或四个表示字符的 UTF-8 编码的转义序列替换某些字符的每个实例来编码 URI
- encodeURI()：函数通过将特定字符的每个实例替换为一个、两个、三或四转义序列来对统一资源标识符 (URI) 进行编码

这两个方法区别就是：

- encodeURIComponent 转义除了`A-Z a-z 0-9 - _ . ! ~ * ' ( )`外的所有字符。
- encodeURI 会替换所有的字符，但不包括以下字符

| 类型         | 包含                          |
| ------------ | ----------------------------- |
| 保留字符     | ; , / ? : @ & = + $           |
| 非转义的字符 | 字母 数字 - \_ . ! ~ \* ' ( ) |
| 数字符号     | #                             |

解码：

decodeURIComponent() decodeURI()

#### utf-8 与 base64 相互转换

window.btoa() window.atob()
