# Vue3实现自定义渲染器

Vue3中是通过，createApp() 这个方法来创建应用，传入组件以及 dom 选择器：`createApp(App).mount('#app')`，但是希望底层变成小程序的话就不行，因为 vue3底层还是操作 dom 元素，createApp 来自 @vue/runtime-dom，在 vue-next 源码中可以发现，由 package/vue 下的index.ts 直接引入导出。

在底层 vue 使用createRenderer来创建一个渲染器，这个渲染器会接收一系列的 DOM 相关的 api，如果希望实现自己的渲染器，就需要传入自己的自定义操作

49:31
