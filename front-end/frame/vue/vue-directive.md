# 自定义指令

## 简介

除了核心功能默认内置的指令 (v-model 和 v-show)，Vue 也允许注册自定义指令。注意，在 Vue2.0 中，代码复用和抽象的主要形式是组件。然而，有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令。

指令原则上是针对DOM元素的，应该尽可能的通过指令表达式把指令需要的内容传入
所以一般不推荐在指令内调用组件实例上的方法或获取组件实例的属性

举个聚焦输入框的例子，当页面加载时，该元素将获得焦点 (注意：autofocus 在移动版 Safari 上不工作)。事实上，只要你在打开这个页面后还没点击过任何内容，这个输入框就应当还是处于聚焦状态。现在让我们用指令来实现这个功能：

```javascript
  // 注册一个全局自定义指令 `v-focus`
  Vue.directive('focus', {
    // 当被绑定的元素插入到 DOM 中时……
    inserted: function (el) {
      // 聚焦元素
      el.focus()
    }
  })
```

如果想注册局部指令，组件中也接受一个 directives 的选项：

```javascript
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    }
  }
```

然后你可以在模板中任何元素上使用新的 v-focus 属性，如下：`<input v-focus>`

## 钩子函数

一个指令定义对象可以提供如下几个钩子函数 (均为可选)：

bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。

inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。

update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。

componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。

unbind：只调用一次，指令与元素解绑时调用。

## 钩子函数参数

指令钩子函数会被传入以下参数：

+ el：指令所绑定的元素，可以用来直接操作 DOM 。
+ binding：一个对象，包含以下属性：
+ name：指令名，不包括 v- 前缀。
+ value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
+ oldValue：指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
+ expression：字符串形式的指令表达式。例如 v-my-directive="1 + 1" 中，表达式为 "1 + 1"。
+ arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
+ modifiers：一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
+ vnode：Vue 编译生成的虚拟节点。移步 VNode API 来了解更多详情。
+ oldVnode：上一个虚拟节点，仅在 update 和 componentUpdated 钩子中可用。

除了 el 之外，其它参数都应该是只读的，切勿进行修改。如果需要在钩子之间共享数据，建议通过元素的 dataset 来进行。
这是一个使用了这些属性的自定义钩子样例：

```javascript
  <div id="hook-arguments-example" v-demo:foo.a.b="message"></div>
  Vue.directive('demo', {
    bind: function (el, binding, vnode) {
      var s = JSON.stringify
      el.innerHTML =
        'name: '       + s(binding.name) + '<br>' +
        'value: '      + s(binding.value) + '<br>' +
        'expression: ' + s(binding.expression) + '<br>' +
        'argument: '   + s(binding.arg) + '<br>' +
        'modifiers: '  + s(binding.modifiers) + '<br>' +
        'vnode keys: ' + Object.keys(vnode).join(', ')
    }
  })

  new Vue({
    el: '#hook-arguments-example',
    data: {
      message: 'hello!'
    }
  })
```

## 函数简写

在很多时候，你可能想在 bind 和 update 时触发相同行为，而不关心其它的钩子。比如这样写:

```javascript
  Vue.directive('color-swatch', function (el, binding) {
    el.style.backgroundColor = binding.value
  })
```

## 对象字面量

如果指令需要多个值，可以传入一个 JavaScript 对象字面量。记住，指令函数能够接受所有合法的 JavaScript 表达式。

```javascript
  <div v-demo="{ color: 'white', text: 'hello!' }"></div>
  Vue.directive('demo', function (el, binding) {
    console.log(binding.value.color) // => "white"
    console.log(binding.value.text)  // => "hello!"
  })
```
