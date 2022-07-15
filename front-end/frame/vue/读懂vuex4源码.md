# 读懂 vuex4 源码

> 原文[一文读懂 vuex4 源码，原来 provide/inject 就是妙用了原型链？](https://lxchuan12.gitee.io/vuex4)

## Vuex 原理简述

结论先行：Vuex 原理可以拆解为三个关键点。

1. 其实就是每个组件实例里都注入了 Store 实例。
2. Store 实例中的各种方法都是为 Store 中的属性服务的。
3. Store 中的属性变更触发视图更新。

本文主要讲解第一点。

以下是一段简短的代码说明 Vuex 原理的。

```js
// 简版
class Store {
  constructor() {
    this._state = "Store 实例"
  }
  dispatch(val) {
    this.__state = val
  }
  commit() {}
  // 省略
}

const store = new Store()
var rootInstance = {
  parent: null,
  provides: {
    store: store,
  },
}
var parentInstance = {
  parent: rootInstance,
  provides: {
    store: store,
  },
}
var childInstance1 = {
  parent: parentInstance,
  provides: {
    store: store,
  },
}
var childInstance2 = {
  parent: parentInstance,
  provides: {
    store: store,
  },
}

store.dispatch("我被修改了")
// store Store {_state: "我被修改了"}

// rootInstance、parentInstance、childInstance1、childInstance2 这些对象中的provides.store都改了。
// 因为共享着同一个store对象。
```

![img1](https://lxchuan12.gitee.io/assets/img/components_provide.6bb18cde.png)

看了上面的官方文档中的图，大概知道是用 provide 父级组件中提供 Store 实例，用 inject 来获取到 Store 实例。

那么接下来，带着问题：

1. 为什么修改了实例 store 里的属性，变更后会触发视图更新。
2. Vuex4 作为 Vue 的插件如何实现和 Vue 结合的。
3. provide、inject 的如何实现的，每个组件如何获取到组件实例中的 Store 的。
4. 为什么每个组件对象里都有 Store 实例对象了(渲染组件对象过程)。
5. 为什么在组件中写的 provide 提供的数据，能被子级组件获取到。

## Vuex 4 重大改变

在看源码之前，先来看下 Vuex 4 发布的 release 和官方文档迁移提到的重大改变，[Vuex 4 release](https://github.com/vuejs/vuex/releases/tag/v4.0.0) 。

[从 3.x 迁移到 4.0](https://next.vuex.vuejs.org/zh/guide/migrating-to-4-0-from-3-x.html)

Vuex 4 的重点是兼容性。Vuex 4 支持使用 Vue 3 开发，并且直接提供了和 Vuex 3 完全相同的 API，因此用户可以在 Vue 3 项目中复用现有的 Vuex 代码。

相比 Vuex 3 版本。主要有如下重大改变（其他的在上方链接中）：

### 安装过程

Vuex 3 是 Vue.use(Vuex)

Vuex 4 则是 app.use(store)

```js
import { createStore } from "vuex"

export const store = createStore({
  state() {
    return {
      count: 1,
    }
  },
})
```

```js
import { createApp } from "vue"
import { store } from "./store"
import App from "./App.vue"

const app = createApp(App)

app.use(store)

app.mount("#app")
```

### 核心模块导出了 createLogger 函数

```js
import { createLogger } from "vuex"
```

## 从源码角度看 Vuex 4 重大变化

找到 createStore 函数打上断点。

```js
// webpack:///./examples/composition/shopping-cart/store/index.js
import { createStore, createLogger } from "vuex"
import cart from "./modules/cart"
import products from "./modules/products"

const debug = process.env.NODE_ENV !== "production"

export default createStore({
  modules: {
    cart,
    products,
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
})
```

找到 app.js 入口，在 app.use(store)、app.mount('#app')等打上断点。

```js
// webpack:///./examples/composition/shopping-cart/app.js
import { createApp } from "vue"
import App from "./components/App.vue"
import store from "./store"
import { currency } from "./currency"

const app = createApp(App)

app.use(store)

app.mount("#app")
```

接下来，从 createApp({})、app.use(Store)两个方面发散开来讲解。

### Vuex.createStore 函数

相比 Vuex 3 中，`new Vuex.Store`，其实是一样的。只不过为了和 Vue 3 统一，Vuex 4 额外多了一个 createStore 函数。

```js
export function createStore(options) {
  return new Store(options)
}
class Store {
  constructor(options = {}) {
    // 省略若干代码...
    this._modules = new ModuleCollection(options)
    const state = this._modules.root.state
    resetStoreState(this, state)
    // 省略若干代码...
  }
}
function resetStoreState(store, state, hot) {
  // 省略若干代码...
  store._state = reactive({
    data: state,
  })
  // 省略若干代码...
}
```

#### 监测数据

和 Vuex 3 不同的是，监听数据不再是用 new Vue()，而是 Vue 3 提供的 reactive 方法。

Vue.reactive 函数方法，本文就不展开讲解了。因为展开来讲，又可以写篇新的文章了。只需要知道主要功能是监测数据改变，变更视图即可。

这也就算解答了开头提出的第一个问题。

跟着断点继续看 app.use()方法，Vue 提供的插件机制。

### app.use() 方法

use 做的事情说起来也算简单，把传递过来的插件添加插件集合中，到防止重复。

执行插件，如果是对象，install 是函数，则把参数 app 和其他参数传递给 install 函数执行。如果是函数直接执行。

```js
// webpack:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function createAppAPI(render, hydrate) {
  return function createApp(rootComponent, rootProps = null) {
    // 代码有删减
    const installedPlugins = new Set()
    const app = (context.app = {
      use(plugin, ...options) {
        // 已经有插件，并且 不是生产环境，报警告。
        if (installedPlugins.has(plugin)) {
          process.env.NODE_ENV !== "production" &&
            warn(`Plugin has already been applied to target app.`)
        }
        // 插件的install 是函数，则添加插件，并执行 install 函数
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin)
          // 断点
          plugin.install(app, ...options)
        }
        // 插件本身 是函数，则添加插件，并执行 插件本身函数
        else if (isFunction(plugin)) {
          installedPlugins.add(plugin)
          plugin(app, ...options)
        }
        // 如果都不是报警告
        else if (process.env.NODE_ENV !== "production") {
          warn(
            `A plugin must either be a function or an object with an "install" ` +
              `function.`
          )
        }
        // 支持链式调用
        return app
      },
      provide() {
        // 省略... 后文再讲
      },
    })
  }
}
```

上面代码中，断点这行 plugin.install(app, ...options);

跟着断点走到下一步，install 函数。

### install 函数

```js
export class Store {
  // 省略若干代码...
  install(app, injectKey) {
    // 为 composition API 中使用
    //  可以传入 injectKey  如果没传取默认的 storeKey 也就是 store
    app.provide(injectKey || storeKey, this)
    // 为 option API 中使用
    app.config.globalProperties.$store = this
  }
  // 省略若干代码...
}
```

Vuex4 中的 install 函数相对比 Vuex3 中简单了许多。 第一句是给 Composition API 提供的。注入到根实例对象中。 第二句则是为 option API 提供的。

接着断点这两句，按 F11 来看 app.provide 实现。

#### app.provide

简单来说就是给 context 的 provides 属性中加了 store = Store 实例对象。

```js
provide(key, value) {
    // 如果已经有值了警告
    if ((process.env.NODE_ENV !== 'production') && key in context.provides) {
        warn(`App already provides property with key "${String(key)}". ` +
            `It will be overwritten with the new value.`);
    }
    // TypeScript doesn't allow symbols as index type
    // https://github.com/Microsoft/TypeScript/issues/24587
    context.provides[key] = value;
    return app;
}
```

接着从上方代码中搜索 context，可以发现这一句代码：

```js
const context = createAppContext()
```

接着我们来看函数 createAppContext。 context 为上下文

```js
// webpack:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      isCustomElement: NO,
      errorHandler: undefined,
      warnHandler: undefined,
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
  }
}
```

[Vue3 文档应用配置(app.config)](https://v3.cn.vuejs.org/api/application-config.html)

#### app.config.globalProperties

[app.config.globalProperties 官方文档](https://v3.cn.vuejs.org/api/application-config.html#globalproperties)

用法：

```js
app.config.globalProperties.$store = {}

app.component("child-component", {
  mounted() {
    console.log(this.$store) // '{}'
  },
})
```

也就能解释为什么每个组件都可以使用 this.$store.xxx 访问 vuex 中的方法和属性了。

也就是说在 appContext.provides 中注入了一个 Store 实例对象。这时也就是相当于根组件实例和 config 全局配置 globalProperties 中有了 Store 实例对象。

至此我们就看完，createStore(store)，app.use(store)两个 API。

app.provide 其实是用于 composition API 使用的。

但这只是文档中这样说的，为什么就每个组件实例都能访问的呢，我们继续深入探究下原理。

接下来，我们看下源码具体实现，为什么每个组件实例中都能获取到的。

这之前先来看下组合式 API 中，我们如何使用 Vuex4，这是线索。

### composition API 中如何使用 Vuex 4

接着我们找到如下文件，useStore 是我们断点的对象。

```js
// webpack:///./examples/composition/shopping-cart/components/ShoppingCart.vue
import { computed } from "vue"
import { useStore } from "vuex"
import { currency } from "../currency"

export default {
  setup() {
    const store = useStore()

    // 我加的这行代码
    window.ShoppingCartStore = store
    // 省略了若干代码
  },
}
```

接着断点按 F11，单步调试，会发现最终是使用了 Vue.inject 方法。

#### Vuex.useStore 源码实现

```js
// vuex/src/injectKey.js
import { inject } from "vue"

export const storeKey = "store"

export function useStore(key = null) {
  return inject(key !== null ? key : storeKey)
}
```

#### Vue.inject 源码实现

接着看 inject 函数，看着代码很多，其实原理很简单，就是要找到我们用 provide 提供的值。

如果没有父级，也就是根实例，就取实例对象中的 vnode.appContext.provides。 否则就取父级中的 instance.parent.provides 的值。

在 Vuex4 源码里则是：Store 实例对象。

```js
// webpack:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  // fallback to `currentRenderingInstance` so that this can be called in
  // a functional component
  // 如果是被一个函数式组件调用则取 currentRenderingInstance
  const instance = currentInstance || currentRenderingInstance
  if (instance) {
    // #2400
    // to support `app.use` plugins,
    // fallback to appContext's `provides` if the intance is at root
    const provides =
      instance.parent == null
        ? instance.vnode.appContext && instance.vnode.appContext.provides
        : instance.parent.provides
    if (provides && key in provides) {
      // TS doesn't allow symbol as index type
      return provides[key]
    }
    // 如果参数大于1个 第二个则是默认值 ，第三个参数是 true，并且第二个值是函数则执行函数。
    else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue()
        : defaultValue
    }
    // 警告没找到
    else if (process.env.NODE_ENV !== "production") {
      warn(`injection "${String(key)}" not found.`)
    }
  }
  // 如果没有当前实例则说明则报警告。
  // 也就是是说inject必须在setup中调用或者在函数式组件中使用
  else if (process.env.NODE_ENV !== "production") {
    warn(`inject() can only be used inside setup() or functional components.`)
  }
}
```

接着我们继续来看 inject 的相对应的 provide。

#### Vue.provide 源码实现

provide 函数作用其实也算简单

1. 也就是给当前组件实例上的 provides 对象属性，添加键值对 key/value。
2. 还有一个作用是当当前组件和父级组件的 provides 相同时，在当前组件实例中的 provides 对象和父级，则建立链接，也就是原型 `[[prototype]]`，(`__proto__`)。

```js
// webpack:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function provide(key, value) {
  if (!currentInstance) {
    if (process.env.NODE_ENV !== "production") {
      warn(`provide() can only be used inside setup().`)
    }
  } else {
    let provides = currentInstance.provides
    // by default an instance inherits its parent's provides object
    // but when it needs to provide values of its own, it creates its
    // own provides object using parent provides object as prototype.
    // this way in `inject` we can simply look up injections from direct
    // parent and let the prototype chain do the work.
    const parentProvides =
      currentInstance.parent && currentInstance.parent.provides
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    // TS doesn't allow symbol as index type
    provides[key] = value
  }
}
```

provide 函数中的这段，可能不是那么好理解。

```js
if (parentProvides === provides) {
  provides = currentInstance.provides = Object.create(parentProvides)
}
```

我们来举个例子消化一下。

```js
var currentInstance = { provides: { store: { __state: "Store实例" } } }
var provides = currentInstance.provides
// 这句是我手动加的，在后文中则是创建实例时就是写的同一个对象，当然就会相等了。
var parentProvides = provides
if (parentProvides === provides) {
  provides = currentInstance.provides = Object.create(parentProvides)
}
```

经过一次执行这个后，currentInstance 就变成了这样。

```js
{
  provides: {
    // 可以容纳其他属性，比如用户自己写的
    __proto__: {
      store: {
        __state: "Store实例"
      }
    }
  }
}
```

执行第二次时，currentInstance 则是：

```js
{
  provides: {
    // 可以容纳其他属性，比如用户自己写的
    __proto__: {
        // 可以容纳其他属性，比如用户自己写的
        __proto__ : { store: { __state: 'Store实例' }  }
    }
  }
}
```

以此类推，多执行 provide 几次，原型链就越长。

上文 inject、provide 函数中都有个变量 currentInstance 当前实例，那么当前实例对象是怎么来的呢。

为什么每个组件就能访问到，依赖注入的思想。 有一个讨巧的方法，就是在文件 runtime-core.esm-bundler.js 中搜索 provides，则能搜索到 createComponentInstance 函数

接下来我们来看 createComponentInstance 函数如何创建组件实例。

### createComponentInstance 创建组件实例

可以禁用其他断点，单独断点这里， 比如：`const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;` 来看具体实现。

```js
// webpack:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
const emptyAppContext = createAppContext()
let uid$1 = 0
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type
  const appContext =
    (parent ? parent.appContext : vnode.appContext) || emptyAppContext
  const instance = {
    uid: uid$1++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    // ...
    provides: parent ? parent.provides : Object.create(appContext.provides),
    // ...
  }
  instance.root = parent ? parent.root : instance
  // ...
  return instance
}
```

断点时会发现，根组件实例时 vnode 已经生成，至于是什么时候生成的，整理了下简化版。

```js
// 把上文中的 appContext 赋值给了 `appContext`
mount(rootContainer, isHydrate) {
    if (!isMounted) {
        const vnode = createVNode(rootComponent, rootProps);
        // store app context on the root VNode.
        // this will be set on the root instance on initial mount.
        vnode.appContext = context;
    }
},
```

其中 Object.create 其实就是建立原型关系。这时放一张图，一图胜千言。

![img3](https://lxchuan12.gitee.io/assets/img/lagou-provides.a779986b.png)

#### 组件实例生成了，那怎么把它们结合呢

这时，也有一个讨巧的方法，在 runtime-core.esm-bundler.js 文件中，搜索 provide(可以搜到如下代码：

这段代码其实看起来很复杂的样子，实际上主要就是把用户在组件中写的 provides 对象或者函数返回值遍历, 生成类似这样的实例对象：

```js
// 当前组件实例
{
  parent: '父级的实例',
  provides: {
    // 可以容纳其他属性，比如用户自己写的
    __proto__: {
        // 可以容纳其他属性，比如用户自己写的
        __proto__ : { store: { __state: 'Store实例' }  }
    }
  }
}
```

```js
// webpack:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function applyOptions(
  instance,
  options,
  deferredData = [],
  deferredWatch = [],
  deferredProvide = [],
  asMixin = false
) {
  // ...
  if (provideOptions) {
    deferredProvide.push(provideOptions)
  }
  if (!asMixin && deferredProvide.length) {
    deferredProvide.forEach((provideOptions) => {
      // 组件中写 provides 可以是对象或者是函数
      const provides = isFunction(provideOptions)
        ? provideOptions.call(publicThis)
        : provideOptions
      Reflect.ownKeys(provides).forEach((key) => {
        provide(key, provides[key])
      })
    })
  }
  // ...
}
```

这样一来就从上到下 app.provide 提供的对象，被注入到每一个组件实例中了。同时组件本身提供的 provides 也被注入到实例中了。

接着我们跟着项目来验证下，上文中的表述。翻看 Vue3 文档可以发现有一个 API 可以获取当前组件实例。

### getCurrentInstance 获取当前实例对象

getCurrentInstance 支持访问内部组件实例，用于高阶用法或库的开发。

```js
import { getCurrentInstance } from "vue"

const MyComponent = {
  setup() {
    const internalInstance = getCurrentInstance()

    internalInstance.appContext.config.globalProperties // 访问 globalProperties
  },
}
```

知道这个 API 后，我们可以在购物车例子的代码中添加一些代码。便于我们理解。

```js
// vuex/examples/composition/shopping-cart/components/App.vue
import { getCurrentInstance, provide } from 'vue'
import { useStore } from 'vuex';
setup () {
  const store = useStore()
  provide('ruochuan12', '微信搜索「若川视野」关注我，专注前端技术分享。')

  window.AppStore = store;
  window.AppCurrentInstance = getCurrentInstance();
},
```

```js
// vuex/examples/composition/shopping-cart/components/ProductList.vue
setup(){
  const store = useStore()

  // 加入的调试代码--start
  window.ProductListStore = store;
  window.ProductListCurrentInstance = getCurrentInstance();
  provide('weixin-2', 'ruochuan12');
  provide('weixin-3', 'ruochuan12');
  provide('weixin-4', 'ruochuan12');
  const mp = inject('ruochuan12');
  console.log(mp, '介绍-ProductList');
  // 加入的调试代码---end
}
```

```js
// vuex/examples/composition/shopping-cart/components/ShoppingCart.vue
setup () {
    const store = useStore()

    // 若川加入的调试代码--start
    window.ShoppingCartStore = store;
    window.ShoppingCartCurrentInstance = getCurrentInstance();
    provide('weixin', 'ruochuan12');
    provide('weixin1', 'ruochuan12');
    provide('weixin2', 'ruochuan12');
    const mp = inject('ruochuan12');
    console.log(mp, '介绍-ShoppingList'); // 微信搜索「若川视野」关注我，专注前端技术分享。
    // 若川加入的调试代码--start
}
```

在控制台输出这些值

```sh
AppCurrentInstance
AppCurrentInstance.provides
ShoppingCartCurrentInstance.parent === AppCurrentInstance // true
ShoppingCartCurrentInstance.provides
ShoppingCartStore === AppStore // true
ProductListStore === AppStore // true
AppStore // store实例对象
```

![img4](https://lxchuan12.gitee.io/assets/img/vuex-provide-inject.71a64224.png)

看控制台截图输出的例子，其实跟上文写的类似。这时如果写了顺手自己注入了一个 provide('store': '空字符串')，那么顺着原型链，肯定是先找到用户写的 store，这时 Vuex 无法正常使用，就报错了。

当然 vuex4 提供了注入的 key 可以不是 store 的写法，这时就不和用户的冲突了。

```js
export class Store {
  // 省略若干代码...
  install(app, injectKey) {
    // 为 composition API 中使用
    //  可以传入 injectKey  如果没传取默认的 storeKey 也就是 store
    app.provide(injectKey || storeKey, this)
    // 为 option API 中使用
    app.config.globalProperties.$store = this
  }
  // 省略若干代码...
}
```

```js
export function useStore(key = null) {
  return inject(key !== null ? key : storeKey)
}
```

## 解答下开头提出的 5 个问题

1、为什么修改了实例 store 里的属性，变更后会触发视图更新

答：使用 Vue 中的 reactive 方法监测数据变化的。

```js
class Store {
  constructor(options = {}) {
    // 省略若干代码...
    this._modules = new ModuleCollection(options)
    const state = this._modules.root.state
    resetStoreState(this, state)
    // 省略若干代码...
  }
}
function resetStoreState(store, state, hot) {
  // 省略若干代码...
  store._state = reactive({
    data: state,
  })
  // 省略若干代码...
}
```

2、Vuex4 作为 Vue 的插件如何实现和 Vue 结合的

答：app.use(store) 时会执行 Store 中的 install 方法，一句是为 composition API 中使用，提供 Store 实例对象到根实例中。一句则是注入到根实例的全局属性中，为 option API 中使用。它们都会在组件生成时，注入到每个组件实例中。

```js
export class Store {
  // 省略若干代码...
  install(app, injectKey) {
    // 为 composition API 中使用
    //  可以传入 injectKey  如果没传取默认的 storeKey 也就是 store
    app.provide(injectKey || storeKey, this)
    // 为 option API 中使用
    app.config.globalProperties.$store = this
  }
  // 省略若干代码...
}
```

3、provide、inject 的如何实现的，每个组件如何获取到组件实例中的 Store 的，为什么在组件中写的 provide 提供的数据，能被子级组件获取到。

答：provide 函数建立原型链区分出组件实例用户自己写的属性和系统注入的属性。inject 函数则是通过原型链找父级实例中的 provides 对象中的属性。

```js
// 有删减
function provide() {
  let provides = currentInstance.provides
  const parentProvides =
    currentInstance.parent && currentInstance.parent.provides
  if (parentProvides === provides) {
    provides = currentInstance.provides = Object.create(parentProvides)
  }
  provides[key] = value
}
```

```js
// 有删减
function inject() {
  const provides =
    instance.parent == null
      ? instance.vnode.appContext && instance.vnode.appContext.provides
      : instance.parent.provides
  if (provides && key in provides) {
    return provides[key]
  }
}
```

也就是类似这样的实例：

```js
// 当前组件实例
{
  parent: '父级的实例',
  provides: {
    // 可以容纳其他属性，比如用户自己写的
    __proto__: {
        // 可以容纳其他属性，比如用户自己写的
        __proto__ : { store: { __state: 'Store实例' }  }
    }
  }
}
```

4、为什么每个组件对象里都有 Store 实例对象了(渲染组件对象过程)。

答：渲染生成组件实例时，调用 createComponentInstance，注入到组件实例的 provides 中。

```js
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type
  const appContext =
    (parent ? parent.appContext : vnode.appContext) || emptyAppContext
  const instance = {
    parent,
    appContext,
    // ...
    provides: parent ? parent.provides : Object.create(appContext.provides),
    // ...
  }
  // ...
  return instance
}
```
