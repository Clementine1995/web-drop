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
      // 缓存旧的子树 vnode，旧的是在初次渲染组件时赋值的
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

更新组件主要做三件事情：更新组件 vnode 节点、渲染新的子树 vnode、根据新旧子树 vnode 执行 patch 逻辑。

1. 首先是更新组件 vnode 节点，这里会有一个条件判断，判断组件实例中是否有新的组件 vnode（用 next 表示），有则更新组件 vnode，没有 next 指向之前的组件 vnode。
2. 接着是渲染新的子树 vnode，因为数据发生了变化，模板又和数据相关，所以渲染生成的子树 vnode 也会发生相应的变化。
3. 最后就是核心的 patch 逻辑，用来找出新旧子树 vnode 的不同，并找到一种合适的方式更新 DOM，接下来就来分析这个过程。

### 核心逻辑：patch 流程

```js
const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, optimized = false) => {
  // 如果存在新旧节点, 且新旧节点类型不同，则销毁旧节点
  if (n1 && !isSameVNodeType(n1, n2)) {
    anchor = getNextHostNode(n1)
    unmount(n1, parentComponent, parentSuspense, true)
    // n1 设置为 null 保证后续都走 mount 逻辑
    n1 = null
  }
  // 下面是根据不同的节点类型做不同的处理，在之前组件渲染中有
  // ...
}
function isSameVNodeType (n1, n2) {
  // n1 和 n2 节点的 type 和 key 都相同，才是相同节点
  return n1.type === n2.type && n1.key === n2.key
}
```

在这个过程中，首先判断新旧节点是否是相同的 vnode 类型，如果不同，比如一个 div 更新成一个 ul，那么最简单的操作就是删除旧的 div 节点，再去挂载新的 ul 节点。

如果是相同的 vnode 类型，就需要走 diff 更新流程了，接着会根据不同的 vnode 类型执行不同的处理逻辑，这里仍然只分析普通元素类型和组件类型的处理过程。

#### 1. 处理组件

举个例子，在父组件 App 中里引入了 Hello 组件

```html
<!-- App.vue -->
<template>
  <div class="app">
    <p>This is an app.</p>
    <hello :msg="msg"></hello>
    <button @click="toggle">Toggle msg</button>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        msg: 'Vue'
      }
    },
    methods: {
      toggle() {
        this.msg = 'Vue'? 'World': 'Vue'
      }
    }
  }
</script>

<!-- Hello.vue -->
<template>
  <div class="hello">
    <p>Hello, {{msg}}</p>
  </div>
</template>
<script>
  export default {
    props: {
      msg: String
    }
  }
</script>
```

点击 App 组件中的按钮执行 toggle 函数，就会修改 data 中的 msg，并且会触发App 组件的重新渲染。

结合前面对渲染函数的流程分析，这里 App 组件的根节点是 div 标签，重新渲染的子树 vnode 节点是一个普通元素的 vnode，应该先走 processElement 逻辑。组件的更新最终还是要转换成内部真实 DOM 的更新，而实际上普通元素的处理流程才是真正做 DOM 的更新，由于稍后我们会详细分析普通元素的处理流程，所以我们先跳过这里，继续往下看。

和渲染过程类似，更新过程也是一个树的深度优先遍历过程，更新完当前节点后，就会遍历更新它的子节点，因此在遍历的过程中会遇到 hello 这个组件 vnode 节点，就会执行到 processComponent 处理逻辑中，再来看一下它的实现，重点关注一下组件更新的相关逻辑

```js
const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
  if (n1 == null) {
    // 挂载组件
  }
  else {
    // 更新子组件
    updateComponent(n1, n2, parentComponent, optimized)
  }
}
const updateComponent = (n1, n2, parentComponent, optimized) => {
  const instance = (n2.component = n1.component)
  // 根据新旧子组件 vnode 判断是否需要更新子组件
  if (shouldUpdateComponent(n1, n2, parentComponent, optimized)) {
    // 新的子组件 vnode 赋值给 instance.next
    instance.next = n2
    // 子组件也可能因为数据变化被添加到更新队列里了，移除它们防止对一个子组件重复更新
    invalidateJob(instance.update)
    // 执行子组件的副作用渲染函数
    instance.update()
  }
  else {
    // 不需要更新，只复制属性
    n2.component = n1.component
    n2.el = n1.el
  }
}
```

可以看到，processComponent 主要通过执行 updateComponent 函数来更新子组件，updateComponent 函数在更新子组件的时候，会先执行 shouldUpdateComponent 函数，根据新旧子组件 vnode 来判断是否需要更新子组件。这里你只需要知道，在 shouldUpdateComponent 函数的内部，主要是通过检测和对比组件 vnode 中的 props、chidren、dirs、transiton 等属性，来决定子组件是否需要更新。

虽然 Vue.js 的更新粒度是组件级别的，组件的数据变化只会影响当前组件的更新，但是在组件更新的过程中，也会对子组件做一定的检查，判断子组件是否也要更新，并通过某种机制避免子组件重复更新。

接着看 updateComponent 函数，如果 shouldUpdateComponent 返回 true ，那么在它的最后，先执行 invalidateJob（instance.update）避免子组件由于自身数据变化导致的重复更新，然后又执行了子组件的副作用渲染函数 instance.update 来主动触发子组件的更新。

再回到副作用渲染函数中，有了前面的讲解，我们再看组件更新的这部分代码，就能很好地理解它的逻辑了：

```js
// setupRenderEffect 中代码
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
const updateComponentPreRender = (instance, nextVNode, optimized) => {
  // 新组件 vnode 的 component 属性指向组件实例
  nextVNode.component = instance
  // 旧组件 vnode 的 props 属性
  const prevProps = instance.vnode.props
  // 组件实例的 vnode 属性指向新的组件 vnode
  instance.vnode = nextVNode
  // 清空 next 属性，为了下一次重新渲染准备
  instance.next = null
  // 更新 props
  updateProps(instance, nextVNode.props, prevProps, optimized)
  // 更新 插槽
  updateSlots(instance, nextVNode.children)
}
```

结合上面的代码，我们在更新组件的 DOM 前，需要先更新组件 vnode 节点信息，包括更改组件实例的 vnode 指针、更新 props 和更新插槽等一系列操作，因为组件在稍后执行 renderComponentRoot 时会重新渲染新的子树 vnode ，它依赖了更新后的组件 vnode 中的 props 和 slots 等数据。

所以现在知道了一个组件重新渲染可能会有两种场景，一种是组件本身的数据变化，这种情况下 next 是 null；另一种是父组件在更新的过程中，遇到子组件节点，先判断子组件是否需要更新，如果需要则主动执行子组件的重新渲染方法，这种情况下 next 就是新的子组件 vnode。

可能还会有疑问，这个子组件对应的新的组件 vnode 是什么时候创建的呢？答案很简单，它是在**父组件重新渲染**的过程中，通过 renderComponentRoot 渲染子树 vnode 的时候生成，因为子树 vnode 是个树形结构，通过遍历它的子节点就可以访问到其对应的组件 vnode。再拿我们前面举的例子说，当 App 组件重新渲染的时候，在执行 renderComponentRoot 生成子树 vnode 的过程中，也生成了 hello 组件对应的新的组件 vnode。

所以 processComponent 处理组件 vnode，本质上就是去判断子组件是否需要更新，如果需要则递归执行子组件的副作用渲染函数来更新，否则仅仅更新一些 vnode 的属性，并让子组件实例保留对组件 vnode 的引用，用于子组件自身数据变化引起组件重新渲染的时候，在渲染函数内部可以拿到新的组件 vnode。

#### 2. 处理普通元素

再来看如何处理普通元素，把之前的示例稍加修改，将其中的 Hello 组件删掉，如下所示

```html
<template>
  <div class="app">
    <p>This is {{msg}}.</p>
    <button @click="toggle">Toggle msg</button>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        msg: 'Vue'
      }
    },
    methods: {
      toggle() {
        this.msg = 'Vue'? 'World': 'Vue'
      }
    }
  }
</script>
```

当我们点击 App 组件中的按钮会执行 toggle 函数，然后修改 data 中的 msg，这就触发了 App 组件的重新渲染。

App 组件的根节点是 div 标签，重新渲染的子树 vnode 节点是一个普通元素的 vnode，所以应该先走 processElement 逻辑，来看这个函数的实现：

```js
const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
  isSVG = isSVG || n2.type === 'svg'
  if (n1 == null) {
    // 挂载元素，组件渲染中有
  }
  else {
    // 更新元素
    patchElement(n1, n2, parentComponent, parentSuspense, isSVG, optimized)
  }
}
const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, optimized) => {
  const el = (n2.el = n1.el)
  const oldProps = (n1 && n1.props) || EMPTY_OBJ
  const newProps = n2.props || EMPTY_OBJ
  // 更新 props
  patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG)
  const areChildrenSVG = isSVG && n2.type !== 'foreignObject'
  // 更新子节点
  patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG)
}
```

可以看到，更新元素的过程主要做两件事情：更新 props 和更新子节点。其实这是很好理解的，因为一个 DOM 节点元素就是由它自身的一些属性和子节点构成的。

首先是更新 props，这里的 patchProps 函数就是在更新 DOM 节点的 class、style、event 以及其它的一些 DOM 属性

其次是更新子节点，我们来看一下这里的 patchChildren 函数的实现：

```js
const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized = false) => {
  const c1 = n1 && n1.children
  const prevShapeFlag = n1 ? n1.shapeFlag : 0
  const c2 = n2.children
  const { shapeFlag } = n2
  // 子节点有 3 种可能情况：文本、数组、空
  if (shapeFlag & 8 /* TEXT_CHILDREN */) {
    if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
      // 数组 -> 文本，则删除之前的子节点
      unmountChildren(c1, parentComponent, parentSuspense)
    }
    if (c2 !== c1) {
      // 文本对比不同，则替换为新文本
      hostSetElementText(container, c2)
    }
  }
  else {
    if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
      // 之前的子节点是数组
      if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        // 新的子节点仍然是数组，则做完整地 diff
        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
      }
      else {
        // 数组 -> 空，则仅仅删除之前的子节点
        unmountChildren(c1, parentComponent, parentSuspense, true)
      }
    }
    else {
      // 之前的子节点是文本节点或者为空
      // 新的子节点是数组或者为空
      if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
        // 如果之前子节点是文本，则把它清空
        hostSetElementText(container, '')
      }
      if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        // 如果新的子节点是数组，则挂载新子节点
        mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
      }
    }
  }
}
```

对于一个元素的子节点 vnode 可能会有三种情况：纯文本、vnode 数组和空。那么根据排列组合对于新旧子节点来说就有九种情况，就需要对着九种情况进行分别处理，其中最复杂的就是新旧节点都为 vnode 的情况，需要使用 diff 算法

旧子节点是纯文本

+ 如果新子节点也是纯文本，那么做简单地文本替换即可；
+ 如果新子节点是空，那么删除旧子节点即可；
+ 如果新子节点是 vnode 数组，那么先把旧子节点的文本清空，再去旧子节点的父容器下添加多个新子节点。

旧子节点是空

+ 如果新子节点是纯文本，那么在旧子节点的父容器下添加新文本节点即可；
+ 如果新子节点也是空，那么什么都不需要做；
+ 如果新子节点是 vnode 数组，那么直接去旧子节点的父容器下添加多个新子节点即可。

旧子节点是 vnode 数组

+ 如果新子节点是纯文本，那么先删除旧子节点，再去旧子节点的父容器下添加新文本节点；
+ 如果新子节点是空，那么删除旧子节点即可；
+ 如果新子节点也是 vnode 数组，那么就需要做完整的 diff 新旧子节点了，这是最复杂的情况，内部运用了核心 diff 算法。

## 核心 diff 算法

在对比新旧节点的时候，整体流程就是同步头部节点，同步尾部节点，添加新的节点，删除多余节点，处理未知子序列，而处理未知子序列最为复杂。

假如现在存在这样两个新旧子节点

prev children     a b c d

next children     a b e c d

### 同步头部节点

```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let i = 0
  const l2 = c2.length
  // 旧子节点的尾部索引
  let e1 = c1.length - 1
  // 新子节点的尾部索引
  let e2 = l2 - 1
  // 1. 从头部开始同步
  // i = 0, e1 = 3, e2 = 4
  // (a b) c d
  // (a b) e c d
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]
    if (isSameVNodeType(n1, n2)) {
      // 相同的节点，递归执行 patch 更新节点
      patch(n1, n2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized)
    }
    else {
      break
    }
    i++
  }
}
```

在整个 diff 的过程，我们需要维护几个变量：头部的索引 i、旧子节点的尾部索引 e1和新子节点的尾部索引 e2。

同步头部节点就是从头部开始，依次对比新节点和旧节点，如果它们相同的则执行 patch 更新节点；如果不同或者索引 i 大于索引 e1 或者 e2，则同步过程结束。

为什么判断条件是 <= ，因为如果是 < 那么在不提前跳出循环的情况下，循环不到 c1 或者 c2 的最后一个节点

那么完成头部同步后：i 是 2，e1 是 3，e2 是 4。

### 同步尾部节点

接着从尾部开始同步尾部节点

```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let i = 0
  const l2 = c2.length
  // 旧子节点的尾部索引
  let e1 = c1.length - 1
  // 新子节点的尾部索引
  let e2 = l2 - 1
  // 1. 从头部开始同步
  // i = 0, e1 = 3, e2 = 4
  // (a b) c d
  // (a b) e c d
  // 2. 从尾部开始同步
  // i = 2, e1 = 3, e2 = 4
  // (a b) (c d)
  // (a b) e (c d)
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized)
    }
    else {
      break
    }
    e1--
    e2--
  }
}
```

同步尾部节点就是从尾部开始，依次对比新节点和旧节点，如果相同的则执行 patch 更新节点；如果不同或者索引 i 大于索引 e1 或者 e2，则同步过程结束。
这个过程 i 不会改变。

为什么判断条件是 <= ，因为如果是 < 那么在不提前跳出循环的情况下，循环不到 i 下标所在的节点

完成尾部节点同步后：i 是 2，e1 是 1，e2 是 2。

看下来，i 代表的就是 c1 与 c2 正向第一个不相同子节点的下标位置，e1 与 e2 分别代表的是反向第一个不相同子节点的下标，那么在 i 大于 e1 或者 e2 的情况下，i 到另一个下标之间的就是需要添加的或者删除的节点

接下来只有 3 种情况要处理：

+ 新子节点有剩余要添加的新节点；
+ 旧子节点有剩余要删除的多余节点；
+ 未知子序列。

### 添加新的节点

```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let i = 0
  const l2 = c2.length
  // 旧子节点的尾部索引
  let e1 = c1.length - 1
  // 新子节点的尾部索引
  let e2 = l2 - 1
  // 1. 从头部开始同步
  // i = 0, e1 = 3, e2 = 4
  // (a b) c d
  // (a b) e c d
  // ...
  // 2. 从尾部开始同步
  // i = 2, e1 = 3, e2 = 4
  // (a b) (c d)
  // (a b) e (c d)
  // 3. 挂载剩余的新节点
  // i = 2, e1 = 1, e2 = 2
  if (i > e1) {
    if (i <= e2) {
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
      while (i <= e2) {
        // 挂载新节点
        patch(null, c2[i], container, anchor, parentComponent, parentSuspense, isSVG)
        i++
      }
    }
  }
}
```

如果索引 i 大于尾部索引 e1 且 i 小于等于 e2，那么从索引 i 开始到索引 e2 之间，我们直接挂载新子树这部分的节点。

对于例子而言，同步完尾部节点后 i 是 2，e1 是 1，e2 是 2，此时满足条件需要添加新的节点

### 删除多余节点

如果不满足添加新节点的情况，我就要接着判断旧子节点是否有剩余，如果满足则删除旧子节点

```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let i = 0
  const l2 = c2.length
  // 旧子节点的尾部索引
  let e1 = c1.length - 1
  // 新子节点的尾部索引
  let e2 = l2 - 1
  // 1. 从头部开始同步
  // i = 0, e1 = 4, e2 = 3
  // (a b) c d e
  // (a b) d e
  // ...
  // 2. 从尾部开始同步
  // i = 2, e1 = 4, e2 = 3
  // (a b) c (d e)
  // (a b) (d e)
  // 3. 普通序列挂载剩余的新节点
  // i = 2, e1 = 2, e2 = 1
  // 不满足
  if (i > e1) {
  }
  // 4. 普通序列删除多余的旧节点
  // i = 2, e1 = 2, e2 = 1
  else if (i > e2) {
    while (i <= e1) {
      // 删除节点
      unmount(c1[i], parentComponent, parentSuspense, true)
      i++
    }
  }
}
```

如果索引 i 大于尾部索引 e2，那么从索引 i 开始到索引 e1 之间，就是应该直接删除旧子树部分的节点。

### 处理未知子序列

单纯的添加和删除节点都是比较理想的情况，操作起来也很容易，但是有些时候并非这么幸运，会遇到比较复杂的未知子序列，这时候 diff 算法会怎么做呢，以下面这个为例

prev children     a   b   c   d   e   f   g   h

next children     a   b   e   c   d   i   g   h

首先同步头部节点

prev children     a   b   c   d   e   f   g   h
                  ↑   ↑
next children     a   b   e   c   d   i   g   h

此时 i 是 2，e1 是7，e2 是7

然后同步尾部

prev children     a   b   c   d   e   f   g   h
                  ↑   ↑                   ↑   ↑
next children     a   b   e   c   d   i   g   h

此时 i 是 2，e1 是5，e2 是5，可以看到它既不满足添加新节点的条件，也不满足删除旧节点的条件

这时要把旧子节点的 c、d、e、f 转变成新子节点的 e、c、d、i。从直观上看，我们把 e 节点移动到 c 节点前面，删除 f 节点，然后在 d 节点后面添加 i 节点即可。其实无论多复杂的情况，最终无非都是通过更新、删除、添加、移动这些动作来操作节点，而要做的就是找到相对优的解。

相比之前的删除以及添加操作来说，最麻烦的就是移动，既要判断哪些节点需要移动也要清楚如何移动。

#### 移动子节点

那么什么时候需要移动呢，就是当子节点排列顺序发生变化的时候，举个简单的例子具体看一下：

```js
var prev = [1, 2, 3, 4, 5, 6]
var next = [1, 3, 2, 6, 4, 5]
```

可以看到，从 prev 变成 next，数组里的一些元素的顺序发生了变化，我们可以把子节点类比为元素，现在问题就简化为我们如何用最少的移动使元素顺序从 prev 变化为 next 。

一种思路是在 next 中找到一个递增子序列，比如 [1, 3, 6] 、[1, 2, 4, 5]。之后对 next 数组进行倒序遍历，移动所有不在递增序列中的元素即可。

如果选择了 [1, 3, 6] 作为递增子序列，那么在倒序遍历的过程中，遇到 6、3、1 不动，遇到 5、4、2 移动即可

如果选择了 [1, 2, 4, 5] 作为递增子序列，那么在倒序遍历的过程中，遇到 5、4、2、1 不动，遇到 6、3 移动即可

可以看到第一种移动了三次，而第二种只移动了两次，递增子序列越长，所需要移动元素的次数越少，所以如何移动的问题就回到了求解最长递增子序列的问题。

在查找过程中需要对比新旧子序列，那么我们就要遍历某个序列，如果在遍历旧子序列的过程中需要判断某个节点是否在新子序列中存在，这就需要双重循环，而双重循环的复杂度是 O(n2) ，为了优化这个复杂度，我们可以用一种空间换时间的思路，建立索引图，把时间复杂度降低到 O(n)。

#### 建立索引图

所以处理未知子序列的第一步，就是建立索引图。

通常我们在开发过程中， 会给 v-for 生成的列表中的每一项分配唯一 key 作为项的唯一 ID，这个 key 在 diff 过程中起到很关键的作用。对于新旧子序列中的节点，我们认为 key 相同的就是同一个节点，直接执行 patch 更新即可。

我们根据 key 建立新子序列的索引图，实现如下：

```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let i = 0
  const l2 = c2.length
  // 旧子节点的尾部索引
  let e1 = c1.length - 1
  // 新子节点的尾部索引
  let e2 = l2 - 1
  // 1. 从头部开始同步
  // i = 0, e1 = 7, e2 = 7
  // (a b) c d e f g h
  // (a b) e c d i g h
  // 2. 从尾部开始同步
  // i = 2, e1 = 7, e2 = 7
  // (a b) c d e f (g h)
  // (a b) e c d i (g h)
  // 3. 普通序列挂载剩余的新节点， 不满足
  // 4. 普通序列删除多余的旧节点，不满足
  // i = 2, e1 = 4, e2 = 5
  // 旧子序列开始索引，从 i 开始记录
  const s1 = i
  // 新子序列开始索引，从 i 开始记录
  const s2 = i //
  // 5.1 根据 key 建立新子序列的索引图
  const keyToNewIndexMap = new Map()
  for (i = s2; i <= e2; i++) {
    const nextChild = c2[i]
    keyToNewIndexMap.set(nextChild.key, i)
  }
}
```

新旧子序列是从 i 开始的，所以我们先用 s1、s2 分别作为新旧子序列的开始索引，接着建立一个 keyToNewIndexMap 的 `Map<key, index>` 结构，遍历新子序列，把节点的 key 和 index 添加到这个 Map 中，注意这里假设所有节点都是有 key 标识的。

keyToNewIndexMap 存储的就是新子序列中每个节点在新子序列中的索引，看一下示例处理后的结果：

prev children     a   b   c   d   e   f   g   h
                  ↑   ↑                   ↑   ↑
next children     a   b   e   c   d   i   g   h

这里 s1 是2，s2也是2

我们得到了一个值为 {e:2,c:3,d:4,i:5} 的新子序列索引图。

#### 更新和移除旧节点

接下来，就需要遍历旧子序列，有相同的节点就通过 patch 更新，并且移除那些不在新子序列中的节点，同时找出是否有需要移动的节点，来看一下这部分逻辑的实现：

```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let i = 0
  const l2 = c2.length
  // 旧子节点的尾部索引
  let e1 = c1.length - 1
  // 新子节点的尾部索引
  let e2 = l2 - 1
  // 1. 从头部开始同步
  // i = 0, e1 = 7, e2 = 7
  // (a b) c d e f g h
  // (a b) e c d i g h
  // 2. 从尾部开始同步
  // i = 2, e1 = 7, e2 = 7
  // (a b) c d e f (g h)
  // (a b) e c d i (g h)
  // 3. 普通序列挂载剩余的新节点，不满足
  // 4. 普通序列删除多余的旧节点，不满足
  // i = 2, e1 = 4, e2 = 5
  // 旧子序列开始索引，从 i 开始记录
  const s1 = i
  // 新子序列开始索引，从 i 开始记录
  const s2 = i
  // 5.1 根据 key 建立新子序列的索引图
  // 5.2 正序遍历旧子序列，找到匹配的节点更新，删除不在新子序列中的节点，判断是否有移动节点
  // 新子序列已更新节点的数量
  let patched = 0
  // 新子序列待更新节点的数量，等于新子序列的长度
  const toBePatched = e2 - s2 + 1
  // 是否存在要移动的节点
  let moved = false
  // 用于跟踪判断是否有节点移动
  let maxNewIndexSoFar = 0
  // 这个数组存储新子序列中的元素在旧子序列节点的索引，用于确定最长递增子序列
  const newIndexToOldIndexMap = new Array(toBePatched)
  // 初始化数组，每个元素的值都是 0
  // 0 是一个特殊的值，如果遍历完了仍有元素的值为 0，则说明这个新节点没有对应的旧节点
  for (i = 0; i < toBePatched; i++)
    newIndexToOldIndexMap[i] = 0
  // 正序遍历旧子序列
  for (i = s1; i <= e1; i++) {
    // 拿到每一个旧子序列节点
    const prevChild = c1[i]
    if (patched >= toBePatched) {
      // 所有新的子序列节点都已经更新，剩余的节点删除
      unmount(prevChild, parentComponent, parentSuspense, true)
      continue
    }
    // 查找旧子序列中的节点在新子序列中的索引
    let newIndex = keyToNewIndexMap.get(prevChild.key)
    if (newIndex === undefined) {
      // 找不到说明旧子序列已经不存在于新子序列中，则删除该节点
      unmount(prevChild, parentComponent, parentSuspense, true)
    }
    else {
      // 更新新子序列中的元素在旧子序列中的索引，这里加 1 偏移，是为了避免 i 为 0 的特殊情况，影响对后续最长递增子序列的求解
      newIndexToOldIndexMap[newIndex - s2] = i + 1
      // maxNewIndexSoFar 始终存储的是上次求值的 newIndex，如果不是一直递增，则说明有移动
      if (newIndex >= maxNewIndexSoFar) {
        maxNewIndexSoFar = newIndex
      }
      else {
        moved = true
      }
      // 更新新旧子序列中匹配的节点
      patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, optimized)
      patched++
    }
  }
}
```

这里建立了一个 newIndexToOldIndexMap 的数组，来存储新子序列节点的索引和旧子序列节点的索引之间的映射关系，用于确定最长递增子序列，这个数组的长度为新子序列的长度，每个元素的初始值设为 0， 它是一个特殊的值，如果遍历完了仍有元素的值为 0，则说明遍历旧子序列的过程中没有处理过这个节点，这个节点是新添加的。

下面说说具体的操作过程：正序遍历旧子序列，根据前面建立的 keyToNewIndexMap 查找旧子序列中的节点在新子序列中的索引，如果找不到就说明新子序列中没有该节点，就删除它；如果找得到则将它在旧子序列中的索引更新到 newIndexToOldIndexMap 中。

注意这里索引加了长度为 1 的偏移，是为了应对 i 为 0 的特殊情况，如果不这样处理就会影响后续求解最长递增子序列。

遍历过程中，我们用变量 maxNewIndexSoFar 跟踪判断节点是否移动，maxNewIndexSoFar 始终存储的是上次求值的 newIndex，一旦本次求值的 newIndex 小于 maxNewIndexSoFar，这说明顺序遍历旧子序列的节点在新子序列的中索引并不是一直递增的，也就说明存在移动的情况。

除此之外，这个过程中也会更新新旧子序列中匹配的节点，另外如果所有新的子序列节点都已经更新，而对旧子序列遍历还未结束，说明剩余的节点就是多余的，删除即可。

至此，完成了新旧子序列节点的更新、多余旧节点的删除，并且建立了一个 newIndexToOldIndexMap 存储新子序列节点的索引和旧子序列节点的索引之间的映射关系，并确定是否有移动。

看一下示例处理后的结果

c、d、e 节点被更新，f 节点被删除，newIndexToOldIndexMap 的值为 [5, 3, 4 ,0]，此时 moved 也为 true，也就是存在节点移动的情况。

#### 移动和挂载新节点

接下来，就到了处理未知子序列的最后一个流程，移动和挂载新节点，来看一下这部分逻辑的实现

```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let i = 0
  const l2 = c2.length
  // 旧子节点的尾部索引
  let e1 = c1.length - 1
  // 新子节点的尾部索引
  let e2 = l2 - 1
  // 1. 从头部开始同步
  // i = 0, e1 = 6, e2 = 7
  // (a b) c d e f g
  // (a b) e c d h f g
  // 2. 从尾部开始同步
  // i = 2, e1 = 6, e2 = 7
  // (a b) c (d e)
  // (a b) (d e)
  // 3. 普通序列挂载剩余的新节点， 不满足
  // 4. 普通序列删除多余的节点，不满足
  // i = 2, e1 = 4, e2 = 5
  // 旧子节点开始索引，从 i 开始记录
  const s1 = i
  // 新子节点开始索引，从 i 开始记录
  const s2 = i //
  // 5.1 根据 key 建立新子序列的索引图
  // 5.2 正序遍历旧子序列，找到匹配的节点更新，删除不在新子序列中的节点，判断是否有移动节点
  // 5.3 移动和挂载新节点
  // 仅当节点移动时生成最长递增子序列
  const increasingNewIndexSequence = moved
    ? getSequence(newIndexToOldIndexMap)
    : EMPTY_ARR
  let j = increasingNewIndexSequence.length - 1
  // 倒序遍历以便我们可以使用最后更新的节点作为锚点
  for (i = toBePatched - 1; i >= 0; i--) {
    const nextIndex = s2 + i
    const nextChild = c2[nextIndex]
    // 锚点指向上一个更新的节点，如果 nextIndex 超过新子节点的长度，则指向 parentAnchor
    const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
    if (newIndexToOldIndexMap[i] === 0) {
      // 挂载新的子节点
      patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG)
    }
    else if (moved) {
      // 没有最长递增子序列（reverse 的场景）或者当前的节点索引不在最长递增子序列中，需要移动
      if (j < 0 || i !== increasingNewIndexSequence[j]) {
        move(nextChild, container, anchor, 2)
      }
      else {
        // 倒序递增子序列
        j--
      }
    }
  }
}
```

### 最长递增子序列LIS

最长递增子序列（longest increasing subsequence）问题是指，在一个给定的数值序列中，找到一个子序列，使得这个子序列元素的数值依次递增，并且这个子序列的长度尽可能地大。最长递增子序列中的元素在原序列中不一定是连续的。

主要思路：对数组遍历，依次求解长度为 i 时的最长递增子序列，当 i 元素大于 i - 1 的元素时，添加 i 元素并更新最长子序列；否则往前查找直到找到一个比 i 小的元素，然后插在该元素后面并更新对应的最长递增子序列。

>维护一个 result 列表表示 arr[] 中的最慢上升序列，遍历 nums，对于一个 arr[i]，若：
>
>1. arr[i] > result 的最后一个元素（即大于slow中的所有元素），就将加入到slow的最后面
>2. arr[i] <= result 的最后一个元素，我们就查找 result 列表中第一个大于等于 arr[i] 的数并替换它。由于非严格单调递增的序列，很容易的发现，可以使用二分法来查找这个数。这一步的时间复杂度便降到了log(n)
>3. 最终的 result 数组的长度就等于LIS的长度
>
>虽然最终能得到LIS的长度，但是slow列表明显不是一个 LIS，甚至连一个子序列都不是，因此需要辅助数组，在下面会有

假设我们有这个样一个数组 arr：[2, 1, 5, 3, 6, 4, 8, 9, 7]，最终求得最长递增子序列的值就是 [1, 3, 4, 8, 9]。

```js
function getSequence (arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    // 数组的第 i 项
    const arrI = arr[i]
    // 去掉值为 0 的干扰，因为 0 代表新子序列中的该节点在旧子序列中不存在，不应考虑在递增子序列中
    if (arrI !== 0) {
      // j 为 result 数组的最后一项，result里面存储的是下标
      j = result[result.length - 1]
      // 如果比上一个大，就是递增的，这时候需要push
      if (arr[j] < arrI) {
        // 存储在 result 更新前的最后一个索引的值
        p[i] = j
        result.push(i)
        // 并且注意此时直接进入下一次循环
        continue
      }
      u = 0
      v = result.length - 1
      // 二分搜索，查找比 arrI 小的节点，更新 result 的值
      while (u < v) {
        // | 0 向下取整
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        }
        else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          // 存储在 result 更新位置的前一个下标
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]

  // 回溯数组 p，找到最终的索引
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
```

在回溯之前的遍历过程

初始 result = [0]

|当前项|操作|result|p|
|-|-|-|-|
|arr[0] = 2|初始0|result = [0]|[*2*, 1, 5, 3, 6, 4, 8, 9, 7]|
|arr[1] = 1|1替换0|result = [1]|[2, *1*, 5, 3, 6, 4, 8, 9, 7]|
|arr[2] = 5|新增2|result = [1, 2]|[2, 1, *1*, 3, 6, 4, 8, 9, 7]|
|arr[3] = 3|3替换5|result = [1, 3]|[2, 1, 1, *1*, 6, 4, 8, 9, 7]|
|arr[4] = 6|新增4|result = [1, 3, 4]|[2, 1, 1, 1, *3*, 4, 8, 9, 7]|
|arr[5] = 4|4替换6|result = [1, 3, 5]|[2, 1, 1, 1, 3, *3*, 8, 9, 7]|
|arr[6] = 8|新增6|result = [1, 3, 5, 6]|[2, 1, 1, 1, 3, 3, *5*, 9, 7]|
|arr[7] = 9|新增7|result = [1, 3, 5, 6, 7]|[2, 1, 1, 1, 3, 3, 5, *6*, 7]|
|arr[8] = 7|7替换8|result = [1, 3, 5, 8, 7]|[2, 1, 1, 1, 3, 3, 5, 6, *5*]|

LIS的长度 = result 的长度 = 5

其中 result 存储的是长度为 i 的递增子序列最小末尾值的索引。比如我们上述例子的第九步，在对数组 p 回溯之前， result 值就是 [1, 3, 4, 7, 9] ，这不是最长递增子序列，它只是存储的对应长度递增子序列的最小末尾。因此在整个遍历过程中会额外用一个数组 p，来存储在每次更新 result 前最后一个索引的值，并且它的 key 是这次要更新的 result 值，数组p的值会在新增以及替换的时候更新，<!-- 不管是新增还是替换，都会记下发生更新位置的前一项下标，这样就可以在回溯时串起来。 -->

```js
j = result[result.length - 1]
p[i] = j
result.push(i)
```

可以看到，result 添加的新值 i 是作为 p 存储 result 最后一个值 j 的 key，这样就建立了 result 中每一项与 p 中的联系。上述例子遍历后 p 的结果如图所示：

p       2   1   1   1   3   3   5   6   5
index   0   1   2   3   4   5   6   7   8

从 result 最后一个元素 9 对应的索引 7 开始回溯，可以看到 p[7] = 6，p[6] = 5，p[5] = 3，p[3] = 1，所以通过对 p 的回溯，得到最终的 result 值是 [1, 3 ,5 ,6 ,7]，也就找到最长递增子序列的最终索引了。这里要注意，我们求解的是最长子序列索引值，它的每个元素其实对应的是数组的下标。对于我们的例子而言，[2, 1, 5, 3, 6, 4, 8, 9, 7] 的最长子序列是 [1, 3, 4, 8, 9]，而我们求解的 [1, 3 ,5 ,6 ,7] 就是最长子序列中元素在原数组中的下标所构成的新数组。

## Todo：组件更新流程总结

1. 组件更新分为两种：一种是组件本身的数据变化，另一种是父组件在更新的过程中，遇到子组件节点，先判断子组件是否需要更新，如果需要则主动执行子组件的重新渲染方法，而 patch 函数就负责 vnode 的挂载与更新
2. 进入 patch 函数后，会根据节点类型的不同，走不同的处理逻辑，主要看处理组件节点与普通 DOM 节点的方法processComponent，processElement。
3. processComponent 中会分别处理挂载与更新的逻辑，更新用到的是 updateComponent
  3.1 updateComponent 方法中首先会判断新旧节点是否需要更新，如果需要更新就会触发 instance.update 方法，这个方法是在挂载时定义的响应式方法，在执行之前会将 instance 的 next 属性 设置为新的 vnode，以此来区分是父节点更新产生的变化还是组件内部状态发生变化导致的更新
  3.2 在 instance.next 存在的情况下，会执行 updateComponentPreRender 方法，来更新组件 vnode 节点信息，比如 props, slots等等
  3.3 而如果是组件自身内部状态发生变化，就不是由 patch 函数进入了，而是直接走 instance.update 方法，因为它是响应式的，此时 instance.next 是 null，以此时的 vnode 作为 next
  3.4 然后渲染新的子树 vnode、根据新旧子树 vnode 执行 patch 逻辑
4. processElement 是处理普通元素节点 vnode 时的主要方法，更新用到的是 patchElement 方法
  4.1 patchElement 方法，主要做的是更新 props 和更新子节点
  4.2 更新子节点是 patchChildren 方法，这里面会对新旧子节点不同情况进行处理，组合后一共有9种情况，其中最复杂的是新旧节点都为 vnode 数组的情况，此时就要通过 diff 算法
5. diff 算法主要分为下面这几步，其中主要通过 key 来分辨是否为同一个节点
  5.1 同步头部节点
  5.2 同步尾部节点
  5.3 添加新的节点
  5.4 删除多余节点
  5.5 处理未知子序列
  5.6 处理未知子序列中首先建立索引图，来确定需要更新和移除的旧节点
  5.7 然后通过最长递增子序列算法确定需要移动和挂载的新节点，并移动挂载
