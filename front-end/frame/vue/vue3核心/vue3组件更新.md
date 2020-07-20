# Vue组件更新：完整的 DOM diff 流程是怎样的

## 副作用渲染函数更新组件的过程

在组件初次渲染时，setupRenderEffect里面将 isMounted 变成true，后面再走这个方法关键就是更新组件的逻辑

```js
const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
  // 创建响应式的副作用渲染函数
  instance.update = effect(function componentEffect() {
    if (!instance.isMounted) {
      // 渲染组件
    }
    else {
      // 更新组件
      let { next, vnode } = instance
      // next 表示新的组件 vnode
      if (next) {
        // 更新组件 vnode 节点信息
        updateComponentPreRender(instance, next, optimized)
      }
      else {
        next = vnode
      }
      // 渲染新的子树 vnode
      const nextTree = renderComponentRoot(instance)
      // 缓存旧的子树 vnode
      const prevTree = instance.subTree
      // 更新子树 vnode
      instance.subTree = nextTree
      // 组件更新核心逻辑，根据新旧子树 vnode 做 patch
      patch(prevTree, nextTree,
        // 如果在 teleport 组件中父节点可能已经改变，所以容器直接找旧树 DOM 元素的父节点
        hostParentNode(prevTree.el),
        // 参考节点在 fragment 的情况可能改变，所以直接找旧树 DOM 元素的下一个节点
        getNextHostNode(prevTree),
        instance,
        parentSuspense,
        isSVG)
      // 缓存更新后的 DOM 节点
      next.el = nextTree.el
    }
  }, prodEffectOptions)
}
```
