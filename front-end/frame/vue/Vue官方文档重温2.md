# Vue官方文档重温2

## 组合式函数

在 Vue 应用的概念中，“组合式函数”(Composables) 是一个利用 Vue 的组合式 API 来封装和复用有状态逻辑的函数。

有状态逻辑负责管理会随时间而变化的状态。一个简单的例子是跟踪当前鼠标在页面中的位置。在实际应用中，也可能是像触摸手势或与数据库的连接状态这样的更复杂的逻辑。

### 鼠标跟踪器示例

如果要直接在组件中使用组合式 API 实现鼠标跟踪功能，它会是这样的：

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function update(event) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

如果想在多个组件中复用这个相同的逻辑呢？可以把这个逻辑以一个组合式函数的形式提取到外部文件中：

```js
// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
export function useMouse() {
  // 被组合式函数封装和管理的状态
  const x = ref(0)
  const y = ref(0)

  // 组合式函数可以随时更改其状态。
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 一个组合式函数也可以挂靠在所属组件的生命周期上
  // 来启动和卸载副作用
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 通过返回值暴露所管理的状态
  return { x, y }
}
```

下面是它在组件中使用的方式：

```vue
<script setup>
import { useMouse } from './mouse.js'

const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

可以将添加和清除 DOM 事件监听器的逻辑也封装进一个组合式函数中：

```js
// event.js
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, callback) {
  // 如果你想的话，
  // 也可以用字符串形式的 CSS 选择器来寻找目标 DOM 元素
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}
```

有了它，之前的 useMouse() 组合式函数可以被简化为：

```js
// mouse.js
import { ref } from 'vue'
import { useEventListener } from './event'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  useEventListener(window, 'mousemove', (event) => {
    x.value = event.pageX
    y.value = event.pageY
  })

  return { x, y }
}
```

### 异步状态示例

useMouse() 组合式函数没有接收任何参数，因此再来看一个需要接收一个参数的组合式函数示例。在做异步数据请求时，常常需要处理不同的状态：加载中、加载成功和加载失败。

```vue
<script setup>
import { ref } from 'vue'

const data = ref(null)
const error = ref(null)

fetch('...')
  .then((res) => res.json())
  .then((json) => (data.value = json))
  .catch((err) => (error.value = err))
</script>

<template>
  <div v-if="error">Oops! Error encountered: {{ error.message }}</div>
  <div v-else-if="data">
    Data loaded:
    <pre>{{ data }}</pre>
  </div>
  <div v-else>Loading...</div>
</template>
```

如果在每个需要获取数据的组件中都要重复这种模式，那就太繁琐了。把它抽取成一个组合式函数：

```js
// fetch.js
import { ref } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  fetch(url)
    .then((res) => res.json())
    .then((json) => (data.value = json))
    .catch((err) => (error.value = err))

  return { data, error }
}
```

useFetch() 接收一个静态的 URL 字符串作为输入，所以它只执行一次请求，然后就完成了。但如果想让它在每次 URL 变化时都重新请求呢？那可以让它同时允许接收 ref 作为参数：

```js
// fetch.js
import { ref, isRef, unref, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  function doFetch() {
    // 在请求之前重设状态...
    data.value = null
    error.value = null
    // unref() 解包可能为 ref 的值
    fetch(unref(url))
      .then((res) => res.json())
      .then((json) => (data.value = json))
      .catch((err) => (error.value = err))
  }

  if (isRef(url)) {
    // 若输入的 URL 是一个 ref，那么启动一个响应式的请求
    watchEffect(doFetch)
  } else {
    // 否则只请求一次
    // 避免监听器的额外开销
    doFetch()
  }

  return { data, error }
}
```

当通过 isRef() 检测到 URL 是一个动态 ref 时，它会使用 watchEffect() 启动一个响应式的 effect。该 effect 会立刻执行一次，并在此过程中将 URL 的 ref 作为依赖进行跟踪。当 URL 的 ref 发生改变时，数据就会被重置，并重新请求。

### 约定和最佳实践

#### 输入参数

尽管其响应性不依赖 ref，组合式函数仍可接收 ref 参数。如果编写的组合式函数会被其他开发者使用，最好在处理输入参数时兼容 ref 而不只是原始的值。unref() 工具函数会对此非常有帮助：

```js
import { unref } from 'vue'

function useFeature(maybeRef) {
  // 若 maybeRef 确实是一个 ref，它的 .value 会被返回
  // 否则，maybeRef 会被原样返回
  const value = unref(maybeRef)
}
```

如果组合式函数在接收 ref 为参数时会产生响应式 effect，请确保使用 watch() 显式地监听此 ref，或者在 watchEffect() 中调用 unref() 来进行正确的追踪。

#### 返回值

在组合式函数中使用 ref() 而不是 reactive()。推荐的约定是组合式函数始终返回一个包含多个 ref 的普通的非响应式对象，这样该对象在组件中被解构为 ref 之后仍可以保持响应性：

```js
// x 和 y 是两个 ref
const { x, y } = useMouse()
```

从组合式函数返回一个响应式对象会导致在对象解构过程中丢失与组合式函数内状态的响应性连接。与之相反，ref 则可以维持这一响应性连接。

#### 副作用

在组合式函数中的确可以执行副作用 (例如：添加 DOM 事件监听器或者请求数据)，但请注意以下规则：

- 如果你的应用用到了服务端渲染 (SSR)，请确保在组件挂载后才调用的生命周期钩子中执行 DOM 相关的副作用，例如：onMounted()。这些钩子仅会在浏览器中被调用，因此可以确保能访问到 DOM。
- 确保在 onUnmounted() 时清理副作用。举例来说，如果一个组合式函数设置了一个事件监听器，它就应该在 onUnmounted() 中被移除 (就像我们在 useMouse() 示例中看到的一样)。当然也可以像之前的 useEventListener() 示例那样，使用一个组合式函数来自动帮你做这些事。

#### 使用限制

组合式函数在 `<script setup>` 或 `setup()` 钩子中，应始终被同步地调用。在某些场景下，你也可以在像 onMounted() 这样的生命周期钩子中使用他们。

这个限制是为了让 Vue 能够确定当前正在被执行的到底是哪个组件实例，只有能确认当前组件实例，才能够：

- 将生命周期钩子注册到该组件实例上
- 将计算属性和监听器注册到该组件实例上，以便在该组件被卸载时停止监听，避免内存泄漏。

## 自定义指令

自定义指令主要是为了重用涉及普通元素的底层 DOM 访问的逻辑。

一个自定义指令由一个包含类似组件生命周期钩子的对象来定义。钩子函数会接收到指令所绑定元素作为其参数。下面是一个自定义指令的例子，当一个 input 元素被 Vue 插入到 DOM 中后，它会被自动聚焦：

```vue
<script setup>
// 在模板中启用 v-focus
const vFocus = {
  mounted: (el) => el.focus()
}
</script>

<template>
  <input v-focus />
</template>
```

在 `<script setup>` 中，任何以 v 开头的驼峰式命名的变量都可以被用作一个自定义指令。在上面的例子中，vFocus 即可以在模板中以 v-focus 的形式使用。

在没有使用 `<script setup>` 的情况下，自定义指令需要通过 directives 选项注册：

```js
export default {
  setup() {
    /*...*/
  },
  directives: {
    // 在模板中启用 v-focus
    focus: {
      /* ... */
    }
  }
}
```

将一个自定义指令全局注册到应用层级也是一种常见的做法：

```js
const app = createApp({})

// 使 v-focus 在所有组件中都可用
app.directive('focus', {
  /* ... */
})
```

> 只有当所需功能只能通过直接的 DOM 操作来实现时，才应该使用自定义指令。其他情况下应该尽可能地使用 v-bind 这样的内置指令来声明式地使用模板，这样更高效，也对服务端渲染更友好。

### 指令钩子

一个指令的定义对象可以提供几种钩子函数 (都是可选的)：

```js
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode, prevVnode) {
    // 下面会介绍各个参数的细节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
}
```

#### 钩子参数

- el：指令绑定到的元素。这可以用于直接操作 DOM。
- binding：一个对象，包含以下属性。
  - value：传递给指令的值。例如在 v-my-directive="1 + 1" 中，值是 2。
  - oldValue：之前的值，仅在 beforeUpdate 和 updated 中可用。无论值是否更改，它都可用。
  - arg：传递给指令的参数 (如果有的话)。例如在 v-my-directive:foo 中，参数是 "foo"。
  - modifiers：一个包含修饰符的对象 (如果有的话)。例如在 v-my-directive.foo.bar 中，修饰符对象是 { foo: true, bar: true }。
  - instance：使用该指令的组件实例。
  - dir：指令的定义对象。
- vnode：代表绑定元素的底层 VNode。
- prevNode：之前的渲染中代表指令所绑定元素的 VNode。仅在 beforeUpdate 和 updated 钩子中可用。

举例来说，像下面这样使用指令：

```template
<div v-example:foo.bar="baz">
```

binding 参数会是一个这样的对象：

```js
{
  arg: 'foo',
  modifiers: { bar: true },
  value: /* `baz` 的值 */,
  oldValue: /* 上一次更新时 `baz` 的值 */
}
```

> 除了 el 外，其他参数都是只读的，不要更改它们。若需要在不同的钩子间共享信息，推荐通过元素的 dataset attribute 实现。

### 对象字面量

如果指令需要多个值，可以向它传递一个 JavaScript 对象字面量。别忘了，指令也可以接收任何合法的 JavaScript 表达式。

```template
<div v-demo="{ color: 'white', text: 'hello!' }"></div>
```

```js
app.directive('demo', (el, binding) => {
  console.log(binding.value.color) // => "white"
  console.log(binding.value.text) // => "hello!"
})
```

> 总的来说，不推荐在组件上使用自定义指令。

## 插件

插件 (Plugins) 是一种能为 Vue 添加全局功能的工具代码。下面是如何安装一个插件的示例：

```js
import { createApp } from 'vue'

const app = createApp({})

app.use(myPlugin, {
  /* 可选的选项 */
})
```

一个插件可以是一个拥有 install() 方法的对象，也可以直接是一个安装函数本身。安装函数会接收到安装它的应用实例和传递给 app.use() 的额外选项作为参数：

```js
const myPlugin = {
  install(app, options) {
    // 配置此应用
  }
}
```

插件没有严格定义的使用范围，但是插件发挥作用的常见场景主要包括以下几种：

1. 通过 app.component() 和 app.directive() 注册一到多个全局组件或自定义指令。
2. 通过 app.provide() 使一个资源可被注入进整个应用。
3. 向 app.config.globalProperties 中添加一些全局实例属性或方法
4. 一个可能上述三种都包含了的功能库 (例如 vue-router)。
