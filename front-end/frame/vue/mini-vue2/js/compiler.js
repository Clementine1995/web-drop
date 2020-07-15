class Compiler {
  constructor(vm) {
    this.el = vm.$el
    this.vm = vm

    this.compiler(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compiler(el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if (this.isTextNode(node)) {
        this.compilerText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compilerElement(node)
      }

      // 判断 node 节点是否有子节点，如果有子节点，递归调用
      if (node.childNodes && node.childNodes.length) {
        this.compiler(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compilerElement(node) {
    // console.log(node.attributes)

    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        // v-text --> text

        attrName = attrName.substr(2)
        // 获取属性的值
        let key = attr.value

        this.update(node, key, attrName)
      }
    })
  }

  update (node, key, attrName) {
    let updateFn = this[`${attrName}Updater`]
    // 为什么要用call，直接执行 updateFn 的话 
    // this 是由 updateFn 的调用者决定的，直接调用是没有的
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }
  // 处理v-text指令
  textUpdater(node, value, key) {
    node.textContent = value

    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  modelUpdater(node, value, key) {
    node.value = value

    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    // 针对表单元素（绑定v-model的）绑定事件，来处理变化后来更新数据的逻辑，也就是双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  // 编译文本节点，处理插值表达式
  compilerText(node) {
    // {{ msg }} 利用正则提取
    let reg = /\{\{(.+?)\}\}/

    let value = node.textContent

    if (reg.test(value)) {
      // RegExp.$1 是个啥玩意
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])

      // 创建watcher对象，当数据改变更新视图
      // 为什么要写在这里，因为数据更新是发生在这里的
      // 而watcher需要的 cb 正是用来更新视图的
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
    }
  }
  // 判断元素属性是否为指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  // 判断传入节点是否为文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }
  // 判断节点是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
}