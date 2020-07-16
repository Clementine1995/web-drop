# Vue3

## 代码管理模式

Vue3使用 monorepo + lerna来管理代码，monorepo是一种将多个package放在一个repo中的代码管理模式，而lerna是用来管理多个package的工具，并且引入tree-shaking技术，间接达到减少项目引入Vue.js包的体积

package.json中private为true的不会被列举出来

## Proxy

defineProperty 需要给对象重写getter/setter，并且需要递归性能比较差

## 组件渲染：vnode 到真实 DOM 如何转变

一个组件想要真正的渲染生成 DOM，需要经历：创建 vnode -> 渲染 vnode -> 生成 DOM

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

ensureRenderer用来创建渲染器对象，为跨平台做准备

### 核心渲染流程：创建 vnode 和渲染 vnode
