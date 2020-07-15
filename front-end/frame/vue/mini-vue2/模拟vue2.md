# 模拟Vue2

## 数据驱动

+ 数据响应式：数据模型仅仅是普通的 JS 对象，而当修改数据的时候，视图会进行更新，避免了繁琐的 DOM 操作，提高开发效率
+ 双向绑定：数据改变，视图改变；视图改变，数据也随之改变，可以使用 v-model 在表单元素上创建数据双向绑定
+ 数据驱动：它是vue最独特的特性之一，只需要关注数据本身，而不需要关注数据如何渲染到视图

## 发布订阅模式和观察者模式

发布订阅模式中，发布者与订阅者是相互隔离的，通过事件中心连接，而观察者模式中，发布者与订阅者是相互依赖的

### 发布/订阅模式

发布/订阅模式由订阅者，发布者，信号中心构成，具体流程是假定存在一个“信号中心”，某个任务执行完成，就向信号中心发布（publish）一个信号，其他任务可以向信号中心订阅（subscribe）这个信号，从而知道什么时候自己可以开始执行

Vue中的自定义事件以及 EventBus 都是基于发布/订阅模式的（在JS文件夹里有）。

```js
class EventEmitter {
  constructor () {
    // this.subs = {}
    // { click: [fn1, fn2], change: [fn] }
    this.subs = Object.create(null)
  }

  $on (eventType, handler) {
    (this.subs[eventType] || this.subs[eventType] = []).push(handler)
  }
  $emit (eventType, payload) {
    if(this.subs[eventType]) {
      this.subs[eventType].forEach(handler => {
        handler(payload)
      })
    }
  }
}
```

### 观察者模式

+ 观察者（订阅者）-- Watcher
  + update()：当事件发生时，具体要做的事
+ 目标（发布者）-- Dep
  + subs数组：存储所有的观察者
  + addSub()：添加观察者
  + notify()：当事件发生时，调用所有观察者的 updata方法
+ 没有事件中心

```js
// 核心思路
// 发布者-目标
class Dep {
  constructor () {
    // 记录所有的订阅者
    this.subs = []
  }
  // 添加订阅者
  addSub (sub) {
    if(sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 发布通知
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
// 订阅者-观察者
class Watcher {
  update () {
    console.log('update')
  }
}
```

## 模拟的整体结构

+ Vue：把data中的成员注入到 Vue 实例，并且把 data 中的成员转换成 getter/setter
+ Observer：能够对数据对象的所有属性进行监听，如有变动可拿到最新值并且通知 Dep
+ Compiler：解析每个元素中的指令以及插值表达式，并替换成相应的数据
+ Watch: 观察者，负责更新视图
+ Dep: 发布者，添加观察者，当数据发生变化时，通知所有的观察者

### Vue

+ 负责接受初始化参数
+ 负责把 data 中的属性注入到 Vue 实例，转换成 getter/setter
+ 负责调用 observer 监听 data 中所有属性的变化
+ 负责调用 compiler 解析指令/插值表达式

### Observer

+ 负责把 data 选项中的属性转换成响应式数据
+ data 中的某个属性也是对象，把该属性转换成响应式数据
+ 数据变化发送通知

### Compiler

+ 负责编译模板，解析指令/插值表达式
+ 负责页面的首次渲染
+ 当数据变化后重新渲染视图

### Dep

+ 收集依赖，添加观察者
+ 通知所有观察者

### Watcher

+ 当数据变化触发依赖，dep通知所有的 Watcher 实例更新视图
+ 自身实例化的时候往 dep 对象中添加自己