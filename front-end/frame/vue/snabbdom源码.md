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
