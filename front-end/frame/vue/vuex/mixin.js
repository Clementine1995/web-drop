export default function applyMixin(Vue) {
  Vue.mixin({ // 内部会把生命周期函数，拍平成一个数组
    beforeCreate: vuexInit
  })
}

// 组建的渲染时从父 -》 子，也就是create方法先父组件执行，然后子组件就能拿到父组件上的一些属性
function vuexInit() {
  console.log('before created', this.$options.name)

  const options = this.$options

  if (options.store) { // 表示是根实例，只有根实例传入
    this.$store = options.store
  } else if (options.parent && options.parent.$store) { // 只考虑子组件
    this.$store = options.parent.$store
  }
}