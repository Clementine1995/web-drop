# Composition API

>官方RFC[Composition API RFC](https://composition-api.vuejs.org/)

## setup()

setup 函数是新的组件选项，也是使用 Composition API 的入口，就相当于 React hook 函数体。

### 调用时机

会在组件实例被创建，并且初始化props之后调用，并且先于 beforeCreate ，可以用它来代替 beforeCreate 与 created ，所以是拿不到 refs dom实例之类的。

### 模板中使用

如果返回对象，则这个对象的属性会被合并到模板的渲染上下文中，其中 ref 会自动解开，如果返回渲染函数，需要借助 h 函数，就与 React hook 类似了。

### 参数

接收 props 作为第一个参数，它也是响应式的，watchEffect 或 watch 都可以监听到其更新，不要结构它否则会失去响应式，不过可以借助 toRef 把其中某个属性变成响应式并传递下去，同时 props 是不应该被修改的。

第二个参数提供了一个上下文对象，其中包含一些 2 版本中的属性，比如 attrs, slots, emit，它们可以放心解构。

### 有关 this

this在这里是完全不可用的，setup在解析 2.x 选项前被调用，setup() 中的 this 将与 2.x 选项中的 this 完全不同。

## 响应式系统 API

### reactive

接收一个普通对象然后返回该普通对象的响应式代理。等同于 2.x 的 `Vue.observable()`，注意转换是深层递归的，基于 Proxy 实现，类似于 React hook 中的 useState方法。

### ref

接受一个参数值并返回一个响应式且可改变的 ref 对象。ref 对象拥有一个指向内部值的单一属性 .value。如果传入对象，则会使用 reactive 进行深层响应转换。与 React hook 中的 useRef 方法类似，可以实现**基本类型**的响应式。

在模板中访问时，会自动解套，不需要再访问 .value ，同时当 ref 作为 reactive 对象的 property 被访问或修改时，也将自动解套 value 值，其行为类似普通属性

需要注意：将新的 ref 分配给现有的 ref，将会替换旧的，同时只有嵌套在对象中时，才会解套，从Array，Map之类的原生集合访问 ref 不会自动解套

### computed

传入一个 getter 函数，返回一个默认不可手动修改的 ref 对象。或者传入一个拥有 get 和 set 函数的对象，创建一个可手动修改的计算状态。

computed 是惰性的，只有被访问了才会执行 getter 函数，并收集依赖

### readonly

传入一个对象（响应式或普通）或 ref，返回一个原始对象的只读代理。只读的代理也是深层的，并且对象内部任何嵌套的属性也都是只读的。

### watchEffect

**立即执行**传入的一个函数，并响应式追踪其依赖，并在其依赖变更时重新运行该函数。

当它在组件的 setup() 函数或生命周期钩子被调用时，watchEffect 会被链接到该组件的生命周期，并在组件卸载时自动停止。也可以手动停止，利用 watchEffect 的返回值。

#### 清除副作用

有时候会使用 watchEffect 去执行一些异步副作用，这些响应需要在其失效时清除，可以通过 onInvalidate 函数作入参, 用来注册清理失效时的回调，失效回调会下面两种情况发生时触发：

+ 副作用即将重新执行时
+ 侦听器被停止 (如果在 setup() 或 生命周期钩子函数中使用了 watchEffect, 则在卸载组件时)

```js
watchEffect((onInvalidate) => {
  const token = performAsyncOperation(id.value)
  onInvalidate(() => {
    // id 改变时 或 停止侦听时
    // 取消之前的异步操作
    token.cancel()
  })
})
```

React hook 中是通过返回一个函数来消除副作用，async 默认回返回一个 Promise ，而如果在 useEffect 中使用 async 则会出现问题，需要一个函数消除副作用却收到了一个 Promise，Vue 则是依赖这个返回的 Promise 来自动处理 Promise 链上的潜在错误。

#### 副作用刷新时机

当一个用户定义的副作用函数进入队列时, 会在所有的组件更新后执行，可以避免同一个 tick 中多个状态变化，或者一个状态变化多次导致的不必要重复调用。

注意，初始化运行是在组件 mounted 之前执行的。如果想在编写副作用函数时访问 DOM（或模板 ref），需要在 onMounted 钩子中进行

如果副作用需要同步或在组件更新之前重新运行，可以传递一个拥有 flush 属性的对象作为选项，默认的执行时机与 React hook 相同

```js
// sync 同步执行，pre 组件更新前执行，默认 post 组件更新后执行
watchEffect(
  () => {
    /* ... */
  },
  {
    flush: 'sync',
  }
)
```

#### 侦听器调试

支持 onTrack 和 onTrigger 选项可用于调试一个侦听器的行为。

+ 当一个 reactive 对象属性或一个 ref 作为依赖被追踪时，将调用 onTrack
+ 依赖项变更导致副作用被触发时，将调用 onTrigger

### watch

watch API 完全等效于 2.x this.$watch （以及 watch 中相应的选项），默认懒执行，在监听数据源变化后，而 watchEffect 初始化时就会调用一次，相比之下 watch 可以

+ 懒执行副作用；
+ 更明确哪些状态的改变会触发侦听器重新运行副作用；
+ 访问侦听状态变化前后的值。

#### 监听单个数据源以及监听多个数据源

```js
// 侦听一个 getter
const state = reactive({ count: 0 })
watch(
  () => state.count,
  (count, prevCount) => {
    /* ... */
  }
)

// 直接侦听一个 ref
const count = ref(0)
watch(count, (count, prevCount) => {
  /* ... */
})

// watcher 也可以使用数组来同时侦听多个源：
watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => {
  /* ... */
})
```

## 生命周期钩子函数

在 setup 中可以直接导入 onXXX 生命周期钩子函数，也只能写在 setup 中，卸载组件时，在生命周期钩子内部同步创建的侦听器和计算状态也将自动删除。

+ beforeCreate -> 使用 setup()
+ created -> 使用 setup()
+ beforeMount -> onBeforeMount
+ mounted -> onMounted
+ beforeUpdate -> onBeforeUpdate
+ updated -> onUpdated
+ beforeDestroy -> onBeforeUnmount
+ destroyed -> onUnmounted
+ errorCaptured -> onErrorCaptured

同时还新增了两个 onRenderTracked，onRenderTriggered

## 依赖注入

provide 和 inject 提供依赖注入，与 2 版本的 api 类似，也只能在 setup 中调用。可以使用 ref 来保证 provided 和 injected 之间值的响应

## 模板 Refs

当使用组合式 API 时，reactive refs 和 template refs 的概念是统一的。setup() 中声明一个 ref 并返回它，然后在模板中赋值给 dom 相应的 ref 属性，就可以响应式的拿到。这一点与React hook 中的 useRef 使用上类似

注意在 v-for 中使用时，需要使用函数型的 ref 来自定义处理方式

```html
<template>
  <div v-for="(item, i) in list" :ref="el => { divs[i] = el }">
    {{ item }}
  </div>
</template>

<script>
  import { ref, reactive, onBeforeUpdate } from 'vue'

  export default {
    setup() {
      const list = reactive([1, 2, 3])
      const divs = ref([])

      // 确保在每次变更之前重置引用
      onBeforeUpdate(() => {
        divs.value = []
      })

      return {
        list,
        divs,
      }
    },
  }
</script>
```

## 响应式系统工具集

### unref

如果参数是一个 ref 则返回它的 value，否则返回参数本身。

### toRef

toRef 可以用来为一个 reactive 对象的某个属性创建一个 ref。这个 ref 可以被传递并且能够保持响应性。在将 props 某个属性作为 ref 传递给组合逻辑函数时，就可以用它。

### toRefs

把一个响应式对象转换成普通对象，该普通对象的每个 property 都是一个 ref ，当想要从一个组合逻辑函数中返回响应式对象时，用 toRefs 是很有效的，可以让消费组件解构，并且保持响应性。

isRef：检查一个值是否为一个 ref 对象。
isProxy：额外的有关于vite原理。
isReactive：检查一个对象是否是由 reactive 创建的响应式代理。
isReadonly：检查一个对象是否是由 readonly 创建的只读代理。

## 高级响应式系统 API

### customRef

customRef 用于自定义一个 ref，可以显式地控制依赖追踪和触发响应，接受一个工厂函数，两个参数分别是用于追踪的 track 与用于触发响应的 trigger，并返回一个一个带有 get 和 set 属性的对象。

### markRaw

显式标记一个对象为“永远不会转为响应式代理”，函数返回这个对象本身。有点类似于 `Object.freeze()` 方法

### shallowReactive

只为某个对象的私有（第一层）属性创建浅层的响应式代理，不会对“属性的属性”做深层次、递归地响应式代理，而只是保留原样。

### shallowReadonly

只为某个对象的自有（第一层）属性创建浅层的只读响应式代理，同样也不会做深层次、递归地代理，深层次的属性并不是只读的。

### shallowRef

创建一个 ref ，将会追踪它的 .value 更改操作，但是并不会对变更后的 .value 做响应式代理转换

### toRaw

返回由 reactive 或 readonly 方法转换成响应式代理的普通对象。这是一个还原方法，可用于临时读取，访问不会被代理/跟踪，写入时也不会触发更改。谨慎使用

## 额外的有关于vite原理

1. vite启动本地服务器，拦截请求的资源文件，并返回经过处理的文件
2. 向html中插入执行环境以及模块热更新相关代码
3. 浏览器请求热更新代码时，会返回client.js，这里面会启动一个socket服务，会接收dev server发送过来的指令，并响应
4. dev server端负责在各个阶段向客户端也就是浏览器发送指令，比如监听到某个文件变化，就解析编译相应文件，并向客户端发送 vue-reload 指令，同时也把编译后的代码发过去
