# Vue 官方文档重温1

## 按键修饰符

在监听键盘事件时，经常需要检查特定的按键。Vue 允许在 v-on 或 @ 监听按键事件时添加按键修饰符。

```template
<!-- 仅在 `key` 为 `Enter` 时调用 `submit` -->
<input @keyup.enter="submit" />
<!-- 直接使用 KeyboardEvent.key 暴露的按键名称作为修饰符，但需要转为 kebab-case 形式。 -->
<input @keyup.page-down="onPageDown" />
```

### 系统按键修饰符

可以使用以下系统按键修饰符来触发鼠标或键盘事件监听器，只有当按键被按下时才会触发。

- .ctrl
- .alt
- .shift
- .meta

举例来说：

```template
<!-- Alt + Enter -->
<input @keyup.alt.enter="clear" />

<!-- Ctrl + 点击 -->
<div @click.ctrl="doSomething">Do something</div>
```

> 系统按键修饰符和常规按键不同。与 keyup 事件一起使用时，该按键必须在事件发出时处于按下状态。换句话说，keyup.ctrl 只会在仍然按住 ctrl 但松开了另一个键时被触发。若单独松开 ctrl 键将不会触发。

### .exact 修饰符

.exact 修饰符允许控制触发一个事件所需的确定组合的系统按键修饰符。

```template
<!-- 当按下 Ctrl 时，即使同时按下 Alt 或 Shift 也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 仅当按下 Ctrl 且未按任何其他键时才会触发 -->
<button @click.ctrl.exact="onCtrlClick">A</button>

<!-- 仅当没有按下任何系统按键时触发 -->
<button @click.exact="onClick">A</button>
```

## v-model 表单输入值绑定

对于单选按钮，复选框和选择器选项，v-model 绑定的值通常是静态的字符串 (或者对复选框是布尔值)：

```template
<!-- `picked` 在被选择时是字符串 "a" -->
<input type="radio" v-model="picked" value="a" />

<!-- `toggle` 只会为 true 或 false -->
<input type="checkbox" v-model="toggle" />

<!-- `selected` 在第一项被选中时为字符串 "abc" -->
<select v-model="selected">
  <option value="abc">ABC</option>
</select>
```

有时可能希望将该值绑定到当前组件实例上的动态数据。这可以通过使用 v-bind 来实现。此外，使用 v-bind 还使可以将选项值绑定为非字符串的数据类型。

### 对于复选框

```template
<input
  type="checkbox"
  v-model="toggle"
  true-value="yes"
  false-value="no" />
```

true-value 和 false-value 是 Vue 特有的 attributes，仅支持和 v-model 配套使用。这里 toggle 属性的值会在选中时被设为 'yes'，取消选择时设为 'no'。同样可以通过 v-bind 将其绑定为其他动态值：

```template
<input
  type="checkbox"
  v-model="toggle"
  :true-value="dynamicTrueValue"
  :false-value="dynamicFalseValue" />
```

### 对于单选按钮

```template
<input type="radio" v-model="pick" :value="first" />
<input type="radio" v-model="pick" :value="second" />
```

pick 会在第一个按钮选中时被设为 first，在第二个按钮选中时被设为 second。

### 对于选择器选项

```template
<select v-model="selected">
  <!-- 内联对象字面量 -->
  <option :value="{ number: 123 }">123</option>
</select>
```

v-model 同样也支持非字符串类型的值绑定！在上面这个例子中，当某个选项被选中，selected 会被设为该对象字面量值 { number: 123 }。

## 侦听器 watch

### 即时回调的侦听器

watch 默认是懒执行的：仅当数据源变化时，才会执行回调。可以用一个对象来声明侦听器，这个对象有 handler 方法和 immediate: true 选项，这样便能强制回调函数立即执行

回调函数的初次执行就发生在 created 钩子之前。Vue 此时已经处理了 data、computed 和 methods 选项，所以这些属性在第一次调用时就是可用的。

### 回调的触发时机

当更改了响应式状态，它可能会同时触发 Vue 组件更新和侦听器回调。

默认情况下，用户创建的侦听器回调，都会在 Vue 组件更新之前被调用。这意味着在侦听器回调中访问的 DOM 将是被 Vue 更新之前的状态。

如果想在侦听器回调中能访问被 Vue 更新之后的 DOM，需要指明 flush: 'post' 选项：

```js
export default {
  // ...
  watch: {
    key: {
      handler() {},
      flush: 'post'
    }
  }
}
```

### 组合式api 侦听数据源类型

watch 的第一个参数可以是不同形式的“数据源”：它可以是一个 ref (包括计算属性)、一个响应式对象、一个 getter 函数、或多个数据源组成的数组：

```js
const x = ref(0)
const y = ref(0)

// 单个 ref
watch(x, (newX) => {
  console.log(`x is ${newX}`)
})

// getter 函数
watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`sum of x + y is: ${sum}`)
  }
)

// 多个来源组成的数组
watch([x, () => y.value], ([newX, newY]) => {
  console.log(`x is ${newX} and y is ${newY}`)
})
```

注意，不能直接侦听响应式对象的属性值，例如:

```js
const obj = reactive({ count: 0 })

// 错误，因为 watch() 得到的参数是一个 number
watch(obj.count, (count) => {
  console.log(`count is: ${count}`)
})
```

这里需要用一个返回该属性的 getter 函数：

```js
// 提供一个 getter 函数
watch(
  () => obj.count,
  (count) => {
    console.log(`count is: ${count}`)
  }
)
```

### 组合式api深层侦听器

直接给 watch() 传入一个响应式对象，会隐式地创建一个深层侦听器——该回调函数在所有嵌套的变更时都会被触发：

```js
const obj = reactive({ count: 0 })

watch(obj, (newValue, oldValue) => {
  // 在嵌套的属性变更时触发
  // 注意：`newValue` 此处和 `oldValue` 是相等的
  // 因为它们是同一个对象！
})

obj.count++
```

相比之下，一个返回响应式对象的 getter 函数，只有在返回不同的对象时，才会触发回调：

```js
watch(
  () => state.someObject,
  () => {
    // 仅当 state.someObject 被替换时触发
  }
)
```

也可以给上面这个例子显式地加上 deep 选项，强制转成深层侦听器：

```js
watch(
  () => state.someObject,
  (newValue, oldValue) => {
    // 注意：`newValue` 此处和 `oldValue` 是相等的
    // *除非* state.someObject 被整个替换了
  },
  { deep: true }
)
```

### watchEffect()

侦听器的回调使用与源完全相同的响应式状态是很常见的。例如下面的代码，在每当 todoId 的引用发生变化时使用侦听器来加载一个远程资源：

```js
const todoId = ref(1)
const data = ref(null)

watch(todoId, async () => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
  )
  data.value = await response.json()
}, { immediate: true })
```

特别是注意侦听器是如何两次使用 todoId 的，一次是作为源，另一次是在回调中。可以用 watchEffect 函数 来简化上面的代码。watchEffect() 允许我们自动跟踪回调的响应式依赖。上面的侦听器可以重写为：

```js
watchEffect(async () => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
  )
  data.value = await response.json()
})
```

> watchEffect 仅会在其同步执行期间，才追踪依赖。在使用异步回调时，只有在第一个 await 正常工作前访问到的属性才会被追踪。

### watch vs. watchEffect

watch 和 watchEffect 都能响应式地执行有副作用的回调。它们之间的主要区别是追踪响应式依赖的方式：

- watch 只追踪明确侦听的数据源。它不会追踪任何在回调中访问到的东西。另外，仅在数据源确实改变时才会触发回调。watch 会避免在发生副作用时追踪依赖，因此，我们能更加精确地控制回调函数的触发时机。
- watchEffect，则会在副作用发生期间追踪依赖。它会在同步执行过程中，自动追踪所有能访问到的响应式属性。这更方便，而且代码往往更简洁，但有时其响应性依赖关系会不那么明确。

需要异步创建侦听器的情况很少，请尽可能选择同步创建。如果需要等待一些异步数据，你可以使用条件式的侦听逻辑：

```js
// 需要异步请求得到的数据
const data = ref(null)

watchEffect(() => {
  if (data.value) {
    // 数据加载后执行某些操作...
  }
}
```

## 模板引用

### 函数模板引用

除了使用字符串值作名字，ref attribute 还可以绑定为一个函数，会在每次组件更新时都被调用。该函数会收到元素引用作为其第一个参数：

```template
<input :ref="(el) => { /* 将 el 赋值给一个数据属性或 ref 变量 */ }">
```

注意这里需要使用动态的 :ref 绑定才能够传入一个函数。当绑定的元素被卸载时，函数也会被调用一次，此时的 el 参数会是 null。当然也可以绑定一个组件方法而不是内联函数。

### 组合式api访问模板引用

为了通过组合式 API 获得该模板引用，需要声明一个同名的 ref：

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放该元素的引用
// 必须和模板里的 ref 同名
const input = ref(null)

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

在组件挂载后才能访问模板引用，如果需要侦听一个模板引用 ref 的变化，确保考虑到其值为 null 的情况：

```js
watchEffect(() => {
  if (input.value) {
    input.value.focus()
  } else {
    // 此时还未挂载，或此元素已经被卸载（例如通过 v-if 控制）
  }
})
```

使用了 `<script setup>` 的组件是默认私有的：一个父组件无法访问到一个使用了 `<script setup>` 的子组件中的任何东西，除非子组件在其中通过 defineExpose 宏显式暴露：

```vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

// 像 defineExpose 这样的编译器宏不需要导入
defineExpose({
  a,
  b
})
</script>
```

## Props

### 使用一个对象绑定多个 prop

如果想要将一个对象的所有属性都当作 props 传入，可以使用没有参数的 v-bind，即只使用 v-bind 而非 :prop-name。例如，这里有一个 post 对象：

```js
export default {
  data() {
    return {
      post: {
        id: 1,
        title: 'My Journey with Vue'
      }
    }
  }
}
```

以及下面的模板：

```template
<BlogPost v-bind="post" />
```

而这实际上等价于：

```template
<BlogPost :id="post.id" :title="post.title" />
```

## 事件

### 事件校验

和对 props 添加类型校验的方式类似，所有触发的事件也可以使用对象形式来描述。

要为事件添加校验，那么事件可以被赋值为一个函数，接受的参数就是抛出事件时传入 this.$emit 的内容，返回一个布尔值来表明事件是否合法。

```js
export default {
  emits: {
    // 没有校验
    click: null,

    // 校验 submit 事件
    submit: ({ email, password }) => {
      if (email && password) {
        return true
      } else {
        console.warn('Invalid submit event payload!')
        return false
      }
    }
  },
  methods: {
    submitForm(email, password) {
      this.$emit('submit', { email, password })
    }
  }
}
```

## 组件 v-model

v-model 可以在组件上使用以实现双向绑定。当使用在一个组件上时，v-model 会被展开为如下的形式：

```template
<CustomInput
  :modelValue="searchText"
  @update:modelValue="newValue => searchText = newValue"
/>
```

要让这个例子实际工作起来，`<CustomInput>` 组件内部需要做两件事：

1. 将内部原生 `<input>` 元素的 value attribute 绑定到 modelValue prop
2. 当原生的 input 事件触发时，触发一个携带了新值的 update:modelValue 自定义事件

这里是相应的代码：

```vue
<!-- CustomInput.vue -->
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

另一种在组件内实现 v-model 的方式是使用一个可写的，同时具有 getter 和 setter 的 computed 属性。get 方法需返回 modelValue prop，而 set 方法需触发相应的事件：

```vue
<!-- CustomInput.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <input v-model="value" />
</template>
```

### v-model 的参数

默认情况下，v-model 在组件上都是使用 modelValue 作为 prop，并以 update:modelValue 作为对应的事件。可以通过给 v-model 指定一个参数来更改这些名字：

```template
<MyComponent v-model:title="bookTitle" />
```

在这个例子中，子组件应声明一个 title prop，并通过触发 update:title 事件更新父组件值：

```vue
<!-- MyComponent.vue -->
<script setup>
defineProps(['title'])
defineEmits(['update:title'])
</script>

<template>
  <input
    type="text"
    :value="title"
    @input="$emit('update:title', $event.target.value)"
  />
</template>
```

### 多个 v-model 绑定

可以在单个组件实例上创建多个 v-model 双向绑定。组件上的每一个 v-model 都会同步不同的 prop，而无需额外的选项：

```template
<UserName
  v-model:first-name="first"
  v-model:last-name="last"
/>
```

### 处理 v-model 修饰符

在输入绑定时，v-model 有一些内置的修饰符，例如 .trim，.number 和 .lazy。在某些场景下，可能想要一个自定义组件的 v-model 支持自定义的修饰符。

创建一个自定义的修饰符 capitalize，它会自动将 v-model 绑定输入的字符串值第一个字母转为大写：

```template
<MyComponent v-model.capitalize="myText" />
```

组件的 v-model 上所添加的修饰符，可以通过 modelModifiers prop 在组件内访问到。在下面的组件中，声明了 modelModifiers 这个 prop，它的默认值是一个空对象：

```vue
<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
})

defineEmits(['update:modelValue'])

console.log(props.modelModifiers) // { capitalize: true }
</script>

<template>
  <input
    type="text"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

注意这里组件的 modelModifiers prop 包含了 capitalize 且其值为 true，因为它在模板中的 v-model 绑定 v-model.capitalize="myText" 上被使用了。

有了这个 prop，就可以检查 modelModifiers 对象的键，并编写一个处理函数来改变抛出的值。在下面的代码里，就是在每次 `<input />` 元素触发 input 事件时将值的首字母大写：

```vue
<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

function emitValue(e) {
  let value = e.target.value
  if (props.modelModifiers.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  emit('update:modelValue', value)
}
</script>

<template>
  <input type="text" :value="modelValue" @input="emitValue" />
</template>
```

对于又有参数又有修饰符的 v-model 绑定，生成的 prop 名将是 arg + "Modifiers"。举例来说：

```template
<MyComponent v-model:title.capitalize="myText">
```

相应的声明应该是：

```js
const props = defineProps(['title', 'titleModifiers'])
defineEmits(['update:title'])

console.log(props.titleModifiers) // { capitalize: true }
```

## 透传 Attributes

### Attributes 继承

“透传 attribute”指的是传递给一个组件，却没有被该组件声明为 props 或 emits 的 attribute 或者 v-on 事件监听器。最常见的例子就是 class、style 和 id。

当一个组件以单个元素为根作渲染时，透传的 attribute 会自动被添加到根元素上。举例来说，假如我们有一个 `<MyButton>` 组件，模板长这样：

```template
<!-- <MyButton> 的模板 -->
<button>click me</button>
```

一个父组件使用了这个组件，并且传入了 class：

```template
<MyButton class="large" />
```

最后渲染出的 DOM 结果是：

```html
<button class="large">click me</button>
```

这里，`<MyButton>` 并没有将 class 声明为一个它所接受的 prop，所以 class 被视作透传 attribute，自动透传到了 `<MyButton>` 的根元素上。

#### 对 class 和 style 的合并

如果一个子组件的根元素已经有了 class 或 style attribute，它会和从父组件上继承的值合并。

#### v-on 监听器继承

同样的规则也适用于 v-on 事件监听器：`<MyButton @click="onClick" />`

click 监听器会被添加到 `<MyButton>` 的根元素，即那个原生的 `<button>` 元素之上。当原生的 `<button>` 被点击，会触发父组件的 onClick 方法。同样的，如果原生 button 元素自身也通过 v-on 绑定了一个事件监听器，则这个监听器和从父组件继承的监听器都会被触发。

#### 深层组件继承

有些情况下一个组件会在根节点上渲染另一个组件。例如，重构一下 `<MyButton>`，让它在根节点上渲染 `<BaseButton>`：

```template
<!-- <MyButton/> 的模板，只是渲染另一个组件 -->
<BaseButton />
```

此时 `<MyButton>` 接收的透传 attribute 会直接继续传给 `<BaseButton>`。

请注意：

- 透传的 attribute 不会包含 `<MyButton>` 上声明过的 props 或是针对 emits 声明事件的 v-on 侦听函数，换句话说，声明过的 props 和侦听函数被 `<MyButton>`“消费”了。
- 透传的 attribute 若符合声明，也可以作为 props 传入 `<BaseButton>`。

### 禁用 Attributes 继承

如果不想要一个组件自动地继承 attribute，可以在组件选项中设置 inheritAttrs: false。

如果使用了 `<script setup>`，需要一个额外的 `<script>` 块来书写这个选项声明：

```vue
<script>
// 使用普通的 <script> 来声明选项
export default {
  inheritAttrs: false
}
</script>

<script setup>
// ...setup 部分逻辑
</script>
```

最常见的需要禁用 attribute 继承的场景就是 attribute 需要应用在根节点以外的其他元素上。通过设置 inheritAttrs 选项为 false，可以完全控制透传进来的 attribute 被如何使用。

这些透传进来的 attribute 可以在模板的表达式中直接用 $attrs 访问到。

```template
<span>Fallthrough attribute: {{ $attrs }}</span>
```

这个 $attrs 对象包含了除组件所声明的 props 和 emits 之外的所有其他 attribute，例如 class，style，v-on 监听器等等。

有几点需要注意：

- 和 props 有所不同，透传 attributes 在 JavaScript 中保留了它们原始的大小写，所以像 foo-bar 这样的一个 attribute 需要通过 $attrs['foo-bar'] 来访问。
- 像 @click 这样的一个 v-on 事件监听器将在此对象下被暴露为一个函数 $attrs.onClick。

有时候可能为了样式，需要在 `<button>` 元素外包装一层 `<div>`：

```template
<div class="btn-wrapper">
  <button class="btn">click me</button>
</div>
```

想要所有像 class 和 v-on 监听器这样的透传 attribute 都应用在内部的 `<button>` 上而不是外层的 `<div>` 上。可以通过设定 inheritAttrs: false 和使用 v-bind="$attrs" 来实现：

```template
<div class="btn-wrapper">
  <button class="btn" v-bind="$attrs">click me</button>
</div>
```

> 没有参数的 v-bind 会将一个对象的所有属性都作为 attribute 应用到目标元素上。

### 多根节点的 Attributes 继承

和单根节点组件有所不同，有着多个根节点的组件没有自动 attribute 透传行为。如果 $attrs 没有被显式绑定，将会抛出一个运行时警告。

```template
<CustomLayout id="custom-layout" @click="changeValue" />
```

如果 `<CustomLayout>` 有下面这样的多根节点模板，由于 Vue 不知道要将 attribute 透传到哪里，所以会抛出一个警告。

```template
<header>...</header>
<main>...</main>
<footer>...</footer>
```

如果 $attrs 被显式绑定，则不会有警告：

```templage
<header>...</header>
<main v-bind="$attrs">...</main>
<footer>...</footer>
```

### 在 JavaScript 中访问透传 Attributes

如果需要可以在 `<script setup>` 中使用 `useAttrs()` API 来访问一个组件的所有透传 attribute：

```js
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>
```

如果没有使用 `<script setup>`，attrs 会作为 setup() 上下文对象的一个属性暴露，在选项式api中通过 $attrs 这个实例属性来访问

> 虽然这里的 attrs 对象总是反映为最新的透传 attribute，但它并不是响应式的。

## 插槽 Slots

### 动态插槽名

动态指令参数在 v-slot 上也是有效的，即可以定义下面这样的动态插槽名：

```template
<base-layout>
  <template v-slot:[dynamicSlotName]>
    ...
  </template>

  <!-- 缩写为 -->
  <template #[dynamicSlotName]>
    ...
  </template>
</base-layout>
```
