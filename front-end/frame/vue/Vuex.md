# Vuex

## 安装

使用 npm: `npm install vuex@next --save`

## 使用

### 创建 Store

创建一个新的 store 实例

```js
import { createStore } from "vuex";

// 创建一个新的 store 实例
const store = createStore({
  state() {
    return {
      count: 0,
    };
  },
  getters: {
    doubleCount: (state) => {
      return state.count * 2;
    },
  },
  actions: {
    increment(context) {
      context.commit("increment");
    },
  },
  mutations: {
    increment(state) {
      state.count++;
    },
  },
});
```

将 store 实例作为插件安装

```js
app.use(store);
```

在组件中使用，通过 $store 来访问对应的属性

```html
<script>
  export default {
    computed: {
      count() {
        // State 会暴露为 store.state
        return this.$store.state.count;
      },
      doubleCount() {
        // Getter 会暴露为 store.getters 对象，可以以属性的形式访问
        return this.$store.getters.doubleCount;
      },
    },
    methods: {
      increment() {
        // 使用 commit 的形式来提交一个变更
        this.$store.commit("increment");
        console.log(this.$store.state.count);
      },
      increment2() {
        // 使用 dispatch 的形式来分发一个动作
        this.$store.dispatch("increment");
        console.log(this.$store.state.count);
      },
    },
  };
</script>
```

- State：存储具体的状态
- Getter：相当于 store 的计算属性
- Mutation：更改 store 中的状态
- Action：提交 mutation，并且可以包含异步操作

## Module

将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter

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
```
