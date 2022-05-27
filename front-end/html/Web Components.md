# Web Components

Web Components 是一套不同的技术，可以创建可重用的定制元素（它们的功能封装在您的代码之外）并且在 web 应用中使用它们。类似于组件的概念。

## 概念和使用

作为开发者，都知道尽可能多的重用代码是一个好主意。这对于自定义标记结构来说通常不是那么容易 — 想想复杂的 HTML。

Web Components 旨在解决这些问题 — 它由三项主要技术组成，它们可以一起使用来创建封装功能的定制元素，可以在你喜欢的任何地方重用，不必担心代码冲突。

- Custom elements（自定义元素）：一组 JavaScript API，允许定义 custom elements 及其行为，然后可以在用户界面中按照需要使用它们。
- Shadow DOM（影子 DOM）：一组 JavaScript API，用于将封装的“影子”DOM 树附加到元素（与主文档 DOM 分开呈现）并控制其关联的功能。通过这种方式，可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。
- HTML templates（HTML 模板）： `<template>` 和 `<slot>` 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。

实现 web component 的基本方法通常如下所示：

1. 创建一个类或函数来指定 web 组件的功能，如果使用类，请使用 ECMAScript 2015 的类语法
2. 使用 `CustomElementRegistry.define()` 方法注册新自定义元素 ，并向其传递要定义的元素名称、指定元素功能的类、以及可选的其所继承自的元素。
3. 如果需要的话，使用 Element.attachShadow() 方法将一个 shadow DOM 附加到自定义元素上。使用通常的 DOM 方法向 shadow DOM 中添加子元素、事件监听器等等。
4. 如果需要的话，使用 `<template>` 和 `<slot>` 定义一个 HTML 模板。再次使用常规 DOM 方法克隆模板并将其附加到您的 shadow DOM 中。
5. 在页面任何位置使用自定义元素，就像使用常规 HTML 元素那样。

## 使用 custom elements

Web Components 标准非常重要的一个特性是，它使开发者能够将 HTML 页面的功能封装为 custom elements（自定义标签），而往常开发者不得不写一大堆冗长、深层嵌套的标签来实现同样的页面功能。

### custom elements 概述

CustomElementRegistry 接口的实例用来处理 web 文档中的 custom elements — 该对象允许你注册一个 custom element，返回已注册 custom elements 的信息，等等。

CustomElementRegistry.define() 方法用来注册一个 custom element，该方法接受以下参数：

- 表示所创建的元素名称的符合 DOMString 标准的字符串。注意，custom element 的名称不能是单个单词，且其中必须要有短横线。
- 用于定义元素行为的 类 。
- 可选参数，一个包含 extends 属性的配置对象，是可选参数。它指定了所创建的元素继承自哪个内置元素，可以继承任何内置元素。

作为示例，可以像这样定义一个叫做 word-count 的 custom element：

```js
customElements.define("word-count", WordCount, { extends: "p" })
```

这个元素叫做 word-count，它的类对象是 WordCount, 继承自 `<p>` 元素.

一个 custom element 的类对象可以通过 ES 2015 标准里的类语法生成。所以，WordCount 可以写成下面这样：

```js
class WordCount extends HTMLParagraphElement {
  constructor() {
    // 必须首先调用 super 方法
    super()
    // 元素的功能代码写在这里
    // ...
  }
}
```

在构造函数中，还可以设定一些生命周期的回调函数，在特定的时间，这些回调函数将会被调用。例如，connectedCallback 会在 custom element 首次被插入到文档 DOM 节点上时被调用，而 attributeChangedCallback 则会在 custom element 增加、删除或者修改某个属性时被调用。

共有两种 custom elements：

- Autonomous custom elements：独立的元素，它不继承其他内建的 HTML 元素。可以直接把它们写成 HTML 标签的形式，来在页面上使用。例如 `<popup-info>`，或者是`document.createElement("popup-info")`这样。
- Customized built-in elements：继承自基本的 HTML 元素。在创建时，必须指定所需扩展的元素（正如上面例子所示），使用时，需要先写出基本的元素标签，并通过 is 属性指定 custom element 的名称。例如`<p is="word-count">`, 或者 `document.createElement("p", { is: "word-count" })`。

### 使用生命周期回调函数

在 custom element 的构造函数中，可以指定多个不同的回调函数，它们将会在元素的不同生命时期被调用：

- connectedCallback：当 custom element 首次被插入文档 DOM 时，被调用。
- disconnectedCallback：当 custom element 从文档 DOM 中删除时，被调用。
- adoptedCallback：当 custom element 被移动到新的文档时，被调用。
- attributeChangedCallback: 当 custom element 增加、删除、修改自身属性时，被调用。

如果需要在元素属性变化后，触发 attributeChangedCallback()回调函数，必须监听这个属性。这可以通过定义 observedAttributes() get 函数来实现，observedAttributes()函数体内包含一个 return 语句，返回一个数组，包含了需要监听的属性名称：`static get observedAttributes() {return ['w', 'l']; }`

## 使用 shadow DOM

Web components 的一个重要属性是封装——可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁。其中，Shadow DOM 接口是关键所在，它可以将一个隐藏的、独立的 DOM 附加到一个元素上。

Shadow DOM 允许将隐藏的 DOM 树附加到常规的 DOM 树中——它以 shadow root 节点为起始根节点，在这个根节点的下方，可以是任意元素，和普通的 DOM 元素一样。

Shadow DOM 特有的术语：

- Shadow host：一个常规 DOM 节点，Shadow DOM 会被附加到这个节点上。
- Shadow tree：Shadow DOM 内部的 DOM 树。
- Shadow boundary：Shadow DOM 结束的地方，也是常规 DOM 开始的地方。
- Shadow root: Shadow tree 的根节点。

可以使用同样的方式来操作 Shadow DOM，就和操作常规 DOM 一样，不同的是，Shadow DOM 内部的元素始终不会影响到它外部的元素。

### shadow DOM 基本用法

可以使用 `Element.attachShadow()` 方法来将一个 shadow root 附加到任何一个元素上。它接受一个配置对象作为参数，该对象有一个 mode 属性，值可以是 open 或者 closed：

```js
let shadow = elementRef.attachShadow({ mode: "open" })
let shadow = elementRef.attachShadow({ mode: "closed" })

// open 表示可以通过页面内的 JavaScript 方法来获取 Shadow DOM，例如使用 Element.shadowRoot 属性：
let myShadowDom = myCustomElem.shadowRoot
```

如果将一个 Shadow root 附加到一个 Custom element 上，并且将 mode 设置为 closed，那么就不可以从外部获取 Shadow DOM 了，myCustomElem.shadowRoot 将会返回 null。浏览器中的某些内置元素就是如此，例如 `<video>`，包含了不可访问的 Shadow DOM。

如果想将一个 Shadow DOM 附加到 custom element 上，可以在 custom element 的构造函数中添加如下实现（目前，这是 shadow DOM 最实用的用法）：

```js
let shadow = this.attachShadow({ mode: "open" })
```

#### 使用外部引入的样式

可以使用行内 `<style>` 元素为 Shadow DOM 添加样式，但是完全可以通过 `<link>` 标签引用外部样式表来替代行内样式。

```js
// 将外部引用的样式添加到 Shadow DOM 上
const linkElem = document.createElement("link")
linkElem.setAttribute("rel", "stylesheet")
linkElem.setAttribute("href", "style.css")

// 将所创建的元素添加到 Shadow DOM 上
shadow.appendChild(linkElem)
```

请注意， 因为 `<link>` 元素不会打断 shadow root 的绘制, 因此在加载样式表时可能会出现未添加样式内容（FOUC），导致闪烁。

## 使用 templates and slots
