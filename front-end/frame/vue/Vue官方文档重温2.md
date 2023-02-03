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

## 性能优化

### 分析选项

为了提高性能，首先需要知道如何衡量它。在这方面，有一些很棒的工具可以提供帮助：

用于生产部署的负载性能分析：

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

### 页面加载优化

页面加载优化有许多跟框架无关的方面 - 这份 [web.dev](https://web.dev/fast/) 指南提供了一个全面的总结。这里，将主要关注和 Vue 相关的技巧。

#### 选用正确的架构

如果你的用例对页面加载性能很敏感，请避免将其部署为纯客户端的 SPA，而是让服务器直接发送包含用户想要查看的内容的 HTML 代码。纯客户端渲染存在首屏加载缓慢的问题，这可以通过服务器端渲染 (SSR) 或静态站点生成 (SSG) 来缓解。查看 SSR 指南以了解如何使用 Vue 实现 SSR。如果应用对交互性要求不高，可以使用传统的后端服务器来渲染 HTML，并在客户端使用 Vue 对其进行增强。

如果主应用必须是 SPA，但还有其他的营销相关页面 (落地页、关于页、博客等)，请单独部署这些页面！理想情况下，营销页面应该是包含尽可能少 JS 的静态 HTML，并用 SSG 方式部署。

#### 包体积与 Tree-shaking 优化

一个最有效的提升页面加载速度的方法就是压缩 JavaScript 打包产物的体积。当使用 Vue 时有下面一些办法来减小打包产物体积：

- 尽可能地采用构建步骤
  - 如果使用的是相对现代的打包工具，许多 Vue 的 API 都是可以被 tree-shake 的。举例来说，如果你根本没有使用到内置的 `<Transition>` 组件，它将不会被打包进入最终的产物里。Tree-shaking 也可以移除你源代码中其他未使用到的模块。
  - 当使用了构建步骤时，模板会被预编译，因此我们无须在浏览器中载入 Vue 编译器。这在同样最小化加上 gzip 优化下会相对缩小 14kb 并避免运行时的编译开销。
- 在引入新的依赖项时要小心包体积膨胀！在现实的应用中，包体积膨胀通常因为无意识地引入了过重的依赖导致的。
  - 如果使用了构建步骤，应当尽量选择提供 ES 模块格式的依赖，它们对 tree-shaking 更友好。举例来说，选择 lodash-es 比 lodash 更好。
  - 查看依赖的体积，并评估与其所提供的功能之间的性价比。如果依赖对 tree-shaking 友好，实际增加的体积大小将取决于你从它之中导入的 API。像 bundlejs.com 这样的工具可以用来做快速的检查，但是根据实际的构建设置来评估总是最准确的。
- 如果你只在渐进式增强的场景下使用 Vue，并想要避免使用构建步骤，请考虑使用 petite-vue (只有 6kb) 来代替。

#### 代码分割

代码分割是指构建工具将构建后的 JavaScript 包拆分为多个较小的，可以按需或并行加载的文件。通过适当的代码分割，页面加载时需要的功能可以立即下载，而额外的块只在需要时才加载，从而提高性能。

像 Rollup (Vite 就是基于它之上开发的) 或者 webpack 这样的打包工具可以通过分析 ESM 动态导入的语法来自动进行代码分割：

```js
// lazy.js 及其依赖会被拆分到一个单独的文件中
// 并只在 `loadLazy()` 调用时才加载
function loadLazy() {
  return import('./lazy.js')
}
```

懒加载对于页面初次加载时的优化帮助极大，它帮助应用暂时略过了那些不是立即需要的功能。在 Vue 应用中，这可以与 Vue 的异步组件搭配使用，为组件树创建分离的代码块：

```js
import { defineAsyncComponent } from 'vue'

// 会为 Foo.vue 及其依赖创建单独的一个块
// 它只会按需加载
//（即该异步组件在页面中被渲染时）
const Foo = defineAsyncComponent(() => import('./Foo.vue'))
```

对于使用了 Vue Router 的应用，强烈建议使用异步组件作为路由组件。Vue Router 已经显性地支持了独立于 defineAsyncComponent 的懒加载

### 更新优化

#### Props 稳定性

在 Vue 之中，一个子组件只会在其至少一个 props 改变时才会更新。思考以下示例：

```template
<ListItem
  v-for="item in list"
  :id="item.id"
  :active-id="activeId" />
```

在 `<ListItem>` 组件中，它使用了 id 和 activeId 两个 props 来确定它是否是当前活跃的那一项。虽然这是可行的，但问题是每当 activeId 更新时，列表中的每一个 `<ListItem>` 都会跟着更新！

理想情况下，只有活跃状态发生改变的项才应该更新。可以将活跃状态比对的逻辑移入父组件来实现这一点，然后让 `<ListItem>` 改为接收一个 active prop：

```template
<ListItem
  v-for="item in list"
  :id="item.id"
  :active="item.id === activeId" />
```

现在，对于大多数的组件来说，activeId 改变时，它们的 active prop 都会保持不变，因此它们无需再更新。总结一下，这个技巧的核心思想就是让传给子组件的 props 尽量保持稳定。

#### v-once

v-once 是一个内置的指令，可以用来渲染依赖运行时数据但无需再更新的内容。它的整个子树都会在未来的更新中被跳过。

#### v-memo

v-memo 是一个内置指令，可以用来有条件地跳过某些大型子树或者 v-for 列表的更新。

### 通用优化

#### 大型虚拟列表

- vue-virtual-scroller
- vue-virtual-scroll-grid
- vueuc/VVirtualList

#### 减少大型不可变数据的响应性开销

Vue 的响应性系统默认是深度的。虽然这让状态管理变得更直观，但在数据量巨大时，深度响应性也会导致不小的性能负担，因为每个属性访问都将触发代理的依赖追踪。

Vue 确实也为此提供了一种解决方案，通过使用 shallowRef() 和 shallowReactive() 来绕开深度响应。浅层式 API 创建的状态只在其顶层是响应式的，对所有深层的对象不会做任何处理。

## 搭配 TypeScript 使用 Vue

### 配置 tsconfig.json

通过 create-vue 搭建的项目包含了预先配置好的 tsconfig.json。其底层配置抽象于 `@vue/tsconfig` 包中。在项目内使用 `Project References` 来确保运行在不同环境下的代码的类型正确

手动配置 tsconfig.json 时，请留意以下选项：

- compilerOptions.isolatedModules 应当设置为 true，因为 Vite 使用 esbuild 来转译 TypeScript，并受限于单文件转译的限制。
- 如果你正在使用选项式 API，需要将 compilerOptions.strict 设置为 true (或者至少开启 compilerOptions.noImplicitThis，它是 strict 模式的一部分)，才可以获得对组件选项中 this 的类型检查。否则 this 会被认为是 any。
- 如果你在构建工具中配置了路径解析别名，例如 `@/*` 这个别名被默认配置在了 create-vue 项目中，你需要通过 compilerOptions.paths 选项为 TypeScript 再配置一遍。

#### defineComponent()

为了让 TypeScript 正确地推导出组件选项内的类型，我们需要通过 defineComponent() 这个全局 API 来定义组件：

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  // 启用了类型推导
  props: {
    name: String,
    msg: { type: String, required: true }
  },
  data() {
    return {
      count: 1
    }
  },
  mounted() {
    this.name // 类型：string | undefined
    this.msg // 类型：string
    this.count // 类型：number
  }
})
```

#### 在单文件组件中的用法

要在单文件组件中使用 TypeScript，需要在 `<script>` 标签上加上 lang="ts" 的 attribute。当 lang="ts" 存在时，所有的模板内表达式都将享受到更严格的类型检查。

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      count: 1
    }
  }
})
</script>

<template>
  <!-- 启用了类型检查和自动补全 -->
  {{ count.toFixed(2) }}
</template>
```

lang="ts" 也可以用于 `<script setup>`：

```vue
<script setup lang="ts">
// 启用了 TypeScript
import { ref } from 'vue'

const count = ref(1)
</script>

<template>
  <!-- 启用了类型检查和自动补全 -->
  {{ count.toFixed(2) }}
</template>
```

### TS 与组合式 API

> [TS 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html)

### TS 与选项式 API

> [TS 与选项式 API](https://cn.vuejs.org/guide/typescript/options-api.html)

## 渲染机制

### 渲染管线

从高层面的视角看，Vue 组件挂载时会发生如下几件事：

- 编译：Vue 模板被编译为渲染函数：即用来返回虚拟 DOM 树的函数。这一步骤可以通过构建步骤提前完成，也可以通过使用运行时编译器即时完成。
- 挂载：运行时渲染器调用渲染函数，遍历返回的虚拟 DOM 树，并基于它创建实际的 DOM 节点。这一步会作为响应式副作用执行，因此它会追踪其中所用到的所有响应式依赖。
- 更新：当一个依赖发生变化后，副作用会重新运行，这时候会创建一个更新后的虚拟 DOM 树。运行时渲染器遍历这棵新树，将它与旧树进行比较，然后将必要的更新应用到真实 DOM 上去。

### 带编译时信息的虚拟 DOM

下面，将讨论一些 Vue 编译器用来提高虚拟 DOM 运行时性能的主要优化：

#### 静态提升

在模板中常常有部分内容是不带任何动态绑定的：

```template
<div>
  <div>foo</div> <!-- 需提升 -->
  <div>bar</div> <!-- 需提升 -->
  <div>{{ dynamic }}</div>
</div>
```

foo 和 bar 这两个 div 是完全静态的，没有必要在重新渲染时再次创建和比对它们。Vue 编译器自动地会提升这部分 vnode 创建函数到这个模板的渲染函数之外，并在每次渲染时都使用这份相同的 vnode，渲染器知道新旧 vnode 在这部分是完全相同的，所以会完全跳过对它们的差异比对。此外，当有足够多连续的静态元素时，它们还会再被压缩为一个“静态 vnode”，其中包含的是这些节点相应的纯 HTML 字符串。这些静态节点会直接通过 innerHTML 来挂载。同时还会在初次挂载后缓存相应的 DOM 节点。如果这部分内容在应用中其他地方被重用，那么将会使用原生的 cloneNode() 方法来克隆新的 DOM 节点，这会非常高效。

#### 更新类型标记

对于单个有动态绑定的元素来说，可以在编译时推断出大量信息：

```template
<!-- 仅含 class 绑定 -->
<div :class="{ active }"></div>

<!-- 仅含 id 和 value 绑定 -->
<input :id="id" :value="value">

<!-- 仅含文本子节点 -->
<div>{{ dynamic }}</div>
```

在为这些元素生成渲染函数时，Vue 在 vnode 创建调用中直接编码了每个元素所需的更新类型：

```js
createElementVNode("div", {
  class: _normalizeClass({ active: _ctx.active })
}, null, 2 /* CLASS */)
```

最后这个参数 2 就是一个更新类型标记 (patch flag)。一个元素可以有多个更新类型标记，会被合并成一个数字。运行时渲染器也将会使用位运算来检查这些标记，确定相应的更新操作：

```js
if (vnode.patchFlag & PatchFlags.CLASS /* 2 */) {
  // 更新节点的 CSS class
}
```

位运算检查是非常快的。通过这样的更新类型标记，Vue 能够在更新带有动态绑定的元素时做最少的操作。

Vue 也为 vnode 的子节点标记了类型。举例来说，包含多个根节点的模板被表示为一个片段 (fragment)，大多数情况下，可以确定其顺序是永远不变的，所以这部分信息就可以提供给运行时作为一个更新类型标记。

```js
export function render() {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    /* children */
  ], 64 /* STABLE_FRAGMENT */))
}
```

运行时会完全跳过对这个根片段中子元素顺序的重新协调过程。

#### 树结构打平

再来看看上面这个例子中生成的代码，会发现所返回的虚拟 DOM 树是经一个特殊的 createElementBlock() 调用创建的

这里引入一个概念“区块”，内部结构是稳定的一个部分可被称之为一个区块。在这个用例中，整个模板只有一个区块，因为这里没有用到任何结构性指令 (比如 v-if 或者 v-for)。

每一个块都会追踪其所有带更新类型标记的后代节点 (不只是直接子节点)，举例来说：

```template
<div> <!-- root block -->
  <div>...</div>         <!-- 不会追踪 -->
  <div :id="id"></div>   <!-- 要追踪 -->
  <div>                  <!-- 不会追踪 -->
    <div>{{ bar }}</div> <!-- 要追踪 -->
  </div>
</div>
```

编译的结果会被打平为一个数组，仅包含所有动态的后代节点：

```null
div (block root)
- div 带有 :id 绑定
- div 带有 {{ bar }} 绑定
```

当这个组件需要重渲染时，只需要遍历这个打平的树而非整棵树。这也就是我们所说的树结构打平，这大大减少了我们在虚拟 DOM 协调时需要遍历的节点数量。模板中任何的静态部分都会被高效地略过。

v-if 和 v-for 指令会创建新的区块节点：

```template
<div> <!-- 根区块 -->
  <div>
    <div v-if> <!-- if 区块 -->
      ...
    <div>
  </div>
</div>
```

一个子区块会在父区块的动态子节点数组中被追踪，这为他们的父区块保留了一个稳定的结构。
