# Pinia

Pinia 是一个与 Vuex 类似的全局状态管理库，同时支持 Vue2 与 Vue3，与 Vuex 相比它去掉了 mutation 的概念。

## 定义 Store

使用 `defineStore()` 定义一个 store，并且需要指定一个唯一的名称，这个名称与 Vuex 中的 module 概念相同。

```js
import { defineStore } from "pinia";

// 命名应该以 use 开头，后面跟具体的业务名称
export const useStore = defineStore("main", {
  // other options...
});
```

### 使用 Store

直到在 setup 中调用 useStore 之后，store 才会被创建。

```js
import { useStore } from "@/stores/counter";

export default {
  setup() {
    const store = useStore();

    return {
      // 可以把整个 store 实例返回给 template
      store,
    };
  },
};
```

注意不要是解构 store 对象，会使其失去响应式，如果非要解构，可以使用 storeToRefs() 方法。

## State

State 是 Store 中核心部分，Pinia 通过函数初始化 state

```js
import { defineStore } from "pinia";

const useStore = defineStore("storeId", {
  // 推荐使用箭头函数来得到完全的类型推断
  state: () => {
    return {
      // 所有的属性都会自动类型推断
      counter: 0,
      name: "Eduardo",
      isAdmin: true,
    };
  },
});
```

### 访问与重置 State

可以直接访问并修改 state 通过 store 实例

```js
const store = useStore();

store.counter++;
// state 将被重置为初始状态
store.$reset();
```

### 修改 State

除了直接使用 `store.counter++;` 来直接修改 state，还可以使用 $patch 方法，它允许同时进行更改多个属性。

```js
store.$patch({
  counter: store.counter + 1,
  name: "Abalam",
});

// 还可以使用函数来进行修改
cartStore.$patch((state) => {
  state.items.push({ name: "shoes", quantity: 1 });
  state.hasChanged = true;
});
```

### 替换 State

可以通过将 $state 属性设置为一个新对象来替换整个 state。

```js
store.$state = { counter: 666, name: "Paimon" };
```

### 订阅 State

可以通过 `$subscribe()` 来观察 state 的变化，与 watch 相比，它只会在 patches 之后触发一次。

```js
cartStore.$subscribe((mutation, state) => {
  // import { MutationType } from 'pinia'
  mutation.type; // 'direct' | 'patch object' | 'patch function'
  // same as cartStore.$id
  mutation.storeId; // 'cart'
  // only available with mutation.type === 'patch object'
  mutation.payload; // patch object passed to cartStore.$patch()
  // persist the whole state to the local storage whenever it changes
  localStorage.setItem("cart", JSON.stringify(state));
});
```

也可以 watch 在 pinia 上的整个 state。

## Getters

Getters 就相当于 Store 的 computed 属性，通过 defineStore() 中的 getters 属性定义，接受 state 作为第一个参数

```js
export const useStore = defineStore("main", {
  state: () => ({
    counter: 0,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
    // 返回类型必须设置，才能推断
    doublePlusOne(): number {
      // 也可以通过 this 获取 store 实例
      return this.counter * 2 + 1;
    },
    // 也可以访问其他 getter
    doubleCountPlusOne() {
      return this.doubleCount + 1;
    },
  },
});
```

### 向 Getters 传递参数

通过返回一个函数来接受参数

```js
export const useStore = defineStore("main", {
  getters: {
    getUserById: (state) => {
      // 如果这样做了，getter 将不再具有 缓存 效果。
      return (userId) => state.users.find((user) => user.id === userId);
      // 通过在 getters 内部缓存结果，这样跟高效一点
      const activeUsers = state.users.filter((user) => user.active);
      return (userId) => activeUsers.find((user) => user.id === userId);
    },
  },
});
```

### 从其他的 store 使用 getters

```js
import { useOtherStore } from "./other-store";

export const useStore = defineStore("main", {
  state: () => ({
    // ...
  }),
  getters: {
    otherGetter(state) {
      // 引用后直接使用
      const otherStore = useOtherStore();
      return state.localData + otherStore.data;
    },
  },
});
```

## Actions

Actions 和组件中的方法相等，可以通过 defineStore() 中的 actions 属性定义，并在其中写业务逻辑。

Actions 中也可以使用 this 来获取 store 实例，同时它还可以是异步的

```js
import { useAuthStore } from "./auth-store";

export const useStore = defineStore("main", {
  state: () => ({
    counter: 0,
  }),
  actions: {
    increment() {
      this.counter++;
    },
    randomizeCounter() {
      this.counter = Math.round(100 * Math.random());
    },
    async registerUser(login, password) {
      try {
        this.userData = await api.post({ login, password });
        showTooltip(`Welcome back ${this.userData.name}!`);
      } catch (error) {
        showTooltip(error);
        // let the form component display the error
        return error;
      }
    },
  },
});
```

### 订阅 Actions

## 插件 Plugins

Pinia Store 是完全可以扩展的，它可以：

- 添加新属性到 stores
- 定义 stores 时添加新的选项（options）
- 添加新的方法到 stores
- 包装已有方法
- 更改或取消 actions
- 实现一些副作用，比如 localStorage

## SSR 支持
