# BroadcastChannel 及其他通信 API

> 参考链接[BroadcastChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel)

BroadcastChannel 接口代理了一个命名频道，可以让指定 origin 下（**同源**）的任意 browsing context 来订阅它。它允许同源的不同浏览器窗口，Tab 页，frame 或者 iframe 下的不同文档之间相互通信。
通过触发一个 message 事件，消息可以广播到所有监听了该频道的 BroadcastChannel 对象。

> 备注： 此特性在 Web Worker 中可用

## 构造函数

BroadcastChannel() 构造函数用于创建一个 BroadcastChannel 对象，并与底层的通道相关联。

语法：`new BroadcastChannel(channelName)`

### channelName

表示通道名称的字符串；对于相同的来源下的所有浏览上下文，一个名称只对应一个通道。

## BroadcastChannel.name

BroadcastChannel.name 是类型为 DOMString 的只读属性，是频道的唯一标识。属性 name 是在创建时传入 BroadcastChannel() 构造函数的，所以是只读的。

```js
// 连接到指定频道
var bc = new BroadcastChannel("test_channel");

// 其他操作 (如：postMessage, …)

// 在控制台打印频道名称
console.log(bc.name); // "test_channel"

// 当完成后，断开与频道的连接
bc.close();
```

## 实例方法

### close()

通过调用 BroadcastChannel.close() 方法，可以马上断开其与对应频道的关联，并让其被垃圾回收。这是必要的步骤，因为浏览器没有其他方式知道频道不再被需要。

```js
// 连接到指定频道
var bc = new BroadcastChannel("test_channel");

// 其他操作 (如：postMessage, …)

// 当完成后，断开与频道的连接
bc.close();
```

### postMessage()

可以使用 BroadcastChannel.postMessage() 发送一条任意 Object 类型的消息，给所有同源下监听了该频道的所有浏览器上下文。消息以 message 事件的形式发送给每一个绑定到该频道的广播频道。

```js
var str = channel.postMessage(object);
```

## 事件

### message

当频道收到一条消息时，会在关联的 BroadcastChannel 对象上触发 message 事件。

在 addEventListener() 等方法中使用事件名称，或设置事件处理器属性。

```js
addEventListener("message", (event) => {});
onmessage = (event) => {};
```

#### message 事件类型

一个 MessageEvent。继承自 Event。

#### message 事件属性

除了下面列出的属性之外，还可以使用父接口 Event 的属性。

- data：只读，由消息发送者发送的数据。
- origin：只读，一个表示消息发送者来源的字符串。
- lastEventId：只读，一个表示事件唯一 ID 的字符串。
- source：只读，一个消息事件源，可以是一个用于表示消息发送者的 WindowProxy、MessagePort 或 ServiceWorker 对象。
- ports：只读，一个与发送消息（通过频道发送消息或向 SharedWorker 发送消息）的频道相关联的 MessagePort 对象的数组。

```js
// 发送者
const channel = new BroadcastChannel("example-channel");
const messageControl = document.querySelector("#message");
const broadcastMessageButton = document.querySelector("#broadcast-message");

broadcastMessageButton.addEventListener("click", () => {
  channel.postMessage(messageControl.value);
});

// 接收者
const channel = new BroadcastChannel("example-channel");
channel.addEventListener("message", (event) => {
    received.textContent = event.data;
});
```

### messageerror

当频道收到一条无法反序列化的消息时会在 BroadcastChannel 对象上触发 messageerror 事件。

```js
const channel = new BroadcastChannel("example-channel");

channel.addEventListener("messageerror", (event) => {
  console.error(event);
});
// or
channel.onmessageerror = (event) => {
    console.log(event);
};
```

## BroadcastChannel 与 window.postMessage

- BroadcastChannel 与 window.postMessage 都是跨页面通信的
- BroadcastChannel 只允许同源下的不同窗口通信，window.postMessage 则可以安全地实现跨源通信
- BroadcastChannel 由于受到同源条件的限制因此比 window.postMessage 更加安全。一般情况下推荐使用 BroadcastChannel 除非需要做到非同源之间的通信

## postMessage

postMessage 是一种在不同窗口之间进行通信的基本机制。它适用于以下场景：

- 在不同的浏览器窗口、标签页或 iframe 之间进行通信。
- 在同一域名下的不同子域之间进行通信。
- 在 Web Worker 内部与主线程进行通信。

postMessage 在很多对象上都有，例如 window 和 Worker

### postMessage() 参数

这里说的是 window.postMessage，语法：`otherWindow.postMessage(message, targetOrigin, [transfer]);`

- message：这里我们传入message的是字符串，实际上可以传入任何类型，挂载到事件对象MessageEvent的data上
- targetOrigin：指的是目标源地址
  - 默认是/，只对同源地址有效
  - 可为任何url，如：example.com
  - 也可以为通配符*，意思是广播到所有iFrame中
- ports：用来传入接口，挂载到事件对象MessageEvent的ports上

## MessageChannel

在一些场景中，简单的单向通信可能无法满足需求，这时可以使用 MessageChannel 来建立一个**双向**通信通道。MessageChannel 适用于以下场景：

- 在同一窗口或 Web Worker 内的不同上下文之间进行双向通信。
- 在父级窗口与子级窗口（iframe）之间进行通信。
- 在多个 Web Worker 之间进行通信。

使用 MessageChannel 的步骤如下：

1. 创建一个 MessageChannel 对象：使用 new MessageChannel() 创建一个新的 MessageChannel 实例。
2. 获取 MessagePort 对象：通过 channel.port1 和 channel.port2 获取两个端口对象，一个用于发送消息，另一个用于接收消息。
3. 发送消息：使用 port.postMessage(message) 方法将消息发送到另一个端口。
4. 接收消息：为接收端口添加消息事件处理程序，通过监听 'message' 事件来接收来自另一个端口的消息，注意使用 onmessage 会隐式调用 start() 方法开始监听

```js
// 创建 MessageChannel 实例
const channel = new MessageChannel();

// 获取两个端口对象
const iframe1 = document.getElementById('iframe1');
const iframe2 = document.getElementById('iframe2');

const port1 = channel.port1;
const port2 = channel.port2;

// 在 iframe1 中发送消息到 iframe2
port1.postMessage('Hello from iframe1!');

// 在 iframe2 中接收来自 iframe1 的消息
port2.onmessage = function(event) {
  console.log('Message received in iframe2:', event.data);
};

// 在 iframe2 中发送消息到 iframe1
port2.postMessage('Hello from iframe2!');

// 在 iframe1 中接收来自 iframe2 的消息
port1.onmessage = function(event) {
  console.log('Message received in iframe1:', event.data);
};
```

### 使用 MessageChannel 实现深拷贝

这个方法比较优秀的地方在于 undefined 的不会丢失，循环引用的对象也不会报错，循环点会被置为 undefined，不过不能复制函数。

```js
function deepClone(target) {
    return new Promise(resolve => {
        const channel = new MessageChannel()
        channel.port2.postMessage(target)
        channel.port1.onmessage = eve => {
            resolve(eve.data)
        }
    })
}

const obj = {
    name: '123',
    b: {
        c: 456
    },
    d: undefined
}

deepClone(obj).then(d => console.log(d))
```

### Vue 的 nextTick 降级方案用到了 MessageChannel

```js
import { isIOS, isNative } from './env'
let microTimerFunc
let macroTimerFunc

if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc
}
```
