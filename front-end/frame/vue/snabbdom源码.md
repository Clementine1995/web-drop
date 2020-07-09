# Snabbdom源码

## h函数

```ts
export function h (sel: any, b?: any, c?: any): VNode {
  var data: VNodeData = {}
  var children: any
  var text: any
  var i: number
  // 处理有三个参数的情况
  if (c !== undefined) {
    // sel,data,children/text
    if (b !== null) {
      data = b // data中存储模块需要用的值，props,styles等
    }
    if (is.array(c)) { // 如果c是数组，表示c是子元素，存储到children中
      children = c
    } else if (is.primitive(c)) { // 如果c是原始值（字符串或者文字），存到text中
      text = c
    } else if (c && c.sel) { // 如果c还是一个vnode，转换成数组传给children
      children = [c]
    }
  } else if (b !== undefined && b !== null) { // 处理两个参数的情况，跟上面差不多
    if (is.array(b)) {
      children = b
    } else if (is.primitive(b)) {
      text = b
    } else if (b && b.sel) {
      children = [b]
    } else { data = b } // 既不是数组，也不是原始值也不是vnode就用做模块需要
  }
  if (children !== undefined) {
    // 处理children中的原始值（string/number）
    for (i = 0; i < children.length; ++i) {
      // 如果child是string/number，通过vnode函数创建文本节点
      if (is.primitive(children[i])) children[i] = vnode(undefined, undefined, undefined, children[i], undefined)
    }
  }
  if (
    sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
    (sel.length === 3 || sel[3] === '.' || sel[3] === '#')
  ) { // 如果是svg要定义命名空间
    addNS(data, children, sel)
  }
  // 返回vnode
  return vnode(sel, data, children, text, undefined)
};
```

## vnode函数

```ts
export interface VNode {
  // 传入的选择器
  sel: string | undefined
  // 节点数据：属性|样式|事件等等
  data: VNodeData | undefined
  // 子节点，和text只能互斥
  children: Array<VNode | string> | undefined
  // 记录vnode对应的真实 DOM
  elm: Node | undefined
  // 节点中的内容，和children只能互斥
  text: string | undefined
  // 优化用
  key: Key | undefined
}

export function vnode (sel: string | undefined,
  data: any | undefined,
  children: Array<VNode | string> | undefined,
  text: string | undefined,
  elm: Element | Text | undefined): VNode {
  const key = data === undefined ? undefined : data.key
  return { sel, data, children, text, elm, key }
}
```

## init函数

init函数会返回一个patch函数

```js
const hooks: Array<keyof Module> = ['create', 'update', 'remove', 'destroy', 'pre', 'post']

export function init (modules: Array<Partial<Module>>, domApi?: DOMAPI) {
  // ...
  // 不传domApi时，默认为htmlDomApi，它是snabbdom提供的一些默认的dom操作api的封装
  // 初始化转换虚拟节点的api
  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi
  // modules 导出的对象都实现了 Module 类型，这个类型定义了模块要有上面 hooks 里面的一种或几种钩子的实现
  // 把传入的所有模块的的钩子函数，统一存储到 cbs 对象中
  // 最终构建的 cbs 对象的形式 cbs = { create: [fn1, fn2], update: [], ... }
  for (i = 0; i < hooks.length; ++i) {
    // cbs.create = [], cbs.update = [] ...
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      // modules 传入的模块数组
      // 取模块中的 hook 函数
      // hook = modules[0][create]
      const hook = modules[j][hooks[i]]
      if (hook !== undefined) {
        // 把获取到的 hook 函数放入到 cbs 对应的函数数组中
        (cbs[hooks[i]] as any[]).push(hook)
      }
    }
  }
  // ...

  // init 内部返回patch函数，把vnode渲染成真实dom，并返回vnode
  return function patch (oldVnode: VNode | Element, vnode: VNode): VNode {
    // ...
  }
}
```

## patch函数

patch的整体过程

+ patch(oldVnode, newVnode)
+ 把新节点中变化的内容渲染到真实DOM，最后返回新节点作为下一次处理的旧节点
+ 对比新旧VNode是否为相同节点(节点的key和sel是否相同)
+ 如果不是相同的节点，删除之前的内容，重新渲染
+ 如果是相同的节点，再判断新的VNode是否有text，如果有并且和 oldVnode 的text不相同，直接更新文本内容
+ 如果新的 VNode 有 children，判断子节点是否有变化，判断子节点变化的过程就是 diff 算法
+ diff 过程只进行同级比较

```js
function isVnode (vnode: any): vnode is VNode {
  return vnode.sel !== undefined
}
// 创建一个空的没有子节点的 vnode
function emptyNodeAt (elm: Element) {
  const id = elm.id ? '#' + elm.id : ''
  const c = elm.className ? '.' + elm.className.split(' ').join('.') : ''
  return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm)
}
// 仅仅是判断 key 与 sel是否相同
function sameVnode (vnode1: VNode, vnode2: VNode): boolean {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
}

function patch (oldVnode: VNode | Element, vnode: VNode): VNode {
  let i: number, elm: Node, parent: Node
  // 保存新插入节点的队列，为了触发钩子函数
  const insertedVnodeQueue: VNodeQueue = []
  // 执行模块的pre钩子函数
  for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()
  // 如果 oldVnode 不是 Vnode，创建 Vnode并设置 elm，判断是否为虚拟节点，就是通过sel来判断
  if (!isVnode(oldVnode)) {
    // 因为patch第一个参数可以是真实dom也可以是虚拟dom，这里就是把 dom 转换成空的vnode
    oldVnode = emptyNodeAt(oldVnode)
  }
  // 如果新旧节点是相同的节点(key 和 sel 相同)
  if (sameVnode(oldVnode, vnode)) {
    // 找节点差异并更新 DOM
    patchVnode(oldVnode, vnode, insertedVnodeQueue)
  } else {
    // 如果新旧节点不同，vnode创建对应的DOM
    // 获取当前的DOM元素
    elm = oldVnode.elm!
    parent = api.parentNode(elm) as Node
    // 创建 vnode 对应的 DOM元素，并触发 init/create 钩子函数
    createElm(vnode, insertedVnodeQueue)

    if (parent !== null) {
      // 如果父节点不为空，把vnode对应的 DOM 插入到文档中（位置在老节点之后）
      api.insertBefore(parent, vnode.elm!, api.nextSibling(elm))
      // 移除老节点
      removeVnodes(parent, [oldVnode], 0, 0)
    }
  }
  // 执行用户设置的 insert 钩子函数
  for (i = 0; i < insertedVnodeQueue.length; ++i) {
    insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i])
  }
  // 执行模块的 post 钩子函数
  for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
  // 返回vnode
  return vnode
}
```

## createElm

创建 vnode 对应的 DOM元素，并触发 init/create 钩子函数

```js
const emptyNode = vnode('', {}, [], undefined, undefined)

function createElm (vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
  let i: any
  let data = vnode.data
  // data也就是h函数创建vnode时传进来的用于模块的数据，style，props之类的
  if (data !== undefined) {
    // 执行用户设置的 init 钩子函数
    const init = data.hook?.init
    if (isDef(init)) { // 判断init是否已经定义，isDef 就是判断不等于 undefined
      init(vnode)
      data = vnode.data
    }
  }
  // 把 vnode 转换成真实的 DOM 对象（没有渲染到页面）
  const children = vnode.children
  const sel = vnode.sel
  if (sel === '!') { // 如果为 ! 创建注释节点
    if (isUndef(vnode.text)) { // isUndef 就是判断等于 undefined
      vnode.text = '' // 确保能成功调用createComment方法
    }
    vnode.elm = api.createComment(vnode.text!)
  } else if (sel !== undefined) { // 如果不为 undefined，创建对应的节点
    // 解析选择器，因为调用h函数时，可能传入id选择器，类选择器之类的
    const hashIdx = sel.indexOf('#')
    const dotIdx = sel.indexOf('.', hashIdx)
    const hash = hashIdx > 0 ? hashIdx : sel.length
    const dot = dotIdx > 0 ? dotIdx : sel.length
    // 拿标签名
    const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel
    // data是否有定义，并且ns有值的话就创建带有命名空间的元素，一般是svg，否则就创建正常的元素
    const elm = vnode.elm = isDef(data) && isDef(i = data.ns)
      ? api.createElementNS(i, tag)
      : api.createElement(tag)
    // 设置id与class
    if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot))
    if (dotIdx > 0) elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '))
    // 执行模块的 create 钩子函数
    for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)

    // 如果vnode中有子节点，创建子 vnode 对应的 DOM 元素并追加到 DOM 树上
    if (is.array(children)) {
      for (i = 0; i < children.length; ++i) {
        const ch = children[i]
        if (ch != null) {
          // 递归调用 createElm，转换子节点也为 vnode，并追加到 elm 上
          api.appendChild(elm, createElm(ch as VNode, insertedVnodeQueue))
        }
      }
    } else if (is.primitive(vnode.text)) { // 如果text是 number 或者 string，直接作为文本节点追加
      api.appendChild(elm, api.createTextNode(vnode.text))
    }
    const hook = vnode.data!.hook
    if (isDef(hook)) {
      // 执行用户传入的钩子 create
      hook.create?.(emptyNode, vnode)
      if (hook.insert) {
        // 把 vnode 添加到队列中，为后续执行 insert 钩子做准备
        insertedVnodeQueue.push(vnode)
      }
    }
  } else { // 如果选择器为空，创建文本节点，对应vnode text有值的情况
    vnode.elm = api.createTextNode(vnode.text!)
  }
  return vnode.elm
}
```

## removeVnodes

```js
function removeVnodes (parentElm: Node,
  vnodes: VNode[],
  startIdx: number,
  endIdx: number): void {
  for (; startIdx <= endIdx; ++startIdx) {
    let listeners: number
    let rm: () => void
    // 获取vnodes中的每一个值，并赋给 ch
    const ch = vnodes[startIdx]
    if (ch != null) {
      if (isDef(ch.sel)) { // 如果 sel有值，是元素节点
        // 执行 destroy 钩子函数（会执行所有子节点的 destroy 钩子函数）
        invokeDestroyHook(ch)
        // remove回调可能有很多，防止真正移除 DOM 的函数执行多次，可以见下面的 createRmCb 的实现
        listeners = cbs.remove.length + 1
        // 创建删除的回调函数
        rm = createRmCb(ch.elm!, listeners)
        // 执行 remove 钩子函数
        for (let i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm)
        // 执行用户设置的 remove 钩子函数
        const removeHook = ch?.data?.hook?.remove
        if (isDef(removeHook)) {
          removeHook(ch, rm)
        } else {
          // 如果没有用户钩子函数，直接调用删除元素的方法
          rm()
        }
      } else { // Text node
        // 如果是文本节点，直接调用删除元素的方法
        api.removeChild(parentElm, ch.elm!)
      }
    }
  }
}
function invokeDestroyHook (vnode: VNode) {
  const data = vnode.data
  if (data !== undefined) {
    // 执行用户设置的 destroy 钩子函数
    data?.hook?.destroy?.(vnode)
    // 调用模板的 destory 钩子函数
    for (let i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
    // 执行子节点的 destroy 钩子函数
    if (vnode.children !== undefined) {
      for (let j = 0; j < vnode.children.length; ++j) {
        const child = vnode.children[j]
        if (child != null && typeof child !== 'string') {
          invokeDestroyHook(child)
        }
      }
    }
  }
}
function createRmCb (childElm: Node, listeners: number) {
  // 返回删除元素的回调函数
  return function rmCb () {
    if (--listeners === 0) {
      // 只有在所有 remove 钩子都执行完后，才会移除该节点
      const parent = api.parentNode(childElm) as Node
      api.removeChild(parent, childElm)
    }
  }
}
```

## addVnodes

```js
function addVnodes (
  parentElm: Node,
  before: Node | null, // 参考元素
  vnodes: VNode[],
  startIdx: number,
  endIdx: number,
  insertedVnodeQueue: VNodeQueue
) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (ch != null) {
      // 如果不为null ，首先将该节点转换为真实的 dom，并插入到父节点中
      api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before)
    }
  }
}
```

## patchVnode

patchVnode 的整体过程，会更新 DOM

1. 触发prepatch钩子函数
2. 触发update钩子函数
3. 新节点有 text 属性，且不等于旧节点的 text 属性
    1. 如果老节点有children， 移除老节点children对应的DOM元素
    2. 设置新节点对应 DOM 元素的 textContent
4. 新老节点都有 children 且不相等
    1. 调用 updateChildren()
    2. 对比子节点，并且更新子节点的差异
5. 只有新节点有 children 属性
    1. 如果老节点有 text 属性，清空对应 DOM元素的 textContent
    2. 添加所有子节点
6. 只有老节点有children属性，就移除所有的老节点
7. 只有老节点有 text 属性，清空对应DOM元素的 textContent
8. 触发 postpatch 钩子函数

```js
function patchVnode (oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
  // 首先执行用户设置的 prepatch 钩子函数
  const hook = vnode.data?.hook
  hook?.prepatch?.(oldVnode, vnode)
  // 把老节点的 elm 赋值给 新节点的 elm，并保存在 elm 中
  const elm = vnode.elm = oldVnode.elm!
  // 存储新旧节点的 children
  const oldCh = oldVnode.children as VNode[]
  const ch = vnode.children as VNode[]
  // 如果新老 vnode 相同返回
  if (oldVnode === vnode) return
  if (vnode.data !== undefined) {
    // 执行模块的 update 钩子函数
    for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    // 执行用户设置的 update 钩子函数，只会在新老 vnode 不相同并且正式开始对比之前执行，而prepatch进来就执行了
    vnode.data.hook?.update?.(oldVnode, vnode)
  }
  // 如果 vnode.text 未定义
  if (isUndef(vnode.text)) {
    // 如果新老节点都有children
    if (isDef(oldCh) && isDef(ch)) {
      // 使用 diff 算法对比子节点，更新子节点
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue)
    } else if (isDef(ch)) {
      // 如果新节点有children，老节点没有children
      // 如果老节点有text，清空 dom 元素的内容
      if (isDef(oldVnode.text)) api.setTextContent(elm, '')
      // 批量添加子节点
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      // 如果老节点有children，新节点没有children
      // 批量移除老节点的子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      // 如果老节点有 text，清空 DOM元素
      api.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    // 如果没有设置 vnode.text
    if (isDef(oldCh)) {
      // 如果老节点有 children 移除
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    }
    api.setTextContent(elm, vnode.text!)
  }
  // 最后执行用户设置的 postpatch 钩子函数
  hook?.postpatch?.(oldVnode, vnode)
}

function updateChildren (parentElm: Node,
  oldCh: VNode[],
  newCh: VNode[],
  insertedVnodeQueue: VNodeQueue) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx: KeyToIndexMap | undefined
  let idxInOld: number
  let elmToMove: VNode
  let before: any

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode might have been moved left
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx]
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      api.insertBefore(parentElm, oldStartVnode.elm!, api.nextSibling(oldEndVnode.elm!))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      api.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      }
      idxInOld = oldKeyToIdx[newStartVnode.key as string]
      if (isUndef(idxInOld)) { // New element
        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm!)
      } else {
        elmToMove = oldCh[idxInOld]
        if (elmToMove.sel !== newStartVnode.sel) {
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm!)
        } else {
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined as any
          api.insertBefore(parentElm, elmToMove.elm!, oldStartVnode.elm!)
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }
}
```