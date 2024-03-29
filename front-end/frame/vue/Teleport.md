# Teleport

Vue 鼓励通过将 UI 和相关行为封装到组件中来构建 UI。可以将它们嵌套在另一个内部，以构建一个组成应用程序 UI 的树。

然而，有时组件模板的一部分逻辑上属于该组件，而从技术角度来看，最好将模板的这一部分移动到 DOM 中 Vue app 之外的其他位置，比如对话框。

一个常见的场景是创建一个包含全屏模式的组件。在大多数情况下，希望模态框的逻辑存在于组件中，但是模态框的快速定位就很难通过 CSS 来解决，或者需要更改组件组合。

考虑下面的 HTML 结构。

```html
<body>
  <div style="position: relative;">
    <h3>Tooltips with Vue 3 Teleport</h3>
    <div>
      <modal-button></modal-button>
    </div>
  </div>
</body>
```

看看 modal-button 组件：

该组件将有一个 button 元素来触发模态框的打开，以及一个带有 class .modal 的 div 元素，它将包含模态框的内容和一个用于自关闭的按钮。

```js
const app = Vue.createApp({})

app.component("modal-button", {
  template: `
    <button @click="modalOpen = true">
        Open full screen modal!
    </button>

    <div v-if="modalOpen" class="modal">
      <div>
        I'm a modal! 
        <button @click="modalOpen = false">
          Close
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      modalOpen: false,
    }
  },
})
```

当在初始的 HTML 结构中使用这个组件时，可以看到一个问题——模态框是在深度嵌套的 div 中渲染的，而模态框的 position:absolute 以父级相对定位的 div 作为引用。

Teleport 提供了一种干净的方法，允许控制在 DOM 中哪个父节点下渲染了 HTML，而不必求助于全局状态或将其拆分为两个组件。

修改 modal-button 以使用 `<teleport>`，并告诉 Vue “将这个 HTML 传送到‘body’标签下”。

```js
app.component("modal-button", {
  template: `
    <button @click="modalOpen = true">
        Open full screen modal! (With teleport!)
    </button>

    <teleport to="body">
      <div v-if="modalOpen" class="modal">
        <div>
          I'm a teleported modal! 
          (My parent is "body")
          <button @click="modalOpen = false">
            Close
          </button>
        </div>
      </div>
    </teleport>
  `,
  data() {
    return {
      modalOpen: false,
    }
  },
})
```

## 与 Vue components 一起使用

如果 `<teleport>` 包含 Vue 组件，则它仍将是 `<teleport>` 父组件的逻辑子组件
