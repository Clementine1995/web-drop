class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    // data中的属性名称
    this.key = key
    // 回调函数负责更新视图
    this.cb = cb
    
    // 把当前的 watcher 对象记录到 Dep类的静态属性target中
    Dep.target = this
    // 触发get方法，在get方法中会调用 addSub
    // 在下面访问旧值的时候，也就是 vm[key]，其实已经触发了get方法，在 observer 中把这个 watcher 存了起来

    this.oldValue = vm[key]
    // 防止重复触发
    Dep.target = null
  }
  // 当数据发生变化的时候更新视图
  update() {
    // 在update 调用的时候 value 是已经更新过的了
    let newValue = this.vm[this.key]
    if (this.oldValue === newValue) {
      return
    }
    // cb更新视图的时候需要一个最新的值
    this.cb(newValue)
  }
}