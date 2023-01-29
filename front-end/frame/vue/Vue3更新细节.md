# Vue3 更新细节

## v-for 中的 Ref 数组

在 Vue 2 中，在 v-for 中使用的 ref attribute 会用 ref 数组填充相应的 $refs property。例如下面这种写法，itemRefs 中会是一个包含所有 ref 的数组

```html
<div v-for="item in list" :ref="itemRefs"></div>
```

而在 Vue 3 中，此类用法将不再自动创建 $ref 数组。要从单个绑定获取多个 ref，需要将 ref 绑定到一个更灵活的函数上。

```html
<div v-for="item in list" :ref="setItemRef"></div>
<script>
  import { onBeforeUpdate, onUpdated } from "vue"

  export default {
    setup() {
      let itemRefs = []
      const setItemRef = (el) => {
        if (el) {
          itemRefs.push(el)
        }
      }
      onBeforeUpdate(() => {
        itemRefs = []
      })
      onUpdated(() => {
        console.log(itemRefs)
      })
      return {
        setItemRef,
      }
    },
  }
</script>
```

注意：

- itemRefs 不必是数组：它也可以是一个对象，其 ref 可以通过迭代的 key 被设置。
- 如有需要，itemRefs 也可以是响应式的，且可以被侦听。

## 异步组件

- 新的 defineAsyncComponent 助手方法，用于显式地定义异步组件
- component 选项被重命名为 loader
- Loader 函数本身不再接收 resolve 和 reject 参数，且必须返回一个 Promise

### Vue2 中的异步组件

以前，异步组件是通过将组件定义为返回 Promise 的函数来创建的，例如：

```js
const asyncModal = () => import("./Modal.vue")
```

或者，对于带有选项的更高阶的组件语法：

```js
const asyncModal = {
  component: () => import("./Modal.vue"),
  delay: 200,
  timeout: 3000,
  error: ErrorComponent,
  loading: LoadingComponent,
}
```

### Vue3.x 异步组件语法

现在，在 Vue 3 中，由于函数式组件被定义为纯函数，因此异步组件需要通过将其包裹在新的 defineAsyncComponent 助手方法中来显式地定义：

```js
import { defineAsyncComponent } from "vue"
import ErrorComponent from "./components/ErrorComponent.vue"
import LoadingComponent from "./components/LoadingComponent.vue"

// 不带选项的异步组件
const asyncModal = defineAsyncComponent(() => import("./Modal.vue"))

// 带选项的异步组件
const asyncModalWithOptions = defineAsyncComponent({
  loader: () => import("./Modal.vue"),
  delay: 200,
  timeout: 3000,
  errorComponent: ErrorComponent,
  loadingComponent: LoadingComponent,
})
```

注意：Vue Router 支持一个类似的机制来异步加载路由组件，也就是俗称的懒加载。但是这跟 Vue 所支持的异步组件是不同的。

对 2.x 所做的另一个更改是，component 选项现在被重命名为 loader，以明确组件定义不能直接被提供。此外，与 2.x 不同，loader 函数不再接收 resolve 和 reject 参数，且必须始终返回 Promise。

## attribute 强制行为

- 移除枚举 attribute 的内部概念，并将这些 attribute 视为普通的非布尔 attribute
- 非兼容：如果值为布尔值 false，则不再移除 attribute。取而代之的是，它将被设置为 attr="false"。若要移除 attribute，应该使用 null 或者 undefined。

## $attrs 包含 class & style

$attrs 现在包含了所有传递给组件的 attribute，包括 class 和 style。

### Vue2.x class 和 style 行为

Vue 2 的虚拟 DOM 实现对 class 和 style attribute 有一些特殊处理。因此，与其它所有 attribute 不一样，它们没有被包含在 $attrs 中。

上述行为在使用 inheritAttrs: false 时会产生副作用：

- $attrs 中的 attribute 将不再被自动添加到根元素中，而是由开发者决定在哪添加。
- 但是 class 和 style 不属于 $attrs，它们仍然会被应用到组件的根元素中：

```vue
<template>
  <label>
    <input type="text" v-bind="$attrs" />
  </label>
</template>
<script>
export default {
  inheritAttrs: false,
}
</script>
```

像这样使用时：

```html
<my-component id="my-id" class="my-class"></my-component>
```

将生成以下 HTML：

```html
<label class="my-class">
  <input type="text" id="my-id" />
</label>
```

#### inheritAttrs

该属性是 Vue2.4 版本新增，默认值为 true，默认情况下父作用域的不被认作 props 的 attribute 绑定 (attribute bindings) 将会“回退”且作为普通的 HTML attribute 应用在子组件的根元素上。通过设置 inheritAttrs 为 false，这些默认行为将会被去掉。而通过 (同样是 2.4 新增的) 实例 property $attrs 可以让这些 attribute 生效，且可以通过 v-bind 显性的绑定到非根元素上。

### 3.x class 和 style 行为

$attrs 包含了所有的 attribute，这使得把它们全部应用到另一个元素上变得更加容易了。现在上面的示例将生成以下 HTML：

```html
<label>
  <input type="text" id="my-id" class="my-class" />
</label>
```

## $children

在 2 版本 中，可以使用 `this.$children` 访问当前实例的直接子组件。
在 3 版本中，$children property 已被移除，且不再支持。如果需要访问子组件实例，建议使用 $refs。

## 自定义指令

指令的钩子函数已经被重命名，以更好地与组件的生命周期保持一致。额外地，expression 字符串不再作为 binding 对象的一部分被传入。

### 自定义指令 2.x 语法

在 Vue 2 中，自定义指令通过使用下列钩子来创建，以对齐元素的生命周期，它们都是可选的：

- bind - 指令绑定到元素后调用。只调用一次。
- inserted - 元素插入父 DOM 后调用。
- update - 当元素更新，但子元素尚未更新时，将调用此钩子。
- componentUpdated - 一旦组件和子级被更新，就会调用这个钩子。
- unbind - 一旦指令被移除，就会调用这个钩子。也只调用一次。

下面是一个例子：

```html
<p v-highlight="'yellow'">以亮黄色高亮显示此文本</p>
<script>
  Vue.directive("highlight", {
    bind(el, binding, vnode) {
      el.style.background = binding.value
    },
  })
</script>
```

### 自定义指令 3.x 语法

然而，在 Vue 3 中，为自定义指令创建了一个更具凝聚力的 API。2 版本它们与组件生命周期方法有很大的不同，即使钩子的目标事件十分相似。现在把它们统一起来了：

- created - 新增！在元素的 attribute 或事件监听器被应用之前调用。
- bind → beforeMount
- inserted → mounted
- beforeUpdate：新增！在元素本身被更新之前调用，与组件的生命周期钩子十分相似。
- update → 移除！该钩子与 updated 有太多相似之处，因此它是多余的。请改用 updated。
- componentUpdated → updated
- beforeUnmount：新增！与组件的生命周期钩子类似，它将在元素被卸载之前调用。
- unbind -> unmounted

因此，API 可以这样使用，与前面的示例相同：

```html
<p v-highlight="'yellow'">以亮黄色高亮显示此文本</p>
<script>
  const app = Vue.createApp({})

  app.directive("highlight", {
    beforeMount(el, binding, vnode) {
      el.style.background = binding.value
    },
  })
</script>
```

#### 边界情况：访问组件实例

在 Vue 2 中，必须通过 vnode 参数访问组件实例，在 Vue 3 中，实例现在是 binding 参数的一部分

## 与自定义元素的互操作性

- 非兼容：检测并确定哪些标签应该被视为自定义元素的过程，现在会在模板编译期间执行，且应该通过编译器选项而不是运行时配置来配置。
- 非兼容：特殊的 is attribute 的使用被严格限制在保留的 `<component>` 标签中。
- 新增：为了支持 2.x 在原生元素上使用 is 的用例来处理原生 HTML 解析限制，用 vue: 前缀来解析一个 Vue 组件。

## Data 选项

- 非兼容：组件选项 data 的声明不再接收纯 JavaScript object，而是接收一个 function。
- 非兼容：当合并来自 mixin 或 extend 的多个 data 返回值时，合并操作现在是浅层次的而非深层次的 (只合并根级属性)。

在 2.x 中，可以通过 object 或者是 function 定义 data 选项。在 3.x 中，data 选项已标准化为只接受返回 object 的 function。

## emits 选项

Vue 3 现在提供一个 emits 选项，和现有的 props 选项类似。这个选项可以用来定义一个组件可以向其父组件触发的事件。

在 Vue 2 中，可以定义一个组件可接收的 prop，但是无法声明它可以触发哪些事件

Vue 3 中和 prop 类似，现在可以通过 emits 选项来定义组件可触发的事件：

```vue
<template>
  <div>
    <p>{{ text }}</p>
    <button v-on:click="$emit('accepted')">OK</button>
  </div>
</template>
<script>
export default {
  props: ["text"],
  emits: ["accepted"],
}
</script>
```

强烈建议使用 emits 记录每个组件所触发的所有事件。

这尤为重要，因为移除了 .native 修饰符。任何未在 emits 中声明的事件监听器都会被算入组件的 $attrs，并将默认绑定到组件的根节点上。

例如对于向其父组件透传原生事件的组件来说，这会导致有两个事件被触发：

```vue
<template>
  <button v-on:click="$emit('click', $event)">OK</button>
</template>
<script>
export default {
  emits: [], // 不声明事件
}
</script>
```

当一个父级组件拥有 click 事件的监听器时：

```html
<my-button v-on:click="handleClick"></my-button>
```

该事件现在会被触发两次:

- 一次来自 $emit()。
- 另一次来自应用在根元素上的原生事件监听器。

现在你有两个选项：

- 正确地声明 click 事件。当你真的在 `<my-button>` 的事件处理器上加入了一些逻辑时，这会很有用。
- 移除透传的事件，因为现在父组件可以很容易地监听原生事件，而不需要添加 .native。适用于你只想透传这个事件。

## 事件 API

$on，$off 和 $once 实例方法已被移除，组件实例不再实现事件触发接口。

在 2.x 中，Vue 实例可用于触发由事件触发器 API 通过指令式方式添加的处理函数 ($on，$off 和 $once)。这可以用于创建一个事件总线（EventBus），以创建在整个应用中可用的全局事件监听器

在 3.x 更新中，从实例中完全移除了 $on、$off 和 $once 方法。

根据具体情况来看，有多种事件总线的替代方案：

- 事件总线模式可以被替换为使用外部的、实现了事件触发器接口的库，例如 mitt 或 tiny-emitter。
- Prop 和事件应该是父子组件之间沟通的首选。兄弟节点可以通过它们的父节点通信。
- Provide 和 inject 允许一个组件与它的插槽内容进行通信。这对于总是一起使用的紧密耦合的组件非常有用。
- provide/inject 也能够用于组件之间的远距离通信。它可以帮助避免“prop 逐级透传”，即 prop 需要通过许多层级的组件传递下去，但这些组件本身可能并不需要那些 prop。
- Prop 逐级透传也可以通过重构以使用插槽来避免。如果一个中间组件不需要某些 prop，那么表明它可能存在关注点分离的问题。在该类组件中使用 slot 可以允许父节点直接为它创建内容，因此 prop 可以被直接传递而不需要中间组件的参与。
- 全局状态管理，比如 Vuex。

## 过滤器

从 Vue 3.0 开始，过滤器已移除，且不再支持。取而代之的是，建议用方法调用或计算属性来替换它们。

### 全局过滤器

如果在应用中全局注册了过滤器，那么在每个组件中用计算属性或方法调用来替换它可能就没那么方便了。

取而代之的是，可以通过全局属性以让它能够被所有组件使用到：

```js
// main.js
const app = createApp(App)

app.config.globalProperties.$filters = {
  currencyUSD(value) {
    return "$" + value
  },
}
```

然后，可以通过这个 $filters 对象修正所有的模板，就像这样：

```html
<template>
  <h1>Bank Account Balance</h1>
  <p>{{ $filters.currencyUSD(accountBalance) }}</p>
</template>
```

## 片段

在 2.x 中，由于不支持多根节点组件，当其被开发者意外地创建时会发出警告。结果是，为了修复这个问题，许多组件被包裹在了一个 `<div>` 中。

在 3.x 中，组件可以包含多个根节点！但是，这要求开发者显式定义 attribute 应该分布在哪里。

```html
<!-- Layout.vue -->
<template>
  <header>...</header>
  <main v-bind="$attrs">...</main>
  <footer>...</footer>
</template>
```

## 函数式组件

- 在 3.x 中，2.x 带来的函数式组件的性能提升可以忽略不计，因此我们建议只使用有状态的组件
- 函数式组件只能由接收 props 和 context (即：slots、attrs、emit) 的普通函数创建
- 非兼容：functional attribute 已从单文件组件 (SFC) 的 `<template>` 中移除
- 非兼容：{ functional: true } 选项已从通过函数创建的组件中移除

### Vue3 通过函数创建组件

现在，在 Vue 3 中，所有的函数式组件都是用普通函数创建的。换句话说，不需要定义 { functional: true } 组件选项。

它们将接收两个参数：props 和 context。context 参数是一个对象，包含组件的 attrs、slots 和 emit property。

此外，h 现在是全局导入的，而不是在 render 函数中隐式提供。例如

```js
import { h } from "vue"

const DynamicHeading = (props, context) => {
  return h(`h${props.level}`, context.attrs, context.slots)
}

DynamicHeading.props = ["level"]

export default DynamicHeading
```

## 全局 API

Vue 2.x 有许多全局 API 和配置，它们可以全局改变 Vue 的行为。例如，要注册全局组件，可以使用 Vue.component API，就像这样：

```js
Vue.component("button-counter", {
  data: () => ({
    count: 0,
  }),
  template: '<button @click="count++">Clicked {{ count }} times.</button>',
})

// 以及全局指令
Vue.directive("focus", {
  inserted: (el) => el.focus(),
})
```

虽然这种声明方式很方便，但它也会导致一些问题。从技术上讲，Vue 2 没有“app”的概念，我们定义的应用只是通过 new Vue() 创建的根 Vue 实例。从同一个 Vue 构造函数创建的每个根实例共享相同的全局配置，这会导致

- 在测试期间，全局配置很容易意外地污染其他测试用例。
- 全局配置使得在同一页面上的多个“应用”在全局配置不同时共享同一个 Vue 副本非常困难。

### 一个新的全局 API：createApp

调用 createApp 返回一个应用实例，一个 Vue 3 中的新概念。任何全局改变 Vue 行为的 API 现在都会移动到应用实例上。

#### config.productionTip 移除

在 Vue 3.x 中，“使用生产版本”提示仅在使用“dev + full build”(包含运行时编译器并有警告的构建版本) 时才会显示。

#### config.ignoredElements 替换为 config.isCustomElement

引入此配置选项的目的是为了支持原生自定义元素，因此重命名可以更好地传达它的意图。

#### Vue.prototype 替换为 config.globalProperties

在 Vue 2 中， Vue.prototype 通常用于添加所有组件都能访问的 property。

在 Vue 3 中与之对应的是 config.globalProperties。这些 property 将被复制到应用中，作为实例化组件的一部分。

#### Vue.extend 移除

在 Vue 2.x 中，Vue.extend 曾经被用于创建一个基于 Vue 构造函数的“子类”，其参数应为一个包含组件选项的对象。

```js
// 之前 - Vue 2

// 创建构造器
const Profile = Vue.extend({
  template: "<p>{{firstName}} {{lastName}} aka {{alias}}</p>",
  data() {
    return {
      firstName: "Walter",
      lastName: "White",
      alias: "Heisenberg",
    }
  },
})
// 创建一个 Profile 的实例，并将它挂载到一个元素上
new Profile().$mount("#mount-point")
```

在 Vue 3.x 中，已经没有组件构造器的概念了。应该始终使用 createApp 这个全局 API 来挂载组件。

```js
// 之后 - Vue 3
const Profile = {
  template: "<p>{{firstName}} {{lastName}} aka {{alias}}</p>",
  data() {
    return {
      firstName: "Walter",
      lastName: "White",
      alias: "Heisenberg",
    }
  },
}
Vue.createApp(Profile).mount("#mount-point")
```

#### 组件继承

在 Vue 3 中，强烈建议使用 组合式 API 来替代继承与 mixin。如果因为某种原因仍然需要使用组件继承，可以使用 extends 选项 来代替 Vue.extend。

### 挂载 App 实例

使用 `createApp(/* options */)` 初始化后，应用实例 app 可通过 `app.mount(domTarget)` 挂载根组件实例

### Provide / Inject

与在 2.x 根实例中使用 provide 选项类似，Vue 3 应用实例也提供了可被应用内任意组件注入的依赖项：

```js
// 在入口中
app.provide("guide", "Vue 3 Guide")

// 在子组件中
export default {
  inject: {
    book: {
      from: "guide",
    },
  },
  template: `<div>{{ book }}</div>`,
}
```

## 内联模板 Attribute

对内联模板特性的支持已被移除。

在 2.x 中，Vue 为子组件提供了 inline-template attribute，以便将其内部内容作为模板使用，而不是作为分发内容。3.x 版本已不再支持

```html
<my-component inline-template>
  <div>
    <p>它们将被编译为组件自己的模板，</p>
    <p>而不是父级所包含的内容。</p>
  </div>
</my-component>
```

## key Attribute

- 新增：对于 v-if/v-else/v-else-if 的各分支项 key 将不再是必须的，因为现在 Vue 会自动生成唯一的 key。
- 非兼容：如果你手动提供 key，那么每个分支必须使用唯一的 key。你将不再能通过故意使用相同的 key 来强制重用分支。
- 非兼容：`<template v-for>` 的 key 应该设置在 `<template>` 标签上 (而不是设置在它的子节点上)。

## 按键修饰符

- 非兼容：不再支持使用数字 (即键码) 作为 v-on 修饰符
- 非兼容：不再支持 config.keyCodes

现在建议对任何要用作修饰符的键使用 kebab-cased (短横线) 名称。

```html
<!-- Vue 3 在 v-on 上使用按键修饰符 -->
<input v-on:keyup.page-down="nextPage" />

<!-- 同时匹配 q 和 Q -->
<input v-on:keypress.q="quit" />
```

## 移除 $listeners

$listeners 对象在 Vue 3 中已被移除。事件监听器现在是 $attrs 的一部分

在 Vue 2 中，你可以通过 this.$attrs 访问传递给组件的 attribute，以及通过 this.$listeners 访问传递给组件的事件监听器。结合 inheritAttrs: false，开发者可以将这些 attribute 和监听器应用到根元素之外的其它元素：

```html
<template>
  <label>
    <input type="text" v-bind="$attrs" v-on="$listeners" />
  </label>
</template>
<script>
  export default {
    inheritAttrs: false,
  }
</script>
```

在 Vue 3 的虚拟 DOM 中，事件监听器现在只是以 on 为前缀的 attribute，这样它就成为了 $attrs 对象的一部分，因此 $listeners 被移除了。

```vue
<template>
  <label>
    <input type="text" v-bind="$attrs" />
  </label>
</template>
<script>
export default {
  inheritAttrs: false,
}
</script>
```

如果这个组件接收一个 id attribute 和一个 v-on:close 监听器，那么 $attrs 对象现在将如下所示:

```js
{
  id: 'my-input',
  onClose: () => console.log('close 事件被触发')
}
```

## 被挂载的应用不会替换元素

在 Vue 2.x 中，当挂载一个具有 template 的应用时，被渲染的内容会替换我们要挂载的目标元素。在 Vue 3.x 中，被渲染的应用会作为子元素插入，从而替换目标元素的 innerHTML。

## propsData

propsData 选项之前用于在创建 Vue 实例的过程中传入 prop，现在它被移除了。如果想为 Vue 3 应用的根组件传入 prop，请使用 createApp 的第二个参数。

## 在 prop 的默认函数中访问 this

生成 prop 默认值的工厂函数不再能访问 this。

取而代之的是：

组件接收到的原始 prop 将作为参数传递给默认函数；

inject API 可以在默认函数中使用。

```js
import { inject } from "vue"

export default {
  props: {
    theme: {
      default(props) {
        // `props` 是传递给组件的、
        // 在任何类型/默认强制转换之前的原始值，
        // 也可以使用 `inject` 来访问注入的 property
        return inject("theme", "default-theme")
      },
    },
  },
}
```

## 渲染函数 API

此更改不会影响 `<template>` 用户。

以下是更改的简要总结：

- h 现在是全局导入，而不是作为参数传递给渲染函数
- 更改渲染函数参数，使其在有状态组件和函数组件的表现更加一致
- VNode 现在有一个扁平的 prop 结构

### 渲染函数参数

在 2.x 中，render 函数会自动接收 h 函数 (它是 createElement 的惯用别名) 作为参数：

```js
// Vue 2 渲染函数示例
export default {
  render(h) {
    return h("div")
  },
}
```

在 3.x 中，h 函数现在是全局导入的，而不是作为参数自动传递。

```js
// Vue 3 渲染函数示例
import { h } from "vue"

export default {
  render() {
    return h("div")
  },
}
```

### 渲染函数签名更改

在 2.x 中，render 函数自动接收参数，如 h 函数。

在 3.x 中，由于 render 函数不再接收任何参数，它将主要在 setup() 函数内部使用。这还有一个好处：可以访问在作用域中声明的响应式状态和函数，以及传递给 setup() 的参数。

```js
import { h, reactive } from "vue"

export default {
  setup(props, { slots, attrs, emit }) {
    const state = reactive({
      count: 0,
    })

    function increment() {
      state.count++
    }

    // 返回渲染函数
    return () =>
      h(
        "div",
        {
          onClick: increment,
        },
        state.count
      )
  },
}
```

### VNode Prop 格式化

在 2.x 中，domProps 包含 VNode prop 中的嵌套列表：

```js
// 2.x
{
  staticClass: 'button',
  class: { 'is-outlined': isOutlined },
  staticStyle: { color: '#34495E' },
  style: { backgroundColor: buttonColor },
  attrs: { id: 'submit' },
  domProps: { innerHTML: '' },
  on: { click: submitForm },
  key: 'submit-button'
}
```

在 3.x 中，整个 VNode prop 的结构都是扁平的。使用上面的例子，来看看它现在的样子。

```js
// 3.x 语法
{
  class: ['button', { 'is-outlined': isOutlined }],
  style: [{ color: '#34495E' }, { backgroundColor: buttonColor }],
  id: 'submit',
  innerHTML: '',
  onClick: submitForm,
  key: 'submit-button'
}
```

### 注册组件

在 2.x 中，注册一个组件后，把组件名作为字符串传递给渲染函数的第一个参数，它可以正常地工作：

```js
// 2.x
Vue.component("button-counter", {
  data() {
    return {
      count: 0,
    }
  },
  template: `
    <button @click="count++">
      Clicked {{ count }} times.
    </button>
  `,
})

export default {
  render(h) {
    return h("button-counter")
  },
}
```

在 3.x 中，由于 VNode 是上下文无关的，不能再用字符串 ID 隐式查找已注册组件。取而代之的是，需要使用一个导入的 resolveComponent 方法：

```js
// 3.x
import { h, resolveComponent } from "vue"

export default {
  setup() {
    const ButtonCounter = resolveComponent("button-counter")
    return () => h(ButtonCounter)
  },
}
```

## 插槽统一

此更改统一了 3.x 中的普通插槽和作用域插槽。

- this.$slots 现在将插槽作为函数公开
- 非兼容：移除 this.$scopedSlots

当使用渲染函数，即 h 时，2.x 曾经在内容节点上定义 slot 数据 property。

```js
// 2.x 语法
h(LayoutComponent, [
  h("div", { slot: "header" }, this.header),
  h("div", { slot: "content" }, this.content),
])
```

此外，可以使用以下语法引用作用域插槽：

```js
// 2.x 语法
this.$scopedSlots.header
```

在 3.x 中，插槽以对象的形式定义为当前节点的子节点：

```js
// 3.x Syntax
h(
  LayoutComponent,
  {},
  {
    header: () => h("div", this.header),
    content: () => h("div", this.content),
  }
)
```

当需要以编程方式引用作用域插槽时，它们现在被统一到 $slots 选项中了。

```js
// 2.x 语法
this.$scopedSlots.header

// 3.x 语法
this.$slots.header()
```

## Suspense

## 过渡的 class 名更改

过渡类名 v-enter 修改为 v-enter-from、过渡类名 v-leave 修改为 v-leave-from。

## Transition 作为根节点

当使用 `<transition>` 作为根结点的组件从外部被切换时将不再触发过渡效果。

## Transition Group 根元素

`<transition-group>` 不再默认渲染根元素，但仍然可以用 tag attribute 创建根元素。

## 移除 v-on.native 修饰符

v-on 的 .native 修饰符已被移除。

2.x 版本默认情况下，传递给带有 v-on 的组件的事件监听器只能通过 this.$emit 触发。要将原生 DOM 监听器添加到子组件的根元素中，可以使用 .native 修饰符：

```html
<my-component
  v-on:close="handleComponentEvent"
  v-on:click.native="handleNativeClickEvent"
/>
```

3.x 版本中 v-on 的 .native 修饰符已被移除。同时，新增的 emits 选项允许子组件定义真正会被触发的事件。

因此，对于子组件中未被定义为组件触发的所有事件监听器，Vue 现在将把它们作为原生事件监听器添加到子组件的根元素中 (除非在子组件的选项中设置了 inheritAttrs: false)。

```html
<my-component
  v-on:close="handleComponentEvent"
  v-on:click="handleNativeClickEvent"
/>
<!-- MyComponent.vue -->
<script>
  export default {
    emits: ["close"],
  }
</script>
```

## v-model

- 非兼容：用于自定义组件时，v-model prop 和事件默认名称已更改：
  - prop：value -> modelValue；
  - 事件：input -> update:modelValue；
- 非兼容：v-bind 的 .sync 修饰符和组件的 model 选项已移除，可在 v-model 上加一个参数代替；
- 新增：现在可以在同一个组件上使用多个 v-model 绑定；
- 新增：现在可以自定义 v-model 修饰符。

在 Vue 2.0 发布后，使用 v-model 指令时必须使用名为 value 的 prop。如果出于不同的目的需要使用其他的 prop，就不得不使用 v-bind.sync。此外，由于 v-model 和 value 之间的这种硬编码关系的原因，产生了如何处理原生元素和自定义元素的问题。

在 Vue 2.2 中，引入了 model 组件选项，允许组件自定义用于 v-model 的 prop 和事件。但是，这仍然只允许在组件上使用一个 v-model。

在 Vue 3 中，双向数据绑定的 API 已经标准化，以减少在使用 v-model 指令时的混淆，并且更加灵活。

### 2.x 版本中 v-model

在 2.x 中，在组件上使用 v-model 相当于绑定 value prop 并触发 input 事件：

```html
<ChildComponent v-model="pageTitle" />
<!-- 是以下的简写: -->
<ChildComponent :value="pageTitle" @input="pageTitle = $event" />
```

如果想要更改 prop 或事件名称，则需要在 ChildComponent 组件中添加 model 选项：

```html
<!-- ParentComponent.vue -->
<ChildComponent v-model="pageTitle" />

<!-- // ChildComponent.vue -->
<script>
  export default {
    model: {
      prop: "title",
      event: "change",
    },
    props: {
      // 这将允许 `value` 属性用于其他用途
      value: String,
      // 使用 `title` 代替 `value` 作为 model 的 prop
      title: {
        type: String,
        default: "Default title",
      },
    },
  }
</script>

<!-- 所以，在这个例子中 v-model 是以下的简写： -->
<ChildComponent :title="pageTitle" @change="pageTitle = $event" />
```

#### 使用 v-bind.sync

在某些情况下，可能需要对某一个 prop 进行“双向绑定”(除了前面用 v-model 绑定 prop 的情况)。为此，建议使用 update:myPropName 抛出事件。例如，对于在上一个示例中带有 title prop 的 ChildComponent，可以通过下面的方式将分配新 value 的意图传达给父级：

```js
this.$emit("update:title", newValue)
```

然后父组件可以在需要时监听该事件，并更新本地的 data property。例如：

```html
<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" />
<!-- 为了方便起见，可以使用 .sync 修饰符来缩写，如下所示： -->
<ChildComponent :title.sync="pageTitle" />
```

### 3.x 版本中 v-model

在 3.x 中，自定义组件上的 v-model 相当于传递了 modelValue prop 并接收抛出的 update:modelValue 事件：

```html
<ChildComponent v-model="pageTitle" />

<!-- 是以下的简写: -->

<ChildComponent
  :modelValue="pageTitle"
  @update:modelValue="pageTitle = $event"
/>
```

#### v-model 参数

若需要更改 model 的名称，现在可以为 v-model 传递一个参数，以作为组件内 model 选项的替代：

```html
<ChildComponent v-model:title="pageTitle" />
<!-- 是以下的简写: -->
<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" />
```

这也可以作为 .sync 修饰符的替代，而且允许我们在自定义组件上使用多个 v-model。

```html
<ChildComponent v-model:title="pageTitle" v-model:content="pageContent" />

<!-- 是以下的简写： -->

<ChildComponent
  :title="pageTitle"
  @update:title="pageTitle = $event"
  :content="pageContent"
  @update:content="pageContent = $event"
/>
```

#### v-model 修饰符

除了像 .trim 这样的 2.x 硬编码的 v-model 修饰符外，现在 3.x 还支持自定义修饰符：

```html
<ChildComponent v-model.capitalize="pageTitle" />
```

## v-if 与 v-for 的优先级对比

非兼容：两者作用于同一个元素上时，v-if 会拥有比 v-for 更高的优先级。

## v-bind 合并行为

- 不兼容：v-bind 的绑定顺序会影响渲染结果。

在一个元素上动态绑定 attribute 时，同时使用 v-bind="object" 语法和独立 attribute 是常见的场景。然而，这就引出了关于合并的优先级的问题。

在 2.x 中，如果一个元素同时定义了 v-bind="object" 和一个相同的独立 attribute，那么这个独立 attribute 总是会覆盖 object 中的绑定。

```html
<!-- 模板 -->
<div id="red" v-bind="{ id: 'blue' }"></div>
<!-- 结果 -->
<div id="red"></div>
```

在 3.x 中，如果一个元素同时定义了 v-bind="object" 和一个相同的独立 attribute，那么绑定的声明顺序将决定它们如何被合并。

```html
<!-- 模板 -->
<div v-bind="{ id: 'blue' }" id="red"></div>
<!-- 结果 -->
<div id="red"></div>
```

### v-bind 动态绑定多个值

如果有像这样的一个包含多个 attribute 的 JavaScript 对象：

```js
data() {
  return {
    objectOfAttrs: {
      id: 'container',
      class: 'wrapper'
    }
  }
}
```

通过不带参数的 v-bind，可以将它们绑定到单个元素上：`<div v-bind="objectOfAttrs"></div>`

## VNode 生命周期事件

在 Vue 2 中，可以通过事件来监听组件生命周期中的关键阶段。这些事件名都是以 hook: 前缀开头，并跟随相应的生命周期钩子的名字。

在 Vue 3 中，这个前缀已被更改为 vnode-。额外地，这些事件现在也可用于 HTML 元素，和在组件上的用法一样。

在 Vue 2 中，这些事件名和相应的生命周期钩子一致，并带有 hook: 前缀：

```html
<template>
  <child-component @hook:updated="onUpdated">
</template>
```

在 Vue 3 中，事件名附带的是 vnode- 前缀：

```html
<template>
  <child-component @vnode-updated="onUpdated">
</template>

<!-- 或者在驼峰命名法的情况下附带前缀 vnode： -->

<template>
  <child-component @vnodeUpdated="onUpdated">
</template>
```

## 侦听数组

非兼容: 当侦听一个数组时，只有当数组被替换时才会触发回调。如果需要在数组被改变时触发回调，必须指定 deep 选项。

## 响应式计算和侦听

### 调试 Computed

computed 可接受一个带有 onTrack 和 onTrigger 选项的对象作为第二个参数：

- onTrack 会在某个响应式 property 或 ref 作为依赖被追踪时调用。
- onTrigger 会在侦听回调被某个依赖的修改触发时调用。

### watchEffect

watchEffect 是 3.x 版本新增的一个 API，使用上跟 React 的 useEffect 类似。

watchEffect 根据响应式状态自动应用和重新应用副作用，它立即执行传入的一个函数，同时响应式追踪其依赖，并在其依赖变更时重新运行该函数。

```js
const count = ref(0)

watchEffect(() => console.log(count.value))
// -> logs 0

setTimeout(() => {
  count.value++
  // -> logs 1
}, 100)
```

#### 停止侦听

当 watchEffect 在组件的 setup() 函数或生命周期钩子被调用时，侦听器会被链接到该组件的生命周期，并在组件卸载时自动停止。

在一些情况下，也可以显式调用返回值以停止侦听：

```js
const stop = watchEffect(() => {
  /* ... */
})

// later
stop()
```

#### 清除副作用

有时副作用函数会执行一些异步的副作用，这些响应需要在其失效时清除 (即完成之前状态已改变了) 。所以侦听副作用传入的函数可以接收一个 onInvalidate 函数作入参，用来注册清理失效时的回调。当以下情况发生时，这个失效回调会被触发：

- 副作用即将重新执行时
- 侦听器被停止 (如果在 setup() 或生命周期钩子函数中使用了 watchEffect，则在组件卸载时)

```js
watchEffect((onInvalidate) => {
  const token = performAsyncOperation(id.value)
  onInvalidate(() => {
    // id has changed or watcher is stopped.
    // invalidate previously pending async operation
    token.cancel()
  })
})
```

这一点与 React 不同，React 的 useEffect 是通过返回一个函数来清除副作用。

在执行数据请求时，副作用函数往往是一个异步函数：

```js
const data = ref(null)
watchEffect(async (onInvalidate) => {
  onInvalidate(() => {
    /* ... */
  }) // 我们在Promise解析之前注册清除函数
  data.value = await fetchData(props.id)
})
```

异步函数都会隐式地返回一个 Promise，但是清理函数必须要在 Promise 被 resolve 之前被注册。另外，Vue 依赖这个返回的 Promise 来自动处理 Promise 链上的潜在错误。

#### 副作用刷新时机

Vue 的响应性系统会缓存副作用函数，并异步地刷新它们，这样可以避免同一个“tick” 中多个状态改变导致的不必要的重复调用。在核心的具体实现中，组件的 update 函数也是一个被侦听的副作用。当一个用户定义的副作用函数进入队列时，默认情况下，会在所有的组件 update 前执行

如果需要在组件更新(例如：当与模板引用一起)后重新运行侦听器副作用，可以传递带有 flush 选项的附加 options 对象 (默认为 'pre')。

### watch 与 watchEffect 共享的行为

watch 与 watchEffect 共享停止侦听，清除副作用 (相应地 onInvalidate 会作为回调的第三个参数传入)、副作用刷新时机和侦听器调试行为。

## DOM 中的根组件模板

当在未采用构建流程的情况下使用 Vue 时，我们可以在挂载容器中直接书写根组件模板：

```html
<div id="app">
  <button @click="count++">{{ count }}</button>
</div>
```

```js
import { createApp } from 'vue'

const app = createApp({
  data() {
    return {
      count: 0
    }
  }
})

app.mount('#app')

```

当根组件没有设置 template 选项时，Vue 将自动使用容器的 innerHTML 作为模板。
