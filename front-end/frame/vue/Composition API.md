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

```js
export default {
  setup(props, context) {
    // 透传 Attributes（非响应式的对象，等价于 $attrs）
    console.log(context.attrs)

    // 插槽（非响应式的对象，等价于 $slots）
    console.log(context.slots)

    // 触发事件（函数，等价于 $emit）
    console.log(context.emit)

    // 暴露公共属性（函数）
    console.log(context.expose)
  }
}
```

attrs 和 slots 都是有状态的对象，它们总是会随着组件自身的更新而更新。这意味着你应当避免解构它们，并始终通过 attrs.x 或 slots.x 的形式使用其中的属性。此外还需注意，和 props 不同，attrs 和 slots 的属性都不是响应式的。如果想要基于 attrs 或 slots 的改变来执行副作用，那么应该在 onBeforeUpdate 生命周期钩子中编写相关逻辑。

#### 暴露公共属性

expose 函数用于显式地限制该组件暴露出的属性，当父组件通过模板引用(即$ref)访问该组件的实例时，将仅能访问 expose 函数暴露出的内容

```js
export default {
  setup(props, { expose }) {
    // 让组件实例处于 “关闭状态”
    // 即不向父组件暴露任何东西
    expose()

    const publicCount = ref(0)
    const privateCount = ref(0)
    // 有选择地暴露局部状态
    expose({ count: publicCount })
  }
}
```

### 有关 this

this在这里是完全不可用的，setup在解析 2.x 选项前被调用，setup() 中的 this 将与 2.x 选项中的 this 完全不同。

## 响应式系统 API

### reactive

接收一个普通对象然后返回该普通对象的响应式代理。等同于 2.x 的 `Vue.observable()`，注意转换是深层递归的，基于 Proxy 实现，类似于 React hook 中的 useState方法。

```ts
function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
```

- 响应式转换是“深层”的：它会影响到所有嵌套的属性。一个响应式对象也将深层地解包任何 ref 属性，同时保持响应性。
- 值得注意的是，当访问到某个响应式数组或 Map 这样的原生集合类型中的 ref 元素时，不会执行 ref 的解包。
- 若要避免深层响应式转换，只想保留对这个对象顶层次访问的响应性，请使用 shallowReactive() 作替代。
- 返回的对象以及其中嵌套的对象都会通过 ES Proxy 包裹，因此不等于源对象，建议只使用响应式代理，避免使用原始对象。

ref 的解包：

```ts
const count = ref(1)
const obj = reactive({ count })

// ref 会被解包
console.log(obj.count === count.value) // true

// 会更新 `obj.count`
count.value++
console.log(count.value) // 2
console.log(obj.count) // 2

// 也会更新 `count` ref
obj.count++
console.log(obj.count) // 3
console.log(count.value) // 3
```

### ref

接受一个参数值并返回一个响应式且可改变的 ref 对象。ref 对象拥有一个指向内部值的单一属性 .value。如果传入对象，则会使用 reactive 进行深层响应转换。与 React hook 中的 useRef 方法类似，可以实现**基本类型**的响应式。

```ts
function ref<T>(value: T): Ref<UnwrapRef<T>>

interface Ref<T> {
  value: T
}
```

在模板中访问时，会自动解套，不需要再访问 .value ，同时当 ref 作为 reactive 对象的 property 被访问或修改时，也将自动解套 value 值，其行为类似普通属性

需要注意：将新的 ref 分配给现有的 ref，将会替换旧的，同时只有嵌套在对象中时，才会解套，从Array，Map之类的原生集合访问 ref 不会自动解套

如果将一个对象赋值给 ref，那么这个对象将通过 reactive() 转为具有深层次响应式的对象。这也意味着如果对象中包含了嵌套的 ref，它们将被深层地解包。

若要避免这种深层次的转换，请使用 shallowRef() 来替代。

### computed

接受一个 getter 函数，返回一个只读的响应式 ref 对象。该 ref 通过 .value 暴露 getter 函数的返回值。它也可以接受一个带有 get 和 set 函数的对象来创建一个可写的 ref 对象。

```ts
// 只读
function computed<T>(
  getter: () => T,
  debuggerOptions?: DebuggerOptions
): Readonly<Ref<Readonly<T>>>

// 可写的
function computed<T>(
  options: {
    get: () => T
    set: (value: T) => void
  },
  debuggerOptions?: DebuggerOptions
): Ref<T>
```

computed 是惰性的，只有被访问了才会执行 getter 函数，并收集依赖

### readonly

接受一个对象 (不论是响应式还是普通的) 或是一个 ref，返回一个原值的只读代理。

```ts
function readonly<T extends object>(
  target: T
): DeepReadonly<UnwrapNestedRefs<T>>
```

- 只读代理是深层的：对任何嵌套属性的访问都将是只读的。它的 ref 解包行为与 reactive() 相同，但解包得到的值是只读的。
- 要避免深层级的转换行为，请使用 shallowReadonly() 作替代。

```js
const original = reactive({ count: 0 })

const copy = readonly(original)

watchEffect(() => {
  // 用来做响应性追踪
  console.log(copy.count)
})

// 更改源属性会触发其依赖的侦听器
original.count++

// 更改该只读副本将会失败，并会得到一个警告
copy.count++ // warning!
```

### watchEffect

**立即执行**传入的一个函数，并响应式追踪其依赖，并在其依赖变更时重新运行该函数。

```ts
function watchEffect(
  effect: (onCleanup: OnCleanup) => void,
  options?: WatchEffectOptions
): StopHandle

type OnCleanup = (cleanupFn: () => void) => void

interface WatchEffectOptions {
  flush?: 'pre' | 'post' | 'sync' // 默认：'pre'
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
}

type StopHandle = () => void
```

- 第一个参数就是要运行的副作用函数。这个副作用函数的参数也是一个函数，用来注册清理回调。清理回调会在该副作用下一次执行前被调用，可以用来清理无效的副作用，例如等待中的异步请求
- 第二个参数是一个可选的选项，可以用来调整副作用的刷新时机或调试副作用的依赖。
  - 默认情况下，侦听器将在组件渲染之前执行。
  - 设置 flush: 'post' 将会使侦听器延迟到组件渲染之后再执行。
  - 在某些特殊情况下 (例如要使缓存失效)，可能有必要在响应式依赖发生改变时立即触发侦听器。这可以通过设置 flush: 'sync' 来实现。
- 返回值是一个用来停止该副作用的函数。

当它在组件的 setup() 函数或生命周期钩子被调用时，watchEffect 会被链接到该组件的生命周期，并在组件卸载时自动停止。

#### 清除副作用

有时候会使用 watchEffect 去执行一些异步副作用，这些响应需要在其失效时清除，可以通过 onInvalidate 函数作入参, 用来注册清理失效时的回调，失效回调会下面两种情况发生时触发：

- 副作用即将重新执行时
- 侦听器被停止 (如果在 setup() 或 生命周期钩子函数中使用了 watchEffect, 则在卸载组件时)

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

- 当一个 reactive 对象属性或一个 ref 作为依赖被追踪时，将调用 onTrack
- 依赖项变更导致副作用被触发时，将调用 onTrigger

### watch

侦听一个或多个响应式数据源，并在数据源变化时调用所给的回调函数。watch API 完全等效于 2.x this.$watch （以及 watch 中相应的选项）

```ts
// 侦听单个来源
function watch<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options?: WatchOptions
): StopHandle

// 侦听多个来源
function watch<T>(
  sources: WatchSource<T>[],
  callback: WatchCallback<T[]>,
  options?: WatchOptions
): StopHandle

type WatchCallback<T> = (
  value: T,
  oldValue: T,
  onCleanup: (cleanupFn: () => void) => void
) => void

type WatchSource<T> =
  | Ref<T> // ref
  | (() => T) // getter
  | T extends object
  ? T
  : never // 响应式对象

interface WatchOptions extends WatchEffectOptions {
  immediate?: boolean // 默认：false
  deep?: boolean // 默认：false
  flush?: 'pre' | 'post' | 'sync' // 默认：'pre'
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
}
```

watch() 默认是懒侦听的，即仅在侦听源发生变化时才执行回调函数。

第一个参数是侦听器的源。这个来源可以是以下几种：

- 一个函数，返回一个值
- 一个 ref
- 一个响应式对象
- ...或是由以上类型的值组成的数组

第二个参数是在发生变化时要调用的回调函数。这个回调函数接受三个参数：新值、旧值，以及一个用于注册副作用清理的回调函数。该回调函数会在副作用下一次重新执行前调用，可以用来清除无效的副作用，例如等待中的异步请求。

当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值。

第三个可选的参数是一个对象，支持以下这些选项：

- immediate：在侦听器创建时立即触发回调。第一次调用时旧值是 undefined。
- deep：如果源是对象，强制深度遍历，以便在深层级变更时触发回调。参考深层侦听器。
- flush：调整回调函数的刷新时机。参考回调的刷新时机及 watchEffect()。
- onTrack / onTrigger：调试侦听器的依赖。参考调试侦听器。

与 watchEffect() 相比，watch() 使我们可以：

- 懒执行副作用；
- 更加明确是应该由哪个状态触发侦听器重新执行；
- 可以访问所侦听状态的前一个值和当前值。

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

- beforeCreate -> 使用 setup()
- created -> 使用 setup()
- beforeMount -> onBeforeMount
- mounted -> onMounted
- beforeUpdate -> onBeforeUpdate
- updated -> onUpdated
- beforeDestroy -> onBeforeUnmount
- destroyed -> onUnmounted
- errorCaptured -> onErrorCaptured

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

如果参数是 ref，则返回内部值，否则返回参数本身。这是 `val = isRef(val) ? val.value : val` 计算的一个语法糖。

```ts
function unref<T>(ref: T | Ref<T>): T
```

示例：

```ts
function useFoo(x: number | Ref<number>) {
  const unwrapped = unref(x)
  // unwrapped 现在保证为 number 类型
}
```

### toRef

toRef 可以用来为一个 reactive 对象的某个属性创建一个 ref。这样创建的 ref 与其源属性保持同步：改变源属性的值将更新 ref 的值，反之亦然。在将 props 某个属性作为 ref 传递给组合逻辑函数时，就可以用它。

```ts
function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K,
  defaultValue?: T[K]
): ToRef<T[K]>

type ToRef<T> = T extends Ref ? T : Ref<T>
```

示例：

```js
const state = reactive({
  foo: 1,
  bar: 2
})

const fooRef = toRef(state, 'foo')

// 更改该 ref 会更新源属性
fooRef.value++
console.log(state.foo) // 2

// 更改源属性也会更新该 ref
state.foo++
console.log(fooRef.value) // 3
```

### toRefs

把一个响应式对象转换成普通对象，该普通对象的每个 property 都是一个 ref ，当想要从一个组合逻辑函数中返回响应式对象时，用 toRefs 是很有效的，可以让消费组件解构，并且保持响应性。

```js
function toRefs<T extends object>(
  object: T
): {
  [K in keyof T]: ToRef<T[K]>
}

type ToRef = T extends Ref ? T : Ref<T>
```

示例：

```js
const state = reactive({
  foo: 1,
  bar: 2
})

const stateAsRefs = toRefs(state)
/*
stateAsRefs 的类型：{
  foo: Ref<number>,
  bar: Ref<number>
}
*/

// 这个 ref 和源属性已经“链接上了”
state.foo++
console.log(stateAsRefs.foo.value) // 2

stateAsRefs.foo.value++
console.log(state.foo) // 3
```

#### isRef

检查一个值是否为一个 ref 对象。

```ts
function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
```

请注意，返回值是一个类型判定 (type predicate)，这意味着 isRef 可以被用作类型守卫：

```ts
let foo: unknown
if (isRef(foo)) {
  // foo 的类型被收窄为了 Ref<unknown>
  foo.value
}
```

#### isProxy

检查一个对象是否是由 reactive()、readonly()、shallowReactive() 或 shallowReadonly() 创建的代理。

#### isReactive

检查一个对象是否是由 reactive() 或 shallowReactive() 创建的代理。

#### isReadonly

检查传入的值是否为只读对象。只读对象的属性可以更改，但他们不能通过传入的对象直接赋值。

通过 readonly() 和 shallowReadonly() 创建的代理都是只读的，因为他们是没有 set 函数的 computed() ref。

## 高级响应式系统 API

### customRef

创建一个自定义的 ref，显式声明对其依赖追踪和更新触发的控制方式。

```ts
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}
```

- customRef() 预期接收一个工厂函数作为参数，这个工厂函数接受 track 和 trigger 两个函数作为参数，并返回一个带有 get 和 set 方法的对象。
- 一般来说，track() 应该在 get() 方法中调用，而 trigger() 应该在 set() 中调用。然而事实上，你对何时调用、是否应该调用他们有完全的控制权。

示例：创建一个防抖 ref，即只在最近一次 set 调用后的一段固定间隔后再调用：

```ts
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}
```

在组件中使用：

```ts
<script setup>
import { useDebouncedRef } from './debouncedRef'
const text = useDebouncedRef('hello')
</script>

<template>
  <input v-model="text" />
</template>
```

### markRaw

显式标记一个对象为“永远不会转为响应式代理”，函数返回这个对象本身。有点类似于 `Object.freeze()` 方法

```ts
function markRaw<T extends object>(value: T): T
```

示例：

```ts
const foo = markRaw({})
console.log(isReactive(reactive(foo))) // false

// 也适用于嵌套在其他响应性对象
const bar = reactive({ foo })
console.log(isReactive(bar.foo)) // false
```

谨慎使用 markRaw() 和类似 shallowReactive() 这样的浅层式 API

- 有些值不应该是响应式的，例如复杂的第三方类实例或 Vue 组件对象。
- 当呈现带有不可变数据源的大型列表时，跳过代理转换可以提高性能。

### shallowReactive

reactive() 的浅层作用形式。

```ts
function shallowReactive<T extends object>(target: T): T
```

和 reactive() 不同，这里没有深层级的转换：一个浅层响应式对象里只有根级别的属性是响应式的。属性的值会被原样存储和暴露，这也意味着值为 ref 的属性不会被自动解包了。

示例：

```ts
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 更改状态自身的属性是响应式的
state.foo++

// ...但下层嵌套对象不会被转为响应式
isReactive(state.nested) // false

// 不是响应式的
state.nested.bar++
```

### shallowReadonly

readonly() 的浅层作用形式。

```ts
function shallowReadonly<T extends object>(target: T): Readonly<T>
```

和 readonly() 不同，这里没有深层级的转换：只有根层级的属性变为了只读。属性的值都会被原样存储和暴露，这也意味着值为 ref 的属性不会被自动解包了。

### shallowRef

ref() 的浅层作用形式。

```ts
function shallowRef<T>(value: T): ShallowRef<T>

interface ShallowRef<T> {
  value: T
}
```

- 和 ref() 不同，浅层 ref 的内部值将会原样存储和暴露，并且不会被深层递归地转为响应式。只有对 .value 的访问是响应式的。
- shallowRef() 常常用于对大型数据结构的性能优化或是与外部的状态管理系统集成。

示例：

```ts
const state = shallowRef({ count: 1 })

// 不会触发更改
state.value.count = 2

// 会触发更改
state.value = { count: 2 }
```

### triggerRef

强制触发依赖于一个浅层 ref 的副作用，这通常在对浅引用的内部值进行深度变更后使用。

```ts
function triggerRef(ref: ShallowRef): void
```

示例：

```ts
const shallow = shallowRef({
  greet: 'Hello, world'
})

// 触发该副作用第一次应该会打印 "Hello, world"
watchEffect(() => {
  console.log(shallow.value.greet)
})

// 这次变更不应触发副作用，因为这个 ref 是浅层的
shallow.value.greet = 'Hello, universe'

// 打印 "Hello, universe"
triggerRef(shallow)
```

### toRaw

根据一个 Vue 创建的代理返回其原始对象。

```ts
function toRaw<T>(proxy: T): T
```

- toRaw() 可以返回由 reactive()、readonly()、shallowReactive() 或者 shallowReadonly() 创建的代理对应的原始对象。
- 这是一个可以用于临时读取而不引起代理访问/跟踪开销，或是写入而不触发更改的特殊方法。不建议保存对原始对象的持久引用，请谨慎使用。

### effectScope

创建一个 effect 作用域，可以捕获其中所创建的响应式副作用 (即计算属性和侦听器)，这样捕获到的副作用可以一起处理。

```ts
function effectScope(detached?: boolean): EffectScope

interface EffectScope {
  run<T>(fn: () => T): T | undefined // 如果作用域不活跃就为 undefined
  stop(): void
}
```

示例：

```ts
const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
})

// 处理掉当前作用域内的所有 effect
scope.stop()
```

### getCurrentScope

如果有的话，返回当前活跃的 effect 作用域。

### onScopeDispose

在当前活跃的 effect 作用域上注册一个处理回调函数。当相关的 effect 作用域停止时会调用这个回调函数。

这个方法可以作为可复用的组合式函数中 onUnmounted 的替代品，它并不与组件耦合，因为每一个 Vue 组件的 setup() 函数也是在一个 effect 作用域中调用的。

## 额外的有关于vite原理

1. vite启动本地服务器，拦截请求的资源文件，并返回经过处理的文件
2. 向html中插入执行环境以及模块热更新相关代码
3. 浏览器请求热更新代码时，会返回client.js，这里面会启动一个socket服务，会接收dev server发送过来的指令，并响应
4. dev server端负责在各个阶段向客户端也就是浏览器发送指令，比如监听到某个文件变化，就解析编译相应文件，并向客户端发送 vue-reload 指令，同时也把编译后的代码发过去
