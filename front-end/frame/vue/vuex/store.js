import applyMixin from "./mixin";
import { forEachValue } from "./utils";

export let Vue;


export class Store{ // 容器的初始化
  constructor(options) { // options 也就是 new Vuex.store 时传入的属性
    const state = options.state // 涉及到数据变化更新视图

    // 响应式的数据 new Vue({data})
    // 1. 添加状态逻辑 数据在哪里使用，就会收集对应的依赖
    const computed = {}

    // 2. 处理getters 属性，它是具有缓存的，类似 computed，（多次取值如果值不变，不会重新计算取值）
    this.getters = {}
    forEachValue(options.getters, (fn, key) => {
      computed[key] = () => { // 将用户的getters定义在实例上
        return fn(this.state)
      }
      Object.defineProperty(this.getters, key, { // 当取值时，执行计算属性的逻辑
        get:() => this._vm[key]
      })
    })

    // 3. 计算属性的实现
    this._vm = new Vue({
      data: { // 属性如果是 $ 开头的话，默认是不会将它挂载到 vm 上
        $$state: state // 会将$$state变成响应式，从而达到响应式的目的
      },
      computed
    })
    // 4. 实现mutations
    this.mutations = {}
    this.actions = {}
    options.mutations

    forEachValue(options.mutations, (fn, key) => {
      this.mutations[key] = (payload) => {
        fn(this.state, payload)
      }
    })
    // 实现 actions
    forEachValue(options.actions, (fn, key) => {
      this.actions[key] = () => {
        fn(this, payload) // 要能结构出 commit
      }
    })
  }
  // 在严格模式下， actions 和 mutations 是有区别的
  commit = (type, payload) => { // 保证当前 this 指向当前的 store 实例，不管是直接用，还是 属性访问使用
    // 调用 commit 其实就去找 绑定好的 mutitations
    this.mutations[type](payload)
  }

  dispatch = (type, payload) => {
    this.actions[type](payload)
  }
  get state() { // 属性访问器
    return this._vm._data.$$state // 虽然没有挂载到实例上，但是在 _data 中可以访问到
  }
}

export const install = (_Vue) => { // 插件的安装， Vue.use 会调用插件的install方法
  // _Vue 是Vue的构造函数
  Vue = _Vue

  // 需要将跟组件中注入的store，分派给买一个组件（子组件） Vue.mixin
  applyMixin(Vue)

}

