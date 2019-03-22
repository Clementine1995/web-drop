# Vue 2.6新功能介绍

>参考自[Vue 2.6 发布了](https://zhuanlan.zhihu.com/p/56260917?utm_source=wechat_timeline&utm_medium=social&utm_oi=27602999836672&from=timeline&isappinstalled=0)

## Slots：新语法，性能优化

v-slot 指令自 Vue 2.6.0 起被引入，提供更好的支持 slot 和 slot-scope 特性的 API 替代方案。slot 和 slot-scope 已经被官方废弃且不会出现在 Vue 3 中。

默认作用域插槽 (default scoped slot)

```()
<my-component v-slot="{ msg }">
  {{ msg }}
</my-component>
```

具名插槽 (named slots)

```()
<my-component>
  <template v-slot:header>
    <p>Header</p>
  </template>
  
  <template v-slot:item="{ data }">
    <h2>{{ data.title }}</h2>
    <p>{{ data.text }}</p>
  </template>
  
  <template v-slot:footer>
    <p>Footer</p>
  </template>
</my-component>
```

注意 **v-slot 只能添加在一个 `<template>` 上** ，只有一种例外情况，就是当被提供的内容只有默认插槽时，组件的标签才可以被当作插槽的模板来使用。这样我们就可以把 v-slot 直接用在组件上。**只要出现多个插槽，请始终为所有的插槽使用完整的基于 `<template>` 的语法**。

```()
<current-user v-slot:default="slotProps">
  {{ slotProps.user.firstName }}
</current-user>
```

这种写法还可以更简单。

```()
<current-user v-slot="slotProps">
  {{ slotProps.user.firstName }}
</current-user>
```

v-slot 的值实际上可以是任何能够作为函数定义中的参数的 JavaScript 表达式。所以在支持的环境下 (单文件组件或现代浏览器)，你也可以使用 ES2015 解构来传入具体的插槽 prop。

它同样开启了 prop 重命名等其它可能，例如将 user 重命名为 person。

```()
<current-user v-slot="{ user: person }">
  {{ person.firstName }}
</current-user>
```

你甚至可以定义后备内容，用于插槽 prop 是 undefined 的情形

```()
<current-user v-slot="{ user = { firstName: 'Guest' } }">
  {{ user.firstName }}
</current-user>
```

### 具名插槽缩写

跟 v-on 和 v-bind 一样，v-slot 也有缩写，即把参数之前的所有内容 (v-slot:) 替换为字符 #。例如 v-slot:header 可以被重写为 #header：

```()
<base-layout>
  <template #header>
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template #footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

## 异步错误处理

Vue 的内置错误处理机制（组件中的 errorCaptured 钩子和全局的 errorHandler 配置项）现在也会处理 v-on 侦听函数中抛出的错误了。另外，如果你组件的生命周期钩子或是实践侦听函数中有异步操作，那么可以通过返回一个 Promise 的方式来让 Vue 处理可能存在的异步错误。如果你用了 async/await，那么就更简单了，因为 async 函数默认返回 Promise：

```()
export default {
  async mounted() {
    // 这里抛出的异步错误会被 errorCaptured 或是
    // Vue.config.errorHandler 钩子捕获到
    this.posts = await api.getPosts()
  }
}
```

## 动态指令参数

指令的参数现在可以接受动态的 JavaScript 表达式：

```()
<div v-bind:[attr]="value"></div>
<div :[attr]="value"></div>

<button v-on:[event]="handler"></button>
<button @[event]="handler"></button>

<my-component>
  <template v-slot:[slotName]>
    Dynamic slot name
  </template>
</my-component>
```

## 编译警告位置信息

2.6 开始，所有的编译器警告都包含了源码位置信息。这使得我们可以生成更有用的警告信息。

## 显式创建响应式对象

2.6 引入了一个新的全局 API，可以用来显式地创建响应式对象：

```()
const reactiveState = Vue.observable({
  count: 0
})
```

生成的对象可以直接用在计算属性 (computed property) 和 render 函数中，并会在被改动时触发相应的更新。

基于此，你可以在不需要 vuex 的情况下就能创建一个简易的 stores，非常适合于一些简单的场景，比如说仅需要跨组件共享外部状态。

举个例子，我们现在就来创建一个简单的计算器来暴露 state 给我们的 store。
首先创建 store.js 文件：

```()
import Vue from"vue";
export const store = Vue.observable({
  count: 0
});
```

复制代码如果你熟悉并喜欢 mutations 和 actions 的设计思想，那么你也可以创建一个简单的函数来更新数据：

```()
import Vue from"vue";

export const store = Vue.observable({
  count: 0
});

export const mutations = {
  setCount(count) {
    store.count = count;
  }
};
```

复制代码现在你只需要在组件中使用它，就像使用 Vuex 一样地去获取 state，我们将会用到计算属性和调用 mutations 的实例方法。

```()
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="setCount(count + 1);">+ 1</button>
    <button @click="setCount(count - 1);">- 1</button>
  </div>
</template>

<script>
  import { store, mutations } from "./store";

  export default {
    computed: {
      count() {
        return store.count;
      }
    },
    methods: {
      setCount: mutations.setCount
    }
  };
</script>
```

## SSR 数据预抓取

新的 serverPrefetch 钩子 使得任意组件都可以在服务端渲染时请求异步的数据（不再限制于路由组件）。这使得整体的数据预抓取方案可以更为灵活，并且可以和路由解耦。

## 可直接在浏览器中引入的 ES Modules 构建文件

Vue 之前版本的 ES Modules 构建文件是针对打包工具的，因此里面包含了一些需要在构建时替换掉的环境变量，从而导致无法直接在浏览器中使用。2.6 包含了一个可以直接在浏览器导入的版本：

```()
<script type="module">
import Vue from 'https://unpkg.com/vue/dist/vue.esm.browser.js'
  
new Vue({
  // ...
})
</script>
```

## 其他内部改动

nextTick 重新调整为全部使用 Microtask

this.$scopedSlots 函数统一返回数组