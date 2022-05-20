# Computed 计算属性原理

> 原文[【Vue 原理】Computed - 源码版](https://zhuanlan.zhihu.com/p/62732142)

## Computed 什么时候初始化

```js
function Vue() {
  // ... 其他处理
  initState(this)
  // ...解析模板，生成DOM 插入页面
}

function initState(vm) {
  var opts = vm.$options
  if (opts.computed) {
    initComputed(vm, opts.computed)
  }
  // .....
}
```

当调用 Vue 创建实例过程中，会去处理各种选项，其中包括处理 computed，处理 computed 的方法是 initComputed，下面是源码：

```js
function initComputed(vm, computed) {
  var watchers = (vm._computedWatchers = Object.create(null))

  for (var key in computed) {
    var userDef = computed[key]
    var getter = typeof userDef === "function" ? userDef : userDef.get
    // 每个 computed 都创建一个 watcher
    // watcher 用来存储计算值，判断是否需要重新计算
    watchers[key] = new Watcher(vm, getter, {
      lazy: true,
    })

    // 判断是否有重名的属性
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    }
  }
}
```

initComputed 这段代码做了几件事

1. 每个 computed 配发 watcher
2. defineComputed 处理
3. 收集所有 computed 的 watcher，存放到 `vm._computedWatchers` 中

### 每个 computed 配发 watcher

computed 到底和 watcher 有什么关系呢？

1. 保存 computed 计算函数
2. 保存计算结果
3. 控制缓存计算结果是否有效

看下 Watcher 源码构造函数：

```js
function Watcher(vm, expOrFn, options) {
  this.dirty = this.lazy = options.lazy
  this.getter = expOrFn
  this.value = this.lazy ? undefined : this.get()
}
```

从这段源码中，再看 computed 传了什么参数 `new Watcher(vm, getter, { lazy: true })`

于是，就知道了上面说的三个关系是怎么回事。

1、保存设置的 getter。

把用户设置的 computed-getter，存放到 watcher.getter 中，用于后面的计算

2、watcher.value 存放计算结果，但是这里有个条件，因为 lazy 的原因，不会新建实例并马上读取值

这里可以算是 Vue 的一个优化，只有你再读取 computed，再开始计算，而不是初始化就开始计算值了

虽然没有一开始计算，但是计算 value 还是这个 watcher.get 这个方法，来看下源码（已省略部分代码，下面讲其他问题，会更详细展示出来）

这个方法，其实就是执行 保存的 getter 函数，从而得到计算值，非常简单

```js
Watcher.prototype.get = function () {
  // getter 就是 watcher 回调
  var value = this.getter.call(vm, vm)
  return value
}
```

3、computed 新建 watcher 的时候，传入 lazy

没错，作用是把计算结果缓存起来，而不是每次使用都要重新计算

而这里呢，还把 lazy 赋值给了 dirty，为什么呢？

因为 lazy 表示一种固定描述，不可改变，表示这个 watcher 需要缓存

而 dirty 表示缓存是否可用，如果为 true，表示缓存脏了，需要重新计算，否则不用

dirty 默认是 false 的，而 lazy 赋值给 dirty，就是给一个初始值，表示 你控制缓存的任务开始了

所以记住，【dirty】 是真正的控制缓存的关键，而 lazy 只是起到一个开启的作用

具体，怎么控制缓存，下面会说

### defineComputed 处理

```js
function defineComputed(target, key, userDef) {
  // 设置 set 为默认值，避免 computed 并没有设置 set

  var set = function () {}
  //  如果用户设置了set，就使用用户的set

  if (userDef.set) set = userDef.set

  Object.defineProperty(target, key, {
    // 包装get 函数，主要用于判断计算缓存结果是否有效
    get: createComputedGetter(key),
    set: set,
  })
}
```

源码已经被简短很多，但是意思是不变的

1. 使用 Object.defineProperty 在 实例上 computed 属性，所以可以直接访问
2. set 函数默认是空函数，如果用户设置，则使用用户设置
3. createComputedGetter 包装返回 get 函数

重点就在第三点，为什么重要？下面 createComputedGetter 源码：

```js
function createComputedGetter(key) {
  return function () {
    // 获取到相应 key 的 computed-watcher
    var watcher = this._computedWatchers[key]
    // 如果 computed 依赖的数据变化，dirty 会变成true，从而重新计算，然后更新缓存值 watcher.value
    if (watcher.dirty) {
      watcher.evaluate()
    }
    // 这里是 computed 牵线的重点，让双方建立关系
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}
```

#### 缓存控制

下面这段代码作用就是缓存控制，请往下看

```js
if (watcher.dirty) {
  watcher.evaluate()
}
```

1、watcher.evaluate 用来重新计算，更新缓存值，并重置 dirty 为 false，表示缓存已更新，下面是源码

```js
Watcher.prototype.evaluate = function () {
  this.value = this.get()
  // 执行完更新函数之后，立即重置标志位
  this.dirty = false
}
```

2、只有 dirty 为 true 的时候，才会执行 evaluate，所以说通过控制 dirty 从而控制缓存，但是怎么控制 dirty 呢？

先说一个设定，computed 数据 A 引用了 data 数据 B，即 A 依赖 B，所以 B 会收集到 A 的 watcher，当 B 改变的时候，会通知 A 进行更新，即调用 A-watcher.update，看下源码

```js
Watcher.prototype.update = function () {
  if (this.lazy) this.dirty = true
  // ....还有其他无关操作，已被省略
}
```

当通知 computed 更新的时候，就只是 把 dirty 设置为 true，从而 读取 comptued 时，便会调用 evalute 重新计算

#### 牵线

牵线的意思，这里简单说一下

现有 页面 P，computed C，data D

1. P 引用了 C，C 引用了 D
2. 理论上 D 改变时， C 就会改变，C 则通知 P 更新。
3. 实际上 C 让 D 和 P 建立联系，让 D 改变时直接通知 P

没错，就是下面这段代码搞的鬼

```js
if (Dep.target) {
  watcher.depend()
}
```

你别看这段代码短啊，涉及的内容真不少啊且需要点脑筋的，看源码分分钟绕不过来，真的服尤大怎么写出来的

来看看 watcher.depend 的源码

```js
Watcher.prototype.depend = function () {
  var i = this.deps.length

  while (i--) {
    // this.deps[i].depend();
    dep.addSub(Dep.target)
  }
}
```

这段的作用就是！（依然使用上面的例子 PCD 代号来说明）

让 D 的依赖收集器收集到 Dep.target，而 Dep.target 当前是什么？

没错，就是 页面 的 watcher！

所以这里，D 就会收集到 页面的 watcher 了，所以就会直接通知 页面 watcher

为什么 Dep.target 是 页面 watcher？

这里内容就有点多了有点繁杂了，下面是源码：

```js
Watcher.prototype.get = function () {
  // 改变 Dep.target
  pushTarget()
  // getter 就是 watcher 回调
  var value = this.getter.call(this.vm, this.vm)
  // 恢复前一个 watcher
  popTarget()
  return value
}

Dep.target = null

var targetStack = []

function pushTarget(_target) {
  // 把上一个 Dep.target 缓存起来，便于后面恢复
  if (Dep.target) {
    targetStack.push(Dep.target)
  }
  Dep.target = _target
}

function popTarget() {
  Dep.target = targetStack.pop()
}
```

注解几个词

1. 页面 watcher.getter 保存 页面更新函数，computed watcher.getter 保存 计算 getter
2. watcher.get 用于执行 watcher.getter 并 设置 Dep.target
3. Dep.target 会有缓存

下面开始 牵线的 详细流程

1、页面更新，读取 computed 的时候，Dep.target 会设置为 页面 watcher。

2、computed 被读取，createComputedGetter 包装的函数触发，第一次会进行计算

computed-watcher.evaluted 被调用，进而 computed-watcher.get 被调用，Dep.target 被设置为 computed-watcher，旧值 页面 watcher 被缓存起来。

3、computed 计算会读取 data，此时 data 就收集到 computed-watcher

同时 computed-watcher 也会保存到 data 的依赖收集器 deps 中。并且会把 data 的 deps 保存到 computed-watcher 的 deps 中

computed 计算完毕，释放 Dep.target，并且 Dep.target 恢复上一个 watcher（页面 watcher）

4、手动 watcher.depend，因为之前保存了 data 的 deps，让 data 再收集一次 Dep.target，于是 data 又收集到 恢复了的页面 watcher

再额外记一个 data 改变后续流程

综上，此时 data 的依赖收集器=【computed-watcher，页面 watcher】

data 改变，正序遍历通知，computed 先更新，页面再更新，所以，页面才能读取到最新的 computed 值

### 收集所有 computed 的 watcher

从源码中，可以看出为每个 computed 新建 watcher 之后，会全部收集到一个对象中，并挂到实例上

为什么收集起来，暂时的想法是：为了在 createComputedGetter 获取到对应的 watcher

其实可以通过传递 watcher ，但是这里的做法是传递 key，然后使用 key 去找到对应 watcher
