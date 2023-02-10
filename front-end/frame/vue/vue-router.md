# Vue-router

> [Vue-router 文档](https://router.vuejs.org/zh/introduction.html)

- 安装：npm install vue-router。
- 使用
  - 创建 router 实例
    - 定义路由组件，`import Home from '../views/HomePage.vue'`
    - 定义一些路由，配置组件和路由的映射关系，`routes = [{ path: '/', name: 'Home', component: Home } ...]`
    - 创建路由实例并传递 `routes` 配置，`const router = createRouter({history: createWebHashHistory(), routes })`
  - 将 router 实例挂载到 vue 实例中，使用 use
  - 使用路由，`<router-link>`该标签是一个 vue-router 中已经内置的组件，它会被渲染成一个`<a>`标签。`<router-view>`：该标签会根据当前的路径，动态渲染出不同的组件。
- 路由模式：history 和 hash
  - hash 模式是用 createWebHashHistory() 创建的，在 URL 之前使用了一个哈希字符 `#`，通过监听 hash 变化来达到路由跳转
  - 用 createWebHistory() 创建 HTML5 的 history 模式，利用 history api
- 如何进行路由跳转
  - router-link 标签，最主要的属性 to：用于指定跳转的路径
  - 使用代码的形式进行跳转。最常用的是 push，形式有下面三种。还有 go, replace 等
    - `router.push('/xxx')`
    - `router.push({ path: '/xxx' })`
    - `router.push({ name: 'Xxx' })`
- 动态路由，类似`{ path: '/users/:id', component: User },` 这种形式，路径参数用冒号 : 表示，像 `/users/johnny` 和 `/users/jolyne` 这样的 URL 都会映射到 User 这个路由
- 路由懒加载：`const Home = () => import('../components/Home.vue')`，也就是只有当路由被访问时采取加载这个组件
- 嵌套路由，使用路由中的 children 属性
- 如何传递参数
  - 通过调用 push 方法时带上 params 或者 query 属性，来传递参数
  - 在到达的路由组件中，使用 $route 属性获取 params 或 query
- 导航守卫
  - 全局路由守卫：router.beforeEach 每一个路由进入前触发。router.afterEach 每一个路由进后前触发。
  - 组件内路由守卫：beforeRouteEnter 当前路由进入前触发，beforeRouteUpdate 在当前路由改变，但是该组件被复用时调用，beforeRouteLeave 离开当前路由时触发
- 命名视图
  - 同个路由，想要显示多个视图就需要多个组件，可以通过设置 components 属性。
- 将 props 传递给路由组件
  - 当 props 设置为 true 时，route.params 将被设置为组件的 props。
  - 当 props 是一个对象时，它将原样设置为组件 props。当 props 是静态的时候很有用。
  - 可以创建一个返回 props 的函数。这允许你将参数转换为其他类型，将静态值与基于路由的值相结合等等。

## Vue Router 和 组合式 API

### 在 setup 中访问路由和当前路由

因为在 setup 里面没有访问 this，所以不能再直接访问 this.$router 或 this.$route。作为替代，使用 useRouter 函数：

```js
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    function pushWithQuery(query) {
      router.push({
        name: 'search',
        query: {
          ...route.query,
        },
      })
    }
  },
}
```

route 对象是一个响应式对象，所以它的任何属性都可以被监听，但应该避免监听整个 route 对象。在大多数情况下，应该直接监听期望改变的参数。

```js
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

export default {
  setup() {
    const route = useRoute()
    const userData = ref()

    // 当参数更改时获取用户信息
    watch(
      () => route.params.id,
      async newId => {
        userData.value = await fetchUser(newId)
      }
    )
  },
}
```

请注意，在模板中仍然可以访问 $router 和 $route，所以不需要在 setup 中返回 router 或 route。

### 导航守卫

虽然仍然可以通过 setup 函数来使用组件内的导航守卫，但 Vue Router 将更新和离开守卫作为 组合式 API 函数公开：

```js
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ref } from 'vue'

export default {
  setup() {
    // 与 beforeRouteLeave 相同，无法访问 `this`
    onBeforeRouteLeave((to, from) => {
      const answer = window.confirm(
        'Do you really want to leave? you have unsaved changes!'
      )
      // 取消导航并停留在同一页面上
      if (!answer) return false
    })

    const userData = ref()

    // 与 beforeRouteUpdate 相同，无法访问 `this`
    onBeforeRouteUpdate(async (to, from) => {
      //仅当 id 更改时才获取用户，例如仅 query 或 hash 值已更改
      if (to.params.id !== from.params.id) {
        userData.value = await fetchUser(to.params.id)
      }
    })
  },
}
```

组合式 API 守卫也可以用在任何由 `<router-view>` 渲染的组件中，它们不必像组件内守卫那样直接用在路由组件上。

### useLink

Vue Router 将 RouterLink 的内部行为作为一个组合式 API 函数公开。它提供了与 v-slot API 相同的访问属性：

```js
import { RouterLink, useLink } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'AppLink',

  props: {
    // 如果使用 TypeScript，请添加 @ts-ignore
    ...RouterLink.props,
    inactiveClass: String,
  },

  setup(props) {
    const { route, href, isActive, isExactActive, navigate } = useLink(props)

    const isExternalLink = computed(
      () => typeof props.to === 'string' && props.to.startsWith('http')
    )

    return { isExternalLink, href, navigate, isActive }
  },
}
```
