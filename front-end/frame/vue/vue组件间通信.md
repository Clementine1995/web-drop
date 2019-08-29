# Vue组件间通信

## 父子组件通信

### 父组件向子组件传值

父组件向子组件传值是通过props实现的。

- 子组件在props中创建一个属性，用以接收父组件传过来的值
- 父组件中注册子组件
- 在子组件标签中添加子组件props中创建的属性
- 把需要传给子组件的值赋给该属性

### 子组件向父组件传值

子组件传递数据给父组件是通过$emit触发事件来做到的

- 子组件中需要以某种方式例如点击事件的方法来触发一个自定义事件
- 将需要传的值作为$emit的第二个参数，该值将作为实参传给响应自定义事件的方法
- 在父组件中注册子组件并在子组件标签上绑定对自定义事件的监听

## 利用总线方式可以平级组件进行通信

对于兄弟组件可以使用中央事件总线的方式来进行通信。新建一个Vue事件eventBus对象，然后通过eventBus.$emit触发事件，eventBus.$on监听触发的事件。

eventBus.js

```js
import Vue from 'vue'
export default new Vue
```

eventBus中只创建了一个新的Vue实例，以后它就承担起了组件之间通信的桥梁了，也就是中央事件总线.

firstChild.vue

```html
<template>
    <div>
        <h2>firstChild组件</h2>
        <button @click="sendMsg">向另一个组件传值</button>
    </div>
</template>
<script>
    import bus from './eventBus'
    export default {
        methods: {
            sendMsg: function(){
                bus.$emit('userDefinedEvent', 'this message is from firstChild')
            }
        }
    }
</script>
```

secondChild.vue

```html
<template>
    <div>
        <h2>secondChild组件</h2>
        <p>从firstchild接收的字符串参数： {{message}}</p>
    </div>
</template>
<script>
    import bus from './eventBus'
    export default {
        data() {
            return {
                message: "默认值"
            }
        },
        mounted() {
            var self = this
            bus.$on('userDefinedEvent', function(msg){
                self.message = msg
            })
        }
    }
</script>
```

在响应点击事件的sendMsg函数中用$emit触发了一个自定义的userDefinedEvent事件，并传递了一个字符串参数
PS:$emit实例方法触发当前实例(这里的当前实例就是bus)上的事件,附加参数都会传给监听器回调。

## $parent和$children（不建议使用）

$parent是当前实例的父实例，$children是当前实例的直接子组件。

parent.vue

```html
<template>
    <div class="parent">
        <h2>$parent和$children</h2>
        <p>父组件中的值： {{parentMessage}}</p>
        <button @click="changeChildMsg">改变子组件中的值</button>
        <Child/>
    </div>
</template>
<script>
    import Child from './Child'
    export default {
        name: 'parent',
        components: {
            Child
        },
        data(){
            return {
                parentMessage: '默认值'
            }
        },
        methods: {
            changeChildMsg: function(){
                this.$children[0].childMessage = "这是父组件改变的"
            }
        }
    }
</script>
```

child.vue

```html
<template>
    <div>
        <h3>子组件部分</h3>
        <p>子组件中的值： {{childMessage}}</p>
        <button @click="changeParentMsg">改变父组件中的值</button>
    </div>
</template>
<script>
    export default {
        name: 'child',
        data(){
            return {
                childMessage: '默认值'
            }
        },
        methods: {
            changeParentMsg: function(){
                this.$parent.parentMessage = '这是子组件改变的'
            }
        }
    }
</script>
```

PS：需要注意 $children 并不保证顺序，也不是响应式的。如果你发现自己正在尝试使用 $children 来进行数据绑定，考虑使用一个数组配合 v-for 来生成子组件，并且使用 Array 作为真正的来源。

## provide和inject（不建议使用）

provide / inject 是 2.2.0 新增的属性，可以以一个祖先组件向所有子孙后代注入依赖（一个内容）。
provider/inject：简单的来说就是在父组件中通过provider来提供变量，然后在子组件中通过inject来注入变量。
以上两者可以在父组件与子组件、孙子组件、曾孙子...组件数据交互，也就是说不仅限于prop的父子组件数据交互，只要在上一层级的声明的provide，那么下一层级无论多深都能够通过inject来访问到provide的数据

parent.vue

```html
<template>
    <div class="parent">
        <h2>Provide和inject</h2>
        <Child />
    </div>
</template>
<script>
    import Child from './Child'
    export default {
        name: 'parent',
        provide: {
            name: 'Garrett'
        },
        components: {
            Child
        }
    }
</script>
```

child.vue

```html
<template>
    <div>
        <h3>子组件部分</h3>
        <GrandChild/>
    </div>
</template>
<script>
    import GrandChild from './GrandChild'
    export default {
        name: 'Child',
        components: {
            GrandChild
        }
    }
</script>
```

grandChild.vue

```html
<template>
    <div>
        <h3>孙子组件部分</h3>
        <p>{{name}}</p>
    </div>
</template>
<script>
    export default {
        name: 'grandChild',
        inject: ['name'],
    }
</script>
```

PS：provide 和 inject 主要为高阶插件/组件库提供用例。并不推荐直接用于应用程序代码中。

## $attrs和$listeners

$attrs和$listeners是2.4.0新增的方法。
$attrs--继承所有的父组件属性（除了prop传递的属性、class 和 style ）
$listeners--属性，它是一个对象，里面包含了作用在这个组件上的所有监听器，你就可以配合
 v-on="$listeners" 将所有的事件监听器指向这个组件的某个特定的子元素。

parent.vue

```html
<template>
    <div class="parent">
        <h2>$attrs和$listeners</h2>
        <p>父组件中的两个值：</p>
        <p>子组件会改变的值：{{message1}}</p>
        <p>孙子组件会改变的值：{{message2}}</p>
        <hr>
        <!--        此处监听了两个事件，可以在B组件或者C组件中直接触发-->
        <child1 :child="child" :grand-child="grandChild" v-on:changeMsg1="changeMsg1" v-on:changeMsg2="changeMsg2"/>
    </div>
</template>
<script>
    import Child1 from './Child.vue'
    export default {
        data() {
            return {
                child: 'child',
                grandChild: 'grandChild',
                message1: '默认值',
                message2: '默认值'
            };
        },
        components: {Child1},
        methods: {
            changeMsg1(msg) {this.message1 = msg},
            changeMsg2(msg) {this.message2 = msg}
        }
    };
</script>
```

child.vue

```html
<template>
    <div>
        <p>in child:</p>
        <p>props: {{child}}</p>
        <p>$attrs: {{$attrs}}</p>
        <button @click="changeMsg">改变父组件的值</button>
        <hr>
        <!-- GrandChild组件中能直接触发changeMsg的原因在于 Child组件调用GrandChild组件时 使用 v-on 绑定了$listeners 属性 -->
        <!-- 通过v-bind 绑定$attrs属性，GrandChild组件可以直接获取到Parent组件中传递下来的props（除了Child组件中props声明的） -->
        <GrandChild v-bind="$attrs" v-on="$listeners"></GrandChild>
    </div>
</template>
<script>
    import GrandChild from './GrandChild.vue';
    export default {
        props: ['child'],
        data() {
            return {};
        },
        inheritAttrs: false,
        components: {GrandChild},
        methods: {
            changeMsg: function(){
                this.$emit('changeMsg1', '这是子组件改变的');
            }
        }
    };
</script>
```

grandChild.vue

```html
<template>
    <div>
        <p>in grandChild:</p>
        <p>props: {{grandChild}}</p>
        <p>$attrs: {{$attrs}}</p>
        <button @click="changeMsg">改变祖先组件的值</button>
    </div>
</template>
<script>
    export default {
        props: ['grandChild'],
        inheritAttrs: false,
        methods: {
            changeMsg: function(){
                this.$emit('changeMsg2', '这是孙子组件改变的');
            }
        }
    };
</script>
```

## VueX

## 双向绑定原理

- 数据响应的实现由两部分构成: 观察者( watcher ) 和 依赖收集器( Dep )，其核心是 Object.DefineProperty这个方法，它可以 重写属性的 get 与 set 方法，从而完成监听数据的改变。
- Observe (观察者)观察 props 与 state 
  - 遍历 props 与 state，对每个属性创建独立的监听器( watcher )
- 使用 defineProperty 重写每个属性的 get/set(defineReactive）
  - get: 收集依赖
    - Dep.depend()
      - watcher.addDep()
  - set: 派发更新
    - Dep.notify()
    - watcher.update()
    - queenWatcher()
    - nextTick
    - flushScheduleQueue
    - watcher.run()
    - updateComponent()

```js
let data = {a: 1}
// 数据响应性
observe(data)

// 初始化观察者
new Watcher(data, 'name', updateComponent)
data.a = 2

// 简单表示用于数据更新后的操作
function updateComponent() {
    vm._update() // patchs
}

// 监视对象
function observe(obj) {
         // 遍历对象，使用 get/set 重新定义对象的每个属性值
    Object.keys(obj).map(key => {
        defineReactive(obj, key, obj[key])
    })
}

function defineReactive(obj, k, v) {
    // 递归子属性
    if (type(v) == 'object') observe(v)
    // 新建依赖收集器
    let dep = new Dep()
    // 定义get/set
    Object.defineProperty(obj, k, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
                  // 当有获取该属性时，证明依赖于该对象，因此被添加进收集器中
            if (Dep.target) {
                dep.addSub(Dep.target)
            }
            return v
        },
        // 重新设置值时，触发收集器的通知机制
        set: function reactiveSetter(nV) {
            v = nV
            dep.nofify()
        },
    })
}

// 依赖收集器
class Dep {
    constructor() {
        this.subs = []
    }
    addSub(sub) {
        this.subs.push(sub)
    }
    notify() {
        this.subs.map(sub => {
            sub.update()
        })
    }
}

Dep.target = null

// 观察者
class Watcher {
    constructor(obj, key, cb) {
        Dep.target = this
        this.cb = cb
        this.obj = obj
        this.key = key
        this.value = obj[key]
        Dep.target = null
    }
    addDep(Dep) {
        Dep.addSub(this)
    }
    update() {
        this.value = this.obj[this.key]
        this.cb(this.value)
    }
    before() {
        callHook('beforeUpdate')
    }
}
```

## key

预期：number | string

key 的特殊属性主要用在 Vue 的虚拟 DOM 算法，在新旧 nodes 对比时辨识 VNodes。如果不使用 key，Vue 会使用一种最大限度减少动态元素并且尽可能的尝试修复/再利用相同类型元素的算法。使用 key，它会基于 key 的变化重新排列元素顺序，并且会移除 key 不存在的元素。

有相同父元素的子元素必须有独特的 key。重复的 key 会造成渲染错误。

最常见的用例是结合 v-for：

```html
<ul>
  <li v-for="item in items" :key="item.id">...</li>
</ul>
```

它也可以用于强制替换元素/组件而不是重复使用它。当你遇到如下场景时它可能会很有用：

完整地触发组件的生命周期钩子

触发过渡

例如：

```html
<transition>
  <span :key="text">{{ text }}</span>
</transition>
```

当 text 发生改变时，`<span>` 会随时被更新，因此会触发过渡。

创建Dom

diff算法，平层对比

如果tagName以及key和原来一样，对比属性，继续递归遍历子树

  旧属性是否有删除

  存在的就属性的属性值是否有变化

  是否有新增的属性

如果tagName或者key和原来不一样，替换原来节点

渲染差异，局部更新
