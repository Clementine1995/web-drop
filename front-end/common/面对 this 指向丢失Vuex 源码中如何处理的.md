# 面对 this 指向丢失 Vuex 源码中是怎么处理的

> 原文[面对 this 指向丢失，尤雨溪在 Vuex 源码中是怎么处理的](https://lxchuan12.gitee.io/vuex-this)

## 对象中的 this 指向

```js
var person = {
  name: "zhangsan",
  say: function (text) {
    console.log(this.name + ", " + text)
  },
}
console.log(person.name)
console.log(person.say("在写文章")) // zhangsan, 在写文章
var say = person.say
say("在写文章") // 这里的this指向就丢失了，指向window了。(非严格模式)
```

## 类中的 this 指向

### ES5

```js
// ES5
var Person = function () {
  this.name = "zhangsan"
}
Person.prototype.say = function (text) {
  console.log(this.name + ", " + text)
}
var person = new Person()
console.log(person.name) // zhangsan
console.log(person.say("在写文章"))
var say = person.say
say("在写文章") // 这里的this指向就丢失了，指向 window 了。
```

### ES6

```js
// ES6
class Person {
  construcor(name = "zhangsan") {
    this.name = name
  }
  say(text) {
    console.log(`${this.name}, ${text}`)
  }
}
const person = new Person()
person.say("在写文章")
// 解构
const { say } = person
say("在写文章") // 报错 this ，因为ES6 默认启用严格模式，严格模式下指向 undefined
```

## 尤大在 Vuex 源码中是怎么处理的

```js
class Store {
  constructor(options = {}) {
    this._actions = Object.create(null)
    // bind commit and dispatch to self
    // 给自己 绑定 commit 和 dispatch
    const store = this
    const { dispatch, commit } = this
    // 为何要这样绑定 ?
    // 说明调用commit和dispach 的 this 不一定是 store 实例
    // 这是确保这两个函数里的this是store实例
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit(type, payload, options) {
      return commit.call(store, type, payload, options)
    }
  }
  dispatch() {
    console.log("dispatch", this)
  }
  commit() {
    console.log("commit", this)
  }
}
const store = new Store()
store.dispatch() // 输出结果 this 是什么呢？

const { dispatch, commit } = store
dispatch() // 输出结果 this 是什么呢？
commit() // 输出结果 this 是什么呢？
```

![img1](https://lxchuan12.gitee.io/assets/img/store.dispatch.0e4bd228.jpg)

结论：非常巧妙的用了 call 把 dispatch 和 commit 函数的 this 指向强制绑定到 store 实例对象上。如果不这么绑定就报错了。

### actions 解构 store

其实 Vuex 源码里就有上面解构 const { dispatch, commit } = store;的写法。想想我们平时是如何写 actions 的。actions 中自定义函数的第一个参数其实就是 store 实例。

这时我们翻看下 actions 文档：`https://vuex.vuejs.org/zh/guide/actions.html`

```js
const store = new Vuex.Store({
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

也可以用解构赋值的写法。

```js
actions: {
  increment ({ commit }) {
    commit('increment')
  }
}
```

有了 Vuex 源码构造函数里的 call 绑定，这样 this 指向就被修正啦~不得不说祖师爷就是厉害。这一招，大家可以免费学走~

接着我们带着问题，为啥上文中的 context 就是 store 实例，有 dispatch、commit 这些方法呢。继续往下看。

### 为什么 actions 对象里的自定义函数 第一个参数就是 store 实例

以下是简单源码，有缩减

```js
class Store {
  construcor() {
    // 初始化 根模块
    // 并且也递归的注册所有子模块
    // 并且收集所有模块的 getters 放在 this._wrappedGetters 里面
    installModule(this, state, [], this._modules.root)
  }
}
```

接着我们看 installModule 函数中的遍历注册 actions 实现

```js
function installModule(store, rootState, path, module, hot) {
  // 省略若干代码
  // 循环遍历注册 action
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })
}
```

接着看注册 actions 函数实现 registerAction

```js
/**
* 注册 mutation
* @param {Object} store 对象
* @param {String} type 类型
* @param {Function} handler 用户自定义的函数
* @param {Object} local local 对象
*/
function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  // payload 是actions函数的第二个参数
  entry.push(function wrappedActionHandler (payload) {
    /**
     * 也就是为什么用户定义的actions中的函数第一个参数有
     *  { dispatch, commit, getters, state, rootGetters, rootState } 的原因
     * actions: {
     *    checkout ({ commit, state }, products) {
     *        console.log(commit, state);
     *    }
     * }
     */
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    // 源码有删减
}
```

比较容易发现调用顺序是 new Store() => installModule(this) => registerAction(store) => let res = handler.call(store)。

其中 handler 就是 用户自定义的函数，也就是对应上文的例子 increment 函数。store 实例对象一路往下传递，到 handler 执行时，也是用了 call 函数，强制绑定了第一个参数是 store 实例对象。

```js
actions: {
  increment ({ commit }) {
    commit('increment')
  }
}
```

这也就是为什么 actions 对象中的自定义函数的第一个参数是 store 对象实例了。

## 最后再总结下 this 指向

如果要判断一个运行中函数的 this 绑定， 就需要找到这个函数的直接调用位置。 找到之后 就可以顺序应用下面这四条规则来判断 this 的绑定对象。

1. new 调用：绑定到新创建的对象，注意：显示 return 函数或对象，返回值不是新创建的对象，而是显式返回的函数或对象。
2. call 或者 apply（ 或者 bind） 调用：严格模式下，绑定到指定的第一个参数。非严格模式下，null 和 undefined，指向全局对象（浏览器中是 window），其余值指向被 new Object()包装的对象。
3. 对象上的函数调用：绑定到那个对象。
4. 普通函数调用： 在严格模式下绑定到 undefined，否则绑定到全局对象。

ES6 中的箭头函数：不会使用上文的四条标准的绑定规则， 而是根据当前的词法作用域来决定 this， 具体来说， 箭头函数会继承外层函数，调用的 this 绑定（ 无论 this 绑定到什么），没有外层函数，则是绑定到全局对象（浏览器中是 window）。 这其实和 ES6 之前代码中的 self = this 机制一样。
