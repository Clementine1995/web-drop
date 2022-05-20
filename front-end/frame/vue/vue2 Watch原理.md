# Watch 原理

> [【Vue 原理】Watch - 源码版](https://zhuanlan.zhihu.com/p/62733342)

1. 什么时候初始化
2. 怎么确定监听哪些值
3. 深度监听怎么回事
4. 怎么触发传入函数

## 什么时候初始化

首先，从这个问题开始，看源码

```js
function Vue() {
  // ... 其他处理
  initState(this)
  // ...解析模板，生成DOM 插入页面
}

function initState(vm) {
  // ...处理 data，props，computed 等数据
  if (opts.watch) {
    initWatch(this, vm.$options.watch)
  }
}
```

当调用 Vue 创建实例过程中，会去处理各种选项，其中包括处理 watch

### initWatch

处理 watch 的方法是 initWatch，下面是源码

```js
function initWatch(vm, watch) {
  for (var key in watch) {
    var watchOpt = watch[key]
    createWatcher(vm, key, handler)
  }
}
```

这段源码只是简简单单的一个遍历，然后每个 watch 都使用 createWatcher 去处理，createWatcher 源码：

```js
function createWatcher(
  // expOrFn 是 key，handler 可能是对象
  vm,
  expOrFn,
  handler,
  opts
) {
  // 监听属性的值是一个对象，包含handler，deep，immediate
  if (typeof handler === "object") {
    opts = handler
    handler = handler.handler
  }
  // 回调函数是一个字符串，从 vm 获取
  if (typeof handler === "string") {
    handler = vm[handler]
  }
  // expOrFn 是 key，options 是watch 的全部选项
  vm.$watch(expOrFn, handler, opts)
}
```

做了两件事：

1. 获取到监听回调
2. 调用 vm.$watch

#### 获取监听回调

首先，传入的 watch 配置可能是这三种

```js
watch: {
  name: {
    handler() {}
  },
  name() {},
  name: "getname"
}
```

如果配置是个对象，就取 handler 字段

如果配置是函数，那么直接就是 监听回调

如果配置是字符串，从实例上获取函数

#### 调用 vm.$watch

先看源码

```js
Vue.prototype.$watch = function (
  // expOrFn 是 监听的 key，cb 是监听回调，opts 是所有选项
  expOrFn,
  cb,
  opts
) {
  // expOrFn 是 监听的 key，cb 是监听的回调，opts 是 监听的所有选项
  var watcher = new Watcher(this, expOrFn, cb, opts)
  // 设定了立即执行，所以马上执行回调
  if (opts.immediate) {
    cb.call(this, watcher.value)
  }
}
```

- 判断是否立即执行监听回调

如果你设置了 immediate 的话，表示不用等数据变化，初始化时马上执行一遍，执行的代码就是直接调用回调，绑定上下文，传入监听值

- 每个 watch 配发 watcher

看看 Watcher 的源码

```js
var Watcher = function (vm, key, cb, opt) {
  this.vm = vm
  this.deep = opt.deep
  this.cb = cb
  // 这里省略处理 xx.xx.xx 这种较复杂的key
  this.getter = function (obj) {
    return obj[key]
  }
  // this.get 作用就是执行 this.getter函数
  this.value = this.get()
}
```

再看看，新建 watcher 的时候 ，传入了什么

1. 监听的 key
2. 监听回调 （Watch 中的 cb）
3. 监听配置的 options

这里会涉及到三个问题，现在来解释

1、怎么对设置的 key 进行监听？

要先对 Watch 中的 this.getter 的函数进行理解，它的本质是为了获取对象的 key 值

然后 getter 是在 watcher.get 中执行的，看下 get 源码

```js
// 对本问题进行了独家简单化的源码
Watcher.prototype.get = function () {
  var value = this.getter(this.vm)
  return value
}
```

Watch 在结尾会立即执行一次 watcher.get，其中便会执行 getter，便会根据你监听的 key，去实例上读取并返回，存放在 watcher.value 上。

首先，watch 初始化之前，data 应该初始化完毕了，每个 data 数据都已经是响应式的，使用例子来说明一下

```js
data() {
  return {
    name: 111
  }
},
watch: {
  name() {}
}
```

当 watch.getter 执行，而读取了 vm.name 的时候，name 的依赖收集器就会收集到 watch-watcher

于是 name 变化的时候，会可以通知到 watch，监听就成功了

2、如何进行深度监听？

首先，深度监听，是设置了 deep 的时候，然后，观察上面的 Watch 源码，deep 会保存在 watcher 中，以便后用

上一问题说过，在 新建 watcher 的时候，会马上执行一个 get，上个问题的 get 源码简化很多，把 处理深度监听的部分去掉了，这里露出来了

```js
Watcher.prototype.get = function () {
  Dep.target = this

  var value = this.getter(this.vm)

  if (this.deep) traverse(value)

  Dep.target = null
  return value
}
```

没错，处理深度监听只有一条语句！

```js
if (this.deep) traverse(value)
```

value 是 getter 从实例上读取监听 key 得到的值，但是 traverse 是什么？

```js
function traverse(val) {
  var i, keys

  // 数组逐个遍历
  if (Array.isArray(val)) {
    i = val.length
    // val[i] 就是读取值了，然后值的对象就能收集到 watch-watcher
    while (i--) {
      traverse(val[i])
    }
  } else {
    keys = Object.keys(val)
    i = keys.length
    // val[keys[i]] 就是读取值了，然后值的对象就能收集到 watch-watcher
    while (i--) {
      traverse(val[keys[i]])
    }
  }
}
```

这段代码长，做的就是一个事情，不断递归深入读取对象

因为读取，就可以让这个属性收集到 watch-watcher 的原则

就算是深层级的对象，其中的每个属性也都是响应式的，每个属性都有自己的依赖收集器

通过不断深入的读取每个属性，这样每个属性就都可以收集到 watch-watcher 了

这样不管对象内多深的属性变化，都会通知到 watch-watcher

于是这样就完成了深度监听

3、监听值变化，如何触发监听函数？

通过上面的问题，我们已经了解了大部分了

监听的数据变化的时候，就能通知 watch-watcher 更新，所谓通知更新，就是手动调用 watch.update

速度看下 watcher.update 源码

```js
Watcher.prototype.update = function () {
  var value = this.get()

  if (value !== this.value || isObject(value) || this.deep) {
    var oldValue = this.value
    this.value = value

    // cb 是监听回调
    this.cb.call(this.vm, value, oldValue)
  }
}
```

很简单嘛，就是读取一遍值，如果值发生了变化，保存新值，接着调用监听回调，并传入新值和旧值
