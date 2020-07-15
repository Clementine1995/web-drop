class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    // 1. 判断 data 是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 2. 遍历 data 对象的所有属性，并调用defineReactive将其转换为响应式
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive(obj, key, val) {
    let that = this

    // 负责收集依赖并发送通知
    let dep = new Dep()
    // 如果val此时是对象，会把val内部的属性也转换成响应式数据
    this.walk(val)
    // 为啥 defineReactive 需要第三个参数 val 呢？
    // 下面如果直接访问 object[key] 就会再次触发下面定义的 get，造成死循环，所以需要第三个参数
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set (newValue) {
        if (newValue === value) {
          return
        }
        val = newValue
        // 为什么要有这一步？因为有可能把一个本来是字符串的属性，重新赋值一个对象
        // 这个时候新赋值的对象也需要转换成响应式的，所以有这一步
        // 但是这里直接通过 this 是调用不到Observer实例的，因为这是在 set 里面调用，它是一个function
        // 所以用先存储过的 that 调用
        that.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}