# Vue 经典面试题 2

> 原文 [又一个月，1.5W 字！50+Vue 经典面试题源码级详解，完结篇！](https://juejin.cn/post/7115055320913117220)

## Vue 3.0 的设计目标是什么？做了哪些优化?

分析：还是问新特性，陈述典型新特性，分析其给你带来的变化即可。

思路：从以下几方面分门别类阐述：易用性、性能、扩展性、可维护性、开发体验等

范例：

1. Vue3 的最大设计目标是替代 Vue2，为了实现这一点，Vue3 在以下几个方面做了很大改进，如：易用性、框架性能、扩展性、可维护性、开发体验等
2. 易用性方面主要是 API 简化，比如 v-model 在 Vue3 中变成了 Vue2 中 v-model 和 sync 修饰符的结合体，用户不用区分两者不同，也不用选择困难。类似的简化还有用于渲染函数内部生成 VNode 的 h(type, props, children)，其中 props 不用考虑区分属性、特性、事件等，框架替我们判断，易用性大增。
3. 开发体验方面，新组件 Teleport 传送门、Fragments 、Suspense 等都会简化特定场景的代码编写，SFC Composition API 语法糖更是极大提升我们开发体验。
4. 扩展性方面提升如独立的 reactivity 模块，custom renderer API 等
5. 可维护性方面主要是 Composition API，更容易编写高复用性的业务逻辑。还有对 TypeScript 支持的提升。
6. 性能方面的改进也很显著，例如编译期优化、基于 Proxy 的响应式系统
7. 使用 TypeScript 重构

可能的追问：

1. Vue3 做了哪些编译优化？
2. Proxy 和 defineProperty 有什么不同？

## 你了解哪些 Vue 性能优化方法？

分析：这是一道综合实践题目，写过一定数量的代码之后自然会开始关注一些优化方法，答得越多肯定实践经验也越丰富，是很好的题目。

答题思路：根据题目描述，这里主要探讨 Vue 代码层面的优化

回答范例：

这里主要从 Vue 代码编写层面说一些优化手段，例如：代码分割、服务端渲染、组件缓存、长列表优化等

- 最常见的路由懒加载：有效拆分 App 尺寸，访问时才异步加载

```js
const router = createRouter({
  routes: [
    // 借助webpack的import()实现异步组件
    { path: "/foo", component: () => import("./Foo.vue") },
  ],
})
```

- keep-alive 缓存页面：避免重复创建组件实例，且能保留缓存组件状态

```vue
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component"></component>
  </keep-alive>
</router-view>
```

- 使用 v-show 复用 DOM：避免重复创建组件

```xml
<template>
  <div class="cell">
    <!-- 这种情况用v-show复用DOM，比v-if效果好 -->
    <div v-show="value" class="on">
      <Heavy :n="10000"/>
    </div>
    <section v-show="!value" class="off">
      <Heavy :n="10000"/>
    </section>
  </div>
</template>
```

- v-for 遍历避免同时使用 v-if：实际上在 Vue3 中已经是个错误写法

```vue
<template>
  <ul>
    <!-- 避免同时使用，vue3中会报错 -->
    <!-- v-if="user.isActive" --> 
    <li v-for="user in activeUsers" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
<script>
export default {
  computed: {
    activeUsers: function () {
      return this.users.filter((user) => user.isActive)
    },
  },
}
</script>
```

- v-once 和 v-memo：不再变化的数据使用 v-once

```vue
<!-- single element -->
<span v-once>This will never change: {{msg}}</span>
<!-- the element have children -->
<div v-once>
  <h1>comment</h1>
  <p>{{msg}}</p>
</div>
<!-- component -->
<my-component v-once :comment="msg"></my-component>
<!-- `v-for` directive -->
<ul>
  <li v-for="i in list" v-once>{{i}}</li>
</ul>
```

按条件跳过更新时使用 v-memo：下面这个列表只会更新选中状态变化项

```vue
<div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
  <p>ID: {{ item.id }} - selected: {{ item.id === selected }}</p>
  <p>...more child nodes</p>
</div>
```

- 长列表性能优化：如果是大数据长列表，可采用虚拟滚动，只渲染少部分区域的内容

```vue
<recycle-scroller class="items" :items="items" :item-size="24">
  <template v-slot="{ item }">
    <FetchItemView
      :item="item"
      @vote="voteItem(item)"
    />
  </template>
</recycle-scroller>
```

> 一些开源库：[vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)，[vue-virtual-scroll-grid](https://github.com/rocwang/vue-virtual-scroll-grid)

- 事件的销毁：Vue 组件销毁时，会自动解绑它的全部指令及事件监听器，但是仅限于组件本身的事件。

```js
export default {
  created() {
    this.timer = setInterval(this.refresh, 2000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
}
```

- 图片懒加载：对于图片过多的页面，为了加速页面加载速度，所以很多时候需要将页面内未出现在可视区域内的图片先不做加载，等到滚动到可视区域后再去加载。

```vue
<img v-lazy="/static/img/1.png" />
```

> 参考项目：[vue-lazyload](https://github.com/hilongjw/vue-lazyload)

- 第三方插件按需引入

像 element-plus 这样的第三方组件库可以按需引入避免体积太大。

```js
import { createApp } from 'vue';
import { Button, Select } from 'element-plus';
​
const app = createApp()
app.use(Button)
app.use(Select)
```

- 子组件分割策略：较重的状态组件适合拆分

```vue
<template>
  <div>
    <ChildComp />
  </div>
</template>
​
<script>
export default {
  components: {
    ChildComp: {
      methods: {
        heavy() {
          /* 耗时任务 */
        },
      },
      render(h) {
        return h("div", this.heavy())
      },
    },
  },
}
</script>
```

但同时也不宜过度拆分组件，尤其是为了所谓组件抽象将一些不需要渲染的组件特意抽出来，组件实例消耗远大于纯 dom 节点。

- 服务端渲染/静态网站生成：SSR/SSG

如果 SPA 应用有首屏渲染慢的问题，可以考虑 SSR、SSG 方案优化。

## Vue 组件为什么只能有一个根元素?

这题现在有些落伍，vue3 已经不用一个根了。因此这题目很有说头！

体验一下：vue2 直接报错，test-v2.html

```js
new Vue({
  components: {
    comp: {
      template: `
        <div>root1</div>
        <div>root2</div>
      `,
    },
  },
}).$mount("#app")
```

vue3 中没有问题，test-v3.html 可以正常显示

```js
Vue.createApp({
  components: {
    comp: {
      template: `
        <div>root1</div>
        <div>root2</div>
      `,
    },
  },
}).mount("#app")
```

回答思路

- 给一条自己的结论
- 解释为什么会这样
- vue3 解决方法原理

范例

- vue2 中组件确实只能有一个根，但 vue3 中组件已经可以多根节点了。
- 之所以需要这样是因为 vdom 是一颗单根树形结构，patch 方法在遍历的时候从根节点开始遍历，它要求只有一个根节点。组件也会转换为一个 vdom，自然应该满足这个要求。
- vue3 中之所以可以写多个根节点，是因为引入了 Fragment 的概念，这是一个抽象的节点，如果发现组件是多根的，就创建一个 Fragment 节点，把多个根节点作为它的 children。将来 patch 的时候，如果发现是一个 Fragment 节点，则直接遍历 children 创建或更新。

知其所以然

- patch 方法接收单根 vdom：

> [github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/runtime-core/src/renderer.ts#L354-L355)

```js
// 直接获取type等，没有考虑数组的可能性
const { type, ref, shapeFlag } = n2
```

- patch 方法对 Fragment 的处理：

> [github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/runtime-core/src/renderer.ts#L1091-L1092)

```js
// a fragment can only have array children
// since they are either generated by the compiler, or implicitly created
// from arrays.
mountChildren(n2.children as VNodeArrayChildren, container, ...)
```

## 有使用过 vuex 的 module 吗？

这是基本应用能力考察，稍微上点规模的项目都要拆分 vuex 模块便于维护。

- 体验

```js
const moduleA = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}
const moduleB = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... }
}
const store = createStore({
  modules: {
    a: moduleA,
    b: moduleB
  }
})
store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
store.getters.c // -> moduleA里的getters
store.commit('d') // -> 能同时触发子模块中同名mutation
store.dispatch('e') // -> 能同时触发子模块中同名action
```

思路

- 概念和必要性
- 怎么拆
- 使用细节
- 优缺点

范例

1. 用过 module，项目规模变大之后，单独一个 store 对象会过于庞大臃肿，通过模块方式可以拆分开来便于维护
2. 可以按之前规则单独编写子模块代码，然后在主文件中通过 modules 选项组织起来：`createStore({modules:{...}})`
3. 不过使用时要注意访问子模块状态时需要加上注册时模块名：`store.state.a.xxx`，但同时 getters、mutations 和 actions 又在全局空间中，使用方式和之前一样。如果要做到完全拆分，需要在子模块加上 namespace 选项，此时再访问它们就要加上命名空间前缀。
4. 很显然，模块的方式可以拆分代码，但是缺点也很明显，就是使用起来比较繁琐复杂，容易出错。而且类型系统支持很差，不能给我们带来帮助。pinia 显然在这方面有了很大改进，是时候切换过去了。

可能的追问

- 用过 pinia 吗？都做了哪些改善？

## 怎么实现路由懒加载呢？

这是一道应用题。当打包应用时，JavaScript 包会变得非常大，影响页面加载。如果我们能把不同路由对应的组件分割成不同的代码块，然后当路由被访问时才加载对应组件，这样就会更加高效。

```js
// 将
// import UserDetails from './views/UserDetails'
// 替换为
const UserDetails = () => import('./views/UserDetails')
​
const router = createRouter({
  // ...
  routes: [{ path: '/users/:id', component: UserDetails }],
})
```

思路

1. 必要性
2. 何时用
3. 怎么用
4. 使用细节

回答范例

1. 当打包构建应用时，JavaScript 包会变得非常大，影响页面加载。利用路由懒加载我们能把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件，这样会更加高效，是一种优化手段。
2. 一般来说，对所有的路由都使用动态导入是个好主意。
3. 给 component 选项配置一个返回 Promise 组件的函数就可以定义懒加载路由。例如：`{ path: '/users/:id', component: () => import('./views/UserDetails') }`
4. 结合注释 `() => import(/* webpackChunkName: "group-user" */ './UserDetails.vue')` 可以做 webpack 代码分块，vite 中结合 rollupOptions 定义分块
5. 路由中不能使用异步组件

知其所以然

component (和 components) 配置如果接收一个返回 Promise 组件的函数，Vue Router 只会在第一次进入页面时才会获取这个函数，然后使用缓存数据。

## ref 和 reactive 异同

这是 Vue3 数据响应式中非常重要的两个概念，自然的，跟我们写代码关系也很大。

体验

```js
const count = ref(0)
console.log(count.value) // 0
​
count.value++
console.log(count.value) // 1

const obj = reactive({ count: 0 })
obj.count++
```

回答思路

1. 两者概念
2. 两者使用场景
3. 两者异同
4. 使用细节
5. 原理

回答范例

- ref 接收内部值（inner value）返回响应式 Ref 对象，reactive 返回响应式代理对象
- 从定义上看 ref 通常用于处理单值的响应式，reactive 用于处理对象类型的数据响应式
- 两者均是用于构造响应式数据，但是 ref 主要解决原始值的响应式问题
- ref 返回的响应式数据在 JS 中使用需要加上.value 才能访问其值，在视图中使用会自动脱 ref，不需要.value；ref 可以接收对象或数组等非原始值，但内部依然是 reactive 实现响应式；reactive 内部如果接收 Ref 对象会自动脱 ref；使用展开运算符(...)展开 reactive 返回的响应式对象会使其失去响应性，可以结合 toRefs()将值转换为 Ref 对象之后再展开。
- reactive 内部使用 Proxy 代理传入对象并拦截该对象各种操作（trap），从而实现响应式。ref 内部封装一个 RefImpl 类，并设置 get value/set value，拦截用户对值的访问，从而实现响应式。

知其所以然

reactive 实现响应式：[github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/reactivity/src/reactive.ts#L90-L91)

ref 实现响应式：[github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/reactivity/src/ref.ts#L73-L74)

## watch 和 watchEffect 异同

经常性需要侦测响应式数据的变化，vue3 中除了 watch 之外又出现了 watchEffect，不少同学会混淆这两个 api。

体验

watchEffect 立即运行一个函数，然后被动地追踪它的依赖，当这些依赖改变时重新执行该函数。

> Runs a function immediately while reactively tracking its dependencies and re-runs it whenever the dependencies are changed.

```js
const count = ref(0)
​
watchEffect(() => console.log(count.value))
// -> logs 0
​
count.value++
// -> logs 1
```

watch 侦测一个或多个响应式数据源并在数据源变化时调用一个回调函数。

> Watches one or more reactive data sources and invokes a callback function when the sources change.

```js
const state = reactive({ count: 0 })
watch(
  () => state.count,
  (count, prevCount) => {
    /* ... */
  }
)
```

思路

1. 给出两者定义
2. 给出场景上的不同
3. 给出使用方式和细节
4. 原理阐述

范例

1. watchEffect 立即运行一个函数，然后被动地追踪它的依赖，当这些依赖改变时重新执行该函数。watch 侦测一个或多个响应式数据源并在数据源变化时调用一个回调函数。
2. watchEffect(effect)是一种特殊 watch，传入的函数既是依赖收集的数据源，也是回调函数。如果我们不关心响应式数据变化前后的值，只是想拿这些数据做些事情，那么 watchEffect 就是我们需要的。watch 更底层，可以接收多种数据源，包括用于依赖收集的 getter 函数，因此它完全可以实现 watchEffect 的功能，同时由于可以指定 getter 函数，依赖可以控制的更精确，还能获取数据变化前后的值，因此如果需要这些时我们会使用 watch。
3. watchEffect 在使用时，传入的函数会立刻执行一次。watch 默认情况下并不会执行回调函数，除非我们手动设置 immediate 选项。
4. 从实现上来说，watchEffect(fn)相当于 watch(fn,fn,{immediate:true})

知其所以然

watchEffect 定义：[github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/runtime-core/src/apiWatch.ts#L80-L81)

```ts
export function watchEffect(
  effect: WatchEffect,
  options?: WatchOptionsBase
): WatchStopHandle {
  return doWatch(effect, null, options)
}
```

watch 定义如下：[github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/runtime-core/src/apiWatch.ts#L158-L159)

```ts
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
  source: T | WatchSource<T>,
  cb: any,
  options?: WatchOptions<Immediate>
): WatchStopHandle {
  return doWatch(source as any, cb, options)
}
```

很明显 watchEffect 就是一种特殊的 watch 实现。

## SPA、SSR 的区别是什么

现在编写的 Vue、React 和 Angular 应用大多数情况下都会在一个页面中，点击链接跳转页面通常是内容切换而非页面跳转，由于良好的用户体验逐渐成为主流的开发模式。但同时也会有首屏加载时间长，SEO 不友好的问题，因此有了 SSR，这也是为什么面试中会问到两者的区别。

思路分析

1. 两者概念
2. 两者优缺点分析
3. 使用场景差异
4. 其他选择

回答范例

1. SPA（Single Page Application）即单页面应用。一般也称为 客户端渲染（Client Side Render）， 简称 CSR。SSR（Server Side Render）即 服务端渲染。一般也称为 多页面应用（Mulpile Page Application），简称 MPA。
2. SPA 应用只会首次请求 html 文件，后续只需要请求 JSON 数据即可，因此用户体验更好，节约流量，服务端压力也较小。但是首屏加载的时间会变长，而且 SEO 不友好。为了解决以上缺点，就有了 SSR 方案，由于 HTML 内容在服务器一次性生成出来，首屏加载快，搜索引擎也可以很方便的抓取页面信息。但同时 SSR 方案也会有性能，开发受限等问题。
3. 在选择上，如果我们的应用存在首屏加载优化需求，SEO 需求时，就可以考虑 SSR。
4. 但并不是只有这一种替代方案，比如对一些不常变化的静态网站，SSR 反而浪费资源，我们可以考虑预渲染（prerender）方案。另外 nuxt.js/next.js 中给我们提供了 SSG（Static Site Generate）静态网站生成方案也是很好的静态站点解决方案，结合一些 CI 手段，可以起到很好的优化效果，且能节约服务器资源。

## vue-loader 是什么？它有什么作用？

体验

使用官方提供的 SFC playground 可以很好的体验 vue-loader。[sfc.vuejs.org](https://sfc.vuejs.org/)

有了 vue-loader 加持，才可以以 SFC 的方式快速编写代码。

```vue
<template>
  <div class="example">{{ msg }}</div>
</template>
​
<script>
export default {
  data() {
    return {
      msg: "Hello world!",
    }
  },
}
</script>
​
<style>
.example {
   color: red;
}
</style>
```

思路

1. vue-loader 是什么东西
2. vue-loader 是做什么用的
3. vue-loader 何时生效
4. vue-loader 如何工作

回答范例

1. vue-loader 是用于处理单文件组件（SFC，Single-File Component）的 webpack loader
2. 因为有了 vue-loader，我们就可以在项目中编写 SFC 格式的 Vue 组件，我们可以把代码分割为 `<template>`、`<script>`和 `<style>`，代码会异常清晰。结合其他 loader 我们还可以用 Pug 编写 `<template>`，用 SASS 编写`<style>`，用 TS 编写 `<script>`。 我们的 `<style>` 还可以单独作用当前组件。
3. webpack 打包时，会以 loader 的方式调用 vue-loader
4. vue-loader 被执行时，它会对 SFC 中的每个语言块用单独的 loader 链处理。最后将这些单独的块装配成最终的组件模块。

知其所以然

- vue-loader 会调用 `@vue/compiler-sfc` 模块解析 SFC 源码为一个描述符（Descriptor），然后为每个语言块生成 import 代码，返回的代码类似下面：

```js
// source.vue被vue-loader处理之后返回的代码
​
// import the <template> block
import render from 'source.vue?vue&type=template'
// import the <script> block
import script from 'source.vue?vue&type=script'
export * from 'source.vue?vue&type=script'
// import <style> blocks
import 'source.vue?vue&type=style&index=1'
​
script.render = render
export default script
```

- 我们想要 script 块中的内容被作为 js 处理（当然如果是`<script lang="ts">`被作为 ts 处理），这样我们想要 webpack 把配置中跟.js 匹配的规则都应用到形如 `source.vue?vue&type=script` 的这个请求上。例如我们对所有 `*.js` 配置了 babel-loader，这个规则将被克隆并应用到所在 Vue SFC 的

```js
import script from "source.vue?vue&type=script"
```

将被展开为：

```js
import script from "babel-loader!vue-loader!source.vue?vue&type=script"
```

类似的，如果我们对.sass 文件配置了 `style-loader` + `css-loader` + `sass-loader`，对下面的代码：

```html
<style scoped lang="scss">
```

vue-loader 将会返回下面结果：

```js
import "source.vue?vue&type=style&index=1&scoped&lang=scss"
```

然后 webpack 会展开如下：

```js
import "style-loader!css-loader!sass-loader!vue-loader!source.vue?vue&type=style&index=1&scoped&lang=scss"
```

- 当处理展开请求时，vue-loader 将被再次调用。这次，loader 将会关注那些有查询串的请求，且仅针对特定块，它会选中特定块内部的内容并传递给后面匹配的 loader。
- 对于 `<script>` 块，处理到这就可以了，但是 `<template>` 和 `<style>` 还有一些额外任务要做，比如：
  - 需要用 Vue 模板编译器编译 template，从而得到 render 函数
  - 需要对 `<style scoped>` 中的 CSS 做后处理（post-process），该操作在 css-loader 之后但在 style-loader 之前

实现上这些附加的 loader 需要被注入到已经展开的 loader 链上，最终的请求会像下面这样：

```js
// <template lang="pug">
import 'vue-loader/template-loader!pug-loader!source.vue?vue&type=template'
​
// <style scoped lang="scss">
import 'style-loader!vue-loader/style-post-loader!css-loader!sass-loader!vue-loader!source.vue?vue&type=style&index=1&scoped&lang=scss'
```

## 写过自定义指令吗？使用场景有哪些？

分析

这是一道 API 题，可能写的自定义指令少，但是用的多呀，多举几个例子就行。

体验

定义一个包含类似组件生命周期钩子的对象，钩子函数会接收指令挂钩的 dom 元素：

```js
const focus = {
  mounted: (el) => el.focus()
}
​
export default {
  directives: {
    // enables v-focus in template
    focus
  }
}
<input v-focus />
```

思路

1. 定义
2. 何时用
3. 如何用
4. 常用指令
5. vue3 变化

回答范例

- Vue 有一组默认指令，比如 v-model 或 v-for，同时 Vue 也允许用户注册自定义指令来扩展 Vue 能力
- 自定义指令主要完成一些可复用低层级 DOM 操作
- 使用自定义指令分为定义、注册和使用三步：
  - 定义自定义指令有两种方式：对象和函数形式，前者类似组件定义，有各种生命周期；后者只会在 mounted 和 updated 时执行
  - 注册自定义指令类似组件，可以使用 app.directive()全局注册，使用 `{directives:{xxx}}` 局部注册
  - 使用时在注册名称前加上 v-即可，比如 v-focus
- 在项目中常用到一些自定义指令，例如：
  - 复制粘贴 v-copy
  - 长按 v-longpress
  - 防抖 v-debounce
  - 图片懒加载 v-lazy
  - 按钮权限 v-premission
  - 页面水印 v-waterMarker
  - 拖拽指令 v-draggable
- vue3 中指令定义发生了比较大的变化，主要是钩子的名称保持和组件一致，这样开发人员容易记忆，不易犯错。另外在 v3.2 之后，可以在 setup 中以一个小写 v 开头方便的定义自定义指令，更简单了

知其所以然

编译后的自定义指令会被 withDirective 函数装饰，进一步处理生成的 vnode，添加到特定属性中。

## 说下 $attrs 和 $listeners 的使用场景

分析

API 考察，但$attrs和$listeners 是比较少用的边界知识，而且 vue3 有变化，$listeners 已经移除，还是有细节可说的。

思路

- 这两个 api 的作用
- 使用场景分析
- 使用方式和细节
- vue3 变化

体验

一个包含组件透传属性的对象。

```vue
<template>
  <child-component v-bind="$attrs">
    将非属性特性透传给内部的子组件
  </child-component>
</template>
```

- 可能会有一些属性和事件没有在 props 中定义，这类称为非属性特性，结合 v-bind 指令可以直接透传给内部的子组件。
- 这类“属性透传”常常用于包装高阶组件时往内部传递属性，常用于爷孙组件之间传参。比如我在扩展 A 组件时创建了组件 B 组件，然后在 C 组件中使用 B，此时传递给 C 的属性中只有 props 里面声明的属性是给 B 使用的，其他的都是 A 需要的，此时就可以利用 v-bind="$attrs"透传下去。
- 最常见用法是结合 v-bind 做展开；$attrs 本身不是响应式的，除非访问的属性本身是响应式对象。
- vue2 中使用 listeners 获取事件，vue3 中已移除，均合并到 attrs 中，使用起来更简单了。

原理

查看透传属性 foo 和普通属性 bar，发现 vnode 结构完全相同，这说明 vue3 中将分辨两者工作由框架完成而非用户指定：

```vue
<template>
  <h1>{{ msg }}</h1>
  <comp foo="foo" bar="bar" />
</template>

<template>
  <div>{{ $attrs.foo }} {{ bar }}</div>
</template>
<script setup>
defineProps({
  bar: String,
})
</script>
```

```js
_createVNode(Comp, {
  foo: "foo",
  bar: "bar",
})
```

## v-once 的使用场景有哪些？

分析

v-once 是 Vue 中内置指令，很有用的 API，在优化方面经常会用到，不过小伙伴们平时可能容易忽略它。

体验

仅渲染元素和组件一次，并且跳过未来更新

```html
<!-- single element -->
<span v-once>This will never change: {{msg}}</span>
<!-- the element have children -->
<div v-once>
  <h1>comment</h1>
  <p>{{msg}}</p>
</div>
<!-- component -->
<my-component v-once :comment="msg"></my-component>
<!-- `v-for` directive -->
<ul>
  <li v-for="i in list" v-once>{{i}}</li>
</ul>
```

思路

- v-once 是什么
- 什么时候使用
- 如何使用
- 扩展 v-memo
- 探索原理

回答范例

- v-once 是 vue 的内置指令，作用是仅渲染指定组件或元素一次，并跳过未来对其更新。
- 如果我们有一些元素或者组件在初始化渲染之后不再需要变化，这种情况下适合使用 v-once，这样哪怕这些数据变化，vue 也会跳过更新，是一种代码优化手段。
- 只需要作用的组件或元素上加上 v-once 即可。
- vue3.2 之后，又增加了 v-memo 指令，可以有条件缓存部分模板并控制它们的更新，可以说控制力更强了。
- 编译器发现元素上面有 v-once 时，会将首次计算结果存入缓存对象，组件再次渲染时就会从缓存获取，从而避免再次计算。

知其所以然

下面例子使用了 v-once：

```vue
<script setup>
import { ref } from 'vue'
​
const msg = ref('Hello World!')
</script>
​
<template>
  <h1 v-once>{{ msg }}</h1>
  <input v-model="msg" />
</template>
```

我们发现 v-once 出现后，编译器会缓存作用元素或组件，从而避免以后更新时重新计算这一部分：

```js
// ...
return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    // 从缓存获取vnode
    _cache[0] || (
      _setBlockTracking(-1),
      _cache[0] = _createElementVNode("h1", null, [
        _createTextVNode(_toDisplayString(msg.value), 1 /* TEXT */)
      ]),
      _setBlockTracking(1),
      _cache[0]
    ),
// ...
```

## 什么是递归组件？举个例子说明下？

分析

递归组件我们用的比较少，但是在 Tree、Menu 这类组件中会被用到。

体验

组件通过组件名称引用它自己，这种情况就是递归组件。

```vue
<template>
  <li>
    <div>{{ model.name }}</div>
    <ul v-show="isOpen" v-if="isFolder">
      <!-- 注意这里：组件递归渲染了它自己 -->
      <TreeItem class="item" v-for="model in model.children" :model="model">
      </TreeItem>
    </ul>
  </li>
  <script>
    export default {
      name: "TreeItem", // ...
    }
  </script>
</template>
```

思路

1. 下定义
2. 使用场景
3. 使用细节
4. 原理阐述

回答范例

1. 如果某个组件通过组件名称引用它自己，这种情况就是递归组件。
2. 实际开发中类似 Tree、Menu 这类组件，它们的节点往往包含子节点，子节点结构和父节点往往是相同的。这类组件的数据往往也是树形结构，这种都是使用递归组件的典型场景。
3. 使用递归组件时，由于我们并未也不能在组件内部导入它自己，所以设置组件 name 属性，用来查找组件定义，如果使用 SFC，则可以通过 SFC 文件名推断。组件内部通常也要有递归结束条件，比如 model.children 这样的判断。
4. 查看生成渲染函数可知，递归组件查找时会传递一个布尔值给 resolveComponent，这样实际获取的组件就是当前组件本身。

知其所以然

递归组件编译结果中，获取组件时会传递一个标识符 `_resolveComponent("Comp", true)`

```js
const _component_Comp = _resolveComponent("Comp", true)
```

就是在传递 maybeSelfReference

```ts
export function resolveComponent(
  name: string,
  maybeSelfReference?: boolean
): ConcreteComponent | string {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name
}
```

resolveAsset 中最终返回的是组件自身：

```js
if (!res && maybeSelfReference) {
  // fallback to implicit self-reference
  return Component
}
```

## 异步组件是什么？使用场景有哪些？

分析

因为异步路由的存在，我们使用异步组件的次数比较少，因此还是有必要两者的不同。

体验

大型应用中，需要分割应用为更小的块，并且在需要组件时再加载它们。

```js
import { defineAsyncComponent } from "vue"
// defineAsyncComponent定义异步组件
const AsyncComp = defineAsyncComponent(() => {
  // 加载函数返回Promise
  return new Promise((resolve, reject) => {
    // ...可以从服务器加载组件
    resolve(/* loaded component */)
  })
})
// 借助打包工具实现ES模块动态导入
const AsyncComp = defineAsyncComponent(() =>
  import("./components/MyComponent.vue")
)
```

思路

- 异步组件作用
- 何时使用异步组件
- 使用细节
- 和路由懒加载的不同

范例

- 在大型应用中，我们需要分割应用为更小的块，并且在需要组件时再加载它们。
- 我们不仅可以在路由切换时懒加载组件，还可以在页面组件中继续使用异步组件，从而实现更细的分割粒度。
- 使用异步组件最简单的方式是直接给 defineAsyncComponent 指定一个 loader 函数，结合 ES 模块动态导入函数 import 可以快速实现。我们甚至可以指定 loadingComponent 和 errorComponent 选项从而给用户一个很好的加载反馈。另外 Vue3 中还可以结合 Suspense 组件使用异步组件。
- 异步组件容易和路由懒加载混淆，实际上不是一个东西。异步组件不能被用于定义懒加载路由上，处理它的是 vue 框架，处理路由组件加载的是 vue-router。但是可以在懒加载的路由组件中使用异步组件

知其所以然

defineAsyncComponent 定义了一个高阶组件，返回一个包装组件。包装组件根据加载器的状态决定渲染什么内容。

## 怎么处理 vue 项目中的错误的？

分析

这是一个综合应用题目，在项目中我们常常需要将 App 的异常上报，此时错误处理就很重要了。

这里要区分错误的类型，针对性做收集。

然后是将收集的的错误信息上报服务器。

思路

- 首先区分错误类型
- 根据错误不同类型做相应收集
- 收集的错误是如何上报服务器的

回答范例

- 应用中的错误类型分为"接口异常"和“代码逻辑异常”
- 我们需要根据不同错误类型做相应处理：接口异常是我们请求后端接口过程中发生的异常，可能是请求失败，也可能是请求获得了服务器响应，但是返回的是错误状态。以 Axios 为例，这类异常我们可以通过封装 Axios，在拦截器中统一处理整个应用中请求的错误。代码逻辑异常是我们编写的前端代码中存在逻辑上的错误造成的异常，vue 应用中最常见的方式是使用全局错误处理函数 app.config.errorHandler 收集错误。
- 收集到错误之后，需要统一处理这些异常：分析错误，获取需要错误信息和数据。这里应该有效区分错误类型，如果是请求错误，需要上报接口信息，参数，状态码等；对于前端逻辑异常，获取错误名称和详情即可。另外还可以收集应用名称、环境、版本、用户信息，所在页面等。这些信息可以通过 vuex 存储的全局状态和路由信息获取。

实践

axios 拦截器中处理捕获异常：

```js
// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 存在response说明服务器有响应
    if (error.response) {
      let response = error.response
      if (response.status >= 400) {
        handleError(response)
      }
    } else {
      handleError(null)
    }
    return Promise.reject(error)
  }
)
```

vue 中全局捕获异常：

```js
import { createApp } from 'vue'
​
const app = createApp(...)
​
app.config.errorHandler = (err, instance, info) => {
  // report error to tracking services
}
```

处理接口请求错误：

```js
function handleError(error, type) {
  if(type == 1) {
    // 接口错误，从config字段中获取请求信息
    let { url, method, params, data } = error.config
    let err_data = {
       url, method,
       params: { query: params, body: data },
       error: error.data?.message || JSON.stringify(error.data),
    })
  }
}
```

处理前端逻辑错误：

```js
function handleError(error, type) {
  if (type == 2) {
    let errData = null // 逻辑错误
    if (error instanceof Error) {
      let { name, message } = error
      errData = {
        type: name,
        error: message,
      }
    } else {
      errData = {
        type: "other",
        error: JSON.strigify(error),
      }
    }
  }
}
```

## 如果让你从零开始写一个 vuex，说说你的思路

思路分析

这个题目很有难度，首先思考 vuex 解决的问题：存储用户全局状态并提供管理状态 API。

- vuex 需求分析
- 如何实现这些需求

回答范例

- 官方说 vuex 是一个状态管理模式和库，并确保这些状态以可预期的方式变更。可见要实现一个 vuex：
  - 要实现一个 Store 存储全局状态
  - 要提供修改状态所需 API：commit(type, payload), dispatch(type, payload)
- 实现 Store 时，可以定义 Store 类，构造函数接收选项 options，设置属性 state 对外暴露状态，提供 commit 和 dispatch 修改属性 state。这里需要设置 state 为响应式对象，同时将 Store 定义为一个 Vue 插件。
- commit(type, payload)方法中可以获取用户传入 mutations 并执行它，这样可以按用户提供的方法修改状态。 dispatch(type, payload)类似，但需要注意它可能是异步的，需要返回一个 Promise 给用户以处理异步结果。

实践

Store 的实现：

```js
class Store {
  constructor(options) {
    this.state = reactive(options.state)
    this.options = options
  }
  commit(type, payload) {
    this.options.mutations[type].call(this, this.state, payload)
  }
}
```

知其所以然

Vuex 中 Store 的实现：[github1s.com/vuejs/vuex/…](https://github1s.com/vuejs/vuex/blob/HEAD/src/store.js#L19-L20)

## vuex 中 actions 和 mutations 有什么区别？

题目分析

mutations 和 actions 是 vuex 带来的两个独特的概念。新手程序员容易混淆，所以面试官喜欢问。

我们只需记住修改状态只能是 mutations，actions 只能通过提交 mutation 修改状态即可。

体验

看下面例子可知，Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。

```js
const store = createStore({
  state: {
    count: 0,
  },
  mutations: {
    increment(state) {
      state.count++
    },
  },
  actions: {
    increment(context) {
      context.commit("increment")
    },
  },
})
```

答题思路

- 给出两者概念说明区别
- 举例说明应用场景
- 使用细节不同
- 简单阐述实现上差异

回答范例

- 官方文档说：更改 Vuex 的 store 中的状态的唯一方法是提交 mutation，mutation 非常类似于事件：每个 mutation 都有一个字符串的类型 (type)和一个 回调函数 (handler) 。Action 类似于 mutation，不同在于：Action 可以包含任意异步操作，但它不能修改状态， 需要提交 mutation 才能变更状态。
- 因此，开发时，包含异步操作或者复杂业务组合时使用 action；需要直接修改状态则提交 mutation。但由于 dispatch 和 commit 是两个 API，容易引起混淆，实践中也会采用统一使用 dispatch action 的方式。
- 调用 dispatch 和 commit 两个 API 时几乎完全一样，但是定义两者时却不甚相同，mutation 的回调函数接收参数是 state 对象。action 则是与 Store 实例具有相同方法和属性的上下文 context 对象，因此一般会解构它为{commit, dispatch, state}，从而方便编码。另外 dispatch 会返回 Promise 实例便于处理内部异步结果。
- 实现上 commit(type)方法相当于调用`options.mutations[type](state)`；dispatch(type)方法相当于调用`options.actions[type](store)`，这样就很容易理解两者使用上的不同了。

知其所以然

可以像下面这样简单实现 commit 和 dispatch，从而辨别两者不同：

```js
class Store {
  constructor(options) {
    this.state = reactive(options.state)
    this.options = options
  }
  commit(type, payload) {
    // 传入上下文和参数1都是state对象
    this.options.mutations[type].call(this.state, this.state, payload)
  }
  dispatch(type, payload) {
    // 传入上下文和参数1都是store本身
    this.options.actions[type].call(this, this, payload)
  }
}
```

## 使用 vue 渲染大量数据时应该怎么优化？说下你的思路

分析

企业级项目中渲染大量数据的情况比较常见，因此这是一道非常好的综合实践题目。

思路

- 描述大数据量带来的问题
- 分不同情况做不同处理
- 总结一下

回答

- 在大型企业级项目中经常需要渲染大量数据，此时很容易出现卡顿的情况。比如大数据量的表格、树。
- 处理时要根据情况做不通处理：
  - 可以采取分页的方式获取，避免渲染大量数据
  - vue-virtual-scroller 等虚拟滚动方案，只渲染视口范围内的数据
  - 如果不需要更新，可以使用 v-once 方式只渲染一次
  - 通过 v-memo 可以缓存结果，结合 v-for 使用，避免数据变化时不必要的 VNode 创建
  - 可以采用懒加载方式，在用户需要的时候再加载数据，比如 tree 组件子树的懒加载
- 总之，还是要看具体需求，首先从设计上避免大数据获取和渲染；实在需要这样做可以采用虚表的方式优化渲染；最后优化更新，如果不需要更新可以 v-once 处理，需要更新可以 v-memo 进一步优化大数据更新性能。其他可以采用的是交互方式优化，无线滚动、懒加载等方案。

## 怎么监听 vuex 数据的变化？

vuex 数据状态是响应式的，所以状态变视图跟着变，但是有时还是需要知道数据状态变了从而做一些事情。

既然状态都是响应式的，那自然可以 watch，另外 vuex 也提供了订阅的 API：store.subscribe()。

思路

- 总述知道的方法
- 分别阐述用法
- 选择和场景

回答范例

- 我知道几种方法：
  - 可以通过 watch 选项或者 watch 方法监听状态
  - 可以使用 vuex 提供的 API：store.subscribe()
- watch 选项方式，可以以字符串形式监听$store.state.xx；subscribe 方式，可以调用 store.subscribe(cb),回调函数接收 mutation 对象和 state 对象，这样可以进一步判断 mutation.type 是否是期待的那个，从而进一步做后续处理。
- watch 方式简单好用，且能获取变化前后值，首选；subscribe 方法会被所有 commit 行为触发，因此还需要判断 mutation.type，用起来略繁琐，一般用于 vuex 插件中。

实践

watch 方式

```js
const app = createApp({
  watch: {
    "$store.state.counter"() {
      console.log("counter change!")
    },
  },
})
```

subscribe 方式：

```js
store.subscribe((mutation, state) => {
  if (mutation.type === "add") {
    console.log("counter change in subscribe()!")
  }
})
```

## router-link 和 router-view 是如何起作用的？

分析

vue-router 中两个重要组件 router-link 和 router-view，分别起到导航作用和内容渲染作用，但是回答如何生效还真有一定难度哪！

思路

- 两者作用
- 阐述使用方式
- 原理说明

回答范例

- vue-router 中两个重要组件 router-link 和 router-view，分别起到路由导航作用和组件内容渲染作用
- 使用中 router-link 默认生成一个 a 标签，设置 to 属性定义跳转 path。实际上也可以通过 custom 和插槽自定义最终的展现形式。router-view 是要显示组件的占位组件，可以嵌套，对应路由配置的嵌套关系，配合 name 可以显示具名组件，起到更强的布局作用。
- router-link 组件内部根据 custom 属性判断如何渲染最终生成节点，内部提供导航方法 navigate，用户点击之后实际调用的是该方法，此方法最终会修改响应式的路由变量，然后重新去 routes 匹配出数组结果，router-view 则根据其所处深度 deep 在匹配数组结果中找到对应的路由并获取组件，最终将其渲染出来。

知其所以然

RouterLink 定义：[github1s.com/vuejs/route…](https://github1s.com/vuejs/router/blob/HEAD/src/RouterLink.ts#L184-L185)

RouterView 定义：[github1s.com/vuejs/route…](https://github1s.com/vuejs/router/blob/HEAD/src/RouterView.ts#L43-L44)

## Vue-router 除了 router-link 怎么实现跳转

分析

vue-router 导航有两种方式：声明式导航和编程方式导航

体验

声明式导航

```html
<router-link to="/about">Go to About</router-link>
```

编程导航

```js
// literal string path
router.push('/users/eduardo')
​
// object with path
router.push({ path: '/users/eduardo' })
​
// named route with params to let the router build the url
router.push({ name: 'user', params: { username: 'eduardo' } })
```

思路

- 两种方式
- 分别阐述使用方式
- 区别和选择
- 原理说明

回答范例

- vue-router 导航有两种方式：声明式导航和编程方式导航
- 声明式导航方式使用 router-link 组件，添加 to 属性导航；编程方式导航更加灵活，可传递调用 router.push()，并传递 path 字符串或者 RouteLocationRaw 对象，指定 path、name、params 等信息
- 如果页面中简单表示跳转链接，使用 router-link 最快捷，会渲染一个 a 标签；如果页面是个复杂的内容，比如商品信息，可以添加点击事件，使用编程式导航
- 实际上内部两者调用的导航函数是一样的

知其所以然

[github1s.com/vuejs/route…](https://github1s.com/vuejs/router/blob/HEAD/packages/router/src/RouterLink.ts#L184-L185)

routerlink 点击跳转，调用的是 navigate 方法，navigate 内部依然调用的 push

## Vue3.0 性能提升体现在哪些方面？

分析

vue3 在设计时有几个目标：更小、更快、更友好，这些多数适合性能相关，因此可以围绕介绍。

思路

- 总述和性能相关的新特性
- 逐个说细节
- 能说点原理更佳

回答范例

- 分别从代码、编译、打包三方面介绍 vue3 性能方面的提升
- 代码层面性能优化主要体现在全新响应式 API，基于 Proxy 实现，初始化时间和内存占用均大幅改进；
- 编译层面做了更多编译优化处理，比如静态提升、动态标记、事件缓存，区块等，可以有效跳过大量 diff 过程；
- 打包时更好的支持 tree-shaking，因此整体体积更小，加载更快

体验

通过 playground 体验编译优化：[sfc.vuejs.org](https://sfc.vuejs.org)

知其所以然

为什么基于 Proxy 更快了：初始化时懒处理，用户访问才做拦截处理，初始化更快：[github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/reactivity/src/baseHandlers.ts#L136-L137)

轻量的依赖关系保存：利用 WeakMap、Map 和 Set 保存响应式数据和副作用之间的依赖关系：[github1s.com/vuejs/core/…](https://github1s.com/vuejs/core/blob/HEAD/packages/reactivity/src/effect.ts#L19-L20)

## Vue3.0 里为什么要用 Proxy 替代 defineProperty ？

分析

Vue3 中最重大的更新之一就是响应式模块 reactivity 的重写。主要的修改就是 Proxy 替换 defineProperty 实现响应式。

此变化主要是从性能方面考量。

思路

- 属性拦截的几种方式
- defineProperty 的问题
- Proxy 的优点
- 其他考量

回答范例

- JS 中做属性拦截常见的方式有三：: defineProperty，getter/setters 和 Proxies.
- Vue2 中使用 defineProperty 的原因是，2013 年时只能用这种方式。由于该 API 存在一些局限性，比如对于数组的拦截有问题，为此 vue 需要专门为数组响应式做一套实现。另外不能拦截那些新增、删除属性；最后 defineProperty 方案在初始化时需要深度递归遍历待处理的对象才能对它进行完全拦截，明显增加了初始化的时间。
- 以上两点在 Proxy 出现之后迎刃而解，不仅可以对数组实现拦截，还能对 Map、Set 实现拦截；另外 Proxy 的拦截也是懒处理行为，如果用户没有访问嵌套对象，那么也不会实施拦截，这就让初始化的速度和内存占用都改善了。
- 当然 Proxy 是有兼容性问题的，IE 完全不支持，所以如果需要 IE 兼容就不合适

知其所以然

Proxy 属性拦截的原理：利用 get、set、deleteProperty 这三个 trap 实现拦截

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {},
    set(target, key, val) {},
    deleteProperty(target, key) {},
  })
}
```

Object.defineProperty 属性拦截原理：利用 get、set 这两个 trap 实现拦截

```js
function defineReactive(obj, key, val) {
  Object.defineReactive(obj, key, {
    get(key) {},
    set(key, val) {},
  })
}
```

## History 模式和 Hash 模式有何区别？

分析

vue-router 有 3 个模式，其中两个更为常用，那便是 history 和 hash。两者差别主要在显示形式和部署上。

体验

vue-router4.x 中设置模式已经变化：

```js
const router = createRouter({
  history: createWebHashHistory(), // hash模式
  history: createWebHistory(), // history模式
})
```

用起来一模一样

```html
<router-link to="/about">Go to About</router-link>
```

区别只在 url 形式

```js
// hash
// 浏览器里的形态：http://xx.com/#/about
// history
// 浏览器里的形态：http://xx.com/about
```

思路

- 区别
- 详细阐述
- 实现

回答范例

- vue-router 有 3 个模式，其中 history 和 hash 更为常用。两者差别主要在显示形式、seo 和部署上。
- hash 模式在地址栏显示的时候是已哈希的形式：#/xxx，这种方式使用和部署简单，但是不会被搜索引擎处理，seo 有问题；history 模式则建议用在大部分 web 项目上，但是它要求应用在部署时做特殊配置，服务器需要做回退处理，否则会出现刷新页面 404 的问题。
- 底层实现上其实 hash 是一种特殊的 history 实现。

知其所以然

hash 是一种特殊的 history 实现：[github1s.com/vuejs/route…](https://github1s.com/vuejs/router/blob/HEAD/src/history/hash.ts#L31-L32)

## 在什么场景下会用到嵌套路由？

分析

应用的有些界面是由多层级组件组合而来的，这种情况下，url 各部分通常对应某个嵌套的组件，vue-router 中就可以使用嵌套路由表示这种关系：[router.vuejs.org/guide/essen…](https://router.vuejs.org/guide/essentials/nested-routes.html)

![img1](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3da6683da0204acda653d94fdedfd9c3~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

体验

定义嵌套路由，对应上图嵌套关系：

```js
const routes = [
  {
    path: "/user/:id",
    component: User,
    children: [
      {
        // UserProfile 会被渲染在 User 组件中的 <router-view> 里
        path: "profile",
        component: UserProfile,
      },
      {
        // UserPosts 会被渲染在 User 组件中的 <router-view> 里
        path: "posts",
        component: UserPosts,
      },
    ],
  },
]
```

思路

- 概念和使用场景
- 使用方式
- 实现原理

回答范例

- 平时开发中，应用的有些界面是由多层级组件组合而来的，这种情况下，url 各部分通常对应某个嵌套的组件，vue-router 中可以使用嵌套路由表示这种关系
- 表现形式是在两个路由间切换时，它们有公用的视图内容。此时通常提取一个父组件，内部放上，从而形成物理上的嵌套，和逻辑上的嵌套对应起来
- 定义嵌套路由时使用 children 属性组织嵌套关系
- 原理上是在 router-view 组件内部判断当前 router-view 处于嵌套层级的深度，讲这个深度作为匹配组件数组 matched 的索引，获取对应渲染组件，渲染之

知其所以然

router-view 获取自己所在的深度：默认 0，加 1 之后传给后代，同时根据深度获取匹配路由。

![img2](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/edc6b0d7873640d5aa2cb73a9006a971~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

## 页面刷新后 vuex 的 state 数据丢失怎么解决？

分析

这是一道应用题目，很容易想到使用 localStorage 或数据库存储并还原状态。

但是如何优雅编写代码还是能体现认知水平。

体验

可以从 localStorage 中获取作为状态初始值：

```js
const store = createStore({
  state() {
    return {
      count: localStorage.getItem("count"),
    }
  },
})
```

业务代码中，提交修改状态同时保存最新值：虽说实现了，但是每次还要手动刷新 localStorage 不太优雅

```js
store.commit("increment")
localStorage.setItem("count", store.state.count)
```

思路

- 问题描述
- 解决方法
- 谈个人理解
- 三方库原理探讨

回答范例

- vuex 只是在内存保存状态，刷新之后就会丢失，如果要持久化就要存起来。
- localStorage 就很合适，提交 mutation 的时候同时存入 localStorage，store 中把值取出作为 state 的初始值即可。
- 这里有两个问题，不是所有状态都需要持久化；如果需要保存的状态很多，编写的代码就不够优雅，每个提交的地方都要单独做保存处理。这里就可以利用 vuex 提供的 subscribe 方法做一个统一的处理。甚至可以封装一个 vuex 插件以便复用。
- 类似的插件有 vuex-persist、vuex-persistedstate，内部的实现就是通过订阅 mutation 变化做统一处理，通过插件的选项控制哪些需要持久化

知其所以然

可以看一下 vuex-persist 内部确实是利用 subscribe 实现的：[github.com/championswi…](https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L277)

## 你觉得 vuex 有什么缺点？

分析

相较于 redux，vuex 已经相当简便好用了。但模块的使用比较繁琐，对 ts 支持也不好。

体验

使用模块：用起来比较繁琐，使用模式也不统一，基本上得不到类型系统的任何支持

```js
const store = createStore({
  modules: {
    a: moduleA,
  },
})
store.state.a // -> 要带上 moduleA 的key，内嵌模块的话会很长，不得不配合mapState使用
store.getters.c // -> moduleA里的getters，没有namespaced时又变成了全局的
store.getters["a/c"] // -> 有namespaced时要加path，使用模式又和state不一样
store.commit("d") // -> 没有namespaced时变成了全局的，能同时触发多个子模块中同名mutation
store.commit("a/d") // -> 有namespaced时要加path，配合mapMutations使用感觉也没简化
```

思路

- 先夸再贬
- 使用感受
- 解决方案

回答范例

- vuex 利用响应式，使用起来已经相当方便快捷了。但是在使用过程中感觉模块化这一块做的过于复杂，用的时候容易出错，还要经常查看文档
- 比如：访问 state 时要带上模块 key，内嵌模块的话会很长，不得不配合 mapState 使用，加不加 namespaced 区别也很大，getters，mutations，actions 这些默认是全局，加上之后必须用字符串类型的 path 来匹配，使用模式不统一，容易出错；对 ts 的支持也不友好，在使用模块时没有代码提示。
- 之前 Vue2 项目中用过 vuex-module-decorators 的解决方案，虽然类型支持上有所改善，但又要学一套新东西，增加了学习成本。pinia 出现之后使用体验好了很多，Vue3 + pinia 会是更好的组合。

知其所以然

下面我们来看看 vuex 中 `store.state.x.y` 这种嵌套的路径是怎么搞出来的。

首先是子模块安装过程：父模块状态 parentState 上面设置了子模块名称 moduleName，值为当前模块 state 对象。放在上面的例子中相当于：`store.state['x'] = moduleX.state`。此过程是递归的，那么`store.state.x.y`安装时就是：`store.state['x']['y'] = moduleY.state`。

```js
if (!isRoot && !hot) {
  // 获取父模块state
  const parentState = getNestedState(rootState, path.slice(0, -1)) // 获取子模块名称
  const moduleName = path[path.length - 1]
  store._withCommit(() => {
    // 把子模块state设置到父模块上
    parentState[moduleName] = module.state
  })
}
```

> 源码地址：[github1s.com/vuejs/vuex/…](https://github1s.com/vuejs/vuex/blob/HEAD/src/store-util.js#L102-L115)

## Composition API 与 Options API 有什么不同

分析

Vue3 最重要更新之一就是 Composition API，它具有一些列优点，其中不少是针对 Options API 暴露的一些问题量身打造。是 Vue3 推荐的写法，因此掌握好 Composition API 应用对掌握好 Vue3 至关重要。

体验

Composition API 能更好的组织代码，下面这个代码用 options api 实现

![img3](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a280d15533ad4481a6121064940eae1b~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

如果用 composition api 可以提取为 useCount()，用于组合、复用

![img4](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1aa01aeeff224815bef1356b773fae2d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

思路

- 总述不同点
- composition api 动机
- 两者选择

回答范例

- Composition API 是一组 API，包括：Reactivity API、生命周期钩子、依赖注入，使用户可以通过导入函数方式编写 vue 组件。而 Options API 则通过声明组件选项的对象形式编写组件。
- Composition API 最主要作用是能够简洁、高效复用逻辑。解决了过去 Options API 中 mixins 的各种缺点；另外 Composition API 具有更加敏捷的代码组织能力，很多用户喜欢 Options API，认为所有东西都有固定位置的选项放置代码，但是单个组件增长过大之后这反而成为限制，一个逻辑关注点分散在组件各处，形成代码碎片，维护时需要反复横跳，Composition API 则可以将它们有效组织在一起。最后 Composition API 拥有更好的类型推断，对 ts 支持更友好，Options API 在设计之初并未考虑类型推断因素，虽然官方为此做了很多复杂的类型体操，确保用户可以在使用 Options API 时获得类型推断，然而还是没办法用在 mixins 和 provide/inject 上。
- Vue3 首推 Composition API，但是这会让我们在代码组织上多花点心思，因此在选择上，如果我们项目属于中低复杂度的场景，Options API 仍是一个好选择。对于那些大型，高扩展，强维护的项目上，Composition API 会获得更大收益。

可能的追问

- Composition API 能否和 Options API 一起使用？

## vue-router 中如何保护路由？

分析

路由保护在应用开发过程中非常重要，几乎每个应用都要做各种路由权限管理，因此相当考察使用者基本功。

体验

全局守卫：

```js
const router = createRouter({ ... })
​
router.beforeEach((to, from) => {
  // ...
  // 返回 false 以取消导航
  return false
})
```

路由独享守卫：

```js
const routes = [
  {
    path: "/users/:id",
    component: UserDetails,
    beforeEnter: (to, from) => {
      // reject the navigation
      return false
    },
  },
]
```

组件内的守卫：

```js
const UserDetails = {
  template: `...`,
  beforeRouteEnter(to, from) {
    // 在渲染该组件的对应路由被验证前调用
  },
  beforeRouteUpdate(to, from) {
    // 在当前路由改变，但是该组件被复用时调用
  },
  beforeRouteLeave(to, from) {
    // 在导航离开渲染该组件的对应路由时调用
  },
}
```

思路

- 路由守卫的概念
- 路由守卫的使用
- 路由守卫的原理

- vue-router 中保护路由的方法叫做路由守卫，主要用来通过跳转或取消的方式守卫导航。
- 路由守卫有三个级别：全局，路由独享，组件级。影响范围由大到小，例如全局的 router.beforeEach()，可以注册一个全局前置守卫，每次路由导航都会经过这个守卫，因此在其内部可以加入控制逻辑决定用户是否可以导航到目标路由；在路由注册的时候可以加入单路由独享的守卫，例如 beforeEnter，守卫只在进入路由时触发，因此只会影响这个路由，控制更精确；我们还可以为路由组件添加守卫配置，例如 beforeRouteEnter，会在渲染该组件的对应路由被验证前调用，控制的范围更精确了。
- 用户的任何导航行为都会走 navigate 方法，内部有个 guards 队列按顺序执行用户注册的守卫钩子函数，如果没有通过验证逻辑则会取消原有的导航。

知其所以然

runGuardQueue(guards)链式的执行用户在各级别注册的守卫钩子函数，通过则继续下一个级别的守卫，不通过进入 catch 流程取消原本导航。

![img6](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a70d8c83e3254b39800e9d646731039d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

[github1s.com/vuejs/route…](https://github1s.com/vuejs/router/blob/HEAD/packages/router/src/router.ts#L808-L809)
