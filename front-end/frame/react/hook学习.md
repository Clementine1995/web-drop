# React Hook

## 简介

什么是Hook？

React官方给出的定义是：Hook可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

为何要使用它？

+ 组件之间复用状态逻辑很难：之前React 没有提供将可复用性行为“附加”到组件的途径，可以使用之后高级的东西，比如render prop 和高阶组件来解决这个问题，但同时也会带来“嵌套地狱”这个问题，而Hook 使你在无需修改组件结构的情况下复用状态逻辑。
+ 复杂组件变得难以理解：组件起初通常很简单，但逐渐会被状态逻辑和副作用充斥。每个生命周期常常包含一些不相关的逻辑。相互关联且需要对照修改的代码被进行了拆分，而完全不相关的代码却在同一个方法中组合在一起。而 Hook 将组件中相互关联的部分拆分成更小的函数（比如设置订阅或请求数据），而并非强制按照生命周期划分。
+ 难以理解的 class：class 是学习 React 的一大屏障，必须去理解 JavaScript 中 this 的工作方式，还不能忘记绑定事件处理器这将会使代码变得非常冗余。而 Hook 使你在非 class 的情况下可以使用更多的 React 特性。

## 概览

### State Hook

下面例子用来显示一个计数器。当你点击按钮，计数器的值就会增加

```jsx
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

useState 就是一个 Hook，通过在函数组件里调用它来给组件添加一些内部 state。React 会在重复渲染时保留这个 state。useState 会返回一对值：当前状态和一个让你更新它的函数，你可以在事件处理函数中或其他一些地方调用这个函数。它类似 class 组件的 this.setState，但是它不会把新的 state 和旧的 state 进行合并。

useState 唯一的参数就是初始 state。在上面的例子中，我们的计数器是从零开始的，所以初始 state 就是 0。值得注意的是，不同于 this.state，这里的 state 不一定要是一个对象，这个初始 state 参数只有在第一次渲染的会被用到。

#### 声明多个 state 变量

你可以在一个组件中多次使用 State Hook:

```js
function ExampleWithManyStates() {
  // 声明多个 state 变量！
  // 数组解构的语法让我们在调用 useState 时可以给 state 变量取不同的名字。
  const [age, setAge] = useState(42);
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
  // ...
}
```

#### 什么是Hook呢

Hook 是一些可以让你在函数组件里“钩入” React state 及生命周期等特性的函数。Hook 不能在 class 组件中使用 —— 这使得你不使用 class 也能使用 React。
