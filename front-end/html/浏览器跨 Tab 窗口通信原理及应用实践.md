# 浏览器跨 Tab 窗口通信原理及应用实践

> 原文[浏览器跨 Tab 窗口通信原理及应用实践](https://www.cnblogs.com/coco1s/p/17861360.html)

如何基于纯前端技术，实现多窗口下进行互相通信。 为了实现跨窗口通信，它应该需要具备以下能力：

1. 数据传输能力：能够将数据从一个窗口发送到另一个窗口，以及接收来自其他窗口的数据。
2. 实时性：能够实现实时或近实时的数据传输，以便及时更新不同窗口的内容。
3. 安全性：确保通信过程中的数据安全，防止恶意窃取或篡改通信数据。当然，这个不是本文讨论的重点，但是是实际应用中不应该忽视的一个重点。

## Broadcast Channel()

Broadcast Channel 是一个较新的 Web API，用于在不同的浏览器窗口、标签页或框架之间实现跨窗口通信。它基于发布-订阅模式，允许一个窗口发送消息，并由其他窗口接收。

其核心步骤如下：

1. 创建一个 BroadcastChannel 对象：在发送和接收消息之前，首先需要在每个窗口中创建一个 BroadcastChannel 对象，使用相同的频道名称进行初始化。
2. 发送消息：通过 BroadcastChannel 对象的 postMessage() 方法，可以向频道中的所有窗口发送消息。
3. 接收消息：通过监听 BroadcastChannel 对象的 message 事件，可以在窗口中接收到来自其他窗口发送的消息。

同时，Broadcast Channel 遵循浏览器的同源策略。这意味着只有在同一个协议、主机和端口下的窗口才能正常进行通信。如果窗口不满足同源策略，将无法互相发送和接收消息。
其本质就是一个数据共享池子。

## SharedWorker API

SharedWorker API 是 HTML5 中提供的一种多线程解决方案，它可以在多个浏览器 TAB 页面之间共享一个后台线程，从而实现跨页面通信。

与其他 Worker 不同的是，SharedWorker 可以被多个浏览器 TAB 页面共享，且可以在同一域名下的不同页面之间建立连接。这意味着，多个页面可以通过 SharedWorker 实例之间的消息传递，实现跨 TAB 页面的通信。

```js
//shared-worker.js
const connections = [];

onconnect = function (event) {
  var port = event.ports[0];
  connections.push(port);

  port.onmessage = function (event) {
    // 接收到消息时，向所有连接发送该消息
    connections.forEach(function (conn) {
      if (conn !== port) {
        conn.postMessage(event.data);
      }
    });
  };

  port.start();
};
```

简单解析一下，下面对其进行解析：

1. 上面的代码中，定义了一个数组 connections，用于存储与 SharedWorker 建立连接的各个页面的端口对象；
2. onconnect 是事件处理程序，当有新的连接建立时会触发该事件；
3. 在 onconnect 函数中，通过 event.ports[0] 获取到与 SharedWorker 建立的连接的第一个端口对象，并将其添加到 connections 数组中，表示该页面与共享 Worker 建立了连接。
4. 在连接建立后，为每个端口对象设置了 onmessage 事件处理程序。当端口对象接收到消息时，会触发该事件处理程序。
5. 在 onmessage 事件处理程序中，通过遍历 connections 数组，将消息发送给除当前连接端口对象之外的所有连接。这样，消息就可以在不同的浏览器 TAB 页面之间传递。
6. 最后，通过调用 port.start() 启动端口对象，使其开始接收消息。

总而言之，shared-worker.js 脚本创建了一个共享 Worker 实例，它可以接收来自不同页面的连接请求，并将接收到的消息发送给其他连接的页面。通过使用 SharedWorker API，实现跨 TAB 页面之间的通信和数据共享。

可以看到，在 SharedWorker 方式中，传输数据与 Broadcast Channel 是一样的，都是利用 Message Event。简单对比一下：

- SharedWorker 通过在多个Tab页面之间共享相同的 Worker 实例，方便地共享数据和状态，SharedWorker 需要多定义一个 shared-worker.js;
- Broadcast Channel 通过向所有订阅同一频道的 Tab 页面广播消息，实现广播式的通信。

另外，需要注意的是，两个方法都使用了 postMessage 方法。window.postMessage() 方法可以安全地实现跨源通信。并且，本质上而言，单独使用 postMessage 就可以实现跨 Tab 通信。

但是，单独使用 postMessage 适合简单的点对点通信。在更复杂的场景中，Broadcast Channel 和 SharedWorker 提供更强大的机制，可简化通信逻辑，有更广泛的通信范围和生命周期管理。Broadcast Channel 的通信范围是所有订阅该频道的窗口，而 SharedWorker 可在多个窗口之间共享状态和通信。

## localStorage/sessionStorage

与上面 Broadcast Channel、SharedWorker 稍微不同的地方在于：

1. localStorage 方式，利用了本地浏览器存储，实现了同域下的数据共享；
2. localStorage 方式，基于 `window.addEventListener('storage',function(event) {})` 事件实现了 localStore 变化时候的数据监听；

当然，由于 localStorage 存储过程只能是字符串，在读取的时候需要利用 JSON.stringify 和 JSON.parse 额外处理一层，调试的时候需要注意。

虽然看起来这种方式最不优雅，但是结合兼容性一起看， localstorage 反而是兼容性最好的方式。在数据量较小的时候，性能相差不会太大，反而可能是更好的选择。

## 实际应用思考

当然，上面的实现其实有很大一个瑕疵。

那就是我们只顾着实现通信，没有考虑实际应用中的一些实际问题：

- 如何确定何时开始通信？
- Tab 页频繁的开关，如何知道当前还有多少页面处于打开状态？
- 我们如何知道页面被关闭了？基于组件的 onUnmounted 发送当前页面关闭的信息或者基于 window 对象的 beforeunload 事件发送当前页面关闭的信息？

这些信息都有可能因为 Tab 页面失活，导致关闭的信息无法正常被发送出去。所以，实际应用中，经常用的一项技术是心跳上报/心跳广播，一旦建立连接后，间隔 X 秒发送一次心跳广播，告诉其他接收端，我还在线。一旦超过某个时间阈值没有收到心跳上报，各个订阅方可以认为该设备已经下线。

总而言之，跨 Tab 窗口通信应用在实际应用的过程中，我们需要思考更多可能隐藏的问题。

## 跨 Tab 窗口通信应用场景

以下是一些常见的应用场景：

- 实时协作：多个用户可以在不同的 Tab 页上进行实时协作，比如编辑文档、共享白板、协同编辑等。通过跨Tab通信，可以实现实时更新和同步操作，提高协作效率。
- 多标签页数据同步：当用户在一个标签页上进行了操作，希望其他标签页上的数据也能实时更新时，可以使用跨 Tab 通信来实现数据同步，保持用户在不同标签页上看到的数据一致性。
- 跨标签页通知：在某些场景下，需要向用户发送通知或提醒，即使用户不在当前标签页上也能及时收到。通过跨 Tab 通信，可以实现跨页面的消息传递，向用户发送通知或提醒。
- 多标签页状态同步：有些应用可能需要在不同标签页之间同步用户的状态信息，例如登录状态、购物车内容等。通过跨 Tab 通信，可以确保用户在不同标签页上看到的状态信息保持一致。
- 页面间数据传输：有时候用户需要从一个页面跳转到另一个页面，并携带一些数据，通过跨Tab通信可以在页面之间传递数据，实现数据的共享和传递。
