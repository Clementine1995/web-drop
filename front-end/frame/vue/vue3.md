# Vue3

## 代码管理模式

Vue3使用 monorepo + lerna来管理代码，monorepo是一种将多个package放在一个repo中的代码管理模式，而lerna是用来管理多个package的工具，并且引入tree-shaking技术，间接达到减少项目引入Vue.js包的体积

package.json中private为true的不会被列举出来

## Proxy

defineProperty 需要给对象重写getter/setter，并且需要递归性能比较差

## 组件渲染：vnode 到真实 DOM 如何转变

一个组件想要真正的渲染生成 DOM，需要经历：创建 vnode -> 渲染 vnode -> 生成 DOM，整个组件树是由根组件开始渲染的，为了找到根组件的渲染入口，、需要从应用程序的初始化过程开始分析。

### 应用程序初始化

createApp 方法，里面主要就是创建 app 对象，以及重写 mount 方法

```js
const createApp = ((...args) => {
  // 创建 app 对象
  const app = ensureRenderer().createApp(...args)
  const { mount } = app
  // 重写 mount 方法
  app.mount = (containerOrSelector) => {
    // ...
  }
  return app
})
```

#### 创建 app 对象

ensureRenderer().createApp() 来创建 app 对象

```js
const app = ensureRenderer().createApp(...args)
```

其中 ensureRenderer用来创建渲染器对象，为跨平台做准备，也可以实现自定义的渲染器

```js
// 渲染相关的一些配置，比如更新属性的方法，操作 DOM 的方法，默认的就是这个用于浏览器环境
const rendererOptions = {
  patchProp,
  ...nodeOps
}
let renderer
// 延时创建渲染器，当用户只依赖响应式包的时候，可以通过 tree-shaking 移除核心渲染逻辑相关的代码
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}
function createRenderer(options) {
  return baseCreateRenderer(options)
}
function baseCreateRenderer(options) {
  function render(vnode, container) {
    // 组件渲染的核心逻辑
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}
function createAppAPI(render) {
  // createApp createApp 方法接受的两个参数：根组件的对象和 prop
  return function createApp(rootComponent, rootProps = null) {
    const app = {
      _component: rootComponent,
      _props: rootProps,
      mount(rootContainer) { // 会被重写
        // 创建根组件的 vnode
        const vnode = createVNode(rootComponent, rootProps)
        // 利用渲染器渲染 vnode
        render(vnode, rootContainer)
        app._container = rootContainer
        return vnode.component.proxy
      }
    }
    return app
  }
}
```

createRenderer 创建一个渲染器，这个渲染器内部会有一个 createApp 方法，它是执行 createAppAPI 方法返回的函数，接受了 rootComponent 和 rootProps 两个参数，我们在应用层面执行 createApp(App) 方法时，会把 App 组件对象作为根组件传递给 rootComponent。这样，createApp 内部就创建了一个 app 对象，它会提供 mount 方法，这个方法是用来挂载组件的。

#### 重写 app.mount 方法

createApp 返回的 app 对象已经拥有了 mount 方法了，但在入口函数中，接下来的逻辑却是对 app.mount 方法的重写。

为什么要重写这个方法，是因为Vue.js 不仅仅是为 Web 平台服务，它的目标是支持跨平台渲染，而 createApp 函数内部的 app.mount 方法是一个标准的可跨平台的组件渲染流程

标准的跨平台渲染流程是先创建 vnode，再渲染 vnode。此外参数 rootContainer 也可以是不同类型的值，比如，在 Web 平台它是一个 DOM 对象，而在其他平台（比如 Weex 和小程序）中可以是其他类型的值。

```js
mount(rootContainer) {
  // 创建根组件的 vnode
  const vnode = createVNode(rootComponent, rootProps)
  // 利用渲染器渲染 vnode
  render(vnode, rootContainer)
  app._container = rootContainer
  return vnode.component.proxy
}

// 重写 app.mount 之前，把createApp生成的 mount 方法先存了起来，也就是上面这个方法，不是在一个文件里
const { mount } = app

app.mount = (containerOrSelector) => {
  // 标准化容器
  const container = normalizeContainer(containerOrSelector)
  if (!container)
    return
  const component = app._component
   // 如组件对象没有定义 render 函数和 template 模板，则取容器的 innerHTML 作为组件模板内容
  if (!isFunction(component) && !component.render && !component.template) {
    component.template = container.innerHTML
  }
  // 挂载前清空容器内容
  container.innerHTML = ''
  // 真正的挂载
  return mount(container)
}
```

首先是通过 normalizeContainer 标准化容器（这里可以传字符串选择器或者 DOM 对象，但如果是字符串选择器，就需要把它转成 DOM 对象，作为最终挂载的容器），然后做一个 if 判断，如果组件对象没有定义 render 函数和 template 模板，则取容器的 innerHTML 作为组件模板内容；接着在挂载前清空容器内容，最终再调用 app.mount 的方法走标准的组件渲染流程。在这里，重写的逻辑都是和 Web 平台相关的，所以要放在外部实现。此外，这么做的目的是既能让用户在使用 API 时可以更加灵活，也兼容了 Vue.js 2.x 的写法，比如 app.mount 的第一个参数就同时支持选择器字符串和 DOM 对象两种类型。

### 核心渲染流程：创建 vnode 和渲染 vnode

#### 创建 vnode

vnode 本质上是用来描述 DOM 的 JavaScript 对象，它在 Vue.js 中可以描述不同类型的节点，比如普通元素节点、组件节点。

普通元素节点的 vnode 比较简单，

```html
<button class="btn" style="width:100px;height:50px">click me</button>
```

上面的按钮可以表示为

```js
const vnode = {
  type: 'button',
  props: {
    'class': 'btn',
    style: {
      width: '100px',
      height: '50px'
    }
  },
  children: 'click me'
}
```

vnode 除了可以像上面那样用于描述一个真实的 DOM，也可以用来描述组件。

```js
// 比如有一个这样的组件
<custom-component msg="test"></custom-component>
// 可以用 vnode 这样表示 <custom-component> 组件标签
const CustomComponent = {
  // 在这里定义组件对象
}
const vnode = {
  type: CustomComponent,
  props: {
    msg: 'test'
  }
}
```

Vue.js 内部是如何创建这些 vnode 的呢？

回顾 app.mount 函数的实现，内部是通过 createVNode 函数创建了根组件的 vnode

```js
const vnode = createVNode(rootComponent, rootProps)
// 下面是 createVNode 函数的大致实现
function createVNode(type, props = null, children = null) {
  if (props) {
    // 处理 props 相关逻辑，标准化 class 和 style
  }
  // 对 vnode 类型信息编码
  const shapeFlag = isString(type)
    ? 1 /* ELEMENT */
    : isSuspense(type)
      ? 128 /* SUSPENSE */
      : isTeleport(type)
        ? 64 /* TELEPORT */
        : isObject(type)
          ? 4 /* STATEFUL_COMPONENT */
          : isFunction(type)
            ? 2 /* FUNCTIONAL_COMPONENT */
            : 0
  const vnode = {
    type,
    props,
    shapeFlag,
    // 一些其他属性
  }
  // 标准化子节点，把不同数据类型的 children 转成数组或者文本类型
  normalizeChildren(vnode, children)
  return vnode
}
```
