# History API

>参考自[Manipulating the browser history
](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)

DOM window 对象通过 history 对象提供了对浏览器的会话历史的访问，从HTML5开始提供了对history栈中内容的操作。

## 属性

History 接口不继承于任何属性。

### History.length

History.length是一个**只读**属性，返回当前session中的history个数，包含当前页面在内。举个例子，对于新开一个tab加载的页面当前属性返回值1。

### History.scrollRestoration

允许Web应用程序在历史导航上显式地设置默认滚动恢复行为。此属性可以是自动的（auto）或者手动的（manual）。注意：这个属性是一个实验性的。

### History.state

只读，返回一个表示历史堆栈顶部的状态的值。这是一种可以不必等待 `popstate` 事件而查看状态的方式。

--

除此之外还有current、next、previous不过已经废弃

## 方法

使用 back(), forward()和 go() 方法来完成在用户历史记录中向后和向前的跳转。HTML5引入了 history.pushState() 和 history.replaceState() 方法，它们分别可以添加和修改历史记录条目。这些方法通常与window.onpopstate 配合使用。

### History.back()

语法：`window.history.back();`

前往上一页, 用户可点击浏览器左上角的返回按钮模拟此方法. 等价于 history.go(-1)，注意：当浏览器会话历史记录处于第一页时调用此方法没有效果，而且也不会报错。

### History.forward()

语法：`window.history.forward();`

在浏览器历史记录里前往下一页，用户可点击浏览器左上角的前进按钮模拟此方法. 等价于 history.go(1)。注意：当浏览器历史栈处于最顶端时( 当前页面处于最后一页时 )调用此方法没有效果也不报错。

### History.go()

语法：`window.history.go(number);`

跳转到 history 中指定的一个点，可以用 go() 方法载入到会话历史中的某一特定页面， 通过与当前页面相对位置来标志 (当前页面的相对位置标志为0)。

当整数参数超出界限时，例如: 如果当前页为第一页，前面已经没有页面了，我传参的值为-1，那么这个方法没有任何效果也不会报错。调用没有参数的 go() 方法或者不是整数的参数时也没有效果。可以通过查看长度属性的值来确定的历史堆栈中页面的数量，也就是上面的History.length

### History.pushState()

语法：`window.history.pushState(stateObj, title, url)`

pushState() 需要三个参数: 一个状态对象, 一个标题 (目前被忽略), 和 (可选的) 一个URL。

+ 状态对象：状态对象state是一个JavaScript对象，通过pushState () 创建新的历史记录条目。无论什么时候用户导航到新的状态，popstate事件就会被触发，且该事件的state属性包含该历史记录条目状态对象的副本。状态对象可以是能被序列化的任何东西，但是请控制态对象在序列化表示后小于640k。
+ 标题：Firefox 目前忽略这个参数，但未来可能会用到。在此处传一个空字符串应该可以安全的防范未来这个方法的更改。或者，你可以为跳转的state传递一个短标题。
+ 该参数定义了新的历史URL记录。注意，调用 pushState() 后浏览器并不会立即加载这个URL，但可能会在稍后某些情况下加载这个URL，比如在用户重新打开浏览器时。新URL不必须为绝对路径。如果新URL是相对路径，那么它将被作为相对于当前URL处理。新URL必须与当前URL同源，否则 pushState() 会抛出一个异常。该参数是可选的，缺省为当前URL。

在某种意义上，调用 pushState() 与 设置 window.location = "#foo" 类似，二者都会在当前页面创建并激活新的历史记录。但 pushState() 具有如下几条优点：

+ 新的 URL 可以是与当前URL同源的任意URL 。而设置 window.location 仅当你只修改了哈希值时才保持同一个 document。
+ 如果需要，你可以不必改变URL。而设置 window.location = "#foo";在当前哈希不是 #foo 的情况下， 仅仅是新建了一个新的历史记录项。
+ 你可以为新的历史记录项关联任意数据。而基于哈希值的方式，则必须将所有相关数据编码到一个短字符串里。
假如 标题 在之后会被浏览器用到，那么这个数据是可以被使用的（哈希则不然）。

注意：pushState() 绝对不会触发 hashchange 事件，即使新的URL与旧的URL仅哈希不同也是如此。

注意：使用 history.pushState() 可以改变referrer，它在用户发送 XMLHttpRequest 请求时在HTTP头部使用，改变state后创建的 XMLHttpRequest 对象的referrer都会被改变。因为referrer是标识创建  XMLHttpRequest 对象时 this 所代表的window对象中document的URL。

例子：

```js
// 假设在 http://mozilla.org/foo.html 中执行了以下 JavaScript 代码:
let stateObj = {
    foo: "bar",
};
history.pushState(stateObj, "page 2", "bar.html");
```

这将使浏览器地址栏显示为 `http://mozilla.org/bar.html`，但并不会导致浏览器加载 bar.html ，甚至不会检查bar.html 是否存在。

假设现在用户又访问了 `http://google.com`，然后点击了返回按钮。此时，地址栏将显示 `http://mozilla.org/bar.html`，history.state 中包含了 stateObj 的一份拷贝。页面此时展现为bar.html。且因为页面被重新加载了，所以popstate事件将不会被触发。

如果我们再次点击返回按钮，页面URL会变为`http://mozilla.org/foo.html`，文档对象document会触发另外一个 popstate 事件，这一次的事件对象state object为null。 这里也一样，返回并不改变文档的内容，尽管文档在接收 popstate 事件时可能会改变自己的内容，其内容仍与之前的展现一致。

### History.replaceState()

history.replaceState() 的使用与 history.pushState() 非常相似，区别在于 replaceState() 是修改了当前的历史记录项而不是新建一个。注意这并不会阻止其在全局浏览器历史记录中创建一个新的历史记录项。

replaceState() 的使用场景在于为了响应用户操作，你想要更新状态对象state或者当前历史记录的URL。

### window.onpopstate

每当活动的历史记录项发生变化时，popstate 事件都会被传递给window对象。如果当前活动的历史记录项是被 pushState 创建的，或者是由 replaceState 改变的，那么 popstate 事件的状态属性 state 会包含一个当前历史记录状态对象的拷贝。

而window.onpopstate是popstate事件在window对象上的事件处理程序。调用history.pushState()或者history.replaceState()不会触发popstate事件. popstate事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮(或者在JavaScript中调用history.back()、history.forward()、history.go()方法)。

当网页加载时,各浏览器对popstate事件是否触发有不同的表现,Chrome 和 Safari会触发popstate事件, 而Firefox不会。

即便进入了那些非pushState和replaceState方法作用过的(比如`http://example.com/example.html`)没有state对象关联的那些网页,popstate事件也仍然会被触发。
