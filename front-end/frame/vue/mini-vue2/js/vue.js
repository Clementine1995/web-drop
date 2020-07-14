class Vue {
  constructor(options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    // 因为传入的可能是 选择器 也就是一个string，也有可能是一个真实的 dom，分别做下面的处理
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把 data 中的成员转换成getter/setter
    this._proxyData(this.$data)

    // 3. 调用 observer 对象监听数据变化
    new Observer(this.$data)
    // 4. 调用 compiler 对象，解析指令和插值表达式

    new Compiler(this)
  }
  _proxyData (data) {
    // 代理数据，遍历data中的所有属性，把data中的属性注入到vue实例中

    Object.keys(data).forEach(key => {
      // 注意这里是 箭头函数 因为这里拿到的就是 当前的 vue实例，_proxyData 是在上面构造函数中通过 this 调用的
      // 不是箭头函数的话，拿到的是 window ？要试一下，实测打印的是 undefined
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}
