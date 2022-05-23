# Vue2 Props 原理

> 原文[Props - 源码版](https://zhuanlan.zhihu.com/p/63656117)

## 父组件怎么传值给子组件的 props

假如有这么一个组件：

```html
<div class="a">
  <testb :child-name="parentName"></testb>
</div>
```

props 父传子前：父组件的模板 会被解析成一个 模板渲染函数

```js
;(function () {
  with (this) {
    return _c(
      "div",
      { staticClass: "a" },
      [_c("testb", { attrs: { "child-name": parentName } })],
      1
    )
  }
})
```

1. `_c` 是渲染组件的函数，`_c('testb')` 表示渲染 testb 这个子组件
2. 因为 with 的作用是，绑定大括号内代码的变量访问作用域
3. 这是一个匿名自执行函数，会在后面执行

props 开始赋值

之后，模板函数会被执行，执行时会绑定父组件为作用域，所以渲染函数内部所有的变量，都会从父组件对象上去获取，绑定了父作用域之后， parentName 自然会从父组件获取，类似这样 `{ attrs: { child-name: "我是父组件" } }`，此时，父组件就正式 利用 props 把 parentName 传给了 子组件的 props child-name

## 初始化

在创建 Vue 实例的过程中，会调用 initState 处理 options，比如 props，computed，watch 等，只要 new Vue 创建实例之后，很快就会处理 options

```js
function Vue() {
  // ... 其他处理
  initState(this)
  // ...解析模板，生成DOM 插入页面
}

function initState(vm) {
  var opts = vm.$options

  if (opts.props) {
    initProps(vm, opts.props)
  }
  // ... 处理 computed，watch，methods 等其他options
}
```

### initProps

处理 Props ，主要用到了一个方法 initProps，源码：

```js
function initProps(vm, propsOpt) {
  // 这是父组件给子组件传入的 props 的具体值
  var propsData = vm.$options.propsData || {}
  var props = (vm._props = {})

  for (var key in propsOpt) {
    // 给 props 的 key 设置 响应式
    defineReactive(props, key, propsData[key])

    if (!(key in vm)) {
      // 转接访问，访问 vm 属性，转到访问 vm._props 属性
      proxy(vm, "_props", key)
    }
  }
}
```

上面的代码主要做了三件事

1. 遍历 props
2. 给 props 设置响应式
3. 给 props 代理到实例上

#### 给 props 设置响应式

```js
defineReactive(props, key, propsData[key])
```

defineReactive 在这里就不给太多源码了，只需要记住它就是给 props 设置响应式的

```js
function defineReactive(obj, key) {
  Object.defineProperty(obj, key, {
    get() {
      //...依赖收集
    },
    set(newVal) {
      //...依赖更新
    },
  })
}
```

Props 设置响应式，也是旨在数据改变时动态更新。数据是直接从父组件上传过来的，没有进行拷贝等处理，原样传过来。

- 如果 props 是基本类型，在子组件实例上设置这个 props 属性为响应式，跟 data 本质一样，作用是监听 props 修改
- 如果 props 是对象，也会在 子组件实例上 设置这个 props 属性为响应式，作用也是监听 props 修改。但是【不会递归对象】给对象内所有属性设置响应式，因为该对象【已经在父组件中】完成响应式设置了，也就是说如果你在子组件中直接修改 props 对象内的数据，父组件也会跟着修改。但是官方是不允许在子组件中修改 props 的，因为把它们设置为了只读

当父组件数据改变，子组件怎么更新？

1、 如果是基本类型，是这个流程

父组件数据改变，只会把新的数据传给子组件

子组件拿到新数据，就会直接替换到原来的 props

替换就是直接等于号赋值，看下源码 updateChildComponent 是子组件内部更新时会调用到的一个函数，这是其中更新 props 的一个片段

```js
function updateChildComponent(vm, propsData) {
  if (propsData && vm.$options.props) {
    // 保存 props 的地方，用于访问转接，具体看文章下面
    var props = vm._props

    // 所有子组件上设置的 props 的 key
    var propKeys = vm.$options._propKeys || []

    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i]
      // 将对应新的 props 值，赋值给子组件中的 props
      props[key] = propsData[key]
    }
    vm.$options.propsData = propsData
  }
}
```

而 props 在子组件中也是响应式的，【直接 等号 替换】导致触发 set，set 再通知 子组件完成更新

```js
data() {
  return {
    num: '111'
  }
}

<div>
{{ num }}
<test :child_num="num"></test>
</div>
```

数据是基本类型，然后设置定时器修改数据

watcher1 是父组件，watcher2 是子组件

父组件内的 data num 通知 watcher1 更新
子组件内的 props child_num 通知 watcher2 更新

2、如果是对象，是这个流程

条件：父组件传对象给子组件，并且父子组件页面都使用到了这个数据

结果：那么这个对象，会收集到父子组件的 watcher

所以：当对象内部被修改的时候，会通知到父和子更新。

```js
data() {
  return {
    obj: { name: '11111' }
  }
}

<div>
{{ obj }}
<test :child_obj="obj"></test>
</div>
```

定时修改父组件数据 obj.name ，可以看到是 obj.name 通知父子更新，当然，如果对象被整个替换了，而不是修改内部，那么跟基本类型一样

区别是什么？

1. 基本类型是，子组件内部 props 通知 子组件更新的
2. 引用类型是，父组件的数据 data 通知 子组件更新的

#### 给 props 设置代理

Props 有个移花接木的暗箱操作，就是访问转移，在项目中，会使用 `this.xxx` 去访问 props，props 已经当成了 实例的属性，所以可以直接访问，但是其实你访问的是 `this._props.xxx`

那么，是怎么设置代理的呢，就是这行 `proxy(vm, "_props", key);`，源码：

```js
function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return this[sourceKey][key]
    },

    set(val) {
      this[sourceKey][key] = val
    },
  })
}
```

这段代码做了 2 个事

1. 使用 props 在 vm 上占位，使得可以通过 `vm.xxx` 的形式访问到 props
2. 设置 [Object.defineProperty] 的 get 和 set ，间接获取和赋值 `vm._props`

所有访问赋值 props，转接到 `vm._props` 上
