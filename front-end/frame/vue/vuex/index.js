// Vue.use(Vuex)  Vuex 是一个对象，有install 方法
// Vuex中有一个 Store 类
// 混入到组件中，有 store 属性

import { Store, install } from './store'

export default {
  Store,
  install
}

// 这个文件是入口文件，核心就是导出所有写好的方法